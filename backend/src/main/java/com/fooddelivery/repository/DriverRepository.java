package com.fooddelivery.repository;

import com.fooddelivery.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Driver Repository - Database access for Driver table
 */
@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {

    /**
     * Find all drivers by status
     */
    List<Driver> findByStatus(Driver.DriverStatus status);

    /**
     * Find available drivers
     */
    List<Driver> findByStatusOrderByHiredAtAsc(Driver.DriverStatus status);

    /**
     * Check if driver exists
     */
    boolean existsByDriverID(Integer driverID);

    /**
     * Check if phone number is already registered
     */
    boolean existsByPhone(String phone);

    /**
     * Check if license number is already registered
     */
    boolean existsByLicense(String license);
}
