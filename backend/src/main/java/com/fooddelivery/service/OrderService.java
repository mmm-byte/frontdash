package com.fooddelivery.service;

import com.fooddelivery.model.Customer;
import com.fooddelivery.model.Driver;
import com.fooddelivery.model.Order;
import com.fooddelivery.model.OrderItem;
import com.fooddelivery.model.MenuItem;
import com.fooddelivery.model.PointsTransaction;
import com.fooddelivery.repository.CustomerRepository;
import com.fooddelivery.repository.DriverRepository;
import com.fooddelivery.repository.OrderRepository;
import com.fooddelivery.repository.OrderItemRepository;
import com.fooddelivery.repository.MenuItemRepository;
import com.fooddelivery.repository.PointsTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Order Service - Business logic for Order operations
 */
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private PointsTransactionRepository pointsTransactionRepository;

    /**
     * Get all orders
     */
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByOrderTimeDesc();
        // Load items for each order
        for (Order order : orders) {
            List<OrderItem> items = loadOrderItems(order.getOrderIdFormatted());
            order.setItems(items);
        }
        return orders;
    }

    /**
     * Get order by ID
     */
    public Optional<Order> getOrderById(Integer orderID) {
        return orderRepository.findById(orderID);
    }

    /**
     * Get orders by restaurant
     */
    public List<Order> getOrdersByRestaurant(Integer restaurantID) {
        List<Order> orders = orderRepository.findByRestaurantIdFkOrderByOrderTimeDesc(restaurantID);
        // Load items for each order
        for (Order order : orders) {
            List<OrderItem> items = loadOrderItems(order.getOrderIdFormatted());
            order.setItems(items);
        }
        return orders;
    }

    /**
     * Get orders by status
     */
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        List<Order> orders = orderRepository.findByStatus(status);
        // Load items for each order
        for (Order order : orders) {
            List<OrderItem> items = loadOrderItems(order.getOrderIdFormatted());
            order.setItems(items);
        }
        return orders;
    }

    /**
     * Get orders by restaurant and status
     */
    public List<Order> getOrdersByRestaurantAndStatus(Integer restaurantID, Order.OrderStatus status) {
        List<Order> orders = orderRepository.findByRestaurantIdFkAndStatus(restaurantID, status);
        // Load items for each order
        for (Order order : orders) {
            List<OrderItem> items = loadOrderItems(order.getOrderIdFormatted());
            order.setItems(items);
        }
        return orders;
    }

    /**
     * Helper method to load OrderItem objects from raw query results
     */
    private List<OrderItem> loadOrderItems(String orderIdFk) {
        List<Object[]> rawItems = orderItemRepository.findRawByOrderIdFk(orderIdFk);
        return rawItems.stream().map(row -> {
            OrderItem item = new OrderItem();
            item.setOrderIdFk((String) row[0]);
            item.setItemIdFk((Integer) row[1]);
            item.setItemNameSnapshot((String) row[2]);
            item.setUnitPriceSnapshot((java.math.BigDecimal) row[3]);
            item.setQuantity((Integer) row[4]);
            item.setItemSubtotal((java.math.BigDecimal) row[5]);
            return item;
        }).collect(java.util.stream.Collectors.toList());
    }

    /**
     * Update order status
     * When status is RETRIEVED, sets timestamp and calculates 20-minute delivery ETA
     * When status is DELIVERED, records the delivery timestamp for comparison with estimated time
     */
    public Order updateOrderStatus(Integer orderID, Order.OrderStatus status, Integer staffID, Integer driverID) {
        Order order = orderRepository.findById(orderID)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);

        // If status is RETRIEVED, set timestamp and 20-minute delivery ETA
        if (Order.OrderStatus.RETRIEVED.equals(status)) {
            LocalDateTime retrievalTime = LocalDateTime.now();
            order.setRetrievedAt(retrievalTime);
            // Set estimated delivery time to 20 minutes from retrieval
            order.setEstimatedDeliveryTime(retrievalTime.plusMinutes(20));

            // Set staff ID if provided
            if (staffID != null) {
                order.setRetrievedByStaffIdFk(staffID);
            }
        }

        // If status is DELIVERED, record delivery timestamp
        // This allows checking actual vs estimated delivery time for future adjustments
        if (Order.OrderStatus.DELIVERED.equals(status)) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        // If assigning driver
        if (driverID != null) {
            order.setDriverIdFk(driverID);
        }

        return orderRepository.save(order);
    }

    /**
     * Assign driver to order
     */
    public Order assignDriver(Integer orderID, Integer driverID) {
        Order order = orderRepository.findById(orderID)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setDriverIdFk(driverID);

        // Populate driver name fields
        if (driverID != null) {
            Optional<Driver> driverOpt = driverRepository.findById(driverID);
            if (driverOpt.isPresent()) {
                Driver driver = driverOpt.get();
                order.setDriverFirstName(driver.getFirstName());
                order.setDriverLastName(driver.getLastName());
            }
        }

        // If order is RETRIEVED, move to IN_TRANSIT
        if (Order.OrderStatus.RETRIEVED.equals(order.getStatus())) {
            order.setStatus(Order.OrderStatus.IN_TRANSIT);
        }

        return orderRepository.save(order);
    }

    /**
     * Create new order
     * Awards 1 point per dollar of subtotal
     * If customer had 100+ points, deducts 100 points for the 10% discount
     */
    public Order createOrder(Order order) {
        // Set default status if not provided
        if (order.getStatus() == null) {
            order.setStatus(Order.OrderStatus.PENDING);
        }

        // Check if customer qualifies for loyalty discount and deduct points BEFORE saving
        if (order.getCustomerIdFk() != null) {
            Optional<Customer> customerOpt = customerRepository.findById(order.getCustomerIdFk());
            if (customerOpt.isPresent()) {
                Customer customer = customerOpt.get();
                if (customer.getLoyaltyOptIn() != null && customer.getLoyaltyOptIn()) {
                    int currentPoints = customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;

                    // If customer has 100+ points, they qualify for 10% discount
                    // Deduct 100 points when order is placed (discount is applied in frontend)
                    if (currentPoints >= 100) {
                        System.out.println("DEBUG: Customer has " + currentPoints + " points, deducting 100 for loyalty discount");
                        customer.setLoyaltyPoints(currentPoints - 100);
                        customerRepository.save(customer);

                        // Record redemption transaction
                        PointsTransaction redeemTxn = new PointsTransaction();
                        redeemTxn.setCustomerIdFk(customer.getCustomerID());
                        redeemTxn.setOrderIdFk(null); // Will update after order is saved
                        redeemTxn.setPointsDelta(-100);
                        redeemTxn.setReason(PointsTransaction.TransactionReason.REDEEM);
                        pointsTransactionRepository.save(redeemTxn);
                        System.out.println("DEBUG: Points after redemption: " + (currentPoints - 100));
                    } else {
                        System.out.println("DEBUG: Customer has only " + currentPoints + " points, no discount applied");
                    }
                }
            }
        }

        // Save the order first to get the auto-generated orderID
        Order savedOrder = orderRepository.save(order);

        // Generate formatted order ID (FD0001, FD0002, etc.)
        String formattedId = "FD" + String.format("%04d", savedOrder.getOrderID());
        savedOrder.setOrderIdFormatted(formattedId);
        savedOrder = orderRepository.save(savedOrder);

        // Save order items if provided
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (OrderItem item : order.getItems()) {
                // Validate item has required fields
                if (item.getItemIdFk() == null) {
                    throw new RuntimeException("Item ID cannot be null. Items: " + order.getItems());
                }
                if (item.getQuantity() == null || item.getQuantity() <= 0) {
                    throw new RuntimeException("Item quantity must be greater than 0");
                }

                // Fetch menu item details
                MenuItem menuItem = menuItemRepository.findById(item.getItemIdFk())
                    .orElseThrow(() -> new RuntimeException("Menu item not found with ID: " + item.getItemIdFk()));

                // Create complete OrderItem with all required fields
                OrderItem orderItem = new OrderItem();
                orderItem.setOrderIdFk(savedOrder.getOrderIdFormatted());  // Use formatted ID (String)
                orderItem.setItemIdFk(item.getItemIdFk());
                orderItem.setQuantity(item.getQuantity());
                orderItem.setItemNameSnapshot(menuItem.getName());
                orderItem.setUnitPriceSnapshot(menuItem.getPrice());
                orderItem.setItemSubtotal(menuItem.getPrice().multiply(new BigDecimal(item.getQuantity())));

                System.out.println("Saving OrderItem: orderIdFk=" + orderItem.getOrderIdFk() +
                                 ", itemIdFk=" + orderItem.getItemIdFk() +
                                 ", quantity=" + orderItem.getQuantity());

                orderItemRepository.save(orderItem);
            }
        }

        // Fetch customer again to get updated points (after potential redemption above)
        // Award loyalty points if customer exists and opted in
        if (savedOrder.getCustomerIdFk() != null) {
            Optional<Customer> customerOpt = customerRepository.findById(savedOrder.getCustomerIdFk());
            if (customerOpt.isPresent()) {
                Customer customer = customerOpt.get();
                if (customer.getLoyaltyOptIn() != null && customer.getLoyaltyOptIn()) {
                    int currentPoints = customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;

                    // Award 1 point per dollar of subtotal (after redemption, if any)
                    int pointsToAward = savedOrder.getSubtotalBeforeService().intValue();
                    customer.setLoyaltyPoints(currentPoints + pointsToAward);

                    customerRepository.save(customer);

                    // Create points transaction record
                    PointsTransaction transaction = new PointsTransaction();
                    transaction.setCustomerIdFk(customer.getCustomerID());
                    transaction.setOrderIdFk(savedOrder.getOrderID());
                    transaction.setPointsDelta(pointsToAward);
                    transaction.setReason(PointsTransaction.TransactionReason.EARN);
                    pointsTransactionRepository.save(transaction);
                }
            }
        }

        return savedOrder;
    }

    /**
     * Get orders retrieved by staff
     */
    public List<Order> getOrdersByStaff(Integer staffID) {
        return orderRepository.findByRetrievedByStaffIdFk(staffID);
    }

    /**
     * Get orders by customer
     */
    public List<Order> getOrdersByCustomer(Integer customerID) {
        return orderRepository.findByCustomerIdFkOrderByOrderTimeDesc(customerID);
    }

    /**
     * Get orders by driver
     */
    public List<Order> getOrdersByDriver(Integer driverID) {
        return orderRepository.findByDriverIdFk(driverID);
    }

    /**
     * Apply loyalty discount if customer has 100+ points
     * Returns the discount amount (10% of subtotal)
     * Deducts 100 points from customer and records transaction
     */
    public BigDecimal applyLoyaltyDiscount(Integer customerId, BigDecimal subtotal) {
        Optional<Customer> customerOpt = customerRepository.findById(customerId);
        if (!customerOpt.isPresent()) {
            return BigDecimal.ZERO;
        }

        Customer customer = customerOpt.get();

        // Check if customer is enrolled in loyalty program
        if (customer.getLoyaltyOptIn() == null || !customer.getLoyaltyOptIn()) {
            return BigDecimal.ZERO;
        }

        int currentPoints = customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;

        // Check if customer has 100 or more points
        if (currentPoints >= 100) {
            // Deduct 100 points
            customer.setLoyaltyPoints(currentPoints - 100);
            customerRepository.save(customer);

            // Record points redemption transaction
            PointsTransaction transaction = new PointsTransaction();
            transaction.setCustomerIdFk(customerId);
            transaction.setOrderIdFk(null); // No order yet
            transaction.setPointsDelta(-100);
            transaction.setReason(PointsTransaction.TransactionReason.REDEEM);
            pointsTransactionRepository.save(transaction);

            // Calculate 10% discount
            BigDecimal discount = subtotal.multiply(new BigDecimal("0.10"));
            return discount;
        }

        return BigDecimal.ZERO;
    }
}
