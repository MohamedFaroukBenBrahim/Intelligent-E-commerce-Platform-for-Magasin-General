package com.example.backend.repository;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByVerificationCode(String verificationCode);
    Optional<User> findByResetPasswordToken(String resetPasswordToken);
    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> findByNameOrEmail(@Param("keyword") String keyword);

    // Used to find all admin accounts when sending low-stock alert emails.
    List<User> findByRole(Role role);

    @Query(value = "SELECT DATE(COALESCE(created_at, NOW())) as date, COUNT(*) as count FROM users WHERE COALESCE(created_at, NOW()) >= NOW() - INTERVAL 7 DAY GROUP BY DATE(COALESCE(created_at, NOW())) ORDER BY date ASC", nativeQuery = true)
    List<Map<String, Object>> countUsersPerDay();


}
