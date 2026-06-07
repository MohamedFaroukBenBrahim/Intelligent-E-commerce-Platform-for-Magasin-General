package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.entity.Order;
import com.example.backend.entity.PaymentMethod;
import com.example.backend.entity.User;
import com.example.backend.service.OrderService;
import com.example.backend.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;

    public OrderController(OrderService orderService, PaymentService paymentService) {
        this.orderService = orderService;
        this.paymentService = paymentService;
    }

    /** POST /orders — place an order from the current user's cart */
    @PostMapping
    public ResponseEntity<?> placeOrder(@AuthenticationPrincipal User user,
                                        @RequestBody PlaceOrderDto dto) {
        try {
            // Validate payment method
            if (dto.getPaymentMethod() == null) {
                return ResponseEntity.badRequest()
                        .body("Payment method is required. Choose from: KONNECT, CARD, CASH_ON_DELIVERY");
            }

            // Use the address from the request, or fall back to the user's saved address
            String address = (dto.getShippingAddress() != null && !dto.getShippingAddress().isBlank())
                    ? dto.getShippingAddress()
                    : user.getAddress();

            if (address == null || address.isBlank()) {
                return ResponseEntity.badRequest()
                        .body("Shipping address is required. Please provide one or save a default address on your profile.");
            }

            Order order = orderService.placeOrder(user.getId(), address, dto.getPaymentMethod());
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** GET /orders — get all orders for the current user */
    @GetMapping
    public ResponseEntity<?> getMyOrders(@AuthenticationPrincipal User user) {
        try {
            List<Order> orders = orderService.getUserOrders(user.getId());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** GET /orders/{id} — get a specific order (user must own it or be admin) */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@AuthenticationPrincipal User user,
                                      @PathVariable Long id) {
        try {
            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            Order order = orderService.getOrderById(id, user.getId(), isAdmin);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** DELETE /orders/{id}/cancel — cancel an order */
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@AuthenticationPrincipal User user,
                                         @PathVariable Long id) {
        try {
            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            Order order = orderService.cancelOrder(id, user.getId(), isAdmin);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // ─── Payment endpoints ─────────────────────────────────────────────────────

    /** POST /orders/payment/konnect — Initiate Konnect payment */
    @PostMapping("/payment/konnect")
    public ResponseEntity<?> initiateKonnectPayment(@AuthenticationPrincipal User user,
                                                     @RequestBody KonnectPaymentDto dto) {
        try {
            // Verify order ownership
            Order order = orderService.getOrderById(dto.getOrderId(), user.getId(), false);
            
            PaymentResponseDto response = paymentService.initiateKonnectPayment(dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }



    /** GET/POST /orders/payment/confirm — Confirm payment after gateway callback */
    @RequestMapping(value = "/payment/confirm", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<?> confirmPayment(@RequestParam Long orderId,
                                            @RequestParam String transactionId,
                                            @RequestParam boolean success) {
        try {
            paymentService.confirmPayment(orderId, transactionId, success);
            return ResponseEntity.ok("Payment confirmation processed");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // ─── Admin endpoints ───────────────────────────────────────────────────────

    /** GET /orders/admin/all — get all orders (admin only) */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrders() {
        try {
            return ResponseEntity.ok(orderService.getAllOrders());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /** PUT /orders/admin/{id}/status — update order status (admin only) */
    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody UpdateOrderStatusDto dto) {
        try {
            Order order = orderService.updateStatus(id, dto.getStatus());
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
