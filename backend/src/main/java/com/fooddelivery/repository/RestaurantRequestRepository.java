package com.fooddelivery.repository;

import com.fooddelivery.model.RestaurantRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * RestaurantRequest Repository - Database access for RestaurantRequest table
 */
@Repository
public interface RestaurantRequestRepository extends JpaRepository<RestaurantRequest, Integer> {

    /**
     * Find all requests by status
     */
    List<RestaurantRequest> findByStatus(RestaurantRequest.RequestStatus status);

    /**
     * Find all requests by type
     */
    List<RestaurantRequest> findByRequestType(RestaurantRequest.RequestType requestType);

    /**
     * Find requests by restaurant
     */
    List<RestaurantRequest> findByRestaurantIdFkOrderBySubmittedAtDesc(Integer restaurantIdFk);

    /**
     * Find pending requests of a specific type
     */
    List<RestaurantRequest> findByRequestTypeAndStatus(RestaurantRequest.RequestType requestType, RestaurantRequest.RequestStatus status);

    /**
     * Get all requests ordered by most recent
     */
    List<RestaurantRequest> findAllByOrderBySubmittedAtDesc();
}
