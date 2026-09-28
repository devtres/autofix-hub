import { useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { createOrder, saveOrder } from '../../utils/orders';
import { PHILIPPINE_LOCATIONS } from '../../utils/philippineLocations';

const INITIAL_CUSTOMER = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  barangay: '',
  city: 'Manila',
  postalCode: '',
};

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(INITIAL_CUSTOMER);
  const [shippingMethod, setShippingMethod] = useState('Standard');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const shippingFee = shippingMethod === 'Express' ? 189 : 99;
  const discount = voucherApplied && subtotal >= 1000 ? 100 : 0;

  function updateCustomer(event) {
    setCustomer((value) => ({ ...value, [event.target.name]: event.target.value }));
  }

  function placeOrder(event) {
    event.preventDefault();
    if (!items.length) return;
    try {
      const order = createOrder({ customer, items, subtotal, shippingMethod, shippingFee, discount, message });
      saveOrder(order);
      clear();
      navigate(`/order-confirmation/${order.orderNumber}`);
    } catch {
      setError('We could not save this demo order in your browser. Check your browser storage and try again.');
    }
  }

  return (
    <main className="checkout-page">
      <Container className="py-5">
        <div className="checkout-heading">
          <p className="eyebrow mb-2">Your garage / Checkout</p>
          <h1 className="display-cond">Confirm your order.</h1>
          <p className="text-muted mb-0">Delivery across the Philippines. No real payment will be collected.</p>
        </div>

        {!items.length ? (
          <div className="checkout-empty">
            <i className="bi bi-bag" />
            <h2>Your garage is empty</h2>
            <p className="text-muted">Add a part before checking out.</p>
            <Button as={Link} to="/" variant="dark">Browse parts</Button>
          </div>
        ) : (
          <Form onSubmit={placeOrder}>
            <Row className="g-4 checkout-grid">
              <Col lg={8}>
                <section className="checkout-section">
                  <div className="checkout-section-heading">
                    <div><span className="checkout-step">01</span><h2>Delivery address</h2></div>
                    <i className="bi bi-geo-alt" />
                  </div>
                  <Row className="g-3">
                    <Col md={6}><Form.Label htmlFor="checkout-name">Full name</Form.Label><Form.Control id="checkout-name" name="fullName" value={customer.fullName} onChange={updateCustomer} autoComplete="name" required /></Col>
                    <Col md={6}><Form.Label htmlFor="checkout-email">Email for tracking</Form.Label><Form.Control id="checkout-email" type="email" name="email" value={customer.email} onChange={updateCustomer} autoComplete="email" required /></Col>
                    <Col md={6}><Form.Label htmlFor="checkout-phone">Mobile number</Form.Label><Form.Control id="checkout-phone" type="tel" name="phone" value={customer.phone} onChange={updateCustomer} placeholder="+63 9XX XXX XXXX" autoComplete="tel" required /></Col>
                    <Col md={6}><Form.Label htmlFor="checkout-city">City</Form.Label>
                      <Form.Select id="checkout-city" name="city" value={customer.city} onChange={updateCustomer}>
                        {PHILIPPINE_LOCATIONS.map((location) => <option key={location.city} value={location.city}>{location.city}, {location.province}</option>)}
                      </Form.Select>
                    </Col>
                    <Col md={8}><Form.Label htmlFor="checkout-address">House no. / Street</Form.Label><Form.Control id="checkout-address" name="address" value={customer.address} onChange={updateCustomer} autoComplete="street-address" required /></Col>
                    <Col md={4}><Form.Label htmlFor="checkout-barangay">Barangay</Form.Label><Form.Control id="checkout-barangay" name="barangay" value={customer.barangay} onChange={updateCustomer} required /></Col>
                    <Col md={4}><Form.Label htmlFor="checkout-postal-code">ZIP code</Form.Label><Form.Control id="checkout-postal-code" name="postalCode" value={customer.postalCode} onChange={updateCustomer} inputMode="numeric" autoComplete="postal-code" required /></Col>
                  </Row>
                </section>

                <section className="checkout-section">
                  <div className="checkout-section-heading">
                    <div><span className="checkout-step">02</span><h2>Parts ordered</h2></div>
                    <span className="mono-sm text-muted">{items.reduce((count, item) => count + item.qty, 0)} items</span>
                  </div>
                  <div className="checkout-items-head mono-sm"><span>Part</span><span>Unit price</span><span>Qty</span><span>Subtotal</span></div>
                  {items.map((item) => (
                    <div className="checkout-item" key={item.product_id}>
                      <div className="checkout-item-name"><span className="checkout-item-icon"><i className="bi bi-gear-wide-connected" /></span><div><strong>{item.name}</strong><span>{item.sku} · {item.fitment}</span></div></div>
                      <span>₱{item.price.toLocaleString()}</span>
                      <span>{item.qty}</span>
                      <strong>₱{(item.price * item.qty).toLocaleString()}</strong>
                    </div>
                  ))}
                  <div className="checkout-message"><Form.Label htmlFor="checkout-message">Message for AutoFix Hub</Form.Label><Form.Control id="checkout-message" as="textarea" rows={2} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Optional delivery instructions" /></div>
                </section>

                <section className="checkout-section">
                  <div className="checkout-section-heading">
                    <div><span className="checkout-step">03</span><h2>Shipping option</h2></div>
                    <i className="bi bi-truck" />
                  </div>
                  <div className="shipping-options">
                    <Form.Check type="radio" id="shipping-standard" name="shipping" value="Standard" checked={shippingMethod === 'Standard'} onChange={() => setShippingMethod('Standard')} label={<span><strong>Standard delivery</strong><small>3–5 business days · ₱99</small></span>} />
                    <Form.Check type="radio" id="shipping-express" name="shipping" value="Express" checked={shippingMethod === 'Express'} onChange={() => setShippingMethod('Express')} label={<span><strong>Express delivery</strong><small>1–2 business days · ₱189</small></span>} />
                  </div>
                </section>
              </Col>

              <Col lg={4}>
                <aside className="checkout-summary">
                  <p className="eyebrow mb-3">Order summary</p>
                  <div className="checkout-voucher">
                    <span><i className="bi bi-ticket-perforated" /> Shop voucher</span>
                    <Button variant="link" disabled={subtotal < 1000} onClick={() => setVoucherApplied((value) => !value)}>
                      {voucherApplied ? 'Remove ₱100' : subtotal >= 1000 ? 'Apply ₱100' : 'Spend ₱1,000'}
                    </Button>
                  </div>
                  <div className="checkout-totals">
                    <div><span>Parts subtotal</span><span>₱{subtotal.toLocaleString()}</span></div>
                    <div><span>Shipping</span><span>₱{shippingFee.toLocaleString()}</span></div>
                    {discount > 0 && <div className="checkout-discount"><span>Shop voucher</span><span>−₱{discount}</span></div>}
                    <div className="checkout-grand-total"><strong>Order total</strong><strong>₱{(subtotal + shippingFee - discount).toLocaleString()}</strong></div>
                  </div>
                  <div className="payment-demo"><i className="bi bi-shield-check" /><div><strong>PAYMENT CONFIRMED</strong><span>Demo checkout only. No payment is processed.</span></div></div>
                  {error && <p className="checkout-error" role="alert">{error}</p>}
                  <Button type="submit" variant="primary" className="w-100 checkout-submit">Place order <i className="bi bi-arrow-right" /></Button>
                  <p className="checkout-privacy"><i className="bi bi-lock" /> Tracking details will be linked to your email.</p>
                </aside>
              </Col>
            </Row>
          </Form>
        )}
      </Container>
    </main>
  );
}