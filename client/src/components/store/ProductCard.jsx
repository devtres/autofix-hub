import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useVehicle } from '../../context/VehicleContext';

export default function ProductCard({ p }) {
  const { add, wishlist, toggleWishlist } = useCart();
  const { selectedVehicle, checkFit } = useVehicle();
  const low = p.is_low_stock;
  const saved = wishlist.some((item) => item.product_id === p.product_id);
  const fit = checkFit(p);

  return (
    <Card
      className={`product-card ${selectedVehicle && !fit.fits ? 'is-incompatible' : ''}`}
      style={{ '--accent': p.accent_color }}
    >
      <div className="thumb">
        <span className="mono-sm cat">{p.category}</span>
        {low && <span className="low-tag">Low stock</span>}

        {/* Fitment Status Tag */}
        {selectedVehicle ? (
          fit.isUniversal ? (
            <span className="fit-tag universal" title="Universal part fits all vehicles">
              <i className="bi bi-asterisk" /> Universal
            </span>
          ) : fit.fits ? (
            <span className="fit-tag fits" title={fit.label}>
              <i className="bi bi-check-circle-fill" /> Fits Your Vehicle
            </span>
          ) : (
            <span className="fit-tag no-fit" title={fit.label}>
              <i className="bi bi-x-circle-fill" /> Does Not Fit
            </span>
          )
        ) : p.is_universal ? (
          <span className="fit-tag universal">
            <i className="bi bi-asterisk" /> Universal
          </span>
        ) : null}

        <button
          className={`heart ${saved ? 'is-saved' : ''}`}
          aria-label={saved ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
          aria-pressed={saved}
          onClick={() => toggleWishlist(p)}
        >
          <i className={`bi ${saved ? 'bi-heart-fill' : 'bi-heart'}`} />
        </button>
        <span className="box-tile">
          <i className={`bi bi-box-seam ${low ? 'text-warning' : ''}`} />
        </span>
      </div>
      <Card.Body>
        <div className="mono-sm text-muted mb-1" style={{ fontSize: '.55rem' }}>
          {p.sku} · {p.fitment}
        </div>
        <Card.Title className="fs-6 fw-bold mb-2">
          <Link className="product-title-link" to={`/products/${p.product_id}`}>
            {p.name}
          </Link>
        </Card.Title>
        <div className="d-flex justify-content-between align-items-center">
          <b>₱{p.price.toLocaleString()}</b>
          <div className="d-flex align-items-center gap-2">
            <Button
              as={Link}
              to={`/products/${p.product_id}`}
              size="sm"
              variant="outline-dark"
              aria-label={`View ${p.name}`}
            >
              <i className="bi bi-arrow-up-right" />
            </Button>
            <Button size="sm" variant="dark" disabled={p.stock_qty === 0} onClick={() => add(p)}>
              + Add
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}