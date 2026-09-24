import { useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import Hero from '../../components/store/Hero';
import ProductCard from '../../components/store/ProductCard';

const PRODUCTS = [
  { product_id:1, sku:'AF-BRK-430', name:'Apex Ceramic Brake Kit',      category:'Brake Systems',  fitment:'BMW M3 / G80',        price:488,  stock_qty:24, low_stock_threshold:10, accent_color:'#3F1617' },
  { product_id:2, sku:'AF-SUS-118', name:'Trackline Coilover Set',      category:'Suspension',     fitment:'Toyota GR86 / 2022+', price:1240, stock_qty:8,  low_stock_threshold:10, accent_color:'#3C2C1A' },
  { product_id:3, sku:'AF-ENG-052', name:'Titanium Oil Cooler',         category:'Engine',         fitment:'Universal / 10-row',  price:296,  stock_qty:42, low_stock_threshold:10, accent_color:'#173446' },
  { product_id:4, sku:'AF-ELC-083', name:'Pulse LED Light Bar',         category:'Electrical',     fitment:'Universal / 22in',    price:184,  stock_qty:5,  low_stock_threshold:10, accent_color:'#351D41' },
  { product_id:5, sku:'AF-WKS-301', name:'TorqueMaster Digital Wrench', category:'Workshop Tools', fitment:'1/2in drive / 20-200Nm', price:329, stock_qty:17, low_stock_threshold:10, accent_color:'#163C2C' },
  { product_id:6, sku:'AF-BRK-011', name:'Pro Race Brake Fluid',        category:'Brake Systems',  fitment:'DOT 4 / 500ml',       price:34,   stock_qty:61, low_stock_threshold:10, accent_color:'#3F1617' },
];
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