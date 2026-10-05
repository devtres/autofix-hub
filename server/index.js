import express from 'express';
import cors from 'cors';
import db from './db.js';
import { checkJwt, syncUser, requireRole } from './middleware/auth.js';

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

// Fetch a single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: 'Database query error' });
  }
});

// Returns the signed-in user's own DB record + role
app.get('/api/me', checkJwt, syncUser, async (req, res) => {
  res.json(req.dbUser);
});

// -------------------------------------------------------------
// OBJECTIVE 2: ORDERING & TRACKING ROUTES
// -------------------------------------------------------------

// Create a new order (Checkout)
app.post('/api/orders', async (req, res) => {
  const {
    order_number: customOrderNumber,
    tracking_number: customTrackingNumber,
    customer_name,
    customer_email,
    guest_email,
    city,
    shipping_address,
    shipping_method,
    shipping_fee,
    discount_amount,
    total_amount,
    message,
    items,
  } = req.body;

  const order_number = customOrderNumber || `AFH-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const tracking_number = customTrackingNumber || `AFH-PH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const email = (customer_email || guest_email || '').trim().toLowerCase();

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Look up user_id if the email belongs to a registered user
    let userId = null;
    if (email) {
      const [matchedUsers] = await connection.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
        [email]
      );
      if (matchedUsers.length > 0) {
        userId = matchedUsers[0].id;
      }
    }

    // 1. Insert into orders table
    const [result] = await connection.query(
      `INSERT INTO orders 
       (order_number, tracking_number, user_id, customer_name, guest_email, city, shipping_address, shipping_method, shipping_fee, discount_amount, total_amount, message, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        order_number,
        tracking_number,
        userId,
        customer_name || null,
        email || null,
        city || 'Manila',
        shipping_address || '',
        shipping_method || 'Standard',
        shipping_fee || 0,
        discount_amount || 0,
        total_amount || 0,
        message || null,
      ]
    );

    const orderId = result.insertId;

    // 2. Insert each item into order_items & decrement product stock
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const productId = item.product_id || item.productId || item.id;
        const qty = item.qty || item.quantity || 1;
        const unitPrice = item.price || item.unit_price || 0;

        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [orderId, productId, qty, unitPrice]
        );

        await connection.query(
          'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
          [qty, productId]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order_id: orderId,
      order_number,
      tracking_number,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    connection.release();
  }
});

// Track an order by order_number, tracking_number, or guest_email
app.get('/api/orders/track/:query', async (req, res) => {
  const { query } = req.params;
  const email = req.query.email;

  try {
    let sql = `
      SELECT o.* 
      FROM orders o 
      WHERE (o.order_number = ? OR o.tracking_number = ? OR LOWER(o.guest_email) = LOWER(?))
    `;
    const params = [query, query, query];

    if (email) {
      sql += ' AND LOWER(o.guest_email) = LOWER(?)';
      params.push(email.trim());
    }

    sql += ' ORDER BY o.created_at DESC';

    const [orders] = await db.query(sql, params);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No order found' });
    }

    const orderIds = orders.map((o) => o.id);
    const [items] = await db.query(
      `SELECT oi.*, p.sku, p.name, p.category, p.fitment_details 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrderId = {};
    for (const item of items) {
      if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
      itemsByOrderId[item.order_id].push({
        product_id: item.product_id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        fitment: item.fitment_details,
        qty: item.quantity,
        price: Number(item.unit_price),
      });
    }

    const enriched = orders.map((o) => ({
      ...o,
      items: itemsByOrderId[o.id] || [],
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Failed to retrieve order' });
  }
});

// Fetch past orders by email
app.get('/api/orders/by-email/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE LOWER(guest_email) = LOWER(?) ORDER BY created_at DESC',
      [email.trim()]
    );

    if (!orders.length) {
      return res.json([]);
    }

    const orderIds = orders.map((o) => o.id);
    const [items] = await db.query(
      `SELECT oi.*, p.sku, p.name, p.category, p.fitment_details 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrderId = {};
    for (const item of items) {
      if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
      itemsByOrderId[item.order_id].push({
        product_id: item.product_id,
        sku: item.sku,
        name: item.name,
        qty: item.quantity,
        price: Number(item.unit_price),
      });
    }

    const enriched = orders.map((o) => ({
      ...o,
      items: itemsByOrderId[o.id] || [],
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// -------------------------------------------------------------
// ADMIN PRODUCT ROUTES
// -------------------------------------------------------------

// Create a new product
app.post('/api/products', checkJwt, syncUser, requireRole('admin'), async (req, res) => {
  try {
    const { sku, name, category, fitment_details, price, stock } = req.body;
    if (!sku || !name || !category || price == null) {
      return res.status(400).json({ error: 'sku, name, category and price are required' });
    }
    await db.query(
      'INSERT INTO products (sku, name, category, fitment_details, price, stock, is_low_stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sku, name, category, fitment_details || null, price, stock || 0, (stock || 0) <= 10 ? 1 : 0]
    );
    res.status(201).json({ message: 'Product created' });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: 'Database query error' });
  }
});

// Edit an existing product
app.put('/api/products/:id', checkJwt, syncUser, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, category, fitment_details, price, stock } = req.body;
    await db.query(
      'UPDATE products SET sku=?, name=?, category=?, fitment_details=?, price=?, stock=?, is_low_stock=? WHERE id=?',
      [sku, name, category, fitment_details || null, price, stock, stock <= 10 ? 1 : 0, id]
    );
    res.json({ message: 'Product updated' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Database query error' });
  }
});

// -------------------------------------------------------------
// SERVER INITIALIZATION
// -------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});