import http from './http';

export async function createOrderApi(payload) {
  const { data } = await http.post('/orders', payload);
  return data;
}

export async function trackOrderApi(query, email) {
  const params = email ? { email } : {};
  const { data } = await http.get(`/orders/track/${encodeURIComponent(query)}`, { params });
  return data;
}

export async function fetchOrderHistoryApi(email) {
  const { data } = await http.get(`/orders/by-email/${encodeURIComponent(email)}`);
  return data;
}

export async function fetchAdminOrders(params = {}) {
  const { data } = await http.get('/admin/orders', { params });
  return data;
}

export async function updateOrderStatus(orderId, payload) {
  const { data } = await http.patch(`/admin/orders/${orderId}/status`, payload);
  return data;
}
