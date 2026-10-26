package com.fooddelivery.controller;

import com.fooddelivery.dto.ApiResponse;
import com.fooddelivery.dto.RestaurantRequestAction;
import com.fooddelivery.model.MenuItem;
import com.fooddelivery.model.Restaurant;
import com.fooddelivery.model.RestaurantRequest;
import com.fooddelivery.service.MenuItemService;
import com.fooddelivery.service.RestaurantRequestService;
import com.fooddelivery.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Restaurant Controller - REST API endpoints for Restaurant operations
 * Handles menu management and requests (Demos 5-9)
 * Note: Authentication now in AuthController
 */
@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "http://localhost:3000")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private MenuItemService menuItemService;

    @Autowired
    private RestaurantRequestService requestService;

    /**
     * Get All Restaurants (optionally filter by status)
     * GET /api/restaurants?status=APPROVED
     */
    @GetMapping
    public ResponseEntity<ApiResponse> getAllRestaurants(@RequestParam(required = false) String status) {
        try {
            List<Restaurant> restaurants;

            if (status != null && !status.isEmpty()) {
                Restaurant.RestaurantStatus restaurantStatus = Restaurant.RestaurantStatus.valueOf(status.toUpperCase());
                restaurants = restaurantService.getRestaurantsByStatus(restaurantStatus);
            } else {
                restaurants = restaurantService.getAllRestaurants();
            }

            return ResponseEntity.ok(new ApiResponse(true, "Restaurants retrieved successfully", restaurants));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Invalid status. Use: PENDING, APPROVED, WITHDRAWN, REJECTED"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve restaurants: " + e.getMessage()));
        }
    }

    /**
     * Get Restaurant by ID
     * GET /api/restaurants/{restaurantID}
     */
    @GetMapping("/{restaurantID}")
    public ResponseEntity<ApiResponse> getRestaurantById(@PathVariable Integer restaurantID) {
        try {
            Optional<Restaurant> restaurant = restaurantService.getRestaurantById(restaurantID);

            if (restaurant.isPresent()) {
                return ResponseEntity.ok(new ApiResponse(true, "Restaurant found", restaurant.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(false, "Restaurant not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve restaurant: " + e.getMessage()));
        }
    }

    /**
     * Update Restaurant
     * PUT /api/restaurants/{restaurantID}
     */
    @PutMapping("/{restaurantID}")
    public ResponseEntity<ApiResponse> updateRestaurant(
            @PathVariable Integer restaurantID,
            @RequestBody Restaurant updatedRestaurant) {
        try {
            Restaurant restaurant = restaurantService.updateRestaurant(restaurantID, updatedRestaurant);
            return ResponseEntity.ok(new ApiResponse(true, "Restaurant updated successfully", restaurant));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update restaurant: " + e.getMessage()));
        }
    }

    // ========== Menu Management (Demo 7) ==========

    /**
     * Get Menu Items - Demo 7.1
     * GET /api/restaurants/{restaurantID}/menu
     */
    @GetMapping("/{restaurantID}/menu")
    public ResponseEntity<ApiResponse> getMenu(@PathVariable Integer restaurantID) {
        try {
            List<MenuItem> menu = menuItemService.getMenuItemsByRestaurant(restaurantID);
            return ResponseEntity.ok(new ApiResponse(true, "Menu retrieved successfully", menu));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve menu: " + e.getMessage()));
        }
    }

    /**
     * Add Menu Item - Demo 7.2
     * POST /api/restaurants/{restaurantID}/menu
     */
    @PostMapping("/{restaurantID}/menu")
    public ResponseEntity<ApiResponse> addMenuItem(
            @PathVariable Integer restaurantID,
            @RequestBody MenuItem menuItem) {
        try {
            menuItem.setRestaurantIdFk(restaurantID);
            MenuItem newItem = menuItemService.addMenuItem(menuItem);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Menu item added successfully", newItem));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to add menu item: " + e.getMessage()));
        }
    }

    /**
     * Update Menu Item - Demo 7.2
     * PUT /api/restaurants/menu/{menuItemID}
     */
    @PutMapping("/menu/{menuItemID}")
    public ResponseEntity<ApiResponse> updateMenuItem(
            @PathVariable Integer menuItemID,
            @RequestBody MenuItem menuItem) {
        try {
            MenuItem updatedItem = menuItemService.updateMenuItem(menuItemID, menuItem);
            return ResponseEntity.ok(new ApiResponse(true, "Menu item updated successfully", updatedItem));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update menu item: " + e.getMessage()));
        }
    }

    /**
     * Delete Menu Item - Demo 7.3
     * DELETE /api/restaurants/menu/{menuItemID}
     */
    @DeleteMapping("/menu/{menuItemID}")
    public ResponseEntity<ApiResponse> deleteMenuItem(@PathVariable Integer menuItemID) {
        try {
            menuItemService.deleteMenuItem(menuItemID);
            return ResponseEntity.ok(new ApiResponse(true, "Menu item deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to delete menu item: " + e.getMessage()));
        }
    }

    /**
     * Toggle Menu Item Availability
     * PATCH /api/restaurants/menu/{menuItemID}/toggle
     */
    @PatchMapping("/menu/{menuItemID}/toggle")
    public ResponseEntity<ApiResponse> toggleMenuItemAvailability(@PathVariable Integer menuItemID) {
        try {
            MenuItem updatedItem = menuItemService.toggleAvailability(menuItemID);
            return ResponseEntity.ok(new ApiResponse(true, "Menu item availability toggled", updatedItem));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to toggle availability: " + e.getMessage()));
        }
    }

    // ========== Restaurant Registration ==========

    /**
     * Register a new restaurant
     * POST /api/restaurants/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerRestaurant(@RequestBody Map<String, Object> requestData) {
        try {
            // Create restaurant
            Restaurant restaurant = new Restaurant();
            restaurant.setName((String) requestData.get("name"));
            restaurant.setPictureUrl((String) requestData.get("picture"));
            restaurant.setBuildingNumber((String) requestData.get("building"));
            restaurant.setStreet((String) requestData.get("street"));
            restaurant.setCity((String) requestData.get("city"));
            restaurant.setState((String) requestData.get("state"));
            restaurant.setZip((String) requestData.get("zip"));
            restaurant.setPhone((String) requestData.get("phone"));
            restaurant.setContactName((String) requestData.get("contactPerson"));
            restaurant.setEmail((String) requestData.get("email"));
            restaurant.setStatus(Restaurant.RestaurantStatus.PENDING);

            // Convert hours map to JSON string
            @SuppressWarnings("unchecked")
            Map<String, String> hours = (Map<String, String>) requestData.get("hours");
            if (hours != null) {
                restaurant.setHoursJson(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(hours));
            }

            Restaurant savedRestaurant = restaurantService.createRestaurant(restaurant);

            // Add menu items
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> menuItems = (List<Map<String, Object>>) requestData.get("menu");
            if (menuItems != null) {
                for (Map<String, Object> item : menuItems) {
                    MenuItem menuItem = new MenuItem();
                    menuItem.setRestaurantIdFk(savedRestaurant.getRestaurantID());
                    menuItem.setName((String) item.get("name"));
                    menuItem.setPictureUrl((String) item.get("picture"));
                    menuItem.setPrice(new java.math.BigDecimal(item.get("price").toString()));
                    menuItem.setAvailability(MenuItem.Availability.valueOf(
                        ((String) item.get("availability")).toUpperCase()
                    ));
                    menuItemService.addMenuItem(menuItem);
                }
            }

            // Create registration request
            RestaurantRequest request = new RestaurantRequest();
            request.setRestaurantIdFk(savedRestaurant.getRestaurantID());
            request.setRequestType(RestaurantRequest.RequestType.REGISTRATION);
            request.setNotes("New restaurant registration");
            requestService.createRequest(request);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Restaurant registration submitted successfully", savedRestaurant));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to register restaurant: " + e.getMessage()));
        }
    }

    // ========== Restaurant Requests (Demos 8-9) ==========

    /**
     * Create Restaurant Request - Demo 8.1 (Registration), Demo 9.1 (Withdrawal)
     * POST /api/restaurants/requests
     */
    @PostMapping("/requests")
    public ResponseEntity<ApiResponse> createRequest(@RequestBody Map<String, Object> requestData) {
        try {
            String requestTypeStr = (String) requestData.get("requestType");
            RestaurantRequest.RequestType requestType = RestaurantRequest.RequestType.valueOf(requestTypeStr.toUpperCase());
            String notes = (String) requestData.getOrDefault("notes", "");

            RestaurantRequest request = new RestaurantRequest();
            request.setRequestType(requestType);
            request.setNotes(notes);

            // If it's a registration, create/update restaurant
            if (requestType == RestaurantRequest.RequestType.REGISTRATION && requestData.containsKey("restaurant")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> restaurantData = (Map<String, Object>) requestData.get("restaurant");

                Restaurant restaurant = new Restaurant();
                restaurant.setName((String) restaurantData.get("name"));
                restaurant.setStreet((String) restaurantData.get("street"));
                restaurant.setCity((String) restaurantData.get("city"));
                restaurant.setState((String) restaurantData.get("state"));
                restaurant.setZip((String) restaurantData.get("zip"));
                restaurant.setPhone((String) restaurantData.get("phone"));
                restaurant.setStatus(Restaurant.RestaurantStatus.PENDING);

                Restaurant savedRestaurant = restaurantService.createRestaurant(restaurant);
                request.setRestaurantIdFk(savedRestaurant.getRestaurantID());
            } else if (requestData.containsKey("restaurantID")) {
                Integer restaurantID = Integer.valueOf(requestData.get("restaurantID").toString());
                request.setRestaurantIdFk(restaurantID);
            }

            RestaurantRequest savedRequest = requestService.createRequest(request);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Request submitted successfully", savedRequest));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Invalid request type. Use REGISTRATION or WITHDRAWAL."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to create request: " + e.getMessage()));
        }
    }

    /**
     * Get All Requests - Demo 8.2, Demo 9.2
     * GET /api/restaurants/requests
     */
    @GetMapping("/requests")
    public ResponseEntity<ApiResponse> getAllRequests(@RequestParam(required = false) String type) {
        try {
            List<RestaurantRequest> requests;

            if (type != null) {
                RestaurantRequest.RequestType requestType = RestaurantRequest.RequestType.valueOf(type.toUpperCase());
                requests = requestService.getRequestsByType(requestType);
            } else {
                requests = requestService.getAllRequests();
            }

            // Enrich requests with restaurant name
            List<Map<String, Object>> enrichedRequests = requests.stream().map(req -> {
                Map<String, Object> enriched = new java.util.HashMap<>();
                enriched.put("requestID", req.getRequestID());
                enriched.put("restaurantIdFk", req.getRestaurantIdFk());
                enriched.put("submittedAt", req.getSubmittedAt());
                enriched.put("status", req.getStatus());
                enriched.put("decidedAt", req.getDecidedAt());
                enriched.put("adminIdFk", req.getAdminIdFk());
                enriched.put("requestType", req.getRequestType());
                enriched.put("notes", req.getNotes());

                // Add restaurant name
                if (req.getRestaurantIdFk() != null) {
                    Optional<Restaurant> restaurant = restaurantService.getRestaurantById(req.getRestaurantIdFk());
                    restaurant.ifPresent(r -> enriched.put("restaurantName", r.getName()));
                }

                return enriched;
            }).collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(new ApiResponse(true, "Requests retrieved successfully", enrichedRequests));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Invalid request type"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve requests: " + e.getMessage()));
        }
    }

    /**
     * Get Pending Requests
     * GET /api/restaurants/requests/pending
     */
    @GetMapping("/requests/pending")
    public ResponseEntity<ApiResponse> getPendingRequests() {
        try {
            List<RestaurantRequest> requests = requestService.getPendingRequests();
            return ResponseEntity.ok(new ApiResponse(true, "Pending requests retrieved", requests));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve pending requests: " + e.getMessage()));
        }
    }

    /**
     * Approve/Reject Request - Demo 8.3, 8.4, 9.3, 9.4
     * PATCH /api/restaurants/requests/{requestID}
     */
    @PatchMapping("/requests/{requestID}")
    public ResponseEntity<ApiResponse> processRequest(
            @PathVariable Integer requestID,
            @RequestBody RestaurantRequestAction action) {
        try {
            RestaurantRequest processedRequest;

            if ("APPROVE".equals(action.getAction())) {
                processedRequest = requestService.approveRequest(
                    requestID,
                    action.getNotes(),
                    action.getUsername(),
                    action.getPassword()
                );
            } else if ("REJECT".equals(action.getAction())) {
                processedRequest = requestService.rejectRequest(requestID, action.getNotes());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(false, "Action must be APPROVE or REJECT"));
            }

            return ResponseEntity.ok(new ApiResponse(true, "Request processed successfully", processedRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to process request: " + e.getMessage()));
        }
    }
}
