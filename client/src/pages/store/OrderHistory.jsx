import { useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getSavedOrders, hydrateOrderFromDb } from '../../utils/orders';
import { fetchOrderHistoryApi } from '../../api/orders';

export default function OrderHistory() {
  const [email, setEmail] = useState('');
  const [searchedEmail, setSearchedEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  async function searchHistory(event) {
    event.preventDefault();
    const em = email.trim().toLowerCase();
    if (!em) return;

    setSearchedEmail(em);
    setLoading(true);

    try {
      // 1. Fetch live orders from MySQL backend
      const dbOrders = await fetchOrderHistoryApi(em);
      const hydratedDb = Array.isArray(dbOrders) ? dbOrders.map(hydrateOrderFromDb) : [];

      // 2. Fetch local storage orders
      const localOrders = getSavedOrders().filter((o) => (o.email || '').toLowerCase() === em);

      // 3. Merge without duplicates (DB orders take precedence)
      const seen = new Set();
      const merged = [];

      for (const ord of hydratedDb) {
        if (!seen.has(ord.orderNumber)) {
          seen.add(ord.orderNumber);
          merged.push(ord);
        }
      }
      for (const ord of localOrders) {
        if (!seen.has(ord.orderNumber)) {
          seen.add(ord.orderNumber);
          merged.push(ord);
        }
      }

      setOrders(merged);
    } catch (err) {
      console.warn('Could not query database order history, falling back to local storage:', err);
      const localOrders = getSavedOrders().filter((o) => (o.email || '').toLowerCase() === em);
      setOrders(localOrders);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="history-page">
      <Container className="py-5">
        <div className="history-heading">
          <p className="eyebrow mb-2">Your garage / Past orders</p>
          <h1 className="display-cond">Order history.</h1>
          <p>Look up past orders placed with your email address.</p>
          <span className="mono-sm">Verified orders from AutoFix Hub database</span>
        </div>

        <Form className="history-search" onSubmit={searchHistory}>
          <Form.Label htmlFor="history-email" className="mono-sm">Checkout email</Form.Label>
          <div>
            <Form.Control id="history-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            <Button type="submit" variant="dark" disabled={loading}>{loading ? 'Searching...' : 'View history'}</Button>
          </div>
        </Form>

        {searchedEmail && (
          orders.length ? (
            <div className="history-orders" aria-live="polite">
              {orders.map((order) => (
                <article className="history-order" key={order.orderNumber}>
                  <div className="history-order-top">
                    <div><span className="mono-sm">{order.orderNumber} · {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-PH') : 'Date unavailable'}</span><h2>{order.items.map((item) => `${item.qty} × ${item.name}`).join(', ')}</h2></div>
                    <strong>₱{order.total.toLocaleString()}</strong>
                  </div>
                  <div className="history-order-bottom">
                    <span><i className="bi bi-box-seam" /> {order.trackingNumber}</span>
                    <span><i className="bi bi-geo-alt" /> {order.destination}</span>
                    <Button as={Link} to="/track" state={{ orderNumber: order.orderNumber, email: order.email }} variant="outline-dark">Track <i className="bi bi-arrow-right" /></Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="history-empty" role="status"><i className="bi bi-receipt" /><strong>No saved orders for that email.</strong><span>Orders are stored only in the browser where checkout was completed.</span></div>
          )
        )}
      </Container>
    </main>
  );
}