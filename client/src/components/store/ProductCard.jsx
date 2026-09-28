import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ p }) {
  const { add, wishlist, toggleWishlist } = useCart();
  const low = p.stock_qty <= p.low_stock_threshold;
  const saved = wishlist.some((item) => item.product_id === p.product_id);
  return (
    <Card className="product-card" style={{ '--accent': p.accent_color }}>
      <div className="thumb">
        <span className="mono-sm cat">{p.category}</span>
        {low && <span className="low-tag">Low stock</span>}
        <button className={`heart ${saved ? 'is-saved' : ''}`} aria-label={saved ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`} aria-pressed={saved} onClick={() => toggleWishlist(p)}><i className={`bi ${saved ? 'bi-heart-fill' : 'bi-heart'}`} /></button>
        <span className="box-tile"><i className={`bi bi-box-seam ${low ? 'text-warning' : ''}`} /></span>
      </div>
      <Card.Body>
        <div className="mono-sm text-muted mb-1" style={{ fontSize: '.55rem' }}>{p.sku} · {p.fitment}</div>
        <Card.Title className="fs-6 fw-bold mb-2"><Link className="product-title-link" to={`/products/${p.product_id}`}>{p.name}</Link></Card.Title>
        <div className="d-flex justify-content-between align-items-center">
          <b>₱{p.price.toLocaleString()}</b>
          <div className="d-flex align-items-center gap-2">
            <Button as={Link} to={`/products/${p.product_id}`} size="sm" variant="outline-dark" aria-label={`View ${p.name}`}><i className="bi bi-arrow-up-right" /></Button>
            <Button size="sm" variant="dark" disabled={p.stock_qty === 0} onClick={() => add(p)}>+ Add</Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}