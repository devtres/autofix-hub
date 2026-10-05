import { useEffect, useState } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { createProduct, updateProduct } from '../../api/products';

const CATEGORIES = ['Brake Systems', 'Suspension', 'Engine', 'Electrical', 'Workshop Tools'];

const EMPTY = { sku: '', name: '', category: CATEGORIES[0], fitment_details: '', price: '', stock: '' };

export default function ProductFormModal({ show, onHide, onSaved, product }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku, name: product.name, category: product.category,
        fitment_details: product.fitment, price: product.price, stock: product.stock_qty,
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [product, show]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (isEdit) await updateProduct(product.product_id, payload);
      else await createProduct(payload);
      onSaved();
      onHide();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} fullscreen="sm-down" centered data-bs-theme="dark">
      <Form onSubmit={submit}>
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="display-cond fs-4">{isEdit ? 'Edit product' : 'Add product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col md={6}>
              <Form.Label className="mono-sm">SKU</Form.Label>
              <Form.Control required value={form.sku} onChange={set('sku')} placeholder="AF-BRK-999" />
            </Col>
            <Col md={6}>
              <Form.Label className="mono-sm">Category</Form.Label>
              <Form.Select value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12}>
              <Form.Label className="mono-sm">Name</Form.Label>
              <Form.Control required value={form.name} onChange={set('name')} placeholder="Apex Ceramic Brake Kit" />
            </Col>
            <Col xs={12}>
              <Form.Label className="mono-sm">Fitment</Form.Label>
              <Form.Control value={form.fitment_details} onChange={set('fitment_details')} placeholder="BMW M3 / G80" />
            </Col>
            <Col md={6}>
              <Form.Label className="mono-sm">Price (₱)</Form.Label>
              <Form.Control required type="number" step="0.01" min="0" value={form.price} onChange={set('price')} />
            </Col>
            <Col md={6}>
              <Form.Label className="mono-sm">Stock</Form.Label>
              <Form.Control required type="number" min="0" value={form.stock} onChange={set('stock')} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-light" onClick={onHide}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save product'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}