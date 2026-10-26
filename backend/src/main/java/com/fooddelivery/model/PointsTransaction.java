package com.fooddelivery.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * PointsTransaction Entity - Maps to PointsTransaction table
 * Tracks loyalty points earned, redeemed, or adjusted
 */
@Entity
@Table(name = "PointsTransaction")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PointsTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "txnID")
    private Integer txnID;

    @Column(name = "customerID_fk", nullable = false)
    private Integer customerIdFk;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customerID_fk", insertable = false, updatable = false)
    private Customer customer;

    @Column(name = "orderID_fk")
    private Integer orderIdFk;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderID_fk", insertable = false, updatable = false)
    private Order order;

    @Column(name = "points_delta", nullable = false)
    private Integer pointsDelta;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionReason reason;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum TransactionReason {
        EARN, REDEEM, ADJUSTMENT
    }
}
