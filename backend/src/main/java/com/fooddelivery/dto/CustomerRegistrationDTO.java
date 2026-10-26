package com.fooddelivery.dto;

import lombok.Data;

/**
 * DTO for customer registration
 * Contains fields that need to be processed before saving
 */
@Data
public class CustomerRegistrationDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    // Card information (raw, will be masked/hashed)
    private String cardNumber;
    private String cardType;
    private Integer expiryMonth;
    private Integer expiryYear;
    private String cardholderName;
    private String securityCode;

    // Billing address
    private String buildingNumber;
    private String billingStreet;
    private String billingCity;
    private String billingState;
    private String billingZip;

    // Loyalty
    private Boolean loyaltyOptIn;
}
