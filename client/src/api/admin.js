import http from './http';

// Overview
export async function fetchAdminOverview() {
  const { data } = await http.get('/admin/overview');
  return data;
}

// Suppliers
export async function fetchSuppliers() {
  const { data } = await http.get('/admin/suppliers');
  return data;
}

export async function createSupplier(payload) {
  const { data } = await http.post('/admin/suppliers', payload);
  return data;
}

export async function updateSupplier(id, payload) {
  const { data } = await http.put(`/admin/suppliers/${id}`, payload);
  return data;
}

export async function deleteSupplier(id) {
  const { data } = await http.delete(`/admin/suppliers/${id}`);
  return data;
}

// Settings
export async function fetchStoreSettings() {
  const { data } = await http.get('/admin/settings');
  return data;
}

export async function updateStoreSettings(payload) {
  const { data } = await http.put('/admin/settings', payload);
  return data;
}
