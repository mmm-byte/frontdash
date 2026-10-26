package com.fooddelivery.controller;

import com.fooddelivery.dto.ApiResponse;
import com.fooddelivery.dto.UpdateOrderStatusRequest;
import com.fooddelivery.model.Order;
import com.fooddelivery.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Order Controller - REST API endpoints for Order operations
 * Handles order viewing and status updates (Demos 2.1-2.3)
 */
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * Get All Orders - Demo 2.1
     * GET /api/orders?status=PENDING (optional status filter)
     */
    @GetMapping
    public ResponseEntity<ApiResponse> getAllOrders(@RequestParam(required = false) String status) {
        try {
            List<Order> orders;

            if (status != null && !status.isEmpty()) {
                // Filter by status if provided
                Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
                orders = orderService.getOrdersByStatus(orderStatus);
            } else {
                // Return all orders if no status filter
                orders = orderService.getAllOrders();
            }

            return ResponseEntity.ok(new ApiResponse(true, "Orders retrieved successfully", orders));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Invalid status. Use: PENDING, PREPARING, READY_FOR_PICKUP, RETRIEVED, IN_TRANSIT, DELIVERED, CANCELLED, REFUNDED"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve orders: " + e.getMessage()));
        }
    }

    /**
     * Get Order by ID - Demo 2.2
     * GET /api/orders/{orderID}
     */
    @GetMapping("/{orderID}")
    public ResponseEntity<ApiResponse> getOrderById(@PathVariable Integer orderID) {
        try {
            Optional<Order> order = orderService.getOrderById(orderID);

            if (order.isPresent()) {
                return ResponseEntity.ok(new ApiResponse(true, "Order found", order.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(false, "Order not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve order: " + e.getMessage()));
        }
    }

    /**
     * Get Orders by Restaurant
     * GET /api/orders/restaurant/{restaurantID}
     */
    @GetMapping("/restaurant/{restaurantID}")
    public ResponseEntity<ApiResponse> getOrdersByRestaurant(@PathVariable Integer restaurantID) {
        try {
            List<Order> orders = orderService.getOrdersByRestaurant(restaurantID);
            return ResponseEntity.ok(new ApiResponse(true, "Orders retrieved successfully", orders));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve orders: " + e.getMessage()));
        }
    }

    /**
     * Get Orders by Status
     * GET /api/orders/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse> getOrdersByStatus(@PathVariable String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            List<Order> orders = orderService.getOrdersByStatus(orderStatus);
            return ResponseEntity.ok(new ApiResponse(true, "Orders retrieved successfully", orders));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Invalid status. Use: PENDING, RETRIEVED, IN_TRANSIT, DELIVERED, CANCELLED, REFUNDED"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve orders: " + e.getMessage()));
        }
    }

    /**
     * Update Order Status - Demo 2.3
     * PATCH /api/orders/{orderID}/status
     */
    @PatchMapping("/{orderID}/status")
    public ResponseEntity<ApiResponse> updateOrderStatus(
            @PathVariable Integer orderID,
            @RequestBody UpdateOrderStatusRequest request) {
        try {
            Order.OrderStatus status = Order.OrderStatus.valueOf(request.getStatus().toUpperCase());
            Order updatedOrder = orderService.updateOrderStatus(
                orderID,
                status,
                request.getStaffID(),
                request.getDriverID()
            );

            Map<String, Object> data = new HashMap<>();
            data.put("orderID", updatedOrder.getOrderID());
            data.put("status", updatedOrder.getStatus().toString());

            return ResponseEntity.ok(new ApiResponse(true, "Order status updated successfully", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Invalid status"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update order status: " + e.getMessage()));
        }
    }

    /**
     * Assign Driver to Order
     * POST /api/orders/{orderID}/assign-driver
     */
    @PostMapping("/{orderID}/assign-driver")
    public ResponseEntity<ApiResponse> assignDriver(
            @PathVariable Integer orderID,
            @RequestBody Map<String, Integer> request) {
        try {
            Integer driverID = request.get("driverID");
            Order updatedOrder = orderService.assignDriver(orderID, driverID);

            return ResponseEntity.ok(new ApiResponse(true, "Driver assigned successfully", updatedOrder));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to assign driver: " + e.getMessage()));
        }
    }

    /**
     * Create New Order
     * POST /api/orders
     */
    @PostMapping
    public ResponseEntity<ApiResponse> createOrder(@RequestBody Order order) {
        try {
            Order newOrder = orderService.createOrder(order);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Order created successfully", newOrder));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to create order: " + e.getMessage()));
        }
    }
}
