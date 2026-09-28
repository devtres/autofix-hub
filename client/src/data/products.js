export const PRODUCTS = [
  {
    product_id: 1, sku: 'AF-BRK-430', name: 'Apex Ceramic Brake Kit', category: 'Brake Systems',
    fitment: 'BMW M3 / G80', price: 488, stock_qty: 24, low_stock_threshold: 10, accent_color: '#3F1617',
    type: 'Passenger car', make: 'BMW', model: 'M3', years: ['2021', '2022', '2023', '2024', '2025', '2026'], displacement: '3.0L',
    description: 'A balanced ceramic brake upgrade designed for confident daily stopping and repeated spirited drives.',
  },
  {
    product_id: 2, sku: 'AF-SUS-118', name: 'Trackline Coilover Set', category: 'Suspension',
    fitment: 'Toyota GR86 / 2022+', price: 1240, stock_qty: 8, low_stock_threshold: 10, accent_color: '#3C2C1A',
    type: 'Passenger car', make: 'Toyota', model: 'GR86', years: ['2022', '2023', '2024', '2025', '2026'], displacement: '2.4L',
    description: 'A height-adjustable suspension set for sharper response and a composed street setup.',
  },
  {
    product_id: 3, sku: 'AF-ENG-052', name: 'Titanium Oil Cooler', category: 'Engine',
    fitment: 'Universal / 10-row', price: 296, stock_qty: 42, low_stock_threshold: 10, accent_color: '#173446',
    universal: true, description: 'A compact ten-row cooler kit for builds that need additional oil temperature control.',
  },
  {
    product_id: 4, sku: 'AF-ELC-083', name: 'Pulse LED Light Bar', category: 'Electrical',
    fitment: 'Universal / 22in', price: 184, stock_qty: 5, low_stock_threshold: 10, accent_color: '#351D41',
    universal: true, description: 'A sealed 22-inch LED light bar for added visibility on dark roads and trails.',
  },
  {
    product_id: 5, sku: 'AF-WKS-301', name: 'TorqueMaster Digital Wrench', category: 'Workshop Tools',
    fitment: '1/2in drive / 20-200Nm', price: 329, stock_qty: 17, low_stock_threshold: 10, accent_color: '#163C2C',
    description: 'A digital 1/2-inch torque wrench with a broad range for accurate garage work.',
  },
  {
    product_id: 6, sku: 'AF-BRK-011', name: 'Pro Race Brake Fluid', category: 'Brake Systems',
    fitment: 'DOT 4 / 500ml', price: 34, stock_qty: 61, low_stock_threshold: 10, accent_color: '#3F1617',
    description: 'DOT 4 brake fluid formulated for dependable pedal feel under demanding use.',
  },
];

export const CATEGORIES = ['All parts', 'Brake Systems', 'Suspension', 'Engine', 'Electrical', 'Workshop Tools'];