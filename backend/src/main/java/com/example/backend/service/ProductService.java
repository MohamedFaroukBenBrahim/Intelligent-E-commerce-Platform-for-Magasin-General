package com.example.backend.service;

import com.example.backend.entity.Category;
import com.example.backend.entity.Product;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ProductService {
    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MinioStorageService storageService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          MinioStorageService storageService,
                          UserRepository userRepository,
                          EmailService emailService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.storageService = storageService;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public Product addProduct(Product product, MultipartFile image, Long categoryId) {
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            product.setCategorie(category);
        }
        if (image != null && !image.isEmpty()) {
            String imageUrl = storageService.uploadFile(image, "products");
            product.setImageUrl(imageUrl);
        }
        return productRepository.save(product);
    }

    public Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    public Product modifyProduct(Long id, Product productUpdates, MultipartFile image, Long categoryId, Integer minStockThreshold) {
        Product existingProduct = getProduct(id);
        
        // Update fields
        if (productUpdates.getName() != null) {
            existingProduct.setName(productUpdates.getName());
        }
        if (productUpdates.getDescription() != null) {
            existingProduct.setDescription(productUpdates.getDescription());
        }
        if (productUpdates.getState() != null) {
            existingProduct.setState(productUpdates.getState());
        }
        if (productUpdates.getPrice() != null) {
            existingProduct.setPrice(productUpdates.getPrice());
        }
        if (productUpdates.getDiscount() != null) {
            existingProduct.setDiscount(productUpdates.getDiscount());
        }
        if (productUpdates.getRate() != null) {
            existingProduct.setRate(productUpdates.getRate());
        }
        existingProduct.setQuantity(productUpdates.getQuantity());

        // Only update threshold when the caller explicitly sends a value;
        // null means "leave the existing threshold untouched".
        if (minStockThreshold != null) {
            existingProduct.setMinStockThreshold(minStockThreshold);
        }
        
        // Update category
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            existingProduct.setCategorie(category);
        }
        
        // Update image
        if (image != null && !image.isEmpty()) {
            // Delete old image from MinIO if exists
            if (existingProduct.getImageUrl() != null) {
                storageService.deleteFile(existingProduct.getImageUrl());
            }
            String imageUrl = storageService.uploadFile(image, "products");
            existingProduct.setImageUrl(imageUrl);
        }
        
        Product saved = productRepository.save(existingProduct);

        // An admin may directly lower quantity through this form;
        // we must still fire the low-stock alert if the threshold is crossed.
        notifyIfLowStock(saved);

        return saved;
    }
    public void deleteProduct(Long id) {
        Product product = getProduct(id);
        if (product.getImageUrl() != null) {
            storageService.deleteFile(product.getImageUrl());
        }
        productRepository.deleteById(id);
    }

    public Page<Product> searchAndFilter(String keyword, Long categoryId, Float minPrice, Float maxPrice, String state, String stockStatus, Pageable pageable) {
        return productRepository.searchAndFilter(keyword, categoryId, minPrice, maxPrice, state, normalizeStockStatus(stockStatus), pageable);
    }

    private String normalizeStockStatus(String stockStatus) {
        if (stockStatus == null) {
            return null;
        }

        String normalized = stockStatus.trim().toLowerCase().replaceAll("[\\s_-]", "");
        if (normalized.isEmpty() || "all".equals(normalized)) {
            return null;
        }
        if ("instock".equals(normalized) || "onstock".equals(normalized)) {
            return "instock";
        }
        if ("outofstock".equals(normalized)) {
            return "outofstock";
        }

        return normalized;
    }

    // ---------------------------------------------------------------
    // Manual stock adjustment
    // ---------------------------------------------------------------

    /**
     * Applies a signed adjustment to a product's quantity and persists it.
     *
     * Why @Transactional? If the DB save fails for any reason, the whole
     * operation is rolled back — we never end up with a partial update.
     *
     * @param id         the product to adjust
     * @param adjustment positive = add stock, negative = remove stock
     * @param reason     free-text audit note (logged, not stored in DB here)
     */
    @Transactional
    public Product adjustStock(Long id, int adjustment, String reason) {
        Product product = getProduct(id);

        int newQuantity = product.getQuantity() + adjustment;
        if (newQuantity < 0) {
            // We refuse to push stock negative — that has no physical meaning.
            throw new RuntimeException(
                "Stock adjustment would result in negative quantity ("
                + newQuantity + ") for product: " + product.getName());
        }

        log.info("Stock adjustment for product '{}' (id={}): {} -> {} | Reason: {}",
                product.getName(), id, product.getQuantity(), newQuantity, reason);

        product.setQuantity(newQuantity);
        Product saved = productRepository.save(product);

        // Check threshold AFTER saving so the DB is consistent before sending email.
        notifyIfLowStock(saved);

        return saved;
    }

    // ---------------------------------------------------------------
    // Low-stock alert (reusable — called from OrderService too)
    // ---------------------------------------------------------------

    /**
     * Sends an alert email to every ADMIN user if the product quantity
     * has dropped to or below its configured minStockThreshold.
     *
     * Why public? OrderService also needs to call this after it decrements
     * stock during order placement — we avoid duplicating the logic.
     *
     * Why not throw? Email is a secondary concern. If it fails, we log it
     * and let the main operation (save) succeed normally.
     */
    public void notifyIfLowStock(Product product) {
        // threshold == 0 means "not configured" — skip silently.
        if (product.getMinStockThreshold() <= 0) return;
        if (product.getQuantity() > product.getMinStockThreshold()) return;

        List<User> admins = userRepository.findByRole(Role.ADMIN);
        if (admins.isEmpty()) {
            log.warn("Low-stock detected for '{}' but no ADMIN users found to notify.",
                    product.getName());
            return;
        }

        String subject = "⚠️ Low Stock Alert: " + product.getName();
        String html = buildLowStockEmail(product);

        for (User admin : admins) {
            try {
                emailService.sendVerificationMail(admin.getEmail(), subject, html);
                log.info("Low-stock alert sent to admin '{}' for product '{}'.",
                        admin.getEmail(), product.getName());
            } catch (Exception e) {
                // Never let email failure break the main flow.
                log.error("Failed to send low-stock alert to {}: {}",
                        admin.getEmail(), e.getMessage());
            }
        }
    }

    /** Builds a simple HTML email body for the low-stock alert. */
    private String buildLowStockEmail(Product product) {
        return "<div style='font-family:Arial,sans-serif;padding:20px'>" +
               "<h2 style='color:#e53e3e'>⚠️ Low Stock Alert</h2>" +
               "<p>The following product has reached its minimum stock threshold:</p>" +
               "<table style='border-collapse:collapse'>" +
               "  <tr><td style='padding:6px;font-weight:bold'>Product</td>" +
               "      <td style='padding:6px'>" + product.getName() + "</td></tr>" +
               "  <tr><td style='padding:6px;font-weight:bold'>Product ID</td>" +
               "      <td style='padding:6px'>" + product.getId() + "</td></tr>" +
               "  <tr><td style='padding:6px;font-weight:bold'>Current Quantity</td>" +
               "      <td style='padding:6px;color:#e53e3e'>" + product.getQuantity() + "</td></tr>" +
               "  <tr><td style='padding:6px;font-weight:bold'>Minimum Threshold</td>" +
               "      <td style='padding:6px'>" + product.getMinStockThreshold() + "</td></tr>" +
               "</table>" +
               "<p style='margin-top:16px'>Please restock this item as soon as possible.</p>" +
               "</div>";
    }
}
