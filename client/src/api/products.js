import http from './http';

// Maps text categories from the DB to the gradient colors the cards use.
// This replaces the categories.accent_color column that doesn't exist yet.
const CATEGORY_ACCENTS = {
  'Brake Systems': '#3F1617',
  'Suspension': '#3C2C1A',
  'Engine': '#173446',
  'Electrical': '#351D41',
  'Workshop Tools': '#163C2C',
};

// Converts one raw DB row into the shape the UI components expect.
function mapProduct(row) {
  return {
    product_id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    fitment: row.fitment_details,
    price: Number(row.price),
    stock_qty: row.stock,
    low_stock_threshold: row.is_low_stock ? row.stock : 10, // fallback threshold; see note below
    is_low_stock: !!row.is_low_stock,
    accent_color: CATEGORY_ACCENTS[row.category] || '#222222',
  };
}

export async function fetchProducts() {
  const { data } = await http.get('/products');
  return data.map(mapProduct);
}

export async function fetchProductsByCategory(category) {
  const { data } = await http.get(`/products/category/${encodeURIComponent(category)}`);
  return data.map(mapProduct);
}

export async function fetchProductById(id) {
  const { data } = await http.get(`/products/${id}`);
  return mapProduct(data);
}

export async function createProduct(payload) {
  const { data } = await http.post('/products', payload);
  return data;
}

export async function updateProduct(id, payload) {
  const { data } = await http.put(`/products/${id}`, payload);
  return data;
}