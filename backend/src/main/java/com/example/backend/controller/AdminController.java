package com.example.backend.controller;

import com.example.backend.dto.RegisterUserDto;
import com.example.backend.dto.StatsDto;
import com.example.backend.dto.StockAdjustmentDto;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;
import com.example.backend.service.ProductService;
import com.example.backend.service.StatsService;
import com.example.backend.service.UserService;
import com.example.backend.service.ExcelExportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final StatsService statsService;
    private final ProductService productService;
    private final ExcelExportService excelExportService;

    public AdminController(UserService userService,
                           StatsService statsService,
                           ProductService productService,
                           ExcelExportService excelExportService) {
        this.userService = userService;
        this.statsService = statsService;
        this.productService = productService;
        this.excelExportService = excelExportService;
    }

    // 1. View statistics
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StatsDto> getStats() {
        return ResponseEntity.ok(statsService.getStats());
    }

    // 2. Export statistics as Excel
    @GetMapping("/stats/export")
    @PreAuthorize("hasRole('ADMIN')")
    public void exportStats(HttpServletResponse response) throws IOException {
        StatsDto stats = statsService.getStats();
        excelExportService.exportStatsToExcel(stats, response);
    }

    // 3. Get all users
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    // 4. Search users by keyword (username or email)
    @GetMapping("/users/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String keyword) {
        return ResponseEntity.ok(userService.searchUsers(keyword));
    }

    // 5. Toggle user status between USER and HR
    @PatchMapping("/users/{id}/toggle-user-hr")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> toggleUserHrStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserHrStatus(id));
    }

    // 6. Modify a user
    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> modifyUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.modifyUser(id, user));
    }

    // 7. Disable or enable  a user
    @PatchMapping("/users/{id}/enabledisable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> enabledisableUser(@PathVariable Long id) {
        userService.enableordisableUser(id);
        return ResponseEntity.noContent().build();
    }



}
