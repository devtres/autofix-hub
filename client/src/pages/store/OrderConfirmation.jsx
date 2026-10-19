import { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { getSavedOrders, hydrateOrderFromDb } from '../../utils/orders';
import { trackOrderApi } from '../../api/orders';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(() => getSavedOrders().find((item) => item.orderNumber === orderNumber) || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderNumber) {
      trackOrderApi(orderNumber)
        .then((data) => {
          const raw = Array.isArray(data) ? data[0] : data;
          if (raw) setOrder(hydrateOrderFromDb(raw));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [order, orderNumber]);

  if (loading) {
    return (
      <main className="checkout-page">
        <Container className="py-5 text-center">
          <Spinner animation="border" role="status" className="mb-3" />
          <p className="text-muted">Loading order confirmation...</p>
        </Container>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="checkout-page">
        <Container className="py-5"><div className="checkout-empty"><h1>Order not found</h1><p className="text-muted">This order could not be located in our records.</p><Button as={Link} to="/" variant="dark">Return to shop</Button></div></Container>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <Container className="py-5">
        <section className="confirmation-panel">
          <div className="confirmation-check"><i className="bi bi-check-lg" /></div>
          <p className="eyebrow mb-2">AutoFix Hub / Order received</p>
          <h1 className="display-cond">You're all set.</h1>
          <div className="payment-confirmed">PAYMENT CONFIRMED <span>DEMO</span></div>
          <p className="confirmation-note">No real payment was collected. Your demo order is saved in this browser.</p>
          <Row className="confirmation-numbers g-3">
            <Col sm={6}><span className="mono-sm">Order number</span><strong>{order.orderNumber}</strong></Col>
            <Col sm={6}><span className="mono-sm">Tracking number</span><strong>{order.trackingNumber}</strong></Col>
          </Row>
          <div className="confirmation-delivery"><i className="bi bi-truck" /><div><span className="mono-sm">Delivering to {order.destination}</span><strong>{order.eta}</strong><span>Tracking lookup email: {order.email}</span></div></div>
          <div className="confirmation-actions">
            <Button as={Link} to="/track" state={{ orderNumber: order.orderNumber, email: order.email }} variant="dark">Track this order <i className="bi bi-arrow-right" /></Button>
            <Button as={Link} to="/" variant="outline-dark">Continue shopping</Button>
          </div>
        </section>
      </Container>
    </main>
  );
}