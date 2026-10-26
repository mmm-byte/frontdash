package com.fooddelivery.service;

import com.fooddelivery.model.Driver;
import com.fooddelivery.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Driver Service - Business logic for Driver operations
 */
@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    /**
     * Get all drivers (only active/hired drivers by default)
     */
    public List<Driver> getAllDrivers() {
        return driverRepository.findByStatus(Driver.DriverStatus.HIRED);
    }

    /**
     * Get all drivers including fired ones
     */
    public List<Driver> getAllDriversIncludingFired() {
        return driverRepository.findAll();
    }

    /**
     * Get driver by ID
     */
    public Optional<Driver> getDriverById(Integer driverID) {
        return driverRepository.findById(driverID);
    }

    /**
     * Get drivers by status
     */
    public List<Driver> getDriversByStatus(Driver.DriverStatus status) {
        return driverRepository.findByStatus(status);
    }

    /**
     * Get hired drivers
     */
    public List<Driver> getHiredDrivers() {
        return driverRepository.findByStatus(Driver.DriverStatus.HIRED);
    }

    /**
     * Get available drivers (alias for hired)
     */
    public List<Driver> getAvailableDrivers() {
        return getHiredDrivers();
    }

    /**
     * Validate name fields (first and last name must be at least 2 characters)
     */
    private void validateName(String firstName, String lastName) {
        if (firstName == null || firstName.trim().length() < 2) {
            throw new IllegalArgumentException("First name must be at least 2 characters long");
        }
        if (lastName == null || lastName.trim().length() < 2) {
            throw new IllegalArgumentException("Last name must be at least 2 characters long");
        }
    }

    /**
     * Add new driver
     */
    public Driver addDriver(Driver driver) {
        // Validate names
        validateName(driver.getFirstName(), driver.getLastName());

        // Validate phone number
        if (driverRepository.existsByPhone(driver.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        // Validate license number (if provided)
        if (driver.getLicense() != null && !driver.getLicense().trim().isEmpty()) {
            if (driverRepository.existsByLicense(driver.getLicense())) {
                throw new RuntimeException("License number already registered");
            }
        }

        // Set default status if not provided
        if (driver.getStatus() == null) {
            driver.setStatus(Driver.DriverStatus.HIRED);
        }

        // Set hired_at timestamp for new drivers
        if (driver.getHiredAt() == null) {
            driver.setHiredAt(LocalDateTime.now());
        }

        return driverRepository.save(driver);
    }

    /**
     * Update driver
     */
    public Driver updateDriver(Integer driverID, Driver updatedDriver) {
        Driver existingDriver = driverRepository.findById(driverID)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        validateName(updatedDriver.getFirstName(), updatedDriver.getLastName());
        existingDriver.setFirstName(updatedDriver.getFirstName());
        existingDriver.setLastName(updatedDriver.getLastName());
        existingDriver.setPhone(updatedDriver.getPhone());
        existingDriver.setVehicle(updatedDriver.getVehicle());
        existingDriver.setLicense(updatedDriver.getLicense());

        return driverRepository.save(existingDriver);
    }

    /**
     * Update driver status (hire/fire)
     */
    public Driver updateDriverStatus(Integer driverID, Driver.DriverStatus status) {
        Driver driver = driverRepository.findById(driverID)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        driver.setStatus(status);

        // Set fired_at timestamp if firing
        if (status == Driver.DriverStatus.FIRED) {
            driver.setFiredAt(LocalDateTime.now());
        }

        return driverRepository.save(driver);
    }

    /**
     * Fire driver (soft delete)
     */
    public Driver fireDriver(Integer driverID) {
        return updateDriverStatus(driverID, Driver.DriverStatus.FIRED);
    }

    /**
     * Rehire driver
     */
    public Driver rehireDriver(Integer driverID) {
        Driver driver = driverRepository.findById(driverID)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        driver.setStatus(Driver.DriverStatus.HIRED);
        driver.setFiredAt(null); // Clear fired timestamp

        return driverRepository.save(driver);
    }

    /**
     * Delete driver (soft delete - sets status to FIRED)
     */
    public void deleteDriver(Integer driverID) {
        Driver driver = driverRepository.findById(driverID)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        driver.setStatus(Driver.DriverStatus.FIRED);
        driver.setFiredAt(LocalDateTime.now());
        driverRepository.save(driver);
    }

    /**
     * Hard delete driver (permanent removal)
     */
    public void hardDeleteDriver(Integer driverID) {
        if (!driverRepository.existsById(driverID)) {
            throw new RuntimeException("Driver not found");
        }
        driverRepository.deleteById(driverID);
    }
}
