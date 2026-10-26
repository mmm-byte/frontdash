package com.fooddelivery.controller;

import com.fooddelivery.dto.ApiResponse;
import com.fooddelivery.model.Customer;
import com.fooddelivery.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

/**
 * CustomerController - REST API endpoints for Customer management
 * Base path: /api/customers
 */
@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    /**
     * Get all customers
     * GET /api/customers
     */
    @GetMapping
    public ResponseEntity<ApiResponse> getAllCustomers() {
        try {
            List<Customer> customers = customerService.getAllCustomers();
            return ResponseEntity.ok(new ApiResponse(true, "Customers retrieved successfully", customers));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve customers: " + e.getMessage()));
        }
    }

    /**
     * Get pending customer registrations
     * GET /api/customers/status/pending
     */
    @GetMapping("/status/pending")
    public ResponseEntity<ApiResponse> getPendingCustomers() {
        try {
            List<Customer> pendingCustomers = customerService.getCustomersByStatus(Customer.CustomerStatus.PENDING);
            return ResponseEntity.ok(new ApiResponse(true, "Pending customers retrieved", pendingCustomers));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve pending customers: " + e.getMessage()));
        }
    }

    /**
     * Get customer by ID
     * GET /api/customers/{customerId}
     */
    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse> getCustomerById(@PathVariable Integer customerId) {
        try {
            Customer customer = customerService.getCustomerById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
            return ResponseEntity.ok(new ApiResponse(true, "Customer retrieved successfully", customer));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve customer: " + e.getMessage()));
        }
    }

    /**
     * Create new customer (registration)
     * POST /api/customers
     */
    @PostMapping
    public ResponseEntity<ApiResponse> createCustomer(@RequestBody com.fooddelivery.dto.CustomerRegistrationDTO registrationDTO) {
        try {
            Customer createdCustomer = customerService.registerCustomer(registrationDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Customer registered successfully", createdCustomer));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Failed to create customer: " + e.getMessage()));
        }
    }

    /**
     * Update customer
     * PUT /api/customers/{customerId}
     */
    @PutMapping("/{customerId}")
    public ResponseEntity<ApiResponse> updateCustomer(@PathVariable Integer customerId, @RequestBody Customer customer) {
        try {
            Customer updatedCustomer = customerService.updateCustomer(customerId, customer);
            return ResponseEntity.ok(new ApiResponse(true, "Customer updated successfully", updatedCustomer));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Failed to update customer: " + e.getMessage()));
        }
    }

    /**
     * Update customer status (approve/reject registration)
     * PATCH /api/customers/{customerId}/status
     */
    @PatchMapping("/{customerId}/status")
    public ResponseEntity<ApiResponse> updateCustomerStatus(
            @PathVariable Integer customerId,
            @RequestParam String status) {
        try {
            Customer.CustomerStatus customerStatus = Customer.CustomerStatus.valueOf(status.toUpperCase());
            Customer updatedCustomer = customerService.updateCustomerStatus(customerId, customerStatus);
            return ResponseEntity.ok(new ApiResponse(true, "Customer status updated successfully", updatedCustomer));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Invalid status. Use: PENDING, APPROVED, or REJECTED"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update customer status: " + e.getMessage()));
        }
    }

    /**
     * Delete customer
     * DELETE /api/customers/{customerId}
     */
    @DeleteMapping("/{customerId}")
    public ResponseEntity<ApiResponse> deleteCustomer(@PathVariable Integer customerId) {
        try {
            customerService.deleteCustomer(customerId);
            return ResponseEntity.ok(new ApiResponse(true, "Customer deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to delete customer: " + e.getMessage()));
        }
    }

    /**
     * Search customer by email
     * GET /api/customers/search/email?email={email}
     */
    @GetMapping("/search/email")
    public ResponseEntity<ApiResponse> searchByEmail(@RequestParam String email) {
        try {
            Customer customer = customerService.getCustomerByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Customer not found with email: " + email));
            return ResponseEntity.ok(new ApiResponse(true, "Customer found", customer));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Search failed: " + e.getMessage()));
        }
    }

    /**
     * Search customer by phone number
     * GET /api/customers/search/phone?phone={phone}
     */
    @GetMapping("/search/phone")
    public ResponseEntity<ApiResponse> searchByPhone(@RequestParam String phone) {
        try {
            Customer customer = customerService.getCustomerByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("Customer not found with phone: " + phone));
            return ResponseEntity.ok(new ApiResponse(true, "Customer found", customer));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Search failed: " + e.getMessage()));
        }
    }

    /**
     * Get customer payment info by ID (for payment verification)
     * GET /api/customers/payment-info/{customerId}
     */
    @GetMapping("/payment-info/{customerId}")
    public ResponseEntity<ApiResponse> getPaymentInfo(@PathVariable Integer customerId) {
        try {
            Customer customer = customerService.getCustomerById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
            return ResponseEntity.ok(new ApiResponse(true, "Payment info retrieved successfully", customer));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to retrieve payment info: " + e.getMessage()));
        }
    }
}
