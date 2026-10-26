package com.fooddelivery.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Driver Entity - Maps to Driver table in database
 * Represents delivery drivers
 */
@Entity
@Table(name = "Driver")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "driverID")
    private Integer driverID;

    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 100, nullable = false)
    private String lastName;

    @Column(name = "phone", length = 20, nullable = false)
    private String phone;

    @Column(name = "license", length = 50)
    private String license;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicle = VehicleType.car;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriverStatus status = DriverStatus.HIRED;

    @Column(name = "hired_at")
    private LocalDateTime hiredAt;

    @Column(name = "fired_at")
    private LocalDateTime firedAt;

    public enum VehicleType {
        motorcycle, car, van, truck
    }

    public enum DriverStatus {
        HIRED, FIRED
    }
}
