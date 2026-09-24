import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero">
      <span className="streak streak-red" /><span className="streak streak-gold" />
      <Container className="position-relative">
        <Row className="align-items-center g-5">
          <Col lg={7}>
            <p className="eyebrow eyebrow-light"><span className="dot" />Built for the way you drive</p>
            <h1 className="display-cond hero-title">Make your<br /><span>Next move.</span></h1>
            <p className="lead-muted">Performance-grade parts, clear fitment, and delivery you can count on. Get your car back on the road with AutoFix.</p>
            <div className="d-flex flex-wrap gap-2">
              <Button as={Link} to="/" variant="primary">Shop the collection <i className="bi bi-chevron-right" /></Button>
              <Button as={Link} to="/track" variant="outline-light">Track my order</Button>
            </div>
          </Col>
          <Col lg={5} className="d-none d-md-block">
            <div className="hero-badge">
              <span className="ring" /><span className="ring r2" />
              <div className="tile display-cond">AFH</div>
              <div className="float">
                <div className="mono-sm text-secondary" style={{ fontSize: '.5rem' }}>Average dispatch</div>
                <b>Under 24 hrs</b>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}