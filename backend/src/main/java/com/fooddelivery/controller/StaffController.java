package com.fooddelivery.controller;

import com.fooddelivery.dto.ApiResponse;
import com.fooddelivery.model.Staff;
import com.fooddelivery.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Staff Controller - REST API endpoints for Staff operations
 * Handles CRUD operations (authentication now in AuthController)
 */
@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "http://localhost:3000")
public class StaffController {

    @Autowired
    private StaffService staffService;

    /**
     * Get All Staff - Demo 3.1
     * GET /api/staff
     * Returns only ACTIVE staff by default (excludes deleted/inactive)
     * Use ?includeInactive=true to get all staff including inactive
     */
    @GetMapping
    public ResponseEntity<ApiResponse> getAllStaff(
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        try {
            List<Staff> staffList;
            if (includeInactive) {
                staffList = staffService.getAllStaff();
            } else {
                staffList = staffService.getActiveStaff();
            }
            return ResponseEntity.ok(new ApiResponse(true, "Staff retrieved successfully", staffList));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve staff: " + e.getMessage()));
        }
    }

    /**
     * Get Staff by ID
     * GET /api/staff/{staffID}
     */
    @GetMapping("/{staffID}")
    public ResponseEntity<ApiResponse> getStaffById(@PathVariable Integer staffID) {
        try {
            Optional<Staff> staff = staffService.getStaffById(staffID);

            if (staff.isPresent()) {
                return ResponseEntity.ok(new ApiResponse(true, "Staff found", staff.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(false, "Staff not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve staff: " + e.getMessage()));
        }
    }

    /**
     * Add New Staff - Demo 3.1
     * POST /api/staff
     * Request body: { "firstName": "...", "lastName": "...", "email": "..." (optional) }
     * System auto-generates:
     *   - Username: lastname + 2 digits (e.g., smith07)
     *   - Password: 12-character secure random password
     * Returns staff info with generated credentials for admin to disseminate
     */
    @PostMapping
    public ResponseEntity<ApiResponse> addStaff(@RequestBody Map<String, String> request) {
        try {
            String firstName = request.get("firstName");
            String lastName = request.get("lastName");
            String email = request.get("email");

            // Validate required fields
            if (firstName == null || firstName.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(false, "First name is required"));
            }
            if (lastName == null || lastName.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(false, "Last name is required"));
            }

            // Create Staff object with only required fields
            Staff staff = new Staff();
            staff.setFirstName(firstName);
            staff.setLastName(lastName);
            if (email != null && !email.trim().isEmpty()) {
                staff.setEmail(email);
            }
            // Phone is not required for staff registration

            // Use new auto-generation method
            Map<String, Object> result = staffService.addStaffWithAutoCredentials(staff);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Staff added successfully. Please provide login credentials to the staff member.", result));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to add staff: " + e.getMessage()));
        }
    }

    /**
     * Update Staff
     * PUT /api/staff/{staffID}
     */
    @PutMapping("/{staffID}")
    public ResponseEntity<ApiResponse> updateStaff(
            @PathVariable Integer staffID,
            @RequestBody Staff staff) {
        try {
            Staff updatedStaff = staffService.updateStaff(staffID, staff);
            return ResponseEntity.ok(new ApiResponse(true, "Staff updated successfully", updatedStaff));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update staff: " + e.getMessage()));
        }
    }

    /**
     * Delete Staff - Demo 3.2 (soft delete - sets status to INACTIVE)
     * DELETE /api/staff/{staffID}
     */
    @DeleteMapping("/{staffID}")
    public ResponseEntity<ApiResponse> deleteStaff(@PathVariable Integer staffID) {
        try {
            staffService.deleteStaff(staffID);
            return ResponseEntity.ok(new ApiResponse(true, "Staff deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to delete staff: " + e.getMessage()));
        }
    }
}
