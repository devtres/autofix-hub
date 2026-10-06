CREATE DATABASE IF NOT EXISTS autofix_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autofix_hub;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auth0_id VARCHAR(255) UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('Brake Systems', 'Suspension', 'Engine', 'Electrical', 'Workshop Tools') NOT NULL,
    fitment_details VARCHAR(255),
    is_universal BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    is_low_stock BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle Compatibility Table (Powers Fitment Filter)
CREATE TABLE IF NOT EXISTS vehicle_compatibility (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    vehicle_type ENUM('Car', 'Motorcycle') DEFAULT 'Car',
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year_start INT NOT NULL,
    year_end INT NOT NULL,
    engine_displacement VARCHAR(50) DEFAULT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    tracking_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT DEFAULT NULL,
    customer_name VARCHAR(120) DEFAULT NULL,
    guest_email VARCHAR(150) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    shipping_address TEXT NOT NULL,
    shipping_method VARCHAR(20) DEFAULT 'Standard',
    shipping_fee DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    message VARCHAR(255) DEFAULT NULL,
    status ENUM('pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Order Tracking History Table (Powers Progress Timeline)
CREATE TABLE IF NOT EXISTS order_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled') NOT NULL,
    location VARCHAR(255) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Suppliers Table (Powers Supplier Directory)
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(30),
    lead_time_days INT DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store Settings Table (Powers Store Operational Parameters)
CREATE TABLE IF NOT EXISTS store_settings (
    setting_key VARCHAR(60) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL
);