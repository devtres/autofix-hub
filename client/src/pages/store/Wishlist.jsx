import { Button, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/store/ProductCard';
import { useCart } from '../../context/CartContext';

export default function Wishlist() {
  const { wishlist } = useCart();
  return (
    <main className="wishlist-page">
      <Container className="py-4 py-md-5">
        <p className="eyebrow mb-2">Your garage / Saved parts</p>
        <h1 className="display-cond wishlist-title">Wishlist.</h1>
        {wishlist.length ? (
          <Row xs={1} sm={2} lg={3} className="g-3 mt-2">{wishlist.map((product) => <Col key={product.product_id}><ProductCard p={product} /></Col>)}</Row>
        ) : (
          <div className="catalog-empty wishlist-empty"><i className="bi bi-heart" /><h2>No saved parts yet</h2><p>Tap the heart on a part to keep it here for later.</p><Button as={Link} to="/" variant="dark">Browse parts</Button></div>
        )}
      </Container>
    </main>
  );
}