import { useState } from 'react';
import { Button, Form, InputGroup, Table } from 'react-bootstrap';
import { PRODUCTS } from '../../data/mockProducts';
import StatusBadge from '../../components/admin/StatusBadge';

export default function Products() {
  const [q, setQ] = useState('');
  const list = PRODUCTS.filter((p) =>
    `${p.name} ${p.sku} ${p.fitment} ${p.category}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <p className="eyebrow mb-1">Catalog / Inventory</p>
          <h1 className="display-cond display-5 mb-1">Product Command</h1>
          <p className="text-secondary small mb-0">Manage the parts that keep your partner garages moving.</p>
        </div>
        <Button variant="primary"><i className="bi bi-plus-lg" /> Add product</Button>
      </div>

      <div className="panel">
        <div className="p-3 d-flex gap-2">
          <InputGroup>
            <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
            <Form.Control placeholder="Search products, SKUs, fitment…" value={q} onChange={(e) => setQ(e.target.value)} />
          </InputGroup>
          <Button variant="outline-light">Filters</Button>
        </div>

        {/* Desktop / tablet: table */}
        <div className="d-none d-md-block">
          <Table responsive hover className="mb-0 align-middle">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.product_id}>
                  <td>
                    <b className="d-block small">{p.name}</b>
                    <span className="mono-sm text-secondary" style={{ fontSize: '.55rem' }}>{p.sku} · {p.fitment}</span>
                  </td>
                  <td className="small">{p.category}</td>
                  <td className="small">₱{p.price.toLocaleString()}</td>
                  <td className="small">{p.stock_qty}</td>
                  <td><StatusBadge stock={p.stock_qty} threshold={p.low_stock_threshold} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Phone: card rows */}
        <div className="d-md-none">
          {list.map((p) => (
            <div key={p.product_id} className="mobile-row">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <b className="d-block small">{p.name}</b>
                  <span className="mono-sm text-secondary" style={{ fontSize: '.55rem' }}>{p.sku} · {p.fitment}</span>
                </div>
                <StatusBadge stock={p.stock_qty} threshold={p.low_stock_threshold} />
              </div>
              <div className="d-flex justify-content-between small mt-2 text-secondary">
                <span>{p.category}</span><span>₱{p.price.toLocaleString()} · Stock {p.stock_qty}</span>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="p-3 text-secondary small mb-0">No products match your search.</p>}
        </div>
      </div>
    </>
  );
}