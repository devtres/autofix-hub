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
    const [products] = await db.query(`
      SELECT p.*, 
             vc.vehicle_type, vc.make, vc.model, vc.year_start, vc.year_end, vc.engine_displacement
      FROM products p
      LEFT JOIN vehicle_compatibility vc ON vc.product_id = p.id
    `);
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
      `SELECT p.*, 
              vc.vehicle_type, vc.make, vc.model, vc.year_start, vc.year_end, vc.engine_displacement
       FROM products p
       LEFT JOIN vehicle_compatibility vc ON vc.product_id = p.id
       WHERE UPPER(p.category) = UPPER(?)`,
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
    const [products] = await db.query(
      `SELECT p.*, 
              vc.vehicle_type, vc.make, vc.model, vc.year_start, vc.year_end, vc.engine_displacement
       FROM products p
       LEFT JOIN vehicle_compatibility vc ON vc.product_id = p.id
       WHERE p.id = ?`,
      [id]
    );
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: 'Database query error' });
  }
});

// Fetch all unique vehicles available in the compatibility catalog
app.get('/api/catalog/vehicles', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT 
        vehicle_type, make, model, 
        MIN(year_start) as year_start, 
        MAX(year_end) as year_end,
        engine_displacement
      FROM vehicle_compatibility
      GROUP BY vehicle_type, make, model, engine_displacement
      ORDER BY vehicle_type ASC, make ASC, model ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching catalog vehicles:', error);
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

// Create a new product with optional vehicle compatibility
app.post('/api/products', checkJwt, syncUser, requireRole('admin'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      sku,
      name,
      description,
      category,
      fitment_details,
      is_universal,
      price,
      stock,
      compatibility,
    } = req.body;

    if (!sku || !name || !category || price == null) {
      await connection.rollback();
      return res.status(400).json({ error: 'sku, name, category and price are required' });
    }

    const universalFlag = !!is_universal;
    const fitment =
      fitment_details ||
      (universalFlag
        ? 'Universal'
        : compatibility?.make && compatibility?.model
        ? `${compatibility.make} ${compatibility.model}`
        : null);

    const [result] = await connection.query(
      `INSERT INTO products 
       (sku, name, description, category, fitment_details, is_universal, price, stock, is_low_stock) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sku,
        name,
        description || null,
        category,
        fitment,
        universalFlag ? 1 : 0,
        price,
        stock || 0,
        (stock || 0) <= 10 ? 1 : 0,
      ]
    );

    const productId = result.insertId;

    if (!universalFlag && compatibility && compatibility.make && compatibility.model) {
      await connection.query(
        `INSERT INTO vehicle_compatibility 
         (product_id, vehicle_type, make, model, year_start, year_end, engine_displacement) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          compatibility.vehicle_type || 'Car',
          compatibility.make,
          compatibility.model,
          compatibility.year_start || new Date().getFullYear(),
          compatibility.year_end || new Date().getFullYear(),
          compatibility.engine_displacement || null,
        ]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Product created successfully', id: productId });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating product:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: 'Database query error' });
  } finally {
    connection.release();
  }
});

// Edit an existing product with vehicle compatibility
app.put('/api/products/:id', checkJwt, syncUser, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      sku,
      name,
      description,
      category,
      fitment_details,
      is_universal,
      price,
      stock,
      compatibility,
    } = req.body;

    const universalFlag = !!is_universal;
    const fitment =
      fitment_details ||
      (universalFlag
        ? 'Universal'
        : compatibility?.make && compatibility?.model
        ? `${compatibility.make} ${compatibility.model}`
        : null);

    await connection.query(
      `UPDATE products 
       SET sku=?, name=?, description=?, category=?, fitment_details=?, is_universal=?, price=?, stock=?, is_low_stock=? 
       WHERE id=?`,
      [
        sku,
        name,
        description || null,
        category,
        fitment,
        universalFlag ? 1 : 0,
        price,
        stock,
        stock <= 10 ? 1 : 0,
        id,
      ]
    );

    // Update vehicle compatibility
    await connection.query('DELETE FROM vehicle_compatibility WHERE product_id = ?', [id]);

    if (!universalFlag && compatibility && compatibility.make && compatibility.model) {
      await connection.query(
        `INSERT INTO vehicle_compatibility 
         (product_id, vehicle_type, make, model, year_start, year_end, engine_displacement) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          compatibility.vehicle_type || 'Car',
          compatibility.make,
          compatibility.model,
          compatibility.year_start || new Date().getFullYear(),
          compatibility.year_end || new Date().getFullYear(),
          compatibility.engine_displacement || null,
        ]
      );
    }

    await connection.commit();
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Database query error' });
  } finally {
    connection.release();
  }
});

// -------------------------------------------------------------
// ADMIN ORDER MANAGEMENT ROUTES
// -------------------------------------------------------------

// Fetch all orders with items & status summary statistics
app.get('/api/admin/orders', checkJwt, syncUser, requireRole('admin'), async (req, res) => {
  try {
    const { status, search } = req.query;

    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND LOWER(status) = LOWER(?)';
      params.push(status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(order_number) LIKE ? OR LOWER(tracking_number) LIKE ? OR LOWER(customer_name) LIKE ? OR LOWER(guest_email) LIKE ? OR LOWER(city) LIKE ?)';
      params.push(term, term, term, term, term);
    }

    sql += ' ORDER BY created_at DESC';

    const [orders] = await db.query(sql, params);

    // Compute status counts & total revenue across ALL orders for quick stat cards/pills
    const [allStatusRows] = await db.query(
      'SELECT status, COUNT(*) as count, SUM(total_amount) as total FROM orders GROUP BY status'
    );

    const stats = {
      all: 0,
      pending: 0,
      confirmed: 0,
      packed: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0,
    };

    for (const row of allStatusRows) {
      const st = (row.status || '').toLowerCase();
      const cnt = Number(row.count || 0);
      stats.all += cnt;
      if (stats[st] !== undefined) {
        stats[st] = cnt;
      }
      if (st !== 'cancelled') {
        stats.totalRevenue += Number(row.total || 0);
      }
    }

    if (orders.length === 0) {
      return res.json({ orders: [], stats });
    }

    // Join order items with product metadata
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
        id: item.id,
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

    res.json({ orders: enriched, stats });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: 'Database query error' });
  }
});

// Update order status (with milestone tracking audit and stock restoration on cancellation)
app.patch('/api/admin/orders/:id/status', checkJwt, syncUser, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { status, note, location } = req.body;

  const validStatuses = [
    'pending',
    'confirmed',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  const targetStatus = (status || '').toLowerCase();
  if (!validStatuses.includes(targetStatus)) {
    return res.status(400).json({ error: `Invalid status. Allowed: ${validStatuses.join(', ')}` });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Fetch existing order
    const [existing] = await connection.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentOrder = existing[0];
    const previousStatus = (currentOrder.status || '').toLowerCase();

    // If order was already cancelled, don't allow changing
    if (previousStatus === 'cancelled' && targetStatus !== 'cancelled') {
      await connection.rollback();
      return res.status(400).json({ error: 'Cancelled orders cannot be reopened.' });
    }

    // If transitioning to cancelled from an unfulfilled state, restore stock
    if (targetStatus === 'cancelled' && previousStatus !== 'cancelled') {
      const [orderItems] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      );
      for (const item of orderItems) {
        await connection.query(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    // Update order status
    await connection.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [targetStatus, id]
    );

    // Record entry into order_tracking table
    await connection.query(
      'INSERT INTO order_tracking (order_id, status, location, notes, updated_at) VALUES (?, ?, ?, ?, NOW())',
      [id, targetStatus, location || currentOrder.city || 'Hub Facility', note || `Status updated to ${targetStatus}`]
    );

    await connection.commit();

    res.json({
      success: true,
      message: `Order #${currentOrder.order_number} status updated to ${targetStatus}`,
      status: targetStatus,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  } finally {
    connection.release();
  }
});

