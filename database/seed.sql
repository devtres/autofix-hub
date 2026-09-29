USE autofix_hub;

-- Insert Seed Product matching team ENUM categories
INSERT INTO products (id, sku, name, category, fitment_details, price, stock, is_low_stock)
VALUES (1, 'BRK-PAD-001', 'Brembo Ceramic Brake Pads', 'Brake Systems', 'Toyota Vios 2018-2024 1.3L', 1450.00, 25, FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Seed Vehicle Compatibility
INSERT INTO vehicle_compatibility (product_id, vehicle_type, make, model, year_start, year_end, engine_displacement)
VALUES (1, 'Car', 'Toyota', 'Vios', 2018, 2024, '1.3L')
ON DUPLICATE KEY UPDATE make=VALUES(make);

-- Insert Seed Order
INSERT INTO orders (id, order_number, tracking_number, guest_email, shipping_address, total_amount, status)
VALUES (1, 'ORD-2026-001', 'AFH-89210', 'customer@example.com', '123 Main St, Dasmariñas, Cavite', 1450.00, 'shipped')
ON DUPLICATE KEY UPDATE tracking_number=VALUES(tracking_number);

-- Insert Seed Order Item
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES (1, 1, 1, 1450.00)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

-- Insert Seed Order Tracking Events
INSERT INTO order_tracking (order_id, status, location, notes) VALUES
(1, 'pending', 'Store System', 'Order placed by customer.'),
(1, 'packed', 'Dasmariñas Warehouse', 'Items packed and ready for dispatch.'),
(1, 'shipped', 'Cavite Sorting Hub', 'Parcel is in transit with logistics courier.')
ON DUPLICATE KEY UPDATE status=VALUES(status);