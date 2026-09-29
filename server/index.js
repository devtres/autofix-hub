import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// OBJECTIVE 1: PRODUCT MANAGEMENT ROUTES
// -------------------------------------------------------------

// Fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Database query error' });
  }
});

// Fetch products by category
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const [products] = await db.query(
      'SELECT * FROM products WHERE UPPER(category) = UPPER(?)',
      [category]
    );
    res.json(products);
  } catch (error) {
    console.error('Error fetching filtered products:', error);
    res.status(500).json({ error: 'Database query error' });
  }
});

// -------------------------------------------------------------
// OBJECTIVE 2: ORDERING & TRACKING ROUTES
// -------------------------------------------------------------

// Create a new order (Checkout)
app.post('/api/orders', async (req, res) => {
  const { customer_name, customer_email, shipping_address, total_amount, items } = req.body;
  const order_number = `AFH-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    // 1. Insert into orders table
    const [result] = await db.query(
      'INSERT INTO orders (order_number, customer_name, customer_email, shipping_address, total_amount) VALUES (?, ?, ?, ?, ?)',
      [order_number, customer_name, customer_email, shipping_address, total_amount]
    );

    const orderId = result.insertId;

    // 2. Insert each purchased item into order_items table
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      // Optional: Reduce stock level in products table
      await db.query(
        'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    res.status(201).json({ 
      success: true, 
      message: 'Order created successfully',
      order_number 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Track an order by order_number or customer_email
app.get('/api/orders/track/:query', async (req, res) => {
  const { query } = req.params;

  try {
    const [orders] = await db.query(
      `SELECT o.*, 
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'product_name', p.name, 
                  'quantity', oi.quantity, 
                  'price', oi.price_at_purchase
                )
              ) AS items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.order_number = ? OR o.customer_email = ?
       GROUP BY o.id`,
      [query, query]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No order found' });
    }

    res.json(orders);
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Failed to retrieve order' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});