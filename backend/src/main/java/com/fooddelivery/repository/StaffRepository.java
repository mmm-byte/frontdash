package com.fooddelivery.repository;

import com.fooddelivery.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Staff Repository - Database access for Staff table
 * Spring Data JPA automatically implements basic CRUD operations
 */
@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer> {

    /**
     * Find staff by email
     * Used for login and validation
     */
    Optional<Staff> findByEmail(String email);

    /**
     * Find staff by username foreign key
     */
    Optional<Staff> findByUsernameFk(String usernameFk);

    /**
     * Find staff by status (e.g., ACTIVE, INACTIVE)
     */
    List<Staff> findByStatus(Staff.StaffStatus status);

    /**
     * Check if staff exists by staffID
     */
    boolean existsByStaffID(Integer staffID);

    /**
     * Check if email is already registered
     */
    boolean existsByEmail(String email);
}
