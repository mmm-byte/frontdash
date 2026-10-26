package com.fooddelivery.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * LoginCredentials Entity - Maps to LoginCredentials table
 * Stores authentication credentials for staff, admin, and restaurants
 */
@Entity
@Table(name = "LoginCredentials")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginCredentials {

    @Id
    @Column(length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "password_changed", nullable = false)
    private Boolean passwordChanged = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserType usertype;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status")
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    public enum UserType {
        ADMIN, STAFF, RESTAURANT
    }

    public enum AccountStatus {
        ACTIVE, INACTIVE, LOCKED
    }
}
