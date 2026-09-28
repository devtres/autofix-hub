import { Button, Col, Container, Row } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../../components/store/ProductCard';
import { useCart } from '../../context/CartContext';
import { PRODUCTS } from '../../data/products';

export default function ProductDetail() {
  const { productId } = useParams();
  const { add } = useCart();
  const product = PRODUCTS.find((item) => item.product_id === Number(productId));
  const related = product ? PRODUCTS.filter((item) => item.category === product.category && item.product_id !== product.product_id).slice(0, 2) : [];

  if (!product) {
    return <main className="detail-page"><Container className="py-5"><div className="catalog-empty"><i className="bi bi-box-seam" /><h1>Part not found</h1><p>This item may no longer be in the catalog.</p><Button as={Link} to="/" variant="dark">Browse parts</Button></div></Container></main>;
  }

  return (
    <main className="detail-page">
      <Container className="py-4 py-md-5">
        <p className="eyebrow"><Link to="/">Shop parts</Link> / {product.category}</p>
        <Row className="g-4 g-lg-5 align-items-start detail-layout">
          <Col lg={6}><div className="detail-visual" style={{ '--accent': product.accent_color }}><span className="mono-sm">{product.category}</span><i className="bi bi-box-seam" /><span className="detail-sku mono-sm">{product.sku}</span></div></Col>
          <Col lg={6}>
            <div className="detail-copy">
              <p className="mono-sm text-muted mb-2">{product.sku} · {product.fitment}</p>
              <h1 className="display-cond">{product.name}</h1>
              <p className="detail-description">{product.description}</p>
              <div className="detail-price">₱{product.price.toLocaleString()}</div>
              <p className="detail-stock"><span className="tracking-status-dot" /> {product.stock_qty > 0 ? `${product.stock_qty} available` : 'Out of stock'}</p>
              <div className="detail-fitment">
                <h2>Compatibility</h2><p>{product.fitment}</p>
                {product.type && <dl><div><dt>Type</dt><dd>{product.type}</dd></div><div><dt>Make</dt><dd>{product.make}</dd></div><div><dt>Model</dt><dd>{product.model}</dd></div><div><dt>Years</dt><dd>{product.years.join(', ')}</dd></div><div><dt>Displacement</dt><dd>{product.displacement}</dd></div></dl>}
                {product.universal && <p className="mb-0">Universal fit. Check dimensions and installation requirements before purchase.</p>}
              </div>
              <div className="detail-actions"><Button variant="dark" disabled={!product.stock_qty} onClick={() => add(product)}><i className="bi bi-bag-plus" /> Add to garage</Button><Link to="/" className="detail-back">Back to parts</Link></div>
            </div>
          </Col>
        </Row>
        {related.length > 0 && <section className="detail-related"><p className="eyebrow">Keep it in the same system</p><h2 className="display-cond">Related parts</h2><Row xs={1} sm={2} className="g-3 mt-1">{related.map((item) => <Col key={item.product_id}><ProductCard p={item} /></Col>)}</Row></section>}
      </Container>
    </main>
  );
}