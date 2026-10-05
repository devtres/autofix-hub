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
