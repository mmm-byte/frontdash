package com.fooddelivery.controller;

import com.fooddelivery.dto.ApiResponse;
import com.fooddelivery.model.Driver;
import com.fooddelivery.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Driver Controller - REST API endpoints for Driver operations
 * Handles driver management (Demos 4.1-4.4)
 */
@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "http://localhost:3000")
public class DriverController {

    @Autowired
    private DriverService driverService;

    /**
     * Get All Drivers - Demo 4.1
     * GET /api/drivers
     * Returns all drivers including fired ones
     */
    @GetMapping
    public ResponseEntity<ApiResponse> getAllDrivers() {
        try {
            List<Driver> drivers = driverService.getAllDriversIncludingFired();
            return ResponseEntity.ok(new ApiResponse(true, "Drivers retrieved successfully", drivers));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve drivers: " + e.getMessage()));
        }
    }

    /**
     * Get Driver by ID - Demo 4.4 (View Details)
     * GET /api/drivers/{driverID}
     */
    @GetMapping("/{driverID}")
    public ResponseEntity<ApiResponse> getDriverById(@PathVariable Integer driverID) {
        try {
            Optional<Driver> driver = driverService.getDriverById(driverID);

            if (driver.isPresent()) {
                return ResponseEntity.ok(new ApiResponse(true, "Driver found", driver.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(false, "Driver not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve driver: " + e.getMessage()));
        }
    }

    /**
     * Get Hired Drivers (currently active)
     * GET /api/drivers/hired
     */
    @GetMapping("/hired")
    public ResponseEntity<ApiResponse> getHiredDrivers() {
        try {
            List<Driver> drivers = driverService.getDriversByStatus(Driver.DriverStatus.HIRED);
            return ResponseEntity.ok(new ApiResponse(true, "Hired drivers retrieved", drivers));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve hired drivers: " + e.getMessage()));
        }
    }

    /**
     * Get Available Drivers (alias for hired drivers)
     * GET /api/drivers/available
     */
    @GetMapping("/available")
    public ResponseEntity<ApiResponse> getAvailableDrivers() {
        try {
            List<Driver> drivers = driverService.getAvailableDrivers();
            return ResponseEntity.ok(new ApiResponse(true, "Available drivers retrieved", drivers));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve available drivers: " + e.getMessage()));
        }
    }

    /**
     * Add New Driver - Demo 4.2
     * POST /api/drivers
     */
    @PostMapping
    public ResponseEntity<ApiResponse> addDriver(@RequestBody Driver driver) {
        try {
            Driver newDriver = driverService.addDriver(driver);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Driver added successfully", newDriver));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to add driver: " + e.getMessage()));
        }
    }

    /**
     * Update Driver - Demo 4.3
     * PUT /api/drivers/{driverID}
     */
    @PutMapping("/{driverID}")
    public ResponseEntity<ApiResponse> updateDriver(
            @PathVariable Integer driverID,
            @RequestBody Driver driver) {
        try {
            Driver updatedDriver = driverService.updateDriver(driverID, driver);
            return ResponseEntity.ok(new ApiResponse(true, "Driver updated successfully", updatedDriver));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update driver: " + e.getMessage()));
        }
    }

    /**
     * Fire Driver (set status to FIRED)
     * POST /api/drivers/{driverID}/fire
     */
    @PostMapping("/{driverID}/fire")
    public ResponseEntity<ApiResponse> fireDriver(@PathVariable Integer driverID) {
        try {
            Driver firedDriver = driverService.fireDriver(driverID);
            return ResponseEntity.ok(new ApiResponse(true, "Driver fired successfully", firedDriver));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to fire driver: " + e.getMessage()));
        }
    }

    /**
     * Rehire Driver (set status back to HIRED)
     * POST /api/drivers/{driverID}/rehire
     */
    @PostMapping("/{driverID}/rehire")
    public ResponseEntity<ApiResponse> rehireDriver(@PathVariable Integer driverID) {
        try {
            Driver rehiredDriver = driverService.rehireDriver(driverID);
            return ResponseEntity.ok(new ApiResponse(true, "Driver rehired successfully", rehiredDriver));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to rehire driver: " + e.getMessage()));
        }
    }

    /**
     * Update Driver Status
     * PATCH /api/drivers/{driverID}/status
     */
    @PatchMapping("/{driverID}/status")
    public ResponseEntity<ApiResponse> updateDriverStatus(
            @PathVariable Integer driverID,
            @RequestBody java.util.Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            Driver.DriverStatus status = Driver.DriverStatus.valueOf(statusStr.toUpperCase());
            Driver updatedDriver = driverService.updateDriverStatus(driverID, status);
            return ResponseEntity.ok(new ApiResponse(true, "Driver status updated", updatedDriver));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Invalid status. Use HIRED or FIRED."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update driver status: " + e.getMessage()));
        }
    }

    /**
     * Delete Driver - Demo 4.3 (alternative)
     * DELETE /api/drivers/{driverID}
     */
    @DeleteMapping("/{driverID}")
    public ResponseEntity<ApiResponse> deleteDriver(@PathVariable Integer driverID) {
        try {
            driverService.deleteDriver(driverID);
            return ResponseEntity.ok(new ApiResponse(true, "Driver deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to delete driver: " + e.getMessage()));
        }
    }
}
