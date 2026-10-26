package com.fooddelivery.service;

import com.fooddelivery.model.LoginCredentials;
import com.fooddelivery.model.Restaurant;
import com.fooddelivery.repository.LoginCredentialsRepository;
import com.fooddelivery.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Restaurant Service - Business logic for Restaurant operations
 * Note: Authentication is now handled by AuthController using LoginCredentials
 */
@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private LoginCredentialsRepository loginCredentialsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get all restaurants
     */
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    /**
     * Get restaurant by ID
     */
    public Optional<Restaurant> getRestaurantById(Integer restaurantID) {
        return restaurantRepository.findById(restaurantID);
    }

    /**
     * Get restaurant by username
     */
    public Optional<Restaurant> getRestaurantByUsername(String username) {
        return restaurantRepository.findByUsernameFk(username);
    }

    /**
     * Get restaurants by status
     */
    public List<Restaurant> getRestaurantsByStatus(Restaurant.RestaurantStatus status) {
        return restaurantRepository.findByStatus(status);
    }

    /**
     * Validate contact name (must be at least 2 characters for first and last name)
     */
    private void validateContactName(String contactName) {
        if (contactName != null && !contactName.trim().isEmpty()) {
            String[] nameParts = contactName.trim().split("\\s+");
            if (nameParts.length < 2) {
                throw new IllegalArgumentException("Contact name must include both first and last name (at least 2 characters each)");
            }
            for (String part : nameParts) {
                if (part.length() < 2) {
                    throw new IllegalArgumentException("Each part of the contact name must be at least 2 characters long");
                }
            }
        }
    }

    /**
     * Create restaurant (for registration - without login credentials yet)
     */
    public Restaurant createRestaurant(Restaurant restaurant) {
        validateContactName(restaurant.getContactName());

        if (restaurant.getEmail() != null && restaurantRepository.existsByEmail(restaurant.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Set default status
        if (restaurant.getStatus() == null) {
            restaurant.setStatus(Restaurant.RestaurantStatus.PENDING);
        }

        return restaurantRepository.save(restaurant);
    }

    /**
     * Update restaurant status
     */
    public Restaurant updateRestaurantStatus(Integer restaurantID, Restaurant.RestaurantStatus status) {
        Restaurant restaurant = restaurantRepository.findById(restaurantID)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        restaurant.setStatus(status);
        return restaurantRepository.save(restaurant);
    }

    /**
     * Update restaurant details (partial update - only non-null fields)
     */
    public Restaurant updateRestaurant(Integer restaurantID, Restaurant updatedRestaurant) {
        Restaurant restaurant = restaurantRepository.findById(restaurantID)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        // Only update fields that are provided (not null)
        if (updatedRestaurant.getName() != null) {
            restaurant.setName(updatedRestaurant.getName());
        }
        if (updatedRestaurant.getEmail() != null) {
            restaurant.setEmail(updatedRestaurant.getEmail());
        }
        if (updatedRestaurant.getPhone() != null) {
            restaurant.setPhone(updatedRestaurant.getPhone());
        }
        if (updatedRestaurant.getStreet() != null) {
            restaurant.setStreet(updatedRestaurant.getStreet());
        }
        if (updatedRestaurant.getCity() != null) {
            restaurant.setCity(updatedRestaurant.getCity());
        }
        if (updatedRestaurant.getState() != null) {
            restaurant.setState(updatedRestaurant.getState());
        }
        if (updatedRestaurant.getZip() != null) {
            restaurant.setZip(updatedRestaurant.getZip());
        }
        if (updatedRestaurant.getContactName() != null) {
            validateContactName(updatedRestaurant.getContactName());
            restaurant.setContactName(updatedRestaurant.getContactName());
        }
        if (updatedRestaurant.getHoursJson() != null) {
            restaurant.setHoursJson(updatedRestaurant.getHoursJson());
        }
        if (updatedRestaurant.getPictureUrl() != null) {
            restaurant.setPictureUrl(updatedRestaurant.getPictureUrl());
        }

        return restaurantRepository.save(restaurant);
    }

    /**
     * Set restaurant login credentials (for approved registrations)
     * Creates LoginCredentials and links to restaurant
     */
    @Transactional
    public Restaurant setLoginCredentials(Integer restaurantID, String username, String password) {
        Restaurant restaurant = restaurantRepository.findById(restaurantID)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        // Check if username already exists
        if (loginCredentialsRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        // Create login credentials
        LoginCredentials credentials = new LoginCredentials();
        credentials.setUsername(username);
        credentials.setPasswordHash(passwordEncoder.encode(password));
        credentials.setUsertype(LoginCredentials.UserType.RESTAURANT);
        credentials.setAccountStatus(LoginCredentials.AccountStatus.ACTIVE);
        loginCredentialsRepository.save(credentials);

        // Link restaurant to credentials
        restaurant.setUsernameFk(username);
        restaurant.setStatus(Restaurant.RestaurantStatus.APPROVED);

        return restaurantRepository.save(restaurant);
    }

    /**
     * Delete restaurant (soft delete by setting status to WITHDRAWN)
     */
    public Restaurant deleteRestaurant(Integer restaurantID) {
        Restaurant restaurant = restaurantRepository.findById(restaurantID)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        restaurant.setStatus(Restaurant.RestaurantStatus.WITHDRAWN);
        return restaurantRepository.save(restaurant);
    }
}
