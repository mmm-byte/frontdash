package com.fooddelivery.service;

import com.fooddelivery.dto.CustomerRegistrationDTO;
import com.fooddelivery.model.Customer;
import com.fooddelivery.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * CustomerService - Business logic layer for Customer operations
 */
@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    /**
     * Get all customers
     */
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    /**
     * Get customer by ID
     */
    public Optional<Customer> getCustomerById(Integer customerId) {
        return customerRepository.findById(customerId);
    }

    /**
     * Get customer by email
     */
    public Optional<Customer> getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email);
    }

    /**
     * Get customer by phone
     */
    public Optional<Customer> getCustomerByPhone(String phone) {
        return customerRepository.findByPhone(phone);
    }

    /**
     * Get customers by status
     */
    public List<Customer> getCustomersByStatus(Customer.CustomerStatus status) {
        return customerRepository.findByStatus(status);
    }

    /**
     * Validate name fields (first and last name must be at least 2 characters)
     */
    private void validateName(String firstName, String lastName) {
        if (firstName == null || firstName.trim().length() < 2) {
            throw new IllegalArgumentException("First name must be at least 2 characters long");
        }
        if (lastName == null || lastName.trim().length() < 2) {
            throw new IllegalArgumentException("Last name must be at least 2 characters long");
        }
    }

    /**
     * Register new customer - handles card masking and security code hashing
     */
    public Customer registerCustomer(CustomerRegistrationDTO dto) {
        validateName(dto.getFirstName(), dto.getLastName());

        Customer customer = new Customer();
        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());

        // Mask card number (keep last 4 digits)
        String cardNumber = dto.getCardNumber();
        String maskedCard = "************" + cardNumber.substring(cardNumber.length() - 4);
        customer.setCardNumberMasked(maskedCard);

        // Set card type
        customer.setCardType(Customer.CardType.valueOf(dto.getCardType()));
        customer.setExpiryMonth(dto.getExpiryMonth());
        customer.setExpiryYear(dto.getExpiryYear());
        customer.setCardholderName(dto.getCardholderName());

        // Hash security code
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        customer.setSecurityCodeHash(encoder.encode(dto.getSecurityCode()));

        // Set billing address
        customer.setBuildingNumber(dto.getBuildingNumber());
        customer.setBillingStreet(dto.getBillingStreet());
        customer.setBillingCity(dto.getBillingCity());
        customer.setBillingState(dto.getBillingState());
        customer.setBillingZip(dto.getBillingZip());

        // Set loyalty
        customer.setLoyaltyOptIn(dto.getLoyaltyOptIn() != null ? dto.getLoyaltyOptIn() : true);
        customer.setLoyaltyPoints(0);

        // Set status to PENDING - requires admin approval
        customer.setStatus(Customer.CustomerStatus.PENDING);

        return customerRepository.save(customer);
    }

    /**
     * Create new customer (legacy method)
     */
    public Customer createCustomer(Customer customer) {
        validateName(customer.getFirstName(), customer.getLastName());
        return customerRepository.save(customer);
    }

    /**
     * Update customer
     */
    public Customer updateCustomer(Integer customerId, Customer customerDetails) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

        validateName(customerDetails.getFirstName(), customerDetails.getLastName());
        customer.setFirstName(customerDetails.getFirstName());
        customer.setLastName(customerDetails.getLastName());
        customer.setEmail(customerDetails.getEmail());
        customer.setPhone(customerDetails.getPhone());
        customer.setBillingStreet(customerDetails.getBillingStreet());
        customer.setBillingCity(customerDetails.getBillingCity());
        customer.setBillingState(customerDetails.getBillingState());
        customer.setBillingZip(customerDetails.getBillingZip());

        return customerRepository.save(customer);
    }

    /**
     * Update customer status (approve/reject registration)
     */
    public Customer updateCustomerStatus(Integer customerId, Customer.CustomerStatus status) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

        customer.setStatus(status);
        return customerRepository.save(customer);
    }

    /**
     * Delete customer
     */
    public void deleteCustomer(Integer customerId) {
        customerRepository.deleteById(customerId);
    }
}
