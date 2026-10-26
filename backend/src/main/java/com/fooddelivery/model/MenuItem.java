package com.fooddelivery.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * MenuItem Entity - Maps to MenuItem table in database
 * Represents menu items offered by restaurants
 */
@Entity
@Table(name = "MenuItem")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "restaurant"})
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "itemID")
    private Integer itemID;

    @Column(name = "restaurantID_fk", nullable = false)
    private Integer restaurantIdFk;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurantID_fk", insertable = false, updatable = false)
    private Restaurant restaurant;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "picture_url", length = 500)
    private String pictureUrl;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Availability availability = Availability.AVAILABLE;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum Availability {
        AVAILABLE, UNAVAILABLE
    }
}
