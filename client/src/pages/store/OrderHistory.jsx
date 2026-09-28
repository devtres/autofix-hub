import { useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getSavedOrders } from '../../utils/orders';

export default function OrderHistory() {
  const [email, setEmail] = useState('');
  const [searchedEmail, setSearchedEmail] = useState('');
  const orders = searchedEmail
    ? getSavedOrders().filter((order) => order.email === searchedEmail.toLowerCase())
    : [];

  function searchHistory(event) {
    event.preventDefault();
    setSearchedEmail(email.trim().toLowerCase());
  }

  return (
    <main className="history-page">
      <Container className="py-5">
        <div className="history-heading">
          <p className="eyebrow mb-2">Your garage / Past orders</p>
          <h1 className="display-cond">Order history.</h1>
          <p>Look up demo orders saved in this browser using the checkout email.</p>
          <span className="mono-sm">Local preview only · Account sign-in is not configured</span>
        </div>

        <Form className="history-search" onSubmit={searchHistory}>
          <Form.Label htmlFor="history-email" className="mono-sm">Checkout email</Form.Label>
          <div>
            <Form.Control id="history-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            <Button type="submit" variant="dark">View history</Button>
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