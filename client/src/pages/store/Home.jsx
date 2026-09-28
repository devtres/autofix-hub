import { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import Hero from '../../components/store/Hero';
import ProductCard from '../../components/store/ProductCard';
import { CATEGORIES, PRODUCTS } from '../../data/products';
const FEATURES = [
  { icon:'bi-shield-check', title:'Fitment checked', sub:'Buy with confidence' },
  { icon:'bi-truck',        title:'Fast dispatch',   sub:'Most orders ship same day' },
  { icon:'bi-clock',        title:'Real human help', sub:'Support from enthusiasts' },
];

export default function Home() {
  const [cat, setCat] = useState('All parts');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [displacement, setDisplacement] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timeout);
  }, []);

  const makes = [...new Set(PRODUCTS.filter((product) => product.type === type).map((product) => product.make))];
  const models = [...new Set(PRODUCTS.filter((product) => product.type === type && product.make === make).map((product) => product.model))];
  const years = [...new Set(PRODUCTS.filter((product) => product.type === type && product.make === make && product.model === model).flatMap((product) => product.years ?? []))].sort();
  const displacements = [...new Set(PRODUCTS.filter((product) => product.type === type && product.make === make && product.model === model && (!year || product.years.includes(year))).map((product) => product.displacement))];
  const list = PRODUCTS.filter((p) =>
    (cat === 'All parts' || p.category === cat) &&
    (!type || (type === 'Universal fit' ? p.universal : p.type === type)) &&
    (!make || p.make === make) &&
    (!model || p.model === model) &&
    (!year || p.years?.includes(year)) &&
    (!displacement || p.displacement === displacement) &&
    `${p.name} ${p.sku} ${p.fitment}`.toLowerCase().includes(q.toLowerCase()));

  function clearFilters() {
    setCat('All parts'); setQ(''); setType(''); setMake(''); setModel(''); setYear(''); setDisplacement('');
  }

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
            <p className="eyebrow mb-1">The current drop / {String(isLoading ? PRODUCTS.length : list.length).padStart(2, '0')} products</p>
            <h2 className="display-cond display-5 mb-0">Parts with purpose.</h2>
          </Col>
          <Col xl="auto">
            <div className="catalog-filters">
              <Form.Select aria-label="Vehicle type" value={type} onChange={(event) => { setType(event.target.value); setMake(''); setModel(''); setYear(''); setDisplacement(''); }}>
                <option value="">Type: Any</option><option value="Passenger car">Passenger car</option><option value="Universal fit">Universal fit</option>
              </Form.Select>
              <Form.Select aria-label="Vehicle make" value={make} disabled={!makes.length} onChange={(event) => { setMake(event.target.value); setModel(''); setYear(''); setDisplacement(''); }}>
                <option value="">Make: Any</option>{makes.map((value) => <option key={value}>{value}</option>)}
              </Form.Select>
              <Form.Select aria-label="Vehicle model" value={model} disabled={!models.length} onChange={(event) => { setModel(event.target.value); setYear(''); setDisplacement(''); }}>
                <option value="">Model: Any</option>{models.map((value) => <option key={value}>{value}</option>)}
              </Form.Select>
              <Form.Select aria-label="Vehicle year" value={year} disabled={!years.length} onChange={(event) => { setYear(event.target.value); setDisplacement(''); }}>
                <option value="">Year: Any</option>{years.map((value) => <option key={value}>{value}</option>)}
              </Form.Select>
              <Form.Select aria-label="Engine displacement" value={displacement} disabled={!displacements.length} onChange={(event) => setDisplacement(event.target.value)}>
                <option value="">Displacement: Any</option>{displacements.map((value) => <option key={value}>{value}</option>)}
              </Form.Select>
              <Form.Control className="rounded-pill search" placeholder="Search parts" aria-label="Search parts" value={q} onChange={(event) => setQ(event.target.value)} />
            </div>
          </Col>
        </Row>
        <div className="chips mb-3">
          {CATEGORIES.map((c) => (
            <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        {isLoading ? (
          <Row xs={1} sm={2} lg={3} className="g-3" aria-label="Loading products">
            {PRODUCTS.slice(0, 3).map((product) => <Col key={product.product_id}><div className="product-skeleton"><div className="skeleton-thumb" /><div className="skeleton-line skeleton-short" /><div className="skeleton-line" /><div className="skeleton-line skeleton-action" /></div></Col>)}
          </Row>
        ) : list.length ? (
          <Row xs={1} sm={2} lg={3} className="g-3">{list.map((p) => <Col key={p.product_id}><ProductCard p={p} /></Col>)}</Row>
        ) : (
          <div className="catalog-empty"><i className="bi bi-search" /><h3>No matching parts</h3><p>Try another vehicle, category, or search term.</p><Button variant="outline-dark" onClick={clearFilters}>Clear filters</Button></div>
        )}
      </Container>
    </>
  );
}