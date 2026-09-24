import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartDrawer from '../components/store/CartDrawer';

export default function StoreLayout() {
  const { count, setOpen } = useCart();
  return (
    <>
      <Navbar expand="md" className="store-nav border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
            <span className="logo-tile"><i className="bi bi-lightning-charge-fill" /></span>
            <span>
              <b className="display-cond fs-5 d-block">AutoFix Hub</b>
              <span className="mono-sm text-muted d-block" style={{ fontSize: '.5rem' }}>Parts / Direct</span>
            </span>
          </Navbar.Brand>
          <div className="d-flex align-items-center gap-2 order-md-3">
            <Button variant="dark" size="sm" onClick={() => setOpen(true)}>
              <i className="bi bi-bag" /> Cart {count > 0 && <Badge bg="primary">{count}</Badge>}
            </Button>
            <Navbar.Toggle />
          </div>
          <Navbar.Collapse>
            <Nav className="mx-auto gap-md-5">
              <Nav.Link as={NavLink} to="/">Shop Parts</Nav.Link>
              <Nav.Link as={NavLink} to="/track">Track an Order</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
      <CartDrawer />
    </>
  );
}