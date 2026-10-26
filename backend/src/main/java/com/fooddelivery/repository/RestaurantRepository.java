package com.fooddelivery.repository;

import com.fooddelivery.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Restaurant Repository - Database access for Restaurant table
 */
@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Integer> {

    /**
     * Find restaurant by email (for login)
     */
    Optional<Restaurant> findByEmail(String email);

    /**
     * Find restaurant by username foreign key
     */
    Optional<Restaurant> findByUsernameFk(String usernameFk);

    /**
     * Find restaurants by status
     */
    List<Restaurant> findByStatus(Restaurant.RestaurantStatus status);

    /**
     * Check if email already exists
     */
    boolean existsByEmail(String email);
}
