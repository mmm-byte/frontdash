package com.fooddelivery.repository;

import com.fooddelivery.model.LoginCredentials;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * LoginCredentials Repository
 * Handles authentication data access
 */
@Repository
public interface LoginCredentialsRepository extends JpaRepository<LoginCredentials, String> {

    Optional<LoginCredentials> findByUsername(String username);

    boolean existsByUsername(String username);
}
