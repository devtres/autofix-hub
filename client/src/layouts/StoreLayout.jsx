import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useCart } from '../context/CartContext';
import { useRole } from '../auth/useRole';
import CartDrawer from '../components/store/CartDrawer';

export default function StoreLayout() {
  const { count, setOpen, wishlist } = useCart();
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
  const { role } = useRole();

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
            {isAuthenticated ? (
              <Button
                variant="outline-dark"
                size="sm"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                {user?.name?.split(' ')[0] || 'Account'} · Sign out
              </Button>
            ) : (
              <Button variant="outline-dark" size="sm" onClick={() => loginWithRedirect()}>
                Sign in
              </Button>
            )}
            <Button variant="dark" size="sm" onClick={() => setOpen(true)}>
              <i className="bi bi-bag" /> Cart {count > 0 && <Badge bg="primary">{count}</Badge>}
            </Button>
            <Navbar.Toggle />
          </div>
          <Navbar.Collapse>
            <Nav className="mx-auto gap-md-5">
              <Nav.Link as={NavLink} to="/">Shop Parts</Nav.Link>
              <Nav.Link as={NavLink} to="/wishlist">Wishlist{wishlist.length > 0 && ` (${wishlist.length})`}</Nav.Link>
              <Nav.Link as={NavLink} to="/track">Track an Order</Nav.Link>
              <Nav.Link as={NavLink} to="/orders">My Orders</Nav.Link>
              {role === 'admin' && <Nav.Link as={Link} to="/admin/products">Admin</Nav.Link>}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
      <CartDrawer />
    </>
  );
}