package com.fooddelivery.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Restaurant Entity - Maps to Restaurant table in database
 * Represents restaurants in the system
 */
@Entity
@Table(name = "Restaurant")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "loginCredentials"})
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "restaurantID")
    private Integer restaurantID;

    @Column(name = "name", length = 255, nullable = false, unique = true)
    private String name;

    @Column(name = "picture_url", length = 500)
    private String pictureUrl;

    @Column(name = "building_number", length = 50)
    private String buildingNumber;

    @Column(name = "street", length = 255, nullable = false)
    private String street;

    @Column(name = "city", length = 100, nullable = false)
    private String city;

    @Column(name = "state", length = 2, nullable = false)
    private String state;

    @Column(name = "zip", length = 10, nullable = false)
    private String zip;

    @Column(name = "phone", length = 20, nullable = false)
    private String phone;

    @Column(name = "contact_name", length = 200, nullable = false)
    private String contactName;

    @Column(name = "email", length = 255, nullable = false)
    private String email;

    @Column(name = "hours_json", columnDefinition = "TEXT")
    private String hoursJson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RestaurantStatus status = RestaurantStatus.PENDING;

    @Column(name = "username_fk", length = 50)
    private String usernameFk;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "username_fk", referencedColumnName = "username", insertable = false, updatable = false)
    private LoginCredentials loginCredentials;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum RestaurantStatus {
        PENDING, APPROVED, WITHDRAWN, REJECTED
    }
}
