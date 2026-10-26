package com.fooddelivery.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * RestaurantRequest Entity - Maps to RestaurantRequest table
 * Handles both REGISTRATION and WITHDRAWAL requests
 */
@Entity
@Table(name = "RestaurantRequest")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "restaurant", "admin"})
public class RestaurantRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "requestID")
    private Integer requestID;

    @Column(name = "restaurantID_fk", nullable = false)
    private Integer restaurantIdFk;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurantID_fk", insertable = false, updatable = false)
    private Restaurant restaurant;

    @Column(name = "submitted_at", insertable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "decided_at")
    private LocalDateTime decidedAt;

    @Column(name = "adminID_fk")
    private Integer adminIdFk;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adminID_fk", insertable = false, updatable = false)
    private Staff admin;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false)
    private RequestType requestType;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum RequestStatus {
        PENDING, APPROVED, REJECTED
    }

    public enum RequestType {
        REGISTRATION, WITHDRAWAL
    }
}
