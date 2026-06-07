package com.example.backend.service;

import com.example.backend.dto.KonnectPaymentDto;
import com.example.backend.dto.PaymentResponseDto;
import com.example.backend.entity.Order;
import com.example.backend.entity.PaymentMethod;
import com.example.backend.entity.PaymentStatus;
import com.example.backend.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;
    private final OrderConfirmationService orderConfirmationService;

    @Value("${konnect.api.url:}")
    private String konnectApiUrl;

    @Value("${konnect.api.key:}")
    private String konnectApiKey;

    @Value("${konnect.receiver.wallet.id:}")
    private String konnectReceiverWalletId;

    @Value("${app.callback.url:}")
    private String callbackUrl;

    public PaymentService(OrderRepository orderRepository, 
                         RestTemplate restTemplate,
                         OrderConfirmationService orderConfirmationService) {
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
        this.orderConfirmationService = orderConfirmationService;
    }

    /**
     * Initiate Konnect payment
     */
    public PaymentResponseDto initiateKonnectPayment(KonnectPaymentDto paymentDto) {
        Order order = orderRepository.findById(paymentDto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        PaymentResponseDto response = new PaymentResponseDto();
        response.setOrderId(order.getId());

        try {
            // Create Konnect payment request
            Map<String, Object> konnectRequest = buildKonnectPaymentRequest(order, paymentDto);

            // Call Konnect API
            String paymentUrl = callKonnectApi(konnectRequest);

            // Update order with payment information
            order.setPaymentMethod(PaymentMethod.KONNECT);
            order.setPaymentStatus(PaymentStatus.PENDING);
            order.setPaymentTransactionId(generateTransactionId());
            orderRepository.save(order);

            response.setStatus(PaymentStatus.PENDING);
            response.setTransactionId(order.getPaymentTransactionId());
            response.setPaymentUrl(paymentUrl);
            response.setMessage("Payment initiated successfully. Please proceed to payment gateway.");

        } catch (Exception e) {
            response.setStatus(PaymentStatus.FAILED);
            response.setMessage("Failed to initiate payment: " + e.getMessage());
        }

        return response;
    }

    /**
     * Confirm payment after gateway callback
     */
    public void confirmPayment(Long orderId, String transactionId, boolean success) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (success) {
            order.setPaymentStatus(PaymentStatus.COMPLETED);
            orderConfirmationService.sendPaymentConfirmation(order);
        } else {
            order.setPaymentStatus(PaymentStatus.FAILED);
        }

        orderRepository.save(order);
    }

    private Map<String, Object> buildKonnectPaymentRequest(Order order, KonnectPaymentDto dto) {
        Map<String, Object> request = new HashMap<>();
        
        // Required fields
        request.put("receiverWalletId", konnectReceiverWalletId);
        request.put("amount", order.getTotalAmount() * 1000); // Konnect uses millimes for TND
        request.put("token", "TND");
        request.put("type", "immediate");
        
        // Order and user details
        request.put("orderId", String.valueOf(order.getId()));
        request.put("description", "Order #" + order.getId());
        request.put("firstName", dto.getFirstName());
        request.put("lastName", dto.getLastName());
        request.put("phoneNumber", dto.getPhoneNumber());
        request.put("email", dto.getEmail());
        
        // Payment configuration
        request.put("acceptedPaymentMethods", new String[]{"wallet", "bank_card", "e-DINAR"});
        request.put("lifespan", 10);
        request.put("checkoutForm", true);
        request.put("addPaymentFeesToAmount", false);
        
        // Webhook for payment notifications
        request.put("webhook", callbackUrl + "/orders/payment/confirm");
        
        // UI Theme
        request.put("theme", "light");
        
        return request;
    }

    private String callKonnectApi(Map<String, Object> request) {
        if (konnectApiKey == null || konnectApiKey.isEmpty()) {
            throw new RuntimeException("Konnect API key not configured");
        }
        if (konnectReceiverWalletId == null || konnectReceiverWalletId.isEmpty()) {
            throw new RuntimeException("Konnect receiver wallet ID not configured");
        }

        try {
            // Step 1: Prepare headers with x-api-key
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", konnectApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            // Step 2: Send POST request to Konnect API (URL already contains full merchant path)
            String response = restTemplate.postForObject(
                    konnectApiUrl,
                    entity,
                    String.class
            );

            // Step 3: Parse JSON response and extract payment URL
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);
            
            // Extract the payment URL from Konnect's response
            String payUrl = (String) responseMap.get("payUrl");
            
            if (payUrl == null || payUrl.isEmpty()) {
                throw new RuntimeException("No payment URL received from Konnect API");
            }
            
            return payUrl;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Konnect API: " + e.getMessage(), e);
        }
    }

    private String generateTransactionId() {
        return UUID.randomUUID().toString();
    }
}
