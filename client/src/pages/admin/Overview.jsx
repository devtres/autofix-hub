import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchAdminOverview } from '../../api/admin';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import StatusBadge from '../../components/admin/StatusBadge';

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load overview data:', err);
      setError(err?.response?.data?.error || err?.message || 'Could not load operations overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = data?.metrics || {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    inFlightOrders: 0,
    ordersToday: 0,
    lowStockCount: 0,
    avgDispatchHours: 18,
  };

  return (
    <div className="admin-overview-page">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <p className="eyebrow mb-1">Workspace / Executive Hub</p>
          <h1 className="display-cond display-5 mb-1">Operations Overview</h1>
          <p className="text-secondary small mb-0">
            Real-time fulfillment metrics, urgent dispatch queues, and inventory health status.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-light" size="sm" onClick={loadData} disabled={loading}>
            <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`} /> Refresh
          </Button>
          <Button as={Link} to="/admin/orders" variant="primary" size="sm">
            <i className="bi bi-receipt me-1" /> Orders Command
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <p className="mono-sm text-secondary mt-2">Loading operations data...</p>
        </div>
      ) : (
        <>
          {/* 4 StatCards Grid */}
          <Row className="g-3 mb-4">
            <Col xs={12} sm={6} lg={3}>
              <Card className="panel border-secondary border-opacity-25 h-100 p-3">
                <span className="eyebrow mb-1">Gross Revenue</span>
                <div className="d-flex align-items-baseline gap-2 mb-2">
                  <h3 className="display-cond fs-2 text-success mb-0">
                    ₱{metrics.totalRevenue.toLocaleString()}
                  </h3>
                </div>
                <span className="mono-sm text-secondary">
                  <i className="bi bi-check-circle text-success me-1" />
                  COD Demo transactions settled
                </span>
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <Card className="panel border-secondary border-opacity-25 h-100 p-3">
                <span className="eyebrow mb-1">Orders in Pipeline</span>
                <div className="d-flex align-items-baseline gap-2 mb-2">
                  <h3 className="display-cond fs-2 text-info mb-0">
                    {metrics.inFlightOrders}
                  </h3>
                  <span className="mono-sm text-secondary">active shipments</span>
                </div>
                <span className="mono-sm text-secondary">
                  <i className="bi bi-calendar-event me-1" />
                  {metrics.ordersToday} placed today
                </span>
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <Card className="panel border-secondary border-opacity-25 h-100 p-3">
                <span className="eyebrow mb-1">Pending Review</span>
                <div className="d-flex align-items-baseline gap-2 mb-2">
                  <h3 className={`display-cond fs-2 mb-0 ${metrics.pendingOrders > 0 ? 'text-warning' : 'text-white'}`}>
                    {metrics.pendingOrders}
                  </h3>
                  <span className="mono-sm text-secondary">needs action</span>
                </div>
                <span className="mono-sm text-secondary">
                  <i className="bi bi-hourglass-split text-warning me-1" />
                  Awaiting confirmation & packing
                </span>
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <Card className="panel border-secondary border-opacity-25 h-100 p-3">
                <span className="eyebrow mb-1">Average Dispatch</span>
                <div className="d-flex align-items-baseline gap-2 mb-2">
                  <h3 className="display-cond fs-2 text-white mb-0">
                    {metrics.avgDispatchHours} hrs
                  </h3>
                  <Badge bg="success" className="mono-sm">Target: &lt; 24h</Badge>
                </div>
                <span className="mono-sm text-secondary">
                  <i className="bi bi-lightning-charge text-warning me-1" />
                  Time from order to courier transit
                </span>
              </Card>
            </Col>
          </Row>

          {/* Operational Views Split */}
          <Row className="g-4 mb-4">
            {/* Recent Orders Queue */}
            <Col lg={7}>
              <div className="panel h-100">
                <div className="p-3 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-bold mb-0 text-white">Recent Customer Orders</h5>
                    <span className="mono-sm text-secondary">Latest incoming transactions</span>
                  </div>
                  <Button as={Link} to="/admin/orders" variant="outline-light" size="sm">
                    View All Orders <i className="bi bi-arrow-right ms-1" />
                  </Button>
                </div>

                {(!data?.recentOrders || data.recentOrders.length === 0) ? (
                  <div className="p-4 text-center text-secondary">
                    <p className="small mb-0">No orders placed yet.</p>
                  </div>
                ) : (
                  <Table responsive hover className="mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentOrders.map((ord) => (
                        <tr key={ord.id}>
                          <td>
                            <b className="font-monospace text-white small d-block">{ord.order_number}</b>
                            <span className="mono-sm text-secondary" style={{ fontSize: '.55rem' }}>
                              {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-PH') : '—'}
                            </span>
                          </td>
                          <td>
                            <span className="small text-light d-block">{ord.customer_name || 'Guest'}</span>
                            <span className="text-secondary small" style={{ fontSize: '.65rem' }}>
                              {ord.city || 'Manila'}
                            </span>
                          </td>
                          <td>
                            <span className="fw-bold text-white small">₱{Number(ord.total_amount).toLocaleString()}</span>
                          </td>
                          <td>
                            <OrderStatusBadge status={ord.status} />
                          </td>
                          <td className="text-end">
                            <Button as={Link} to="/admin/orders" size="sm" variant="outline-secondary">
                              <i className="bi bi-arrow-right" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </Col>

            {/* Low Stock Alerts */}
            <Col lg={5}>
              <div className="panel h-100">
                <div className="p-3 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-bold mb-0 text-white">Inventory Health</h5>
                    <span className="mono-sm text-warning">
                      <i className="bi bi-exclamation-triangle me-1" />
                      {metrics.lowStockCount} items at low threshold
                    </span>
                  </div>
                  <Button as={Link} to="/admin/products" variant="outline-light" size="sm">
                    Manage <i className="bi bi-arrow-right ms-1" />
                  </Button>
                </div>

                {(!data?.lowStockProducts || data.lowStockProducts.length === 0) ? (
                  <div className="p-4 text-center text-secondary">
                    <i className="bi bi-check-circle text-success fs-3 d-block mb-2" />
                    <h6 className="fw-bold text-white">All stock levels healthy</h6>
                    <p className="small mb-0">No parts currently below the minimum stock threshold.</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {data.lowStockProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <b className="text-white small d-block">{p.name}</b>
                          <span className="mono-sm text-secondary" style={{ fontSize: '.6rem' }}>
                            {p.sku} · {p.category}
                          </span>
                        </div>
                        <div className="text-end">
                          <StatusBadge stock={p.stock} isLow={true} />
                          <span className="mono-sm text-secondary d-block mt-1" style={{ fontSize: '.65rem' }}>
                            {p.stock} units left
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* Quick Management Shortcuts */}
          <div className="panel p-3">
            <span className="eyebrow mb-2 d-block">Quick System Shortcuts</span>
            <div className="d-flex flex-wrap gap-2">
              <Button as={Link} to="/admin/products" variant="outline-light" size="sm">
                <i className="bi bi-plus-lg me-1" /> Add / Manage Products
              </Button>
              <Button as={Link} to="/admin/orders" variant="outline-light" size="sm">
                <i className="bi bi-receipt me-1" /> Order Fulfillment
              </Button>
              <Button as={Link} to="/admin/tracking" variant="outline-light" size="sm">
                <i className="bi bi-truck me-1" /> Live Fleet Tracking
              </Button>
              <Button as={Link} to="/admin/suppliers" variant="outline-light" size="sm">
                <i className="bi bi-buildings me-1" /> Suppliers Directory
              </Button>
              <Button as={Link} to="/admin/settings" variant="outline-light" size="sm">
                <i className="bi bi-gear me-1" /> Store Settings
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
