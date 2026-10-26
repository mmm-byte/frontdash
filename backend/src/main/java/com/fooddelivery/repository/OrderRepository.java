package com.fooddelivery.repository;

import com.fooddelivery.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Order Repository - Database access for Order table
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    /**
     * Find orders by status
     */
    List<Order> findByStatus(Order.OrderStatus status);

    /**
     * Find orders by restaurant
     */
    List<Order> findByRestaurantIdFkOrderByOrderTimeDesc(Integer restaurantIdFk);

    /**
     * Find orders by customer
     */
    List<Order> findByCustomerIdFkOrderByOrderTimeDesc(Integer customerIdFk);

    /**
     * Find orders by assigned driver
     */
    List<Order> findByDriverIdFk(Integer driverIdFk);

    /**
     * Find orders retrieved by staff
     */
    List<Order> findByRetrievedByStaffIdFk(Integer retrievedByStaffIdFk);

    /**
     * Find orders by restaurant and status
     */
    List<Order> findByRestaurantIdFkAndStatus(Integer restaurantIdFk, Order.OrderStatus status);

    /**
     * Get all orders ordered by most recent
     */
    List<Order> findAllByOrderByOrderTimeDesc();
}
