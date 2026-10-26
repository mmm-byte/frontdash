package com.fooddelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Login Request DTO
 * Used for unified authentication (staff, admin, restaurant)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String username;     // For all login types
    private String staffID;      // Deprecated: use username instead
    private String email;        // Deprecated: use username instead
    private String password;
    private String loginType;    // 'admin', 'staff', 'restaurant'
}
