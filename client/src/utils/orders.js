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