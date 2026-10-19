import { createApproximateRoute, PHILIPPINE_LOCATIONS } from './philippineLocations';

const STORAGE_KEY = 'autofix-hub-orders';

export function getSavedOrders() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const orders = saved ? JSON.parse(saved) : [];
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

export function saveOrder(order) {
  const orders = getSavedOrders();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...orders]));
}

export function createOrder({ customer, items, subtotal, shippingMethod, shippingFee, discount, message }) {
  const location = PHILIPPINE_LOCATIONS.find((item) => item.city === customer.city);
  const now = new Date();
  const orderNumber = `AFH-${now.getTime().toString().slice(-8)}`;
  const trackingNumber = `AFH-PH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const confirmedAt = now.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

  return {
    orderNumber,
    trackingNumber,
    createdAt: now.toISOString(),
    email: customer.email.trim().toLowerCase(),
    customer: { fullName: customer.fullName, city: customer.city },
    items: items.map((item) => ({ ...item })),
    subtotal,
    shippingMethod,
    shippingFee,
    discount,
    message,
    total: subtotal + shippingFee - discount,
    paymentStatus: 'PAYMENT CONFIRMED (DEMO)',
      status: 'Processing',
    eta: shippingMethod === 'Express' ? '1–2 business days' : '3–5 business days',
    destination: `${customer.city}, ${location.province}`,
    center: location.center,
    route: createApproximateRoute(location),
    delivered: false,
    milestones: [
      { title: 'Payment confirmed', time: confirmedAt, complete: true },
      { title: 'Order processing', time: 'Preparing your parts', complete: true, current: true },
      { title: 'Out for delivery', time: 'Estimated within 1–3 days', complete: false },
      { title: 'Delivered', time: 'Estimated in ' + (shippingMethod === 'Express' ? '1–2 days' : '3–5 days'), complete: false },
    ],
  };
}

export function hydrateOrderFromDb(dbOrder) {
  const city = dbOrder.city || 'Manila';
  const location = PHILIPPINE_LOCATIONS.find((loc) => loc.city.toLowerCase() === city.toLowerCase()) || PHILIPPINE_LOCATIONS[0];
  const createdAt = dbOrder.created_at ? new Date(dbOrder.created_at) : new Date();
  const confirmedAt = createdAt.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
  const statusRaw = (dbOrder.status || 'pending').toLowerCase();

  let uiStatus = 'Processing';
  let isDelivered = false;
  let isInTransit = false;

  if (statusRaw === 'delivered') {
    uiStatus = 'Delivered';
    isDelivered = true;
  } else if (statusRaw === 'shipped' || statusRaw === 'out_for_delivery') {
    uiStatus = 'In transit';
    isInTransit = true;
  } else if (statusRaw === 'cancelled') {
    uiStatus = 'Cancelled';
  }

  const shippingMethod = dbOrder.shipping_method || 'Standard';
  const eta = isDelivered
    ? `Delivered on ${confirmedAt}`
    : shippingMethod === 'Express'
    ? '1–2 business days'
    : '3–5 business days';

  const milestones = [
    { title: 'Payment confirmed', time: confirmedAt, complete: true },
    {
      title: 'Order processing',
      time: 'Parts verified & packed',
      complete: statusRaw !== 'pending',
      current: statusRaw === 'pending' || statusRaw === 'confirmed' || statusRaw === 'packed',
    },
    {
      title: 'Out for delivery',
      time: isInTransit ? 'Courier in transit' : isDelivered ? 'Delivered to address' : 'Estimated within 1–3 days',
      complete: isInTransit || isDelivered,
      current: isInTransit,
    },
    {
      title: 'Delivered',
      time: isDelivered ? confirmedAt : 'Estimated in ' + (shippingMethod === 'Express' ? '1–2 days' : '3–5 days'),
      complete: isDelivered,
      current: isDelivered,
    },
  ];

  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    trackingNumber: dbOrder.tracking_number,
    createdAt: dbOrder.created_at || new Date().toISOString(),
    email: (dbOrder.guest_email || '').trim().toLowerCase(),
    customer: {
      fullName: dbOrder.customer_name || 'Valued Customer',
      city: location.city,
    },
    items: Array.isArray(dbOrder.items)
      ? dbOrder.items.map((i) => ({
          product_id: i.product_id,
          sku: i.sku,
          name: i.name,
          fitment: i.fitment,
          price: Number(i.price),
          qty: i.qty || i.quantity || 1,
        }))
      : [],
    shippingMethod,
    shippingFee: Number(dbOrder.shipping_fee || 0),
    discount: Number(dbOrder.discount_amount || 0),
    subtotal: Number(dbOrder.total_amount || 0) - Number(dbOrder.shipping_fee || 0) + Number(dbOrder.discount_amount || 0),
    total: Number(dbOrder.total_amount || 0),
    message: dbOrder.message,
    paymentStatus: 'PAYMENT CONFIRMED (DEMO)',
    status: uiStatus,
    eta,
    destination: `${location.city}, ${location.province}`,
    center: location.center,
    route: createApproximateRoute(location),
    delivered: isDelivered,
    milestones,
  };
}