import { Offcanvas, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { open, setOpen, items, remove, setQuantity, subtotal } = useCart();
  const navigate = useNavigate();
  return (
    <Offcanvas show={open} onHide={() => setOpen(false)} placement="end" className="garage">
      <Offcanvas.Header closeButton>
        <div>
          <p className="eyebrow mb-0">Your garage</p>
          <Offcanvas.Title className="display-cond fs-2">Cart</Offcanvas.Title>
        </div>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex flex-column">
        {items.length === 0 ? (
          <div className="m-auto text-center px-4">
            <i className="bi bi-bag fs-4" />
            <h6 className="fw-bold mt-2">Your garage is empty</h6>
            <p className="small text-muted">Add parts from the collection and we'll keep your order together here.</p>
          </div>
        ) : (
          <>
            {items.map((i) => (
              <div key={i.product_id} className="cart-line py-3 border-bottom">
                <div className="d-flex justify-content-between align-items-start gap-2"><div><b className="d-block small">{i.name}</b><span className="mono-sm text-muted">₱{i.price.toLocaleString()} each</span></div>
                  <Button size="sm" variant="link" className="text-danger p-1" aria-label={`Remove ${i.name}`} onClick={() => remove(i.product_id)}><i className="bi bi-trash3" /></Button>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2"><div className="quantity-stepper" aria-label={`Quantity for ${i.name}`}>
                  <Button size="sm" variant="outline-dark" aria-label={`Decrease ${i.name} quantity`} onClick={() => setQuantity(i.product_id, i.qty - 1)}><i className="bi bi-dash" /></Button>
                  <span aria-live="polite">{i.qty}</span>
                  <Button size="sm" variant="outline-dark" aria-label={`Increase ${i.name} quantity`} disabled={i.qty >= i.stock_qty} onClick={() => setQuantity(i.product_id, i.qty + 1)}><i className="bi bi-plus" /></Button>
                </div><b>₱{(i.qty * i.price).toLocaleString()}</b></div>
              </div>
            ))}
            <div className="mt-auto pt-3">
              <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><b>₱{subtotal.toLocaleString()}</b></div>
              <Button variant="primary" className="w-100" onClick={() => { setOpen(false); navigate('/checkout'); }}>Checkout</Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}