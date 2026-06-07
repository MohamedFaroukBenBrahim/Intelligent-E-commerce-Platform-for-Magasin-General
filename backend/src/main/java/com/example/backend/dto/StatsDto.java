package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class StatsDto {
    // Basic Metrics
    private long totalUsers;
    private long totalOrders;
    private double totalRevenue;
    private long totalProducts;
    
    // Order Status Breakdown
    private long pendingOrders;
    private long confirmedOrders;
    private long shippedOrders;
    private long deliveredOrders;
    private long cancelledOrders;
    
    // Payment Status
    private long completedPayments;
    private long pendingPayments;
    private long failedPayments;
    
    // Product Metrics
    private long activeProducts;
    private long totalCategories;
    private double averageProductPrice;
    private long lowStockProducts;
    
    // Monthly Metrics (Current Month)
    private long newUsersThisMonth;
    private long ordersThisMonth;
    private double revenueThisMonth;
    
    // Customer Metrics
    private double averageOrderValue;
    private double averageRevenuePerUser;
    private long returningCustomers;
    
    // Performance Metrics
    private double platformHealthScore; // Percentage based on active products and orders
    
    // Phase 2: Advanced Metrics
    private List<Map<String, Object>> topSellingProducts; // Top 5 products with qty and revenue
    private List<Map<String, Object>> categoryRevenue; // Revenue breakdown by category
    private List<Map<String, Object>> monthlyRevenueTrend; // Last 6 months revenue trend
}