// -------------------------------------------------------------
// ADMIN OVERVIEW METRICS ROUTE
// -------------------------------------------------------------
app.get('/api/admin/overview', checkJwt, syncUser, requireRole('admin'), async (req, res) => {
  try {
    // 1. Order stats
    const [orderStats] = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN LOWER(status) != 'cancelled' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END), 0) as pending_orders,
        COALESCE(SUM(CASE WHEN LOWER(status) IN ('confirmed', 'packed', 'shipped', 'out_for_delivery') THEN 1 ELSE 0 END), 0) as in_flight_orders,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END), 0) as orders_today
      FROM orders
    `);

    // 2. Average dispatch time in hours
    const [dispatchTime] = await db.query(`
      SELECT ROUND(COALESCE(AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)), 18), 1) as avg_dispatch_hours
      FROM orders
      WHERE LOWER(status) IN ('shipped', 'out_for_delivery', 'delivered')
    `);

    // 3. Low stock count and items
    const [lowStockItems] = await db.query(`
      SELECT id, sku, name, category, stock, is_low_stock 
      FROM products 
      WHERE stock <= 10 OR is_low_stock = 1
      ORDER BY stock ASC
      LIMIT 10
    `);

    const [totalLowCount] = await db.query(`
      SELECT COUNT(*) as low_count FROM products WHERE stock <= 10 OR is_low_stock = 1
    `);

    // 4. Recent orders (top 6)
    const [recentOrders] = await db.query(`
      SELECT o.* 
      FROM orders o 
      ORDER BY o.created_at DESC 
      LIMIT 6
    `);

    // Enrich recent orders with item count
    if (recentOrders.length > 0) {
      const orderIds = recentOrders.map((o) => o.id);
      const [items] = await db.query(
        `SELECT oi.order_id, oi.product_id, oi.quantity, oi.unit_price, p.name AS product_name 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id IN (?)`,
        [orderIds]
      );
      const itemsMap = {};
      for (const it of items) {
        if (!itemsMap[it.order_id]) itemsMap[it.order_id] = [];
        itemsMap[it.order_id].push(it);
      }
      for (const ord of recentOrders) {
        ord.items = itemsMap[ord.id] || [];
      }
    }

    res.json({
      metrics: {
        totalRevenue: Number(orderStats[0]?.total_revenue || 0),
        totalOrders: Number(orderStats[0]?.total_orders || 0),
        pendingOrders: Number(orderStats[0]?.pending_orders || 0),
        inFlightOrders: Number(orderStats[0]?.in_flight_orders || 0),
        ordersToday: Number(orderStats[0]?.orders_today || 0),
        lowStockCount: Number(totalLowCount[0]?.low_count || 0),
        avgDispatchHours: Number(dispatchTime[0]?.avg_dispatch_hours || 18),
      },
      lowStockProducts: lowStockItems,
      recentOrders,
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ error: 'Database query error' });
  }
});

// -------------------------------------------------------------
// ADMIN SUPPLIERS ROUTES
// -------------------------------------------------------------
app.get('/api/admin/suppliers', checkJwt, syncUser, requireRole('admin'), async (req, res) => {
  try {
    const [suppliers] = await db.query('SELECT * FROM suppliers WHERE is_active = TRUE ORDER BY name ASC');
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Database query error' });
  }
});

app.post('/api/admin/suppliers', checkJwt, syncUser, requireRole('admin'), async (req, res) => {
  try {
    const { name, contact_person, email, phone, lead_time_days } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Supplier company name is required' });
    }
    const [result] = await db.query(
      'INSERT INTO suppliers (name, contact_person, email, phone, lead_time_days) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), contact_person || null, email || null, phone || null, Number(lead_time_days) || 3]
    );
    res.status(201).json({ message: 'Supplier added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding supplier:', error);
    res.status(500).json({ error: 'Database query error' });
  }
});

app.put('/api/admin/suppliers/:id', checkJwt, syncUser, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_person, email, phone, lead_time_days } = req.body;
    await db.query(
      'UPDATE suppliers SET name=?, contact_person=?, email=?, phone=?, lead_time_days=? WHERE supplier_id=?',
      [name.trim(), contact_person || null, email || null, phone || null, Number(lead_time_days) || 3, id]
    );
    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Database query error' });
  }
});

app.delete('/api/admin/suppliers/:id', checkJwt, syncUser, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE suppliers SET is_active = FALSE WHERE supplier_id = ?', [id]);
    res.json({ message: 'Supplier removed' });
  } catch (error) {
    console.error('Error removing supplier:', error);
    res.status(500).json({ error: 'Database query error' });
  }
});

// -------------------------------------------------------------
// ADMIN SETTINGS ROUTES
// -------------------------------------------------------------
app.get('/api/admin/settings', checkJwt, syncUser, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM store_settings');
    const settings = {};
    for (const row of rows) {
      settings[row.setting_key] = row.setting_value;
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching store settings:', error);
    res.status(500).json({ error: 'Database query error' });
  }
});

app.put('/api/admin/settings', checkJwt, syncUser, requireRole('admin'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await connection.query(
        'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [key, String(value)]
      );
    }
    await connection.commit();
    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error saving store settings:', error);
    res.status(500).json({ error: 'Database query error' });
  } finally {
    connection.release();
  }
});

// -------------------------------------------------------------
// SERVER INITIALIZATION
// -------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});