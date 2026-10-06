import { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../../components/store/ProductCard';
import { useCart } from '../../context/CartContext';
import { useVehicle } from '../../context/VehicleContext';
import { PRODUCTS } from '../../data/products';
import { fetchProductById, fetchProducts } from '../../api/products';

export default function ProductDetail() {
  const { productId } = useParams();
  const { add } = useCart();
  const { selectedVehicle, checkFit } = useVehicle();
  const [product, setProduct] = useState(() => {
    const staticMatch = PRODUCTS.find((item) => item.product_id === Number(productId));
    return staticMatch || null;
  });
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(!product);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    fetchProductById(productId)
      .then((dbProduct) => {
        if (cancelled) return;
        const staticMatch = PRODUCTS.find((p) => p.product_id === dbProduct.product_id);
        const merged = {
          ...staticMatch,
          ...dbProduct,
          description: dbProduct.description || staticMatch?.description || `${dbProduct.name} is a high-grade performance part engineered for durability and precise fitment.`,
          type: dbProduct.type || (dbProduct.vehicle_type === 'Car' ? 'Passenger car' : dbProduct.vehicle_type) || staticMatch?.type || (dbProduct.universal ? null : 'Passenger car'),
          make: dbProduct.make || staticMatch?.make,
          model: dbProduct.model || staticMatch?.model || dbProduct.fitment,
          years: dbProduct.years || (dbProduct.year_start ? (dbProduct.year_end && dbProduct.year_end >= dbProduct.year_start ? Array.from({ length: dbProduct.year_end - dbProduct.year_start + 1 }, (_, i) => String(dbProduct.year_start + i)) : [String(dbProduct.year_start)]) : staticMatch?.years) || [],
          displacement: dbProduct.displacement || staticMatch?.displacement || 'Standard',
          universal: dbProduct.universal ?? dbProduct.is_universal ?? staticMatch?.universal ?? false,
        };
        setProduct(merged);
        setLoading(false);

        fetchProducts()
          .then((all) => {
            if (cancelled) return;
            const rel = all.filter((item) => item.category === merged.category && item.product_id !== merged.product_id).slice(0, 2);
            setRelated(rel);
          })
          .catch(() => {});
      })
      .catch(() => {
        if (cancelled) return;
        const staticMatch = PRODUCTS.find((item) => item.product_id === Number(productId));
        if (staticMatch) {
          setProduct(staticMatch);
          setRelated(PRODUCTS.filter((item) => item.category === staticMatch.category && item.product_id !== staticMatch.product_id).slice(0, 2));
          setLoading(false);
        } else {
          setNotFound(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [productId]);

  if (loading && !product) {
    return (
      <main className="detail-page">
        <Container className="py-5 text-center">
          <Spinner animation="border" className="mb-3" />
          <p className="text-muted">Loading part specifications...</p>
        </Container>
      </main>
    );
  }

  if (notFound || !product) {
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
                <h2>Compatibility</h2>
                {selectedVehicle && (
                  <div
                    className={`p-2 px-3 rounded-3 mb-3 d-flex align-items-center gap-2 small ${
                      fit.fits
                        ? 'bg-success bg-opacity-10 text-success border border-success'
                        : 'bg-danger bg-opacity-10 text-danger border border-danger'
                    }`}
                  >
                    <i className={`bi ${fit.fits ? 'bi-check-circle-fill' : 'bi-exclamation-octagon-fill'} fs-6`} />
                    <div>
                      <strong>{fit.fits ? (fit.isUniversal ? 'Universal Fit' : 'Guaranteed Fit') : 'Does Not Fit'}</strong>
                      <span className="ms-1">
                        for your {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                        {fit.label && !fit.fits ? ` (${fit.label})` : ''}
                      </span>
                    </div>
                  </div>
                )}
                <p>{product.fitment || (product.universal ? 'Universal Fitment' : `${product.make || ''} ${product.model || ''}`)}</p>
                {(!product.universal && (product.make || product.model || product.type)) && (
                  <dl>
                    <div><dt>Type</dt><dd>{product.type || 'Passenger car'}</dd></div>
                    {product.make && <div><dt>Make</dt><dd>{product.make}</dd></div>}
                    {product.model && <div><dt>Model</dt><dd>{product.model}</dd></div>}
                    {product.years && product.years.length > 0 && <div><dt>Years</dt><dd>{product.years.join(', ')}</dd></div>}
                    {product.displacement && <div><dt>Displacement</dt><dd>{product.displacement}</dd></div>}
                  </dl>
                )}
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