package com.example.backend.controller;

import com.example.backend.repository.JobApplicationRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

// DashboardController.java
@RestController
@RequestMapping("/admin/dashboard")
@PreAuthorize("hasAnyRole('ADMIN','RH')")
public class DashboardController {

    @Autowired
    OrderRepository orderRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    ProductRepository productRepository;
    @Autowired
    JobApplicationRepository jobApplicationRepository;

    private List<Map<String, Object>> normalizeKeys(List<Map<String, Object>> rows) {
        return rows.stream().map(row -> {
            Map<String, Object> normalized = new LinkedHashMap<>();
            row.forEach((key, value) -> {
                String normalizedKey = key == null ? "" : key.toLowerCase(Locale.ROOT);
                normalized.put(normalizedKey, value);
            });
            return normalized;
        }).toList();
    }

    // Orders per day (last 7 days)
    @GetMapping("/orders-per-day")
    public List<Map<String, Object>> ordersPerDay() {
        return normalizeKeys(orderRepository.countOrdersPerDay());
    }

    // Revenue per day (last 7 days)
    @GetMapping("/revenue-per-day")
    public List<Map<String, Object>> revenuePerDay() {
        return normalizeKeys(orderRepository.sumRevenuePerDay());
    }

    // Products by category
    @GetMapping("/products-by-category")
    public List<Map<String, Object>> productsByCategory() {
        return normalizeKeys(productRepository.countByCategory());
    }

    // Top 5 selling products
    @GetMapping("/top-products")
    public List<Map<String, Object>> topProducts() {
        return normalizeKeys(orderRepository.topSellingProducts());
    }

    // New users per day
    @GetMapping("/users-per-day")
    public List<Map<String, Object>> usersPerDay() {
        return normalizeKeys(userRepository.countUsersPerDay());
    }

    // Job applications by status
    @GetMapping("/applications-by-status")
    public List<Map<String, Object>> applicationsByStatus() {
        return normalizeKeys(jobApplicationRepository.countByStatus());
    }

    // Summary stats
    @GetMapping("/stats")
    public Map<String, Object> stats() {
        Map<String, Object> map = new HashMap<>();
        map.put("totalUsers", userRepository.count());
        map.put("totalOrders", orderRepository.count());
        map.put("totalRevenue", orderRepository.sumTotalRevenue());
        map.put("totalProducts", productRepository.count());
        return map;
    }
}




