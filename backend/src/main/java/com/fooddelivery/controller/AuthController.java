package com.fooddelivery.controller;

import com.fooddelivery.dto.ApiResponse;
import com.fooddelivery.dto.LoginRequest;
import com.fooddelivery.model.LoginCredentials;
import com.fooddelivery.model.Restaurant;
import com.fooddelivery.model.Staff;
import com.fooddelivery.repository.LoginCredentialsRepository;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Auth Controller - Unified authentication endpoint
 * Handles login for staff, admin, and restaurant users
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private LoginCredentialsRepository loginCredentialsRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Unified Login Endpoint
     * POST /api/auth/login
     * Supports loginType: 'admin', 'staff', 'restaurant'
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest request) {
        try {
            String username = request.getUsername();
            String password = request.getPassword();
            String loginType = request.getLoginType();

            if (username == null || password == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Username and password are required"));
            }

            // Find login credentials
            Optional<LoginCredentials> credentials = loginCredentialsRepository.findByUsername(username);

            if (credentials.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Invalid credentials"));
            }

            LoginCredentials loginCreds = credentials.get();

            // SECURITY CHECK: Verify usertype matches the login page
            String expectedUserType = loginType.toUpperCase();
            String actualUserType = loginCreds.getUsertype().toString();

            if (!actualUserType.equals(expectedUserType)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false,
                            "This account is registered as " + actualUserType.toLowerCase() +
                            ", not " + loginType + ". Please use the correct login page."));
            }

            // Verify password
            if (!passwordEncoder.matches(password, loginCreds.getPasswordHash())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Invalid credentials"));
            }

            // Check account status
            if (loginCreds.getAccountStatus() != LoginCredentials.AccountStatus.ACTIVE) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "Account is " + loginCreds.getAccountStatus()));
            }

            // Update last login time
            loginCreds.setLastLoginAt(LocalDateTime.now());
            loginCredentialsRepository.save(loginCreds);

            // Build response based on user type
            Map<String, Object> data = new HashMap<>();
            data.put("username", username);
            data.put("usertype", loginCreds.getUsertype().toString());
            data.put("passwordChanged", loginCreds.getPasswordChanged());

            // Get additional user details
            if (loginCreds.getUsertype() == LoginCredentials.UserType.STAFF ||
                loginCreds.getUsertype() == LoginCredentials.UserType.ADMIN) {

                Optional<Staff> staff = staffRepository.findByUsernameFk(username);
                if (staff.isPresent()) {
                    Staff s = staff.get();
                    data.put("staffID", s.getStaffID());
                    data.put("firstName", s.getFirstName());
                    data.put("lastName", s.getLastName());
                    data.put("name", s.getFirstName() + " " + s.getLastName()); // Combined name for frontend
                    data.put("email", s.getEmail());
                    data.put("role", loginCreds.getUsertype().toString().toLowerCase());
                }
            } else if (loginCreds.getUsertype() == LoginCredentials.UserType.RESTAURANT) {
                Optional<Restaurant> restaurant = restaurantRepository.findByUsernameFk(username);
                if (restaurant.isPresent()) {
                    Restaurant r = restaurant.get();
                    data.put("restaurantID", r.getRestaurantID());
                    data.put("restaurantName", r.getName());
                    data.put("name", r.getName()); // Restaurant name for frontend
                    data.put("email", r.getEmail());
                    data.put("status", r.getStatus().toString());
                }
            }

            return ResponseEntity.ok(new ApiResponse(true, "Login successful", data));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Login failed: " + e.getMessage()));
        }
    }

    /**
     * Logout Endpoint
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        return ResponseEntity.ok(new ApiResponse(true, "Logout successful"));
    }

    /**
     * Change Password Endpoint
     * POST /api/auth/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (username == null || currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Username, current password, and new password are required"));
            }

            // Find user credentials
            Optional<LoginCredentials> credentials = loginCredentialsRepository.findByUsername(username);

            if (credentials.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Invalid credentials"));
            }

            LoginCredentials loginCreds = credentials.get();

            // Verify current password
            if (!passwordEncoder.matches(currentPassword, loginCreds.getPasswordHash())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Current password is incorrect"));
            }

            // Update to new password
            loginCreds.setPasswordHash(passwordEncoder.encode(newPassword));
            loginCreds.setPasswordChanged(true);
            loginCredentialsRepository.save(loginCreds);

            return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to change password: " + e.getMessage()));
        }
    }

    /**
     * Check Session Endpoint
     * GET /api/auth/check-session
     */
    @GetMapping("/check-session")
    public ResponseEntity<ApiResponse> checkSession() {
        // In a real implementation, this would check session/JWT token
        return ResponseEntity.ok(new ApiResponse(false, "No active session"));
    }
}
