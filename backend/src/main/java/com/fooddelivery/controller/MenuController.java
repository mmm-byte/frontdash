package com.fooddelivery.controller;

import com.fooddelivery.dto.ApiResponse;
import com.fooddelivery.model.MenuItem;
import com.fooddelivery.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * MenuController - REST API endpoints for MenuItem management
 * Base path: /api/menu
 */
@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "http://localhost:3000")
public class MenuController {

    @Autowired
    private MenuItemService menuItemService;

    /**
     * Get all menu items for a restaurant
     * GET /api/menu/restaurant/{restaurantId}
     */
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<ApiResponse> getMenuItemsByRestaurant(@PathVariable Integer restaurantId) {
        try {
            List<MenuItem> menuItems = menuItemService.getMenuItemsByRestaurant(restaurantId);
            return ResponseEntity.ok(
                new ApiResponse(true, "Menu items retrieved successfully", menuItems)
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, "Failed to retrieve menu items: " + e.getMessage()));
        }
    }

    /**
     * Get available menu items for a restaurant
     * GET /api/menu/restaurant/{restaurantId}/available
     */
    @GetMapping("/restaurant/{restaurantId}/available")
    public ResponseEntity<ApiResponse> getAvailableMenuItems(@PathVariable Integer restaurantId) {
        try {
            List<MenuItem> menuItems = menuItemService.getAvailableMenuItems(restaurantId);
            return ResponseEntity.ok(
                new ApiResponse(true, "Available menu items retrieved successfully", menuItems)
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, "Failed to retrieve available menu items: " + e.getMessage()));
        }
    }

    /**
     * Get menu item by ID
     * GET /api/menu/{itemId}
     */
    @GetMapping("/{itemId}")
    public ResponseEntity<ApiResponse> getMenuItemById(@PathVariable Integer itemId) {
        try {
            Optional<MenuItem> menuItem = menuItemService.getMenuItemById(itemId);
            if (menuItem.isPresent()) {
                return ResponseEntity.ok(
                    new ApiResponse(true, "Menu item retrieved successfully", menuItem.get())
                );
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, "Menu item not found"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, "Failed to retrieve menu item: " + e.getMessage()));
        }
    }

    /**
     * Add new menu item
     * POST /api/menu
     */
    @PostMapping
    public ResponseEntity<ApiResponse> addMenuItem(@RequestBody MenuItem menuItem) {
        try {
            MenuItem createdMenuItem = menuItemService.addMenuItem(menuItem);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(true, "Menu item added successfully", createdMenuItem));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, "Failed to add menu item: " + e.getMessage()));
        }
    }

    /**
     * Update menu item
     * PUT /api/menu/{itemId}
     */
    @PutMapping("/{itemId}")
    public ResponseEntity<ApiResponse> updateMenuItem(
            @PathVariable Integer itemId,
            @RequestBody MenuItem menuItem) {
        try {
            MenuItem updatedMenuItem = menuItemService.updateMenuItem(itemId, menuItem);
            return ResponseEntity.ok(
                new ApiResponse(true, "Menu item updated successfully", updatedMenuItem)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, "Failed to update menu item: " + e.getMessage()));
        }
    }

    /**
     * Delete menu item
     * DELETE /api/menu/{itemId}
     */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse> deleteMenuItem(@PathVariable Integer itemId) {
        try {
            menuItemService.deleteMenuItem(itemId);
            return ResponseEntity.ok(
                new ApiResponse(true, "Menu item deleted successfully")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, "Failed to delete menu item: " + e.getMessage()));
        }
    }

    /**
     * Toggle menu item availability
     * PATCH /api/menu/{itemId}/toggle-availability
     */
    @PatchMapping("/{itemId}/toggle-availability")
    public ResponseEntity<ApiResponse> toggleAvailability(@PathVariable Integer itemId) {
        try {
            MenuItem updatedMenuItem = menuItemService.toggleAvailability(itemId);
            return ResponseEntity.ok(
                new ApiResponse(true, "Menu item availability toggled", updatedMenuItem)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, "Failed to toggle availability: " + e.getMessage()));
        }
    }

    /**
     * Set menu item availability
     * PATCH /api/menu/{itemId}/availability
     */
    @PatchMapping("/{itemId}/availability")
    public ResponseEntity<ApiResponse> setAvailability(
            @PathVariable Integer itemId,
            @RequestParam String status) {
        try {
            MenuItem.Availability availability = MenuItem.Availability.valueOf(status.toUpperCase());
            MenuItem updatedMenuItem = menuItemService.setAvailability(itemId, availability);
            return ResponseEntity.ok(
                new ApiResponse(true, "Menu item availability updated", updatedMenuItem)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse(false, "Invalid availability status. Use AVAILABLE or UNAVAILABLE"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, "Failed to update availability: " + e.getMessage()));
        }
    }
}
