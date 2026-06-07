package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"categorie", "category", "description", "state", "createdAt", "rate"})
    private Product product;

    @Column(nullable = false)
    private int quantity;

    public Float getSubtotal() {
        if (product == null) return 0f;
        Float price = product.getPrice();
        Float discount = product.getDiscount();
        float effectivePrice = (discount != null && discount > 0)
                ? price * (1 - discount / 100)
                : price;
        return effectivePrice * quantity;
    }
}
