package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="name",nullable = false,length = 255)
    private String name;

    @Column(name="description",length = 1000)
    private String description;

    @Column(length = 100)
    private String state;

    @Column(name="price",nullable = false)
    private Float price;

    @Column(name="discount")
    private Float discount;

    @Column(name="rate")
    private Float rate;

    @Column(name="quantity")
    private int quantity;

    /**
     * If > 0, an alert email is sent to all admins whenever the quantity
     * falls to or below this value (after an order or manual adjustment).
     * Default 0 means "no threshold configured" — no alerts will fire.
     * columnDefinition ensures MySQL sets 0 (not NULL) for new rows.
     */
    @Column(name = "min_stock_threshold", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int minStockThreshold = 0;

    @ManyToOne
    @JoinColumn(name ="categorie_id")
    @JsonIgnoreProperties("products")
    @JsonProperty("category")
    @JsonAlias("categorie")
    private Category categorie;

    private String imageUrl;

    private LocalDateTime createdAt;
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();

    }

}
