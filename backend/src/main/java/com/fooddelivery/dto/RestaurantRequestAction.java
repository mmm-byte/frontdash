package com.fooddelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Restaurant Request Action DTO
 * For approving/rejecting registration and withdrawal requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantRequestAction {
    private String action;        // APPROVE or REJECT
    private String notes;         // Admin notes
    private String username;      // Optional: for creating login
    private String password;      // Optional: for creating login
}
