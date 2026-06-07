package com.example.backend.service;

import com.example.backend.entity.*;
import com.example.backend.repository.CartRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final OrderConfirmationService orderConfirmationService;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        ProductService productService,
                        OrderConfirmationService orderConfirmationService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productService = productService;
        this.orderConfirmationService = orderConfirmationService;
    }

    /**
     * Place an order from the user's current cart.
     * Decrements product stock and clears the cart.
     */
    @Transactional
    public Order placeOrder(Long userId, String shippingAddress, PaymentMethod paymentMethod) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot place order: cart is empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(shippingAddress);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(PaymentStatus.PENDING);

        float total = 0f;
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            if (product.getQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName()
                        + ". Available: " + product.getQuantity());
            }

            // Snapshot price at order time (apply discount if any)
            Float price = product.getPrice();
            Float discount = product.getDiscount();
            float effectivePrice = (discount != null && discount > 0)
                    ? price * (1 - discount / 100)
                    : price;

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(effectivePrice);

            order.getItems().add(orderItem);
            total += effectivePrice * cartItem.getQuantity();

            // Decrement stock
            product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            // Check if this product just crossed the low-stock threshold
            // and notify all admins by email if so.
            productService.notifyIfLowStock(product);
        }

        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);

        // Clear the cart after placing order
        cart.getItems().clear();
        cartRepository.save(cart);

        // Send order confirmation email
        orderConfirmationService.sendOrderConfirmation(savedOrder);

        return savedOrder;
    }

    /**
     * Get all orders for a user.
     */
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get a specific order by ID (validates ownership unless admin).
     */
    public Order getOrderById(Long orderId, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return order;
    }

    /**
     * Update order status (admin only).
     */
    @Transactional
    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus().equals(OrderStatus.CANCELLED)) {
            throw new RuntimeException("Cannot update a cancelled order");
        }
        if (status.equals(OrderStatus.CANCELLED)) {
            throw new RuntimeException("Use the cancel endpoint to cancel an order");
        }
        order.setStatus(status);
        return orderRepository.save(order);
    }

    /**
     * Cancel an order (user can only cancel PENDING orders).
     */
    @Transactional
    public Order cancelOrder(Long orderId, Long userId, boolean isAdmin) {
        Order order = getOrderById(orderId, userId, isAdmin);

        if (!isAdmin && order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only PENDING orders can be cancelled");
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    /**
     * Get all orders (admin).
     */
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
