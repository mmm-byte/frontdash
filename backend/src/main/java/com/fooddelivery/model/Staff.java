package com.fooddelivery.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Staff Entity - Maps to Staff table in database
 * Represents staff members who manage orders and drivers
 */
@Entity
@Table(name = "Staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "loginCredentials"})
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "staffID")
    private Integer staffID;

    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 100, nullable = false)
    private String lastName;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StaffStatus status = StaffStatus.ACTIVE;

    @Column(name = "username_fk", nullable = false, length = 50)
    private String usernameFk;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "username_fk", referencedColumnName = "username", insertable = false, updatable = false)
    private LoginCredentials loginCredentials;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum StaffStatus {
        ACTIVE, INACTIVE
    }
}
