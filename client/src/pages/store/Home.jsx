import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Alert, Placeholder } from 'react-bootstrap';
import Hero from '../../components/store/Hero';
import ProductCard from '../../components/store/ProductCard';
import { fetchProducts } from '../../api/products';

const CATEGORIES = ['All parts', 'Brake Systems', 'Suspension', 'Engine', 'Electrical', 'Workshop Tools'];
const FEATURES = [
  { icon: 'bi-shield-check', title: 'Fitment checked', sub: 'Buy with confidence' },
  { icon: 'bi-truck',        title: 'Fast dispatch',   sub: 'Most orders ship same day' },
  { icon: 'bi-clock',        title: 'Real human help', sub: 'Support from enthusiasts' },
];

export default function Home() {
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

  const list = products.filter((p) =>
    (cat === 'All parts' || p.category === cat) &&
    `${p.name} ${p.sku} ${p.fitment}`.toLowerCase().includes(q.toLowerCase()));

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
            <p className="eyebrow mb-1">The current drop / {String(list.length).padStart(2, '0')} products</p>
            <h2 className="display-cond display-5 mb-0">Parts with purpose.</h2>
          </Col>
          <Col md="auto">
            <Form.Control className="rounded-pill search" placeholder="Search by part or vehicle"
              value={q} onChange={(e) => setQ(e.target.value)} />
          </Col>
        </Row>

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
          <Alert variant="secondary">No parts match your search. Try a different keyword or category.</Alert>
        ) : (
          <Row xs={2} lg={3} className="g-3">
            {list.map((p) => <Col key={p.product_id}><ProductCard p={p} /></Col>)}
          </Row>
        )}
      </Container>
    </>
  );
}