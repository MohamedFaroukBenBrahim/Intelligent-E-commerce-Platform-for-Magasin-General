package com.example.backend.repository;

import com.example.backend.entity.Order;
import com.example.backend.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByStatus(OrderStatus status);
    @Query(value = "SELECT DATE(created_at) as date, COUNT(*) as count FROM orders WHERE created_at >= NOW() - INTERVAL 7 DAY GROUP BY DATE(created_at) ORDER BY date ASC", nativeQuery = true)
    List<Map<String, Object>> countOrdersPerDay();

    @Query(value = "SELECT DATE(created_at) as date, SUM(total_amount) as revenue FROM orders WHERE created_at >= NOW() - INTERVAL 7 DAY GROUP BY DATE(created_at) ORDER BY date ASC", nativeQuery = true)
    List<Map<String, Object>> sumRevenuePerDay();

    @Query("SELECT new map(p.name as name, SUM(oi.quantity) as total_sold) FROM OrderItem oi JOIN oi.product p GROUP BY p ORDER BY SUM(oi.quantity) DESC")
    List<Map<String, Object>> topSellingProducts();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    Double sumTotalRevenue();




}
