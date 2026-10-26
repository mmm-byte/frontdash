-- Food Delivery Database Schema
-- Based on ER Diagram provided

-- Drop existing tables if they exist (in reverse order of dependencies)

-- ====================================
-- 1. LoginCredentials Table
-- ====================================
CREATE TABLE LoginCredentials (
    username VARCHAR(50) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    usertype ENUM('ADMIN', 'STAFF', 'RESTAURANT') NOT NULL,
    account_status ENUM('ACTIVE', 'INACTIVE', 'LOCKED') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME NULL,
    INDEX idx_usertype (usertype),
    INDEX idx_account_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- 2. Staff Table
-- ====================================
CREATE TABLE Staff (
    staffID INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    username_fk VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username_fk) REFERENCES LoginCredentials(username) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_username (username_fk)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- 3. Driver Table
-- ====================================
CREATE TABLE Driver (
    driverID INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    license VARCHAR(50) NULL,
    vehicle ENUM('motorcycle', 'car', 'van', 'truck') DEFAULT 'car',
    status ENUM('HIRED', 'FIRED') DEFAULT 'HIRED',
    hired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    fired_at DATETIME NULL,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- 4. Restaurant Table
-- ====================================
CREATE TABLE Restaurant (
    restaurantID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    picture_url VARCHAR(500) NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state CHAR(2) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    contact_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    hours_json TEXT NULL,
    status ENUM('PENDING', 'APPROVED', 'WITHDRAWN', 'REJECTED') DEFAULT 'PENDING',
    username_fk VARCHAR(50) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username_fk) REFERENCES LoginCredentials(username) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- 5. MenuItem Table
-- ====================================
CREATE TABLE MenuItem (
    itemID INT AUTO_INCREMENT PRIMARY KEY,
    restaurantID_fk INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture_url VARCHAR(500) NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    availability ENUM('AVAILABLE', 'UNAVAILABLE') DEFAULT 'AVAILABLE',
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurantID_fk) REFERENCES Restaurant(restaurantID) ON DELETE CASCADE,
    INDEX idx_restaurant (restaurantID_fk),
    INDEX idx_availability (availability)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- 6. Customer Table
-- ====================================
CREATE TABLE Customer (
    customerID INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    card_number_masked VARCHAR(20) NOT NULL,
    card_type ENUM('VISA', 'MASTERCARD', 'DISCOVER', 'AMEX') NOT NULL,
    expiry_month INT NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
    expiry_year INT NOT NULL,
    cardholder_name VARCHAR(200) NOT NULL,
    security_code_hash VARCHAR(255) NOT NULL,
    billing_street VARCHAR(255) NOT NULL,
    billing_city VARCHAR(100) NOT NULL,
    billing_state CHAR(2) NOT NULL,
    billing_zip VARCHAR(10) NOT NULL,
    loyalty_opt_in BOOLEAN DEFAULT TRUE,
    loyalty_points INT DEFAULT 0 CHECK (loyalty_points >= 0),
    loyalty_card_identifier VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_loyalty_card (loyalty_card_identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- 7. RestaurantRequest Table
-- ====================================
CREATE TABLE RestaurantRequest (
    requestID INT AUTO_INCREMENT PRIMARY KEY,
    restaurantID_fk INT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    decided_at DATETIME NULL,
    adminID_fk INT NULL,
    request_type ENUM('REGISTRATION', 'WITHDRAWAL') NOT NULL,
    notes TEXT NULL,
    FOREIGN KEY (restaurantID_fk) REFERENCES Restaurant(restaurantID) ON DELETE CASCADE,
    FOREIGN KEY (adminID_fk) REFERENCES Staff(staffID) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_request_type (request_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- 8. Order Table
-- ====================================
CREATE TABLE `Order` (
    orderID INT AUTO_INCREMENT PRIMARY KEY,
    order_id_formatted VARCHAR(20) NOT NULL,
    restaurantID_fk INT NOT NULL,
    customerID_fk INT NULL,
    driverID_fk INT NULL,
    driver_first_name VARCHAR(100) NULL,
    driver_last_name VARCHAR(100) NULL,
    order_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'PREPARING', 'READY_FOR_PICKUP', 'RETRIEVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',
    estimated_delivery_time DATETIME NULL,
    service_charge_rate DECIMAL(5, 4) DEFAULT 0.0825,
    tip_amount DECIMAL(10, 2) DEFAULT 0.00,
    subtotal_before_service DECIMAL(10, 2) NOT NULL,
    grand_total DECIMAL(10, 2) NOT NULL,
    building_number VARCHAR(50) NULL,
    street_name VARCHAR(255) NULL,
    unit VARCHAR(50) NULL,
    city VARCHAR(100) NULL,
    state CHAR(2) NULL,
    zipcode VARCHAR(10) NULL,
    contact_name VARCHAR(200) NULL,
    contact_phone VARCHAR(20) NULL,
    retrieved_by_staffID_fk INT NULL,
    retrieved_at DATETIME NULL,
    delivered_at DATETIME NULL,
    FOREIGN KEY (restaurantID_fk) REFERENCES Restaurant(restaurantID) ON DELETE CASCADE,
    FOREIGN KEY (customerID_fk) REFERENCES Customer(customerID) ON DELETE SET NULL,
    FOREIGN KEY (driverID_fk) REFERENCES Driver(driverID) ON DELETE SET NULL,
    FOREIGN KEY (retrieved_by_staffID_fk) REFERENCES Staff(staffID) ON DELETE SET NULL,
    INDEX idx_order_id_formatted (order_id_formatted),
    INDEX idx_status (status),
    INDEX idx_order_time (order_time),
    INDEX idx_restaurant (restaurantID_fk),
    INDEX idx_customer (customerID_fk),
    INDEX idx_delivered_at (delivered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- 9. OrderItem Table
-- ====================================
CREATE TABLE OrderItem (
    orderID_formatted_fk VARCHAR(20) NOT NULL,
    itemID_fk INT NOT NULL,
    item_name_snapshot VARCHAR(255) NOT NULL,
    unit_price_snapshot DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    item_subtotal DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (orderID_formatted_fk, itemID_fk),
    FOREIGN KEY (orderID_formatted_fk) REFERENCES `Order`(order_id_formatted) ON DELETE CASCADE,
    FOREIGN KEY (itemID_fk) REFERENCES MenuItem(itemID) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- 10. PointsTransaction Table
-- ====================================
CREATE TABLE PointsTransaction (
    txnID INT AUTO_INCREMENT PRIMARY KEY,
    customerID_fk INT NOT NULL,
    orderID_fk INT NULL,
    points_delta INT NOT NULL,
    reason ENUM('EARN', 'REDEEM', 'ADJUSTMENT') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerID_fk) REFERENCES Customer(customerID) ON DELETE CASCADE,
    FOREIGN KEY (orderID_fk) REFERENCES `Order`(orderID) ON DELETE SET NULL,
    INDEX idx_customer (customerID_fk),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- Triggers
-- ====================================

-- Trigger to auto-generate order_id_formatted before insert
DELIMITER $$
CREATE TRIGGER before_order_insert
BEFORE INSERT ON `Order`
FOR EACH ROW
BEGIN
    IF NEW.order_id_formatted IS NULL OR NEW.order_id_formatted = '' THEN
        -- Get the next auto-increment value
        SET @next_id = (SELECT AUTO_INCREMENT FROM information_schema.TABLES
                        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Order');
        -- Generate formatted ID (FD0001, FD0002, etc.)
        SET NEW.order_id_formatted = CONCAT('FD', LPAD(@next_id, 4, '0'));
    END IF;
END$$
DELIMITER ;

-- ====================================
-- Insert Default Admin Account
-- ====================================
-- Password: AdminPass1!

-- Create default admin staff record

-- Insert Default Restaurant Account
-- Password: RestPass1!

-- Create Pizza Palace restaurant

-- ====================================
-- Success Message
-- ====================================
SELECT 'Database schema created successfully!' AS Message;
