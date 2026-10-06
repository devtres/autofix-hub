import { useEffect, useState } from 'react';
import { Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { fetchStoreSettings, updateStoreSettings } from '../../api/admin';

export default function Settings() {
  const [settings, setSettings] = useState({
    store_name: 'AutoFix Hub',
    contact_email: 'support@autofixhub.ph',
    contact_phone: '+63 917 000 0000',
    default_low_stock_threshold: '10',
    shipping_flat_fee: '25',
    free_shipping_over: '1000',
    dispatch_target_hours: '24',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStoreSettings();
      if (data && Object.keys(data).length > 0) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Failed to load store settings:', err);
      setError('Could not load current settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key) => (e) => {
    setSettings((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateStoreSettings(settings);
      setSuccessToast('Store settings updated successfully.');
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-settings-page">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <p className="eyebrow mb-1">Manage / Store Configuration</p>
          <h1 className="display-cond display-5 mb-1">Store Settings</h1>
          <p className="text-secondary small mb-0">
            Configure global store thresholds, delivery fee policies, and inventory safeguards.
          </p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={saving || loading}>
          {saving ? (
            <>
              <Spinner animation="border" size="sm" className="me-1" /> Saving...
            </>
          ) : (
            <>
              <i className="bi bi-check2 me-1" /> Save All Changes
            </>
          )}
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

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <p className="mono-sm text-secondary mt-2">Loading store settings...</p>
        </div>
      ) : (
        <Form onSubmit={handleSave}>
          <Row className="g-4">
            {/* Section 1: Store & Communications Profile */}
            <Col lg={6}>
              <Card className="panel border-secondary border-opacity-25 h-100 p-4">
                <span className="eyebrow mb-3 d-block">1. Store Branding & Identity</span>

                <Form.Group className="mb-3">
                  <Form.Label className="mono-sm text-secondary">Store Public Name</Form.Label>
                  <Form.Control
                    value={settings.store_name || ''}
                    onChange={handleChange('store_name')}
                    placeholder="AutoFix Hub"
                  />
                  <Form.Text className="text-secondary small">
                    Appears on the storefront navbar, emails, and generated invoices.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="mono-sm text-secondary">Support Email Channel</Form.Label>
                  <Form.Control
                    type="email"
                    value={settings.contact_email || ''}
                    onChange={handleChange('contact_email')}
                    placeholder="support@autofixhub.ph"
                  />
                </Form.Group>

                <Form.Group className="mb-0">
                  <Form.Label className="mono-sm text-secondary">Operations Hotline</Form.Label>
                  <Form.Control
                    value={settings.contact_phone || ''}
                    onChange={handleChange('contact_phone')}
                    placeholder="+63 917 000 0000"
                  />
                </Form.Group>
              </Card>
            </Col>

            {/* Section 2: Logistics & Dispatch Policies */}
            <Col lg={6}>
              <Card className="panel border-secondary border-opacity-25 h-100 p-4">
                <span className="eyebrow mb-3 d-block">2. Shipping & Delivery Rates</span>

                <Form.Group className="mb-3">
                  <Form.Label className="mono-sm text-secondary">Standard Flat Delivery Fee (₱)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="1"
                    value={settings.shipping_flat_fee || '25'}
                    onChange={handleChange('shipping_flat_fee')}
                  />
                  <Form.Text className="text-secondary small">
                    Default logistics fee applied during checkout across Philippine locations.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="mono-sm text-secondary">Free Shipping Order Cutoff (₱)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="50"
                    value={settings.free_shipping_over || '1000'}
                    onChange={handleChange('free_shipping_over')}
                  />
                  <Form.Text className="text-secondary small">
                    Orders with subtotals exceeding this amount receive zero shipping charges.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-0">
                  <Form.Label className="mono-sm text-secondary">Target Dispatch Window (Hours)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="72"
                    value={settings.dispatch_target_hours || '24'}
                    onChange={handleChange('dispatch_target_hours')}
                  />
                  <Form.Text className="text-secondary small">
                    Feeds the hero "Average dispatch: Under 24 hrs" SLA benchmark.
                  </Form.Text>
                </Form.Group>
              </Card>
            </Col>

            {/* Section 3: Inventory Safeguards */}
            <Col xs={12}>
              <Card className="panel border-secondary border-opacity-25 p-4">
                <span className="eyebrow mb-3 d-block">3. Inventory Threshold Safeguards</span>
                <Row className="align-items-center g-3">
                  <Col md={6}>
                    <Form.Group className="mb-0">
                      <Form.Label className="mono-sm text-secondary">Default Low Stock Alert Threshold</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="100"
                        value={settings.default_low_stock_threshold || '10'}
                        onChange={handleChange('default_low_stock_threshold')}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <p className="text-secondary small mb-0 pt-md-3">
                      <i className="bi bi-info-circle me-1" />
                      When a product stock level drops at or below this value, the system automatically triggers a yellow <strong>Low Stock</strong> badge in Product Command and lists it under Inventory Health.
                    </p>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" type="submit" size="lg" disabled={saving}>
              {saving ? 'Saving Settings...' : 'Save All Settings'}
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}
