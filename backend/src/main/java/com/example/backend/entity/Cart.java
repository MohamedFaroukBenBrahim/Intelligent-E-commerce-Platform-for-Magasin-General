package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"cart", "orders", "password", "verificationCode",
            "verificationExpiration", "resetPasswordToken", "resetPasswordExpiration",
            "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired",
            "provider", "enabled", "phone", "address", "profilePictureUrl"})
    private User user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Float getTotalPrice() {
        return items.stream()
                .map(item -> {
                    Float price = item.getProduct().getPrice();
                    Float discount = item.getProduct().getDiscount();
                    float effectivePrice = (discount != null && discount > 0)
                            ? price * (1 - discount / 100)
                            : price;
                    return effectivePrice * item.getQuantity();
                })
                .reduce(0f, Float::sum);
    }
}
