import { useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import Hero from '../../components/store/Hero';
import ProductCard from '../../components/store/ProductCard';

import { PRODUCTS } from '../../data/mockProducts';

const CATEGORIES = ['All parts', 'Brake Systems', 'Suspension', 'Engine', 'Electrical', 'Workshop Tools'];
const FEATURES = [
  { icon:'bi-shield-check', title:'Fitment checked', sub:'Buy with confidence' },
  { icon:'bi-truck',        title:'Fast dispatch',   sub:'Most orders ship same day' },
  { icon:'bi-clock',        title:'Real human help', sub:'Support from enthusiasts' },
];

export default function Home() {
  const [cat, setCat] = useState('All parts');
  const [q, setQ] = useState('');
  const list = PRODUCTS.filter((p) =>
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
        <Row xs={2} lg={3} className="g-3">
          {list.map((p) => <Col key={p.product_id}><ProductCard p={p} /></Col>)}
        </Row>
      </Container>
    </>
  );
}