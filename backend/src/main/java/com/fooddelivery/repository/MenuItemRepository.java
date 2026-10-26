package com.fooddelivery.repository;

import com.fooddelivery.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MenuItem Repository - Database access for MenuItem table
 */
@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Integer> {

    /**
     * Find all menu items for a restaurant
     */
    List<MenuItem> findByRestaurantIdFk(Integer restaurantIdFk);

    /**
     * Find menu items by restaurant and availability
     */
    List<MenuItem> findByRestaurantIdFkAndAvailability(Integer restaurantIdFk, MenuItem.Availability availability);
}
