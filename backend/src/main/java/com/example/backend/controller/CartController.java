package com.example.backend.controller;

import com.example.backend.dto.CartItemDto;
import com.example.backend.entity.Cart;
import com.example.backend.entity.User;
import com.example.backend.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /** GET /cart — get the current user's cart */
    @GetMapping
    public ResponseEntity<?> getCart(@AuthenticationPrincipal User user) {
        try {
            Cart cart = cartService.getOrCreateCart(user.getId());
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** POST /cart/items — add an item to the cart */
    @PostMapping("/items")
    public ResponseEntity<?> addItem(@AuthenticationPrincipal User user,
                                     @RequestBody CartItemDto dto) {
        try {
            Cart cart = cartService.addItem(user.getId(), dto.getProductId(), dto.getQuantity());
            return ResponseEntity.status(HttpStatus.CREATED).body(cart);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** PUT /cart/items/{itemId} — update quantity of a cart item */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateItem(@AuthenticationPrincipal User user,
                                        @PathVariable Long itemId,
                                        @RequestBody CartItemDto dto) {
        try {
            Cart cart = cartService.updateItem(user.getId(), itemId, dto.getQuantity());
            return ResponseEntity.ok(cart);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** DELETE /cart/items/{itemId} — remove an item from the cart */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeItem(@AuthenticationPrincipal User user,
                                        @PathVariable Long itemId) {
        try {
            Cart cart = cartService.removeItem(user.getId(), itemId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** DELETE /cart — clear all items in the cart */
    @DeleteMapping
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal User user) {
        try {
            Cart cart = cartService.clearCart(user.getId());
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
