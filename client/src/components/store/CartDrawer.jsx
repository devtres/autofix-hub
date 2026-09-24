import { Offcanvas, Button } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { open, setOpen, items, remove, subtotal } = useCart();
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
              <div key={i.product_id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div><b className="d-block small">{i.name}</b><span className="mono-sm text-muted">{i.qty} × ₱{i.price}</span></div>
                <Button size="sm" variant="link" className="text-danger" onClick={() => remove(i.product_id)}><i className="bi bi-x-lg" /></Button>
              </div>
            ))}
            <div className="mt-auto pt-3">
              <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><b>₱{subtotal.toLocaleString()}</b></div>
              <Button variant="primary" className="w-100">Checkout</Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}