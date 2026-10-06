import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Alert, Placeholder, Button } from 'react-bootstrap';
import Hero from '../../components/store/Hero';
import ProductCard from '../../components/store/ProductCard';
import VehicleSelector from '../../components/store/VehicleSelector';
import { useVehicle } from '../../context/VehicleContext';
import { fetchProducts } from '../../api/products';

const CATEGORIES = ['All parts', 'Brake Systems', 'Suspension', 'Engine', 'Electrical', 'Workshop Tools'];
const FEATURES = [
  { icon: 'bi-shield-check', title: 'Fitment checked', sub: 'Buy with confidence' },
  { icon: 'bi-truck',        title: 'Fast dispatch',   sub: 'Most orders ship same day' },
  { icon: 'bi-clock',        title: 'Real human help', sub: 'Support from enthusiasts' },
];

export default function Home() {
  const { selectedVehicle, clearVehicle, onlyCompatible, setOnlyCompatible, checkFit } = useVehicle();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cat, setCat] = useState('All parts');
  const [q, setQ] = useState('');

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError('Could not load products. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  const list = products.filter((p) => {
    const matchCat = cat === 'All parts' || p.category === cat;
    const matchText = `${p.name} ${p.sku} ${p.fitment}`.toLowerCase().includes(q.toLowerCase());
    if (!matchCat || !matchText) return false;
    if (selectedVehicle && onlyCompatible) {
      const fit = checkFit(p);
      return fit.fits;
    }
    return true;
  });

  return (
    <>
      <Hero />
      <section className="feature-strip">
        <Container>
          <Row xs={1} md={3} className="g-3">
            {FEATURES.map((f) => (
              <Col key={f.title} className="d-flex align-items-center gap-2">
                <span className="feature-icon"><i className={`bi ${f.icon}`} /></span>
                <div><b className="d-block small">{f.title}</b><span className="small text-muted">{f.sub}</span></div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        <Row className="align-items-end g-3 mb-3">
          <Col md>
            <p className="eyebrow mb-1">
              The current drop / {String(list.length).padStart(2, '0')} products
              {selectedVehicle && onlyCompatible && ' (matching vehicle)'}
            </p>
            <h2 className="display-cond display-5 mb-0">Parts with purpose.</h2>
          </Col>
          <Col md="auto" className="d-flex flex-wrap align-items-center gap-2">
            <VehicleSelector />
            <Form.Control
              className="rounded-pill search"
              placeholder="Search by part or vehicle"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </Col>
        </Row>

        {selectedVehicle && (
          <div className="vehicle-bar mb-3">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="dot" style={{ background: '#1F9D6B' }} />
              <span className="mono-sm text-uppercase text-white-50">Filtered For:</span>
              <strong className="vehicle-title text-white">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </strong>
              {selectedVehicle.displacement && (
                <span className="badge bg-dark border border-secondary text-white-50 mono-sm">
                  {selectedVehicle.displacement}
                </span>
              )}
            </div>
            <div className="d-flex align-items-center gap-3">
              <Form.Check
                type="switch"
                id="only-compatible-switch"
                label={
                  <span className="filter-toggle text-white-50">
                    Only show compatible parts
                  </span>
                }
                checked={onlyCompatible}
                onChange={(e) => setOnlyCompatible(e.target.checked)}
              />
              <button
                type="button"
                className="btn btn-link text-white-50 text-decoration-none p-0 mono-sm"
                onClick={clearVehicle}
                title="Clear vehicle filter"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="chips mb-3">
          {CATEGORIES.map((c) => (
            <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <Row xs={2} lg={3} className="g-3">
            {[...Array(6)].map((_, i) => (
              <Col key={i}>
                <div className="product-card" style={{ height: 220 }}>
                  <Placeholder as="div" animation="glow" className="h-100 w-100 d-block" />
                </div>
              </Col>
            ))}
          </Row>
        ) : list.length === 0 ? (
          <Alert variant="secondary" className="py-4 text-center">
            <p className="mb-2">No parts match your search or vehicle filter criteria.</p>
            {selectedVehicle && onlyCompatible ? (
              <Button
                variant="outline-dark"
                size="sm"
                className="rounded-pill"
                onClick={() => setOnlyCompatible(false)}
              >
                Show all parts (including non-matching)
              </Button>
            ) : (
              <span className="text-muted small">Try a different keyword or category.</span>
            )}
          </Alert>
        ) : (
          <Row xs={2} lg={3} className="g-3">
            {list.map((p) => <Col key={p.product_id}><ProductCard p={p} /></Col>)}
          </Row>
        )}
      </Container>
    </>
  );
}