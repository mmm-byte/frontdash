package com.fooddelivery.service;

import com.fooddelivery.model.Restaurant;
import com.fooddelivery.model.RestaurantRequest;
import com.fooddelivery.repository.RestaurantRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * RestaurantRequest Service - Business logic for registration/withdrawal requests
 */
@Service
public class RestaurantRequestService {

    @Autowired
    private RestaurantRequestRepository requestRepository;

    @Autowired
    private RestaurantService restaurantService;

    /**
     * Get all requests
     */
    public List<RestaurantRequest> getAllRequests() {
        return requestRepository.findAllByOrderBySubmittedAtDesc();
    }

    /**
     * Get pending requests
     */
    public List<RestaurantRequest> getPendingRequests() {
        return requestRepository.findByStatus(RestaurantRequest.RequestStatus.PENDING);
    }

    /**
     * Get requests by type
     */
    public List<RestaurantRequest> getRequestsByType(RestaurantRequest.RequestType requestType) {
        return requestRepository.findByRequestType(requestType);
    }

    /**
     * Get requests by status
     */
    public List<RestaurantRequest> getRequestsByStatus(RestaurantRequest.RequestStatus status) {
        return requestRepository.findByStatus(status);
    }

    /**
     * Get request by ID
     */
    public Optional<RestaurantRequest> getRequestById(Integer requestID) {
        return requestRepository.findById(requestID);
    }

    /**
     * Create new request
     */
    public RestaurantRequest createRequest(RestaurantRequest request) {
        // Set default status if not provided
        if (request.getStatus() == null) {
            request.setStatus(RestaurantRequest.RequestStatus.PENDING);
        }
        // Note: submittedAt is auto-populated by database
        return requestRepository.save(request);
    }

    /**
     * Approve request
     */
    @Transactional
    public RestaurantRequest approveRequest(Integer requestID, String notes, String username, String password) {
        RestaurantRequest request = requestRepository.findById(requestID)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(RestaurantRequest.RequestStatus.APPROVED);
        request.setNotes(notes);
        request.setDecidedAt(LocalDateTime.now());

        // Handle based on request type
        if (request.getRequestType() == RestaurantRequest.RequestType.REGISTRATION) {
            // Approve restaurant and set login credentials
            if (username != null && password != null) {
                restaurantService.setLoginCredentials(request.getRestaurantIdFk(), username, password);
            } else {
                restaurantService.updateRestaurantStatus(request.getRestaurantIdFk(), Restaurant.RestaurantStatus.APPROVED);
            }
        } else if (request.getRequestType() == RestaurantRequest.RequestType.WITHDRAWAL) {
            // Mark restaurant as withdrawn
            restaurantService.updateRestaurantStatus(request.getRestaurantIdFk(), Restaurant.RestaurantStatus.WITHDRAWN);
        }

        return requestRepository.save(request);
    }

    /**
     * Reject request
     */
    @Transactional
    public RestaurantRequest rejectRequest(Integer requestID, String notes) {
        RestaurantRequest request = requestRepository.findById(requestID)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(RestaurantRequest.RequestStatus.REJECTED);
        request.setNotes(notes);
        request.setDecidedAt(LocalDateTime.now());

        // If this was a registration request, update restaurant status to REJECTED
        if (request.getRequestType() == RestaurantRequest.RequestType.REGISTRATION) {
            restaurantService.updateRestaurantStatus(request.getRestaurantIdFk(), Restaurant.RestaurantStatus.REJECTED);
        }

        return requestRepository.save(request);
    }

    /**
     * Get requests by restaurant
     */
    public List<RestaurantRequest> getRequestsByRestaurant(Integer restaurantIdFk) {
        return requestRepository.findByRestaurantIdFkOrderBySubmittedAtDesc(restaurantIdFk);
    }
}
