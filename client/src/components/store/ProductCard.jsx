import { Card, Button } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ p }) {
  const { add } = useCart();
  const low = p.stock_qty <= p.low_stock_threshold;
  return (
    <Card className="product-card" style={{ '--accent': p.accent_color }}>
      <div className="thumb">
        <span className="mono-sm cat">{p.category}</span>
        {low && <span className="low-tag">Low stock</span>}
        <button className="heart" aria-label="Wishlist"><i className="bi bi-heart" /></button>
        <span className="box-tile"><i className={`bi bi-box-seam ${low ? 'text-warning' : ''}`} /></span>
      </div>
      <Card.Body>
        <div className="mono-sm text-muted mb-1" style={{ fontSize: '.55rem' }}>{p.sku} · {p.fitment}</div>
        <Card.Title className="fs-6 fw-bold mb-2">{p.name}</Card.Title>
        <div className="d-flex justify-content-between align-items-center">
          <b>₱{p.price.toLocaleString()}</b>
          <Button size="sm" variant="dark" disabled={p.stock_qty === 0} onClick={() => add(p)}>+ Add</Button>
        </div>
      </Card.Body>
    </Card>
  );
}