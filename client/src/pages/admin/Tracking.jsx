import { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Spinner, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchAdminOrders, updateOrderStatus } from '../../api/orders';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';

const MILESTONE_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export default function Tracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulatingId, setSimulatingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load orders for tracking board:', err);
      setError('Could not load dispatch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const advanceStep = async (order, targetStatus) => {
    try {
      await updateOrderStatus(order.id, {
        status: targetStatus,
        note: `Dispatched to ${targetStatus} via tracking board`,
        location: order.city || 'Hub Sorting Facility',
      });
      await loadOrders();
      setStatusMessage(`Order #${order.order_number} advanced to ${targetStatus.replace('_', ' ')}.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err?.response?.data?.error || 'Failed to advance status.');
    }
  };

  // Live simulation for academic / presentation evaluations
  const simulateLiveProgress = async (order) => {
    setSimulatingId(order.id);
    setStatusMessage(`Beginning live delivery simulation for Order #${order.order_number}...`);

    const currentIdx = MILESTONE_STEPS.indexOf((order.status || 'pending').toLowerCase());
    const nextSteps = MILESTONE_STEPS.slice(Math.max(1, currentIdx + 1));

    for (const step of nextSteps) {
      try {
        await new Promise((res) => setTimeout(res, 2000));
        await updateOrderStatus(order.id, {
          status: step,
          note: `Simulated live tracking transit: ${step}`,
          location: step === 'delivered' ? order.city : 'In transit on Express Route',
        });
        setStatusMessage(`Order #${order.order_number} ➔ ${step.replace('_', ' ').toUpperCase()}`);
        await loadOrders();
      } catch (err) {
        console.error('Simulation halted:', err);
        break;
      }
    }

    setSimulatingId(null);
    setStatusMessage(`Order #${order.order_number} successfully completed simulated delivery cycle!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // In-flight or active orders (shipped, out_for_delivery, packed, confirmed)
  const activeOrders = orders.filter((o) => {
    const s = (o.status || '').toLowerCase();
    return s === 'shipped' || s === 'out_for_delivery' || s === 'packed' || s === 'confirmed';
  });

  return (
    <div className="admin-tracking-board">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <p className="eyebrow mb-1">Workspace / Fleet Dispatch</p>
          <h1 className="display-cond display-5 mb-1">Active Tracking Board</h1>
          <p className="text-secondary small mb-0">
            Real-time courier dispatch monitoring with instant progress simulation for demo evaluations.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-light" size="sm" onClick={loadOrders} disabled={loading}>
            <i className="bi bi-arrow-clockwise me-1" /> Refresh
          </Button>
          <Button as={Link} to="/admin/orders" variant="outline-light" size="sm">
            <i className="bi bi-receipt me-1" /> View All Orders
          </Button>
        </div>
      </div>

      {/* Status Toasts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {error}
        </Alert>
      )}
      {statusMessage && (
        <Alert variant="info" dismissible onClose={() => setStatusMessage(null)} className="mb-3">
          <i className="bi bi-truck me-2" />
          {statusMessage}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <p className="mono-sm text-secondary mt-2">Loading active dispatch routes...</p>
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="panel p-5 text-center">
          <i className="bi bi-truck fs-1 text-secondary opacity-50 d-block mb-3" />
          <h5 className="fw-bold">No packages currently in transit</h5>
          <p className="text-secondary small max-w-md mx-auto mb-4">
            Orders that are confirmed, packed, shipped, or out for delivery will automatically appear here on the active fleet board.
          </p>
          <Button as={Link} to="/admin/orders" variant="primary">
            Go to Orders Command to dispatch packages
          </Button>
        </div>
      ) : (
        <Row className="g-3">
          {activeOrders.map((order) => {
            const st = (order.status || 'pending').toLowerCase();
            const stepIndex = MILESTONE_STEPS.indexOf(st);
            const progressPercent = Math.round(((stepIndex + 1) / MILESTONE_STEPS.length) * 100);
            const isSimulating = simulatingId === order.id;

            return (
              <Col lg={6} key={order.id}>
                <Card className="panel border-secondary border-opacity-25 h-100 p-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <b className="font-monospace text-white fs-6">{order.order_number}</b>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <span className="mono-sm text-secondary d-block mt-1">
                        Tracking: {order.tracking_number} · {order.shipping_method || 'Standard'}
                      </span>
                    </div>
                    <Badge bg="dark" className="border border-secondary text-light">
                      AutoFix Express
                    </Badge>
                  </div>

                  {/* Progress Milestone Bar */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mono-sm text-secondary mb-1">
                      <span>Dispatch Progress</span>
                      <span>{progressPercent}% Complete</span>
                    </div>
                    <ProgressBar
                      now={progressPercent}
                      variant={st === 'out_for_delivery' ? 'warning' : 'info'}
                      style={{ height: '6px' }}
                    />
                  </div>

                  {/* Route Details */}
                  <div className="bg-black p-3 rounded border border-secondary border-opacity-10 mb-3">
                    <Row className="g-2 text-secondary small">
                      <Col xs={6}>
                        <span className="mono-sm d-block text-secondary">Origin Hub</span>
                        <strong className="text-white">AutoFix Central (NCR)</strong>
                      </Col>
                      <Col xs={6}>
                        <span className="mono-sm d-block text-secondary">Destination</span>
                        <strong className="text-white">{order.city || 'Manila'}, PH</strong>
                      </Col>
                      <Col xs={12} className="pt-2 border-top border-secondary border-opacity-10">
                        <span className="mono-sm d-block text-secondary">Recipient</span>
                        <span className="text-light">{order.customer_name || 'Valued Customer'}</span> ·{' '}
                        <span className="text-secondary">{order.shipping_address || 'Delivery address'}</span>
                      </Col>
                    </Row>
                  </div>

                  {/* Action Controls */}
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-auto pt-2 border-top border-secondary border-opacity-10">
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-warning"
                        disabled={isSimulating}
                        onClick={() => simulateLiveProgress(order)}
                        title="Simulate sequential progression through to delivery"
                      >
                        {isSimulating ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Simulating...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-play-circle me-1" />
                            Simulate Progress
                          </>
                        )}
                      </Button>

                      {st === 'packed' && (
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => advanceStep(order, 'shipped')}
                          disabled={isSimulating}
                        >
                          Dispatch / Ship
                        </Button>
                      )}
                      {st === 'shipped' && (
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => advanceStep(order, 'out_for_delivery')}
                          disabled={isSimulating}
                        >
                          Out for Delivery
                        </Button>
                      )}
                      {st === 'out_for_delivery' && (
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => advanceStep(order, 'delivered')}
                          disabled={isSimulating}
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </div>

                    <Button
                      as={Link}
                      to="/track"
                      state={{ orderNumber: order.order_number, email: order.guest_email }}
                      target="_blank"
                      variant="outline-light"
                      size="sm"
                    >
                      <i className="bi bi-map me-1" /> Map View
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
