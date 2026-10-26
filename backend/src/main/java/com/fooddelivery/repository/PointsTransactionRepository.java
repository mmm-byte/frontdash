package com.fooddelivery.repository;

import com.fooddelivery.model.PointsTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * PointsTransaction Repository - Database access for PointsTransaction table
 */
@Repository
public interface PointsTransactionRepository extends JpaRepository<PointsTransaction, Integer> {

    /**
     * Find all transactions for a customer
     */
    List<PointsTransaction> findByCustomerIdFkOrderByCreatedAtDesc(Integer customerIdFk);

    /**
     * Find transactions for a specific order
     */
    List<PointsTransaction> findByOrderIdFk(Integer orderIdFk);

    /**
     * Find transactions by reason
     */
    List<PointsTransaction> findByReason(String reason);

    /**
     * Find transactions for a customer by reason
     */
    List<PointsTransaction> findByCustomerIdFkAndReason(Integer customerIdFk, String reason);
}
