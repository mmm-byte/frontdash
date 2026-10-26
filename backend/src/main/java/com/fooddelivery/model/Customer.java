package com.fooddelivery.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Customer Entity - Maps to Customer table in database
 * Represents customers who place orders
 */
@Entity
@Table(name = "Customer")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customerID")
    private Integer customerID;

    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 100, nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(name = "card_number_masked", nullable = false, length = 20)
    private String cardNumberMasked;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_type", nullable = false)
    private CardType cardType;

    @Column(name = "expiry_month", nullable = false)
    private Integer expiryMonth;

    @Column(name = "expiry_year", nullable = false)
    private Integer expiryYear;

    @Column(name = "cardholder_name", nullable = false, length = 200)
    private String cardholderName;

    @Column(name = "security_code_hash", nullable = false, length = 255)
    private String securityCodeHash;

    @Column(name = "building_number", length = 50)
    private String buildingNumber;

    @Column(name = "billing_street", nullable = false, length = 255)
    private String billingStreet;

    @Column(name = "billing_city", nullable = false, length = 100)
    private String billingCity;

    @Column(name = "billing_state", nullable = false, length = 2)
    private String billingState;

    @Column(name = "billing_zip", nullable = false, length = 10)
    private String billingZip;

    @Column(name = "loyalty_opt_in")
    private Boolean loyaltyOptIn = true;

    @Column(name = "loyalty_points")
    private Integer loyaltyPoints = 0;

    @Column(name = "loyalty_card_identifier", length = 255)
    private String loyaltyCardIdentifier;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private CustomerStatus status = CustomerStatus.APPROVED;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum CardType {
        VISA, MASTERCARD, DISCOVER, AMEX
    }

    public enum CustomerStatus {
        PENDING, APPROVED, REJECTED
    }
}
