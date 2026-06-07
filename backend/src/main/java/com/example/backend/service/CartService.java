package com.example.backend.service;

import com.example.backend.entity.*;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.CartRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get or create a cart for the given user.
     */
    @Transactional
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }

    /**
     * Add a product to the cart (or increase quantity if already present).
     */
    @Transactional
    public Cart addItem(Long userId, Long productId, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be greater than 0");

        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + product.getQuantity());
        }

        cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .ifPresentOrElse(
                        existingItem -> {
                            int newQty = existingItem.getQuantity() + quantity;
                            if (product.getQuantity() < newQty) {
                                throw new IllegalArgumentException("Insufficient stock. Available: " + product.getQuantity());
                            }
                            existingItem.setQuantity(newQty);
                            cartItemRepository.save(existingItem);
                        },
                        () -> {
                            CartItem item = new CartItem();
                            item.setCart(cart);
                            item.setProduct(product);
                            item.setQuantity(quantity);
                            cart.getItems().add(item);
                            cartItemRepository.save(item);
                        }
                );

        return cartRepository.save(cart);
    }

    /**
     * Update the quantity of a specific cart item.
     */
    @Transactional
    public Cart updateItem(Long userId, Long cartItemId, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be greater than 0");

        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to this user's cart");
        }

        if (item.getProduct().getQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + item.getProduct().getQuantity());
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return cartRepository.findById(cart.getId()).orElseThrow();
    }

    /**
     * Remove an item from the cart.
     */
    @Transactional
    public Cart removeItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to this user's cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return cartRepository.findById(cart.getId()).orElseThrow();
    }

    /**
     * Clear all items in the cart.
     */
    @Transactional
    public Cart clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        return cartRepository.save(cart);
    }
}
