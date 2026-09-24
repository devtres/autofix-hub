USE autofix_hub;

-- Index for faster filtering by category and stock
CREATE INDEX idx_products_category ON products(category);

-- View for low stock alerts
CREATE OR REPLACE VIEW vw_low_stock_products AS
SELECT id, sku, name, category, stock
FROM products
WHERE stock <= 5 OR is_low_stock = TRUE;