import { useEffect, useState } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Card } from 'react-bootstrap';
import { createProduct, updateProduct } from '../../api/products';
import http from '../../api/http';

const CATEGORIES = ['Brake Systems', 'Suspension', 'Engine', 'Electrical', 'Workshop Tools'];

const EMPTY = {
  sku: '',
  name: '',
  description: '',
  category: CATEGORIES[0],
  fitment_details: '',
  price: '',
  stock: '',
  is_universal: false,
  vehicle_type: 'Car',
  make: '',
  model: '',
  year_start: '2022',
  year_end: '2026',
  engine_displacement: '',
};

export default function ProductFormModal({ show, onHide, onSaved, product }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [catalogVehicles, setCatalogVehicles] = useState([]);
  const isEdit = !!product;

  useEffect(() => {
    http
      .get('/catalog/vehicles')
      .then((res) => setCatalogVehicles(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        category: product.category || CATEGORIES[0],
        fitment_details: product.fitment || '',
        price: product.price ?? '',
        stock: product.stock_qty ?? '',
        is_universal: !!product.is_universal || !!product.universal,
        vehicle_type: product.vehicle_type || 'Car',
        make: product.make || '',
        model: product.model || '',
        year_start: product.year_start ? String(product.year_start) : '',
        year_end: product.year_end ? String(product.year_end) : '',
        engine_displacement: product.displacement || product.engine_displacement || '',
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [product, show]);

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const generatedFitment = form.is_universal
        ? (form.fitment_details || 'Universal Fitment')
        : (form.fitment_details || `${form.make} ${form.model} / ${form.year_start}+`.trim());

      const payload = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category,
        fitment_details: generatedFitment,
        is_universal: form.is_universal,
        price: Number(form.price),
        stock: Number(form.stock),
        compatibility: form.is_universal
          ? null
          : {
              vehicle_type: form.vehicle_type,
              make: form.make.trim(),
              model: form.model.trim(),
              year_start: form.year_start ? Number(form.year_start) : null,
              year_end: form.year_end ? Number(form.year_end) : null,
              engine_displacement: form.engine_displacement.trim() || null,
            },
      };

      if (isEdit) {
        await updateProduct(product.product_id, payload);
      } else {
        await createProduct(payload);
      }

      onSaved();
      onHide();
    } catch (err) {
      console.error('Failed to save product:', err);
      setError(err.response?.data?.error || 'Something went wrong while saving product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered data-bs-theme="dark">
      <Form onSubmit={submit}>
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="display-cond fs-4">{isEdit ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Section 1: Basic Information */}
          <span className="eyebrow text-secondary d-block mb-3">1. Basic Specifications</span>
          <Row className="g-3 mb-4">
            <Col md={6}>
              <Form.Label className="mono-sm text-secondary">SKU Code</Form.Label>
              <Form.Control required value={form.sku} onChange={set('sku')} placeholder="e.g., AF-BRK-430" />
            </Col>
            <Col md={6}>
              <Form.Label className="mono-sm text-secondary">Category</Form.Label>
              <Form.Select value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12}>
              <Form.Label className="mono-sm text-secondary">Product Name</Form.Label>
              <Form.Control required value={form.name} onChange={set('name')} placeholder="e.g., Apex Ceramic Brake Kit" />
            </Col>
            <Col xs={12}>
              <Form.Label className="mono-sm text-secondary">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.description}
                onChange={set('description')}
                placeholder="High-grade performance component designed for optimal reliability..."
              />
            </Col>
            <Col md={6}>
              <Form.Label className="mono-sm text-secondary">Price (₱)</Form.Label>
              <Form.Control required type="number" step="0.01" min="0" value={form.price} onChange={set('price')} />
            </Col>
            <Col md={6}>
              <Form.Label className="mono-sm text-secondary">Initial Stock Quantity</Form.Label>
              <Form.Control required type="number" min="0" value={form.stock} onChange={set('stock')} />
            </Col>
          </Row>

          {/* Section 2: Compatibility & Fitment */}
          <span className="eyebrow text-secondary d-block mb-2">2. Vehicle Compatibility (Powers Fitment Box)</span>
          <Card className="bg-black border-secondary border-opacity-25 p-3 mb-3">
            <Form.Check
              type="switch"
              id="universal-switch"
              label="Universal Part (Tools, Fluids, Generic Light Bars)"
              checked={form.is_universal}
              onChange={set('is_universal')}
              className="mb-3 text-light"
            />

            {!form.is_universal ? (
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="mono-sm text-secondary">Vehicle Classification</Form.Label>
                  <Form.Select value={form.vehicle_type} onChange={set('vehicle_type')}>
                    <option value="Car">Passenger Car</option>
                    <option value="Motorcycle">Motorcycle</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label className="mono-sm text-secondary">Engine Displacement / Spec</Form.Label>
                  <Form.Control
                    value={form.engine_displacement}
                    onChange={set('engine_displacement')}
                    placeholder="e.g., 2.4L, 3.0L, 160cc"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="mono-sm text-secondary">Make / Brand</Form.Label>
                  <Form.Control
                    required={!form.is_universal}
                    list="admin-makes"
                    value={form.make}
                    onChange={set('make')}
                    placeholder="e.g., Toyota, Honda, BMW"
                  />
                  <datalist id="admin-makes">
                    {Array.from(
                      new Set(
                        catalogVehicles
                          .filter((v) => (v.vehicle_type || '').toLowerCase() === (form.vehicle_type || 'Car').toLowerCase())
                          .map((v) => v.make)
                      )
                    )
                      .sort((a, b) => a.localeCompare(b))
                      .map((m) => (
                        <option key={m} value={m} />
                      ))}
                  </datalist>
                </Col>
                <Col md={6}>
                  <Form.Label className="mono-sm text-secondary">Model</Form.Label>
                  <Form.Control
                    required={!form.is_universal}
                    list="admin-models"
                    value={form.model}
                    onChange={(e) => {
                      const val = e.target.value;
                      const match = catalogVehicles.find(
                        (v) =>
                          (v.vehicle_type || '').toLowerCase() === (form.vehicle_type || 'Car').toLowerCase() &&
                          v.model.toLowerCase() === val.toLowerCase()
                      );
                      setForm((prev) => ({
                        ...prev,
                        model: val,
                        make: prev.make || match?.make || prev.make,
                        year_start: match?.year_start ? String(match.year_start) : prev.year_start,
                        year_end: match?.year_end ? String(match.year_end) : prev.year_end,
                        engine_displacement: prev.engine_displacement || match?.engine_displacement || '',
                      }));
                    }}
                    placeholder="e.g., Civic Type R, GR86, Ninja 400"
                  />
                  <datalist id="admin-models">
                    {Array.from(
                      new Set(
                        catalogVehicles
                          .filter(
                            (v) =>
                              (v.vehicle_type || '').toLowerCase() === (form.vehicle_type || 'Car').toLowerCase() &&
                              (!form.make || v.make.toLowerCase() === form.make.toLowerCase())
                          )
                          .map((v) => v.model)
                      )
                    )
                      .sort((a, b) => a.localeCompare(b))
                      .map((m) => (
                        <option key={m} value={m} />
                      ))}
                  </datalist>
                </Col>
                <Col md={6}>
                  <Form.Label className="mono-sm text-secondary">Compatible Year (Start)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1980"
                    max="2035"
                    value={form.year_start}
                    onChange={set('year_start')}
                    placeholder="2022"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="mono-sm text-secondary">Compatible Year (End)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1980"
                    max="2035"
                    value={form.year_end}
                    onChange={set('year_end')}
                    placeholder="2026"
                  />
                </Col>
              </Row>
            ) : (
              <p className="text-secondary small mb-0">
                <i className="bi bi-info-circle me-1" />
                This item is marked as universal and will be presented with a universal compatibility tag in the store catalog.
              </p>
            )}
          </Card>

          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="mono-sm text-secondary">Custom Fitment Tag (Optional Label Override)</Form.Label>
              <Form.Control
                value={form.fitment_details}
                onChange={set('fitment_details')}
                placeholder="Leave blank to auto-generate (e.g., TOYOTA GR86 / 2022+)"
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-secondary border-opacity-25">
          <Button variant="outline-light" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Saving Product...' : isEdit ? 'Update Product' : 'Add Product'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}