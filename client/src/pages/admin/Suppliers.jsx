import { useEffect, useState } from 'react';
import { Table, Button, Form, Modal, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../api/admin';

const EMPTY = {
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  lead_time_days: 3,
};

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSuppliers();
      setSuppliers(data || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
      setError('Could not load suppliers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openAdd = () => {
    setEditingSupplier(null);
    setForm(EMPTY);
    setShowModal(true);
  };

  const openEdit = (sup) => {
    setEditingSupplier(sup);
    setForm({
      name: sup.name || '',
      contact_person: sup.contact_person || '',
      email: sup.email || '',
      phone: sup.phone || '',
      lead_time_days: sup.lead_time_days || 3,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.supplier_id, form);
        setSuccessToast(`Supplier "${form.name}" updated successfully.`);
      } else {
        await createSupplier(form);
        setSuccessToast(`Supplier "${form.name}" added successfully.`);
      }
      setTimeout(() => setSuccessToast(null), 3000);
      setShowModal(false);
      await loadSuppliers();
    } catch (err) {
      console.error('Failed to save supplier:', err);
      setError(err?.response?.data?.error || 'Failed to save supplier details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sup) => {
    if (!window.confirm(`Are you sure you want to remove supplier "${sup.name}"?`)) return;
    try {
      await deleteSupplier(sup.supplier_id);
      setSuccessToast(`Supplier "${sup.name}" removed.`);
      setTimeout(() => setSuccessToast(null), 3000);
      await loadSuppliers();
    } catch (err) {
      console.error('Failed to remove supplier:', err);
      setError('Could not remove supplier.');
    }
  };

  return (
    <div className="admin-suppliers-page">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <p className="eyebrow mb-1">Manage / Parts Vendors</p>
          <h1 className="display-cond display-5 mb-1">Supplier Directory</h1>
          <p className="text-secondary small mb-0">
            Maintain manufacturing partners, lead times, and distributor contact channels.
          </p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          <i className="bi bi-plus-lg me-1" /> Add Supplier
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {error}
        </Alert>
      )}

      {successToast && (
        <Alert variant="success" dismissible onClose={() => setSuccessToast(null)} className="mb-3">
          <i className="bi bi-check-circle-fill me-2" />
          {successToast}
        </Alert>
      )}

      <div className="panel">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" />
            <p className="mono-sm text-secondary mt-2">Loading suppliers...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-buildings fs-1 text-secondary opacity-50 d-block mb-3" />
            <h5 className="fw-bold">No suppliers on record</h5>
            <p className="text-secondary small mb-3">Add partner distributors to organize inventory restocking.</p>
            <Button variant="primary" size="sm" onClick={openAdd}>
              + Add First Supplier
            </Button>
          </div>
        ) : (
          <Table responsive hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Company / Distributor</th>
                <th>Contact Person</th>
                <th>Communications</th>
                <th>Lead Time</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((sup) => (
                <tr key={sup.supplier_id}>
                  <td>
                    <b className="text-white d-block small">{sup.name}</b>
                    <span className="mono-sm text-secondary" style={{ fontSize: '.55rem' }}>
                      SUP-{String(sup.supplier_id).padStart(4, '0')}
                    </span>
                  </td>
                  <td>
                    <span className="small text-light">{sup.contact_person || '—'}</span>
                  </td>
                  <td>
                    <span className="d-block small text-light">{sup.email || '—'}</span>
                    <span className="mono-sm text-secondary" style={{ fontSize: '.6rem' }}>
                      {sup.phone || '—'}
                    </span>
                  </td>
                  <td>
                    <Badge bg="dark" className="border border-secondary text-info mono-sm">
                      {sup.lead_time_days} business {sup.lead_time_days === 1 ? 'day' : 'days'}
                    </Badge>
                  </td>
                  <td>
                    <span className="badge-pill badge-healthy">Active Partner</span>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-1">
                      <Button size="sm" variant="outline-light" onClick={() => openEdit(sup)} title="Edit">
                        <i className="bi bi-pencil" />
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(sup)} title="Delete">
                        <i className="bi bi-trash" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Add / Edit Supplier Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton closeVariant="white">
            <Modal.Title className="display-cond fs-4">
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Row className="g-3">
              <Col xs={12}>
                <Form.Label className="mono-sm text-secondary">Supplier / Company Name</Form.Label>
                <Form.Control
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Apex Performance Imports"
                />
              </Col>
              <Col xs={12}>
                <Form.Label className="mono-sm text-secondary">Primary Contact Representative</Form.Label>
                <Form.Control
                  value={form.contact_person}
                  onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                  placeholder="e.g., Rico Tan"
                />
              </Col>
              <Col md={6}>
                <Form.Label className="mono-sm text-secondary">Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="sales@apexperf.ph"
                />
              </Col>
              <Col md={6}>
                <Form.Label className="mono-sm text-secondary">Contact Phone</Form.Label>
                <Form.Control
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="09170001111"
                />
              </Col>
              <Col xs={12}>
                <Form.Label className="mono-sm text-secondary">Delivery Lead Time (Days)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="60"
                  value={form.lead_time_days}
                  onChange={(e) => setForm({ ...form, lead_time_days: Number(e.target.value) })}
                />
                <Form.Text className="text-secondary small">
                  Estimated business days required from restock order placement to warehouse arrival.
                </Form.Text>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-secondary border-opacity-25">
            <Button variant="outline-light" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
