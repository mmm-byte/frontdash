package com.fooddelivery.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Order Entity - Maps to Order table in database
 * Note: "Order" is a SQL keyword, so we use table name in backticks
 */
@Entity
@Table(name = "`Order`")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "restaurant", "customer", "driver", "retrievedByStaff"})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "orderID")
    private Integer orderID;

    @Column(name = "order_id_formatted", length = 20)
    private String orderIdFormatted;

    @Column(name = "restaurantID_fk", nullable = false)
    private Integer restaurantIdFk;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurantID_fk", insertable = false, updatable = false)
    private Restaurant restaurant;

    @Column(name = "customerID_fk")
    private Integer customerIdFk;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customerID_fk", insertable = false, updatable = false)
    private Customer customer;

    @Column(name = "driverID_fk")
    private Integer driverIdFk;

    @Column(name = "driver_first_name", length = 100)
    private String driverFirstName;

    @Column(name = "driver_last_name", length = 100)
    private String driverLastName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driverID_fk", insertable = false, updatable = false)
    private Driver driver;

    @Column(name = "order_time", insertable = false, updatable = false)
    private LocalDateTime orderTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "estimated_delivery_time")
    private LocalDateTime estimatedDeliveryTime;

    @Column(name = "service_charge_rate", precision = 5, scale = 4)
    private BigDecimal serviceChargeRate = new BigDecimal("0.0825");

    @Column(name = "tip_amount", precision = 10, scale = 2)
    private BigDecimal tipAmount = BigDecimal.ZERO;

    @Column(name = "subtotal_before_service", precision = 10, scale = 2, nullable = false)
    private BigDecimal subtotalBeforeService;

    @Column(name = "grand_total", precision = 10, scale = 2, nullable = false)
    private BigDecimal grandTotal;

    @Column(name = "building_number", length = 50)
    private String buildingNumber;

    @Column(name = "street_name", length = 255)
    private String streetName;

    @Column(length = 50)
    private String unit;

    @Column(length = 100)
    private String city;

    @Column(length = 2)
    private String state;

    @Column(length = 10)
    private String zipcode;

    @Column(name = "contact_name", length = 200)
    private String contactName;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "retrieved_by_staffID_fk")
    private Integer retrievedByStaffIdFk;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "retrieved_by_staffID_fk", insertable = false, updatable = false)
    private Staff retrievedByStaff;

    @Column(name = "retrieved_at")
    private LocalDateTime retrievedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    // Transient field for order items (not stored in Order table)
    @Transient
    private List<OrderItem> items;

    /**
     * Generate order_id_formatted before persisting
     * This ensures the NOT NULL constraint is satisfied
     */
    @PrePersist
    public void generateOrderIdFormatted() {
        if (this.orderIdFormatted == null || this.orderIdFormatted.isEmpty()) {
            // Set a temporary placeholder - will be updated after save in service
            this.orderIdFormatted = "TEMP";
        }
    }

    public enum OrderStatus {
        PENDING, PREPARING, READY_FOR_PICKUP, RETRIEVED, IN_TRANSIT, DELIVERED, CANCELLED, REFUNDED
    }
}
