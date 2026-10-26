package com.fooddelivery.repository;

import com.fooddelivery.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, OrderItem.OrderItemId> {

    @Query(value = "SELECT orderID_formatted_fk, itemID_fk, item_name_snapshot, unit_price_snapshot, quantity, item_subtotal " +
                   "FROM OrderItem WHERE orderID_formatted_fk = :orderIdFk",
           nativeQuery = true)
    List<Object[]> findRawByOrderIdFk(@Param("orderIdFk") String orderIdFk);
}
