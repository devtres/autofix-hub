import { useEffect, useState, useMemo } from 'react';
import { Button, Form, InputGroup, Table, Spinner, Alert, Modal, Badge, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchAdminOrders, updateOrderStatus } from '../../api/orders';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';

const STATUS_TRANSITIONS = {
  pending: { next: 'confirmed', label: 'Confirm Order', icon: 'bi-check2-circle', variant: 'outline-info' },
  confirmed: { next: 'packed', label: 'Mark as Packed', icon: 'bi-box-seam', variant: 'outline-primary' },
  packed: { next: 'shipped', label: 'Dispatch / Ship', icon: 'bi-truck', variant: 'outline-warning' },
  shipped: { next: 'out_for_delivery', label: 'Out for Delivery', icon: 'bi-geo-alt', variant: 'outline-warning' },
  out_for_delivery: { next: 'delivered', label: 'Mark Delivered', icon: 'bi-check-all', variant: 'outline-success' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    packed: 0,
    shipped: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Order Details Modal State
  const [activeOrder, setActiveOrder] = useState(null);
  const [actionNote, setActionNote] = useState('');
  const [actionLocation, setActionLocation] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOrders();
      setOrders(data.orders || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
      setError('Could not load orders. Ensure server is running and admin privileges are granted.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleAdvanceStatus = async (order, targetStatus, customNote, customLocation) => {
    setUpdatingId(order.id);
    setError(null);
    try {
      await updateOrderStatus(order.id, {
        status: targetStatus,
        note: customNote || `Status updated to ${targetStatus} by admin`,
        location: customLocation || order.city || 'Hub Warehouse',
      });

      setSuccessToast(`Order #${order.order_number} advanced to ${targetStatus.replace('_', ' ')}.`);
      setTimeout(() => setSuccessToast(null), 4000);

      // Refresh orders list
      await loadOrders();

      // If active order in modal, update it
      if (activeOrder && activeOrder.id === order.id) {
        setActiveOrder((prev) => (prev ? { ...prev, status: targetStatus } : null));
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError(err?.response?.data?.error || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel order #${order.order_number}? This will restore product inventory.`)) {
      return;
    }
    await handleAdvanceStatus(order, 'cancelled', 'Cancelled by administrator', 'Order Cancelled');
  };

  // Filtered list based on status tab and search query
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        selectedStatus === 'all' || (order.status || '').toLowerCase() === selectedStatus.toLowerCase();
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (order.order_number || '').toLowerCase().includes(term) ||
        (order.tracking_number || '').toLowerCase().includes(term) ||
        (order.customer_name || '').toLowerCase().includes(term) ||
        (order.guest_email || '').toLowerCase().includes(term) ||
        (order.city || '').toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, searchQuery]);

  const activeInFlightCount =
    (stats.confirmed || 0) + (stats.packed || 0) + (stats.shipped || 0) + (stats.out_for_delivery || 0);

  return (
    <div className="orders-command-page">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <p className="eyebrow mb-1">Workspace / Fulfillment</p>
          <h1 className="display-cond display-5 mb-1">Order Command</h1>
          <p className="text-secondary small mb-0">
            Process incoming orders, advance logistics milestones, and inspect delivery routes.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-light" size="sm" onClick={loadOrders} disabled={loading}>
            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`} /> Refresh
          </Button>
          <Button as={Link} to="/track" target="_blank" variant="primary" size="sm">
            <i className="bi bi-map" /> Live Tracking Map
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <Row className="g-3 mb-4">
        <Col xs={6} lg={3}>
          <div className="panel p-3">
            <span className="eyebrow d-block mb-1">Total Orders</span>
            <div className="d-flex align-items-baseline gap-2">
              <span className="display-cond fs-3 text-white">{stats.all}</span>
              <span className="mono-sm text-secondary">lifetime</span>
            </div>
          </div>
        </Col>
        <Col xs={6} lg={3}>
          <div className="panel p-3">
            <span className="eyebrow d-block mb-1">Pending Review</span>
            <div className="d-flex align-items-baseline gap-2">
              <span className={`display-cond fs-3 ${stats.pending > 0 ? 'text-warning' : 'text-white'}`}>
                {stats.pending}
              </span>
              <span className="mono-sm text-secondary">needs action</span>
            </div>
          </div>
        </Col>
        <Col xs={6} lg={3}>
          <div className="panel p-3">
            <span className="eyebrow d-block mb-1">Active In-Transit</span>
            <div className="d-flex align-items-baseline gap-2">
              <span className="display-cond fs-3 text-info">{activeInFlightCount}</span>
              <span className="mono-sm text-secondary">in pipeline</span>
            </div>
          </div>
        </Col>
        <Col xs={6} lg={3}>
          <div className="panel p-3">
            <span className="eyebrow d-block mb-1">Gross Revenue</span>
            <div className="d-flex align-items-baseline gap-2">
              <span className="display-cond fs-3 text-success">₱{stats.totalRevenue.toLocaleString()}</span>
              <span className="mono-sm text-secondary">settled (COD)</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Alert Toasts */}
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

      {/* Main Panel */}
      <div className="panel">
        {/* Status Filter Tabs */}
        <div className="border-bottom border-secondary border-opacity-10 p-3 pb-2 d-flex gap-2 overflow-auto">
          {[
            { key: 'all', label: 'All Orders', count: stats.all },
            { key: 'pending', label: 'Pending', count: stats.pending },
            { key: 'confirmed', label: 'Confirmed', count: stats.confirmed },
            { key: 'packed', label: 'Packed', count: stats.packed },
            { key: 'shipped', label: 'Shipped', count: stats.shipped },
            { key: 'out_for_delivery', label: 'Out for Delivery', count: stats.out_for_delivery },
            { key: 'delivered', label: 'Delivered', count: stats.delivered },
            { key: 'cancelled', label: 'Cancelled', count: stats.cancelled },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`btn btn-sm text-nowrap rounded-pill ${
                selectedStatus === tab.key ? 'btn-light text-dark fw-bold' : 'btn-outline-secondary text-light'
              }`}
              style={{ fontSize: '.75rem', padding: '.25rem .75rem' }}
              onClick={() => setSelectedStatus(tab.key)}
            >
              {tab.label} <Badge bg={selectedStatus === tab.key ? 'dark' : 'secondary'} className="ms-1">{tab.count || 0}</Badge>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="p-3 d-flex gap-2">
          <InputGroup>
            <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
            <Form.Control
              placeholder="Search by order number, tracking number, customer, or city…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          {searchQuery && (
            <Button variant="outline-secondary" size="sm" onClick={() => setSearchQuery('')}>
              Clear
            </Button>
          )}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" />
            <p className="mono-sm text-secondary mt-2">Loading orders from database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-5 px-3">
            <i className="bi bi-receipt fs-1 text-secondary opacity-50 d-block mb-2" />
            <h6 className="fw-bold">No orders found</h6>
            <p className="text-secondary small mb-0">
              {searchQuery ? 'No orders match your search criteria.' : 'No orders in this status category.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="d-none d-lg-block">
              <Table responsive hover className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Order & Date</th>
                    <th>Customer & City</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const st = (order.status || 'pending').toLowerCase();
                    const transition = STATUS_TRANSITIONS[st];
                    const itemCount = (order.items || []).reduce((acc, i) => acc + (i.qty || 1), 0);
                    const isBusy = updatingId === order.id;

                    return (
                      <tr key={order.id}>
                        <td>
                          <b className="d-block font-monospace text-white">{order.order_number}</b>
                          <span className="mono-sm text-secondary d-block" style={{ fontSize: '.6rem' }}>
                            {order.tracking_number}
                          </span>
                          <span className="text-secondary small" style={{ fontSize: '.7rem' }}>
                            {order.created_at ? new Date(order.created_at).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                          </span>
                        </td>
                        <td>
                          <span className="fw-bold d-block text-light small">{order.customer_name || 'Guest Customer'}</span>
                          <span className="text-secondary small"><i className="bi bi-geo-alt" /> {order.city || 'Manila'}</span>
                        </td>
                        <td>
                          <span className="badge bg-dark border border-secondary text-light mb-1">
                            {itemCount} {itemCount === 1 ? 'part' : 'parts'}
                          </span>
                          <div className="small text-secondary text-truncate" style={{ maxWidth: '200px' }}>
                            {(order.items || []).map((i) => `${i.qty}× ${i.name}`).join(', ') || 'No item details'}
                          </div>
                        </td>
                        <td>
                          <b className="text-white">₱{Number(order.total_amount || 0).toLocaleString()}</b>
                          <span className="d-block mono-sm text-secondary" style={{ fontSize: '.55rem' }}>
                            {order.shipping_method || 'Standard'}
                          </span>
                        </td>
                        <td>
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1">
                            {transition && (
                              <Button
                                size="sm"
                                variant={transition.variant}
                                disabled={isBusy}
                                onClick={() => handleAdvanceStatus(order, transition.next)}
                                title={`Advance to ${transition.next.replace('_', ' ')}`}
                              >
                                {isBusy ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <>
                                    <i className={`bi ${transition.icon} me-1`} />
                                    {transition.label}
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline-light"
                              onClick={() => {
                                setActiveOrder(order);
                                setActionNote('');
                                setActionLocation(order.city || 'Central Hub');
                              }}
                              title="Inspect Details"
                            >
                              <i className="bi bi-eye" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            {/* Mobile / Tablet Card View */}
            <div className="d-lg-none">
              {filteredOrders.map((order) => {
                const st = (order.status || 'pending').toLowerCase();
                const transition = STATUS_TRANSITIONS[st];
                const itemCount = (order.items || []).reduce((acc, i) => acc + (i.qty || 1), 0);
                const isBusy = updatingId === order.id;

                return (
                  <div key={order.id} className="mobile-row p-3 border-top border-secondary border-opacity-10">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div>
                        <b className="font-monospace text-white d-block">{order.order_number}</b>
                        <span className="mono-sm text-secondary" style={{ fontSize: '.6rem' }}>
                          {order.tracking_number}
                        </span>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="small text-secondary mb-2">
                      <span className="text-light fw-bold">{order.customer_name || 'Guest'}</span> · {order.city || 'Manila'}
                      <div className="text-truncate">
                        {(order.items || []).map((i) => `${i.qty}× ${i.name}`).join(', ')}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary border-opacity-10">
                      <div>
                        <span className="mono-sm text-secondary d-block" style={{ fontSize: '.55rem' }}>Total Amount</span>
                        <b className="text-white">₱{Number(order.total_amount || 0).toLocaleString()}</b>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-light"
                          onClick={() => {
                            setActiveOrder(order);
                            setActionNote('');
                            setActionLocation(order.city || 'Central Hub');
                          }}
                        >
                          Details
                        </Button>
                        {transition && (
                          <Button
                            size="sm"
                            variant={transition.variant}
                            disabled={isBusy}
                            onClick={() => handleAdvanceStatus(order, transition.next)}
                          >
                            {isBusy ? <Spinner animation="border" size="sm" /> : transition.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Order Details & Lifecycle Modal */}
      <Modal
        show={!!activeOrder}
        onHide={() => setActiveOrder(null)}
        size="lg"
        centered
        data-bs-theme="dark"
      >
        {activeOrder && (
          <>
            <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <Modal.Title className="display-cond fs-4 mb-0">Order {activeOrder.order_number}</Modal.Title>
                  <OrderStatusBadge status={activeOrder.status} />
                </div>
                <span className="mono-sm text-secondary d-block mt-1">
                  Tracking: {activeOrder.tracking_number}
                </span>
              </div>
            </Modal.Header>

            <Modal.Body className="p-4">
              {/* Customer & Shipping Summary */}
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Card className="h-100 bg-black border-secondary border-opacity-25 p-3">
                    <span className="eyebrow mb-2">Recipient Information</span>
                    <h6 className="fw-bold text-white mb-1">{activeOrder.customer_name || 'Guest Customer'}</h6>
                    <p className="small text-secondary mb-1">
                      <i className="bi bi-envelope me-1" /> {activeOrder.guest_email || 'No email provided'}
                    </p>
                    <p className="small text-secondary mb-0">
                      <i className="bi bi-clock me-1" /> Placed on{' '}
                      {activeOrder.created_at ? new Date(activeOrder.created_at).toLocaleString('en-PH') : '—'}
                    </p>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100 bg-black border-secondary border-opacity-25 p-3">
                    <span className="eyebrow mb-2">Delivery Destination</span>
                    <h6 className="fw-bold text-white mb-1">{activeOrder.city}, Philippines</h6>
                    <p className="small text-secondary mb-1">
                      <i className="bi bi-geo-alt me-1" /> {activeOrder.shipping_address || 'Standard Address'}
                    </p>
                    <p className="small text-secondary mb-0">
                      <i className="bi bi-truck me-1" /> {activeOrder.shipping_method || 'Standard Shipping'} (₱{Number(activeOrder.shipping_fee || 0).toLocaleString()})
                    </p>
                  </Card>
                </Col>
              </Row>

              {/* Items List */}
              <div className="mb-4">
                <span className="eyebrow d-block mb-2">Ordered Parts & Quantities</span>
                <div className="border border-secondary border-opacity-25 rounded overflow-hidden">
                  <Table responsive hover className="mb-0 align-middle table-sm">
                    <thead className="table-dark">
                      <tr>
                        <th>Part Details</th>
                        <th>Category</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Unit Price</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeOrder.items || []).map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <b className="text-white small d-block">{item.name}</b>
                            <span className="mono-sm text-secondary" style={{ fontSize: '.55rem' }}>
                              SKU: {item.sku} {item.fitment ? `· Fits: ${item.fitment}` : ''}
                            </span>
                          </td>
                          <td className="small text-secondary">{item.category || 'General'}</td>
                          <td className="text-center text-white font-monospace">{item.qty}</td>
                          <td className="text-end text-secondary small">₱{Number(item.price || 0).toLocaleString()}</td>
                          <td className="text-end text-white fw-bold small">
                            ₱{(Number(item.price || 0) * Number(item.qty || 1)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="p-3 bg-black border border-secondary border-opacity-25 rounded mb-4">
                <div className="d-flex justify-content-between small text-secondary mb-1">
                  <span>Shipping Fee:</span>
                  <span>₱{Number(activeOrder.shipping_fee || 0).toLocaleString()}</span>
                </div>
                {Number(activeOrder.discount_amount || 0) > 0 && (
                  <div className="d-flex justify-content-between small text-success mb-1">
                    <span>Voucher Discount:</span>
                    <span>-₱{Number(activeOrder.discount_amount).toLocaleString()}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between fw-bold text-white fs-6 pt-2 border-top border-secondary border-opacity-25">
                  <span>Total Amount (COD):</span>
                  <span className="text-warning">₱{Number(activeOrder.total_amount || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Status Advancement Console */}
              <div className="p-3 bg-black border border-secondary border-opacity-25 rounded">
                <span className="eyebrow d-block mb-2">Advance Milestone Lifecycle</span>
                <p className="text-secondary small mb-3">
                  Select a milestone to progress this order. This updates the live tracking timeline and triggers route calculations on the customer map.
                </p>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  {[
                    { key: 'confirmed', label: '1. Confirm', icon: 'bi-check2' },
                    { key: 'packed', label: '2. Pack Parts', icon: 'bi-box-seam' },
                    { key: 'shipped', label: '3. Dispatch / Ship', icon: 'bi-truck' },
                    { key: 'out_for_delivery', label: '4. Out for Delivery', icon: 'bi-geo-alt' },
                    { key: 'delivered', label: '5. Delivered', icon: 'bi-check-all' },
                  ].map((step) => {
                    const isCurrent = (activeOrder.status || '').toLowerCase() === step.key;
                    return (
                      <Button
                        key={step.key}
                        size="sm"
                        variant={isCurrent ? 'light' : 'outline-secondary'}
                        disabled={updatingId === activeOrder.id || (activeOrder.status || '').toLowerCase() === 'cancelled'}
                        onClick={() => handleAdvanceStatus(activeOrder, step.key, actionNote, actionLocation)}
                      >
                        <i className={`bi ${step.icon} me-1`} />
                        {step.label}
                      </Button>
                    );
                  })}
                </div>

                <Row className="g-2">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="mono-sm text-secondary">Milestone Location Note</Form.Label>
                      <Form.Control
                        size="sm"
                        placeholder="e.g., In transit at South Luzon Hub"
                        value={actionLocation}
                        onChange={(e) => setActionLocation(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="mono-sm text-secondary">Internal Status Note</Form.Label>
                      <Form.Control
                        size="sm"
                        placeholder="e.g., Courier picked up package"
                        value={actionNote}
                        onChange={(e) => setActionNote(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Modal.Body>

            <Modal.Footer className="border-secondary border-opacity-25 d-flex justify-content-between">
              <div>
                {(activeOrder.status || '').toLowerCase() !== 'cancelled' &&
                  (activeOrder.status || '').toLowerCase() !== 'delivered' && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleCancelOrder(activeOrder)}
                      disabled={updatingId === activeOrder.id}
                    >
                      <i className="bi bi-x-circle me-1" /> Cancel Order & Restock
                    </Button>
                  )}
              </div>
              <div className="d-flex gap-2">
                <Button
                  as={Link}
                  to="/track"
                  state={{ orderNumber: activeOrder.order_number, email: activeOrder.guest_email }}
                  target="_blank"
                  variant="outline-info"
                  size="sm"
                >
                  <i className="bi bi-box-arrow-up-right me-1" /> View Tracking Map
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setActiveOrder(null)}>
                  Close
                </Button>
              </div>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}
