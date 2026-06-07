package com.example.backend.service;

import com.example.backend.entity.Order;
import com.example.backend.entity.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class OrderConfirmationService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.from:}")
    private String fromEmail;

    public OrderConfirmationService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    /**
     * Send order confirmation email to the user
     */
    public void sendOrderConfirmation(Order order) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Order Confirmation - Order #" + order.getId());

            String htmlContent = buildOrderConfirmationEmail(order);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
        } catch (MessagingException e) {
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }
    }

    /**
     * Send payment confirmation email to the user
     */
    public void sendPaymentConfirmation(Order order) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Payment Confirmed - Order #" + order.getId());

            String htmlContent = buildPaymentConfirmationEmail(order);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
        } catch (MessagingException e) {
            System.err.println("Failed to send payment confirmation email: " + e.getMessage());
        }
    }

    private String buildOrderConfirmationEmail(Order order) {
        StringBuilder html = new StringBuilder();
        html.append("<html><body style=\"font-family: Arial, sans-serif;\">");
        html.append("<h2>Order Confirmation</h2>");
        html.append("<p>Dear ").append(order.getUser().getUsername()).append(",</p>");
        html.append("<p>Thank you for your order! Your order has been received and is being processed.</p>");
        
        html.append("<h3>Order Details</h3>");
        html.append("<table border=\"1\" cellpadding=\"10\" style=\"border-collapse: collapse;\">");
        html.append("<tr><th>Order ID</th><td>").append(order.getId()).append("</td></tr>");
        html.append("<tr><th>Order Date</th><td>").append(order.getCreatedAt()).append("</td></tr>");
        html.append("<tr><th>Shipping Address</th><td>").append(order.getShippingAddress()).append("</td></tr>");
        html.append("<tr><th>Payment Method</th><td>").append(order.getPaymentMethod()).append("</td></tr>");
        html.append("<tr><th>Total Amount</th><td>TND ").append(String.format("%.2f", order.getTotalAmount())).append("</td></tr>");
        html.append("</table>");

        html.append("<h3>Items</h3>");
        html.append("<table border=\"1\" cellpadding=\"10\" style=\"border-collapse: collapse;\">");
        html.append("<tr><th>Product</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr>");
        
        for (OrderItem item : order.getItems()) {
            float subtotal = item.getPrice() * item.getQuantity();
            html.append("<tr>");
            html.append("<td>").append(item.getProduct().getName()).append("</td>");
            html.append("<td>").append(item.getQuantity()).append("</td>");
            html.append("<td>TND ").append(String.format("%.2f", item.getPrice())).append("</td>");
            html.append("<td>TND ").append(String.format("%.2f", subtotal)).append("</td>");
            html.append("</tr>");
        }
        
        html.append("</table>");

        html.append("<p style=\"margin-top: 20px;\">You will receive another email once your order is shipped.</p>");
        html.append("<p>If you have any questions, please contact our support team.</p>");
        html.append("<p>Best regards,<br/>MG E-Commerce Team</p>");
        html.append("</body></html>");

        return html.toString();
    }

    private String buildPaymentConfirmationEmail(Order order) {
        StringBuilder html = new StringBuilder();
        html.append("<html><body style=\"font-family: Arial, sans-serif;\">");
        html.append("<h2>Payment Confirmation</h2>");
        html.append("<p>Dear ").append(order.getUser().getUsername()).append(",</p>");
        html.append("<p>Your payment has been successfully processed!</p>");
        
        html.append("<h3>Payment Details</h3>");
        html.append("<table border=\"1\" cellpadding=\"10\" style=\"border-collapse: collapse;\">");
        html.append("<tr><th>Order ID</th><td>").append(order.getId()).append("</td></tr>");
        html.append("<tr><th>Transaction ID</th><td>").append(order.getPaymentTransactionId()).append("</td></tr>");
        html.append("<tr><th>Payment Method</th><td>").append(order.getPaymentMethod()).append("</td></tr>");
        html.append("<tr><th>Amount</th><td>TND ").append(String.format("%.2f", order.getTotalAmount())).append("</td></tr>");
        html.append("<tr><th>Status</th><td>").append(order.getPaymentStatus()).append("</td></tr>");
        html.append("</table>");

        html.append("<p style=\"margin-top: 20px;\">Your order is now confirmed and will be shipped soon.</p>");
        html.append("<p>Best regards,<br/>MG E-Commerce Team</p>");
        html.append("</body></html>");

        return html.toString();
    }
}
