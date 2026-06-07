package com.example.backend.controller;

import com.example.backend.dto.StockAdjustmentDto;
import com.example.backend.entity.Product;
import com.example.backend.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/product")
public class ProductController {
    private final ProductService productService;
    public ProductController(ProductService productService) {
        this.productService = productService;
    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addProduct(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String state,
            @RequestParam Float price,
            @RequestParam(required = false) Float discount,
            @RequestParam(required = false) Float rate,
            @RequestParam(defaultValue = "0") int quantity,
            @RequestParam(defaultValue = "0") int minStockThreshold,
            @RequestParam(required = false) Long categoryId,
            @RequestPart(required = false) MultipartFile image) {
        try {
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setState(state);
            product.setPrice(price);
            product.setDiscount(discount);
            product.setRate(rate);
            product.setQuantity(quantity);
            product.setMinStockThreshold(minStockThreshold);
            Product savedProduct = productService.addProduct(product, image, categoryId);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> modifyProduct(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) Float price,
            @RequestParam(required = false) Float discount,
            @RequestParam(required = false) Float rate,
            @RequestParam(defaultValue = "0") int quantity,
            @RequestParam(required = false) Integer minStockThreshold,
            @RequestParam(required = false) Long categoryId,
            @RequestPart(required = false) MultipartFile image) {
        try {
            Product productUpdates = new Product();
            productUpdates.setName(name);
            productUpdates.setDescription(description);
            productUpdates.setState(state);
            productUpdates.setPrice(price);
            productUpdates.setDiscount(discount);
            productUpdates.setRate(rate);
            productUpdates.setQuantity(quantity);
            Product updatedProduct = productService.modifyProduct(id, productUpdates, image, categoryId, minStockThreshold);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProduct(id);
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteProductById(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Product>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Float minPrice,
            @RequestParam(required = false) Float maxPrice,
            @RequestParam(required = false) String state,
            @RequestParam(defaultValue = "all") String stockStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        PageRequest pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(productService.searchAndFilter(keyword, categoryId, minPrice, maxPrice, state, stockStatus, pageable));
    }

    // ---------------------------------------------------------------
    // Manual stock adjustment
    // ---------------------------------------------------------------
    /**
     * PATCH /product/{id}/stock
     * Body: { "adjustment": 10, "reason": "Received new shipment" }
     *
     * adjustment can be negative (e.g. -3) to remove damaged/lost units.
     * Returns the updated product with its new quantity.
     */
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> adjustStock(
            @PathVariable Long id,
            @RequestBody StockAdjustmentDto dto) {
        Product updated = productService.adjustStock(id, dto.getAdjustment(), dto.getReason());
        return ResponseEntity.ok(updated);
    }
}
