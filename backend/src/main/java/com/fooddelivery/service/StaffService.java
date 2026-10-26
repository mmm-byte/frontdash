package com.fooddelivery.service;

import com.fooddelivery.model.LoginCredentials;
import com.fooddelivery.model.Staff;
import com.fooddelivery.repository.LoginCredentialsRepository;
import com.fooddelivery.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Staff Service - Business logic for Staff operations
 * Note: Authentication is now handled by AuthController using LoginCredentials
 */
@Service
public class StaffService {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private LoginCredentialsRepository loginCredentialsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get all staff members
     */
    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    /**
     * Get all active staff members (excluding deleted/inactive)
     */
    public List<Staff> getActiveStaff() {
        return staffRepository.findByStatus(Staff.StaffStatus.ACTIVE);
    }

    /**
     * Get staff by ID
     */
    public Optional<Staff> getStaffById(Integer staffID) {
        return staffRepository.findById(staffID);
    }

    /**
     * Get staff by username
     */
    public Optional<Staff> getStaffByUsername(String username) {
        return staffRepository.findByUsernameFk(username);
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
     * Generate unique username from lastname + 2 digits
     * Format: lastname (lowercase) + two digits (00-99)
     * Ensures uniqueness by incrementing digits if username exists
     */
    private String generateUniqueUsername(String lastName) {
        String baseUsername = lastName.toLowerCase().replaceAll("[^a-z]", "");

        // Try up to 100 combinations (00-99)
        for (int i = 0; i < 100; i++) {
            String username = baseUsername + String.format("%02d", i);
            if (!loginCredentialsRepository.existsByUsername(username)) {
                return username;
            }
        }

        // If all combinations taken, throw exception
        throw new RuntimeException("Unable to generate unique username for lastname: " + lastName);
    }

    /**
     * Generate secure random password
     * Format: 12 characters with uppercase, lowercase, digits, and special characters
     */
    private String generateSecurePassword() {
        String upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lowerCase = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String special = "!@#$%&*";
        String allChars = upperCase + lowerCase + digits + special;

        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder password = new StringBuilder(12);

        // Ensure at least one of each type
        password.append(upperCase.charAt(random.nextInt(upperCase.length())));
        password.append(lowerCase.charAt(random.nextInt(lowerCase.length())));
        password.append(digits.charAt(random.nextInt(digits.length())));
        password.append(special.charAt(random.nextInt(special.length())));

        // Fill remaining 8 characters randomly
        for (int i = 4; i < 12; i++) {
            password.append(allChars.charAt(random.nextInt(allChars.length())));
        }

        // Shuffle the password characters
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }

        return new String(passwordArray);
    }

    /**
     * Add new staff member with auto-generated login credentials
     * Only requires firstName and lastName (email optional)
     * Username: lastname + 2 digits (auto-generated to ensure uniqueness)
     * Password: 12-character secure random password (auto-generated)
     * Returns Map with staff object, username, and password
     */
    @Transactional
    public Map<String, Object> addStaffWithAutoCredentials(Staff staff) {
        // Validate names
        validateName(staff.getFirstName(), staff.getLastName());

        // Check if email already exists (if provided)
        if (staff.getEmail() != null && !staff.getEmail().isEmpty()
                && staffRepository.existsByEmail(staff.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Auto-generate unique username from lastname
        String username = generateUniqueUsername(staff.getLastName());

        // Auto-generate secure password
        String password = generateSecurePassword();

        // Create login credentials
        LoginCredentials credentials = new LoginCredentials();
        credentials.setUsername(username);
        credentials.setPasswordHash(passwordEncoder.encode(password));
        credentials.setUsertype(LoginCredentials.UserType.STAFF);
        credentials.setAccountStatus(LoginCredentials.AccountStatus.ACTIVE);
        loginCredentialsRepository.save(credentials);

        // Set username foreign key and status
        staff.setUsernameFk(username);
        staff.setStatus(Staff.StaffStatus.ACTIVE);

        // Save staff
        Staff savedStaff = staffRepository.save(staff);

        // Return staff with credentials (for admin to disseminate)
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("staff", savedStaff);
        result.put("username", username);
        result.put("password", password);

        return result;
    }

    /**
     * Add new staff member with login credentials (legacy method for backward compatibility)
     */
    @Transactional
    public Staff addStaff(Staff staff, String username, String password) {
        // Validate names
        validateName(staff.getFirstName(), staff.getLastName());

        // Check if username already exists
        if (loginCredentialsRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (staff.getEmail() != null && staffRepository.existsByEmail(staff.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create login credentials first
        LoginCredentials credentials = new LoginCredentials();
        credentials.setUsername(username);
        credentials.setPasswordHash(passwordEncoder.encode(password));
        credentials.setUsertype(LoginCredentials.UserType.STAFF);
        credentials.setAccountStatus(LoginCredentials.AccountStatus.ACTIVE);
        loginCredentialsRepository.save(credentials);

        // Set username foreign key
        staff.setUsernameFk(username);
        staff.setStatus(Staff.StaffStatus.ACTIVE);

        return staffRepository.save(staff);
    }

    /**
     * Update staff member (basic info only)
     */
    public Staff updateStaff(Integer staffID, Staff updatedStaff) {
        Staff existingStaff = staffRepository.findById(staffID)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        validateName(updatedStaff.getFirstName(), updatedStaff.getLastName());
        existingStaff.setFirstName(updatedStaff.getFirstName());
        existingStaff.setLastName(updatedStaff.getLastName());
        existingStaff.setEmail(updatedStaff.getEmail());
        existingStaff.setPhone(updatedStaff.getPhone());

        return staffRepository.save(existingStaff);
    }

    /**
     * Update staff status
     */
    public Staff updateStaffStatus(Integer staffID, Staff.StaffStatus status) {
        Staff staff = staffRepository.findById(staffID)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        staff.setStatus(status);
        return staffRepository.save(staff);
    }

    /**
     * Delete staff member (soft delete by setting status to INACTIVE)
     */
    public void deleteStaff(Integer staffID) {
        Staff staff = staffRepository.findById(staffID)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        staff.setStatus(Staff.StaffStatus.INACTIVE);
        staffRepository.save(staff);
    }

    /**
     * Hard delete staff member (also deletes login credentials due to CASCADE)
     */
    @Transactional
    public void hardDeleteStaff(Integer staffID) {
        if (!staffRepository.existsById(staffID)) {
            throw new RuntimeException("Staff not found");
        }
        staffRepository.deleteById(staffID);
    }
}
