package com.example.backend.service;

import com.example.backend.dto.StatsDto;
import com.example.backend.entity.OrderStatus;
import com.example.backend.entity.PaymentStatus;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatsService {
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;

    public StatsService(UserRepository userRepository, 
                       ProductRepository productRepository, 
                       OrderRepository orderRepository,
                       CategoryRepository categoryRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.categoryRepository = categoryRepository;
    }

    public StatsDto getStats(){
        StatsDto stats = new StatsDto();
        
        // Basic Metrics
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();
        double totalRevenue = orderRepository.sumTotalRevenue() != null ? orderRepository.sumTotalRevenue() : 0.0;
        long totalProducts = productRepository.count();
        
        stats.setTotalUsers(totalUsers);
        stats.setTotalOrders(totalOrders);
        stats.setTotalRevenue(totalRevenue);
        stats.setTotalProducts(totalProducts);
        
        // Order Status Breakdown
        stats.setPendingOrders(orderRepository.findByStatus(OrderStatus.PENDING).size());
        stats.setConfirmedOrders(orderRepository.findByStatus(OrderStatus.CONFIRMED).size());
        stats.setShippedOrders(orderRepository.findByStatus(OrderStatus.SHIPPED).size());
        stats.setDeliveredOrders(orderRepository.findByStatus(OrderStatus.DELIVERED).size());
        stats.setCancelledOrders(orderRepository.findByStatus(OrderStatus.CANCELLED).size());
        
        // Payment Status (counting from orders with respective payment status)
        stats.setCompletedPayments(countOrdersByPaymentStatus(PaymentStatus.COMPLETED));
        stats.setPendingPayments(countOrdersByPaymentStatus(PaymentStatus.PENDING));
        stats.setFailedPayments(countOrdersByPaymentStatus(PaymentStatus.FAILED));
        
        // Product Metrics
        stats.setActiveProducts(totalProducts);
        stats.setTotalCategories(categoryRepository.count());
        stats.setAverageProductPrice(productRepository.getAveragePrice() != null ? productRepository.getAveragePrice() : 0.0);
        stats.setLowStockProducts(0); // Will be set if you have a stock field
        
        // Monthly Metrics
        stats.setNewUsersThisMonth(countUsersCreatedThisMonth());
        stats.setOrdersThisMonth(countOrdersThisMonth());
        stats.setRevenueThisMonth(sumRevenueThisMonth());
        
        // Customer Metrics
        stats.setAverageOrderValue(totalOrders > 0 ? totalRevenue / totalOrders : 0.0);
        stats.setAverageRevenuePerUser(totalUsers > 0 ? totalRevenue / totalUsers : 0.0);
        stats.setReturningCustomers(countReturningCustomers());
        
        // Performance Health Score (0-100%)
        double healthScore = calculatePlatformHealthScore(totalProducts, totalOrders);
        stats.setPlatformHealthScore(healthScore);
        
        // Phase 2: Advanced Metrics
        stats.setTopSellingProducts(getTopSellingProducts(5));
        stats.setCategoryRevenue(getCategoryRevenueBreakdown());
        stats.setMonthlyRevenueTrend(getMonthlyRevenueTrend(6));
        
        return stats;
    }
    
    private long countOrdersByPaymentStatus(PaymentStatus status) {
        return orderRepository.findAll().stream()
            .filter(o -> o.getPaymentStatus() == status)
            .count();
    }
    
    private long countUsersCreatedThisMonth() {
        YearMonth currentMonth = YearMonth.now();
        return userRepository.findAll().stream()
            .filter(u -> u.getCreatedAt() != null && 
                    YearMonth.from(u.getCreatedAt()).equals(currentMonth))
            .count();
    }
    
    private long countOrdersThisMonth() {
        YearMonth currentMonth = YearMonth.now();
        return orderRepository.findAll().stream()
            .filter(o -> o.getCreatedAt() != null && 
                    YearMonth.from(o.getCreatedAt()).equals(currentMonth))
            .count();
    }
    
    private double sumRevenueThisMonth() {
        YearMonth currentMonth = YearMonth.now();
        return orderRepository.findAll().stream()
            .filter(o -> o.getCreatedAt() != null && 
                    YearMonth.from(o.getCreatedAt()).equals(currentMonth))
            .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0.0)
            .sum();
    }
    
    private long countReturningCustomers() {
        return userRepository.findAll().stream()
            .filter(u -> {
                long userOrderCount = orderRepository.findByUserIdOrderByCreatedAtDesc(u.getId()).size();
                return userOrderCount > 1;
            })
            .count();
    }
    
    private double calculatePlatformHealthScore(long totalProducts, long totalOrders) {
        // Health score: 40% products (max 20 products), 60% orders (max 50 orders per month)
        double productScore = Math.min((totalProducts / 20.0) * 40, 40);
        long ordersThisMonth = countOrdersThisMonth();
        double orderScore = Math.min((ordersThisMonth / 50.0) * 60, 60);
        return Math.round((productScore + orderScore) * 100.0) / 100.0;
    }
    
    // Phase 2: Advanced Metrics Methods
    
    /**
     * Get top N selling products with quantity and revenue
     */
    private List<Map<String, Object>> getTopSellingProducts(int limit) {
        List<Map<String, Object>> topProducts = orderRepository.topSellingProducts();
        
        if (topProducts.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Limit to N products and calculate revenue for each
        return topProducts.stream()
            .limit(limit)
            .map(product -> {
                Map<String, Object> result = new HashMap<>(product);
                String productName = (String) product.get("name");
                Long quantitySold = product.get("total_sold") != null ? 
                    ((Number) product.get("total_sold")).longValue() : 0L;
                
                // Calculate revenue: sum of (quantity * price) for this product
                double revenue = orderRepository.findAll().stream()
                    .flatMap(order -> order.getItems().stream())
                    .filter(item -> item.getProduct().getName().equals(productName))
                    .mapToDouble(item -> (item.getQuantity() * item.getProduct().getPrice()))
                    .sum();
                
                result.put("revenue", revenue);
                return result;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get revenue breakdown by category
     */
    private List<Map<String, Object>> getCategoryRevenueBreakdown() {
        List<Map<String, Object>> categoryList = new ArrayList<>();
        
        productRepository.findAll().forEach(product -> {
            String categoryName = product.getCategorie() != null ? 
                product.getCategorie().getName() : "Uncategorized";
            
            double categoryRevenue = orderRepository.findAll().stream()
                .flatMap(order -> order.getItems().stream())
                .filter(item -> item.getProduct().getCategorie() != null &&
                       item.getProduct().getCategorie().getName().equals(categoryName))
                .mapToDouble(item -> (item.getQuantity() * item.getProduct().getPrice()))
                .sum();
            
            // Avoid duplicates
            boolean exists = categoryList.stream()
                .anyMatch(c -> c.get("category").equals(categoryName));
            
            if (!exists && categoryRevenue > 0) {
                Map<String, Object> catMap = new HashMap<>();
                catMap.put("category", categoryName);
                catMap.put("revenue", categoryRevenue);
                categoryList.add(catMap);
            }
        });
        
        return categoryList.stream()
            .sorted((a, b) -> Double.compare(
                (Double) b.get("revenue"), 
                (Double) a.get("revenue")))
            .collect(Collectors.toList());
    }
    
    /**
     * Get monthly revenue trend for last N months
     */
    private List<Map<String, Object>> getMonthlyRevenueTrend(int months) {
        List<Map<String, Object>> monthlyTrend = new ArrayList<>();
        
        for (int i = months - 1; i >= 0; i--) {
            YearMonth monthToCheck = YearMonth.now().minusMonths(i);
            
            double monthRevenue = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt() != null && 
                       YearMonth.from(o.getCreatedAt()).equals(monthToCheck))
                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0.0)
                .sum();
            
            Map<String, Object> monthMap = new HashMap<>();
            monthMap.put("month", monthToCheck.toString());
            monthMap.put("revenue", monthRevenue);
            monthlyTrend.add(monthMap);
        }
        
        return monthlyTrend;
    }
}
