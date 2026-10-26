package com.fooddelivery.service;

import com.fooddelivery.model.MenuItem;
import com.fooddelivery.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * MenuItem Service - Business logic for MenuItem operations
 */
@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    /**
     * Get all menu items for a restaurant
     */
    public List<MenuItem> getMenuItemsByRestaurant(Integer restaurantIdFk) {
        return menuItemRepository.findByRestaurantIdFk(restaurantIdFk);
    }

    /**
     * Get available menu items for a restaurant
     */
    public List<MenuItem> getAvailableMenuItems(Integer restaurantIdFk) {
        return menuItemRepository.findByRestaurantIdFkAndAvailability(
            restaurantIdFk,
            MenuItem.Availability.AVAILABLE
        );
    }

    /**
     * Get menu item by ID
     */
    public Optional<MenuItem> getMenuItemById(Integer itemID) {
        return menuItemRepository.findById(itemID);
    }

    /**
     * Add menu item
     */
    public MenuItem addMenuItem(MenuItem menuItem) {
        // Set default availability if not provided
        if (menuItem.getAvailability() == null) {
            menuItem.setAvailability(MenuItem.Availability.AVAILABLE);
        }
        return menuItemRepository.save(menuItem);
    }

    /**
     * Update menu item
     */
    public MenuItem updateMenuItem(Integer itemID, MenuItem updatedMenuItem) {
        MenuItem menuItem = menuItemRepository.findById(itemID)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        menuItem.setName(updatedMenuItem.getName());
        menuItem.setPrice(updatedMenuItem.getPrice());

        if (updatedMenuItem.getAvailability() != null) {
            menuItem.setAvailability(updatedMenuItem.getAvailability());
        }

        return menuItemRepository.save(menuItem);
    }

    /**
     * Delete menu item
     */
    public void deleteMenuItem(Integer itemID) {
        if (!menuItemRepository.existsById(itemID)) {
            throw new RuntimeException("Menu item not found");
        }
        menuItemRepository.deleteById(itemID);
    }

    /**
     * Toggle menu item availability
     */
    public MenuItem toggleAvailability(Integer itemID) {
        MenuItem menuItem = menuItemRepository.findById(itemID)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        // Toggle between AVAILABLE and UNAVAILABLE
        if (menuItem.getAvailability() == MenuItem.Availability.AVAILABLE) {
            menuItem.setAvailability(MenuItem.Availability.UNAVAILABLE);
        } else {
            menuItem.setAvailability(MenuItem.Availability.AVAILABLE);
        }

        return menuItemRepository.save(menuItem);
    }

    /**
     * Set menu item availability status
     */
    public MenuItem setAvailability(Integer itemID, MenuItem.Availability availability) {
        MenuItem menuItem = menuItemRepository.findById(itemID)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        menuItem.setAvailability(availability);
        return menuItemRepository.save(menuItem);
    }
}
