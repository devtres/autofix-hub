import { useState } from 'react';
import { Nav, Offcanvas, Button } from 'react-bootstrap';
import { NavLink, Outlet, Link } from 'react-router-dom';

const WORKSPACE = [
  { to: '/admin',          label: 'Overview', icon: 'bi-grid-1x2', end: true },
  { to: '/admin/products', label: 'Products', icon: 'bi-box-seam' },
  { to: '/admin/orders',   label: 'Orders',   icon: 'bi-receipt' },
  { to: '/admin/tracking', label: 'Tracking', icon: 'bi-truck' },
];
const MANAGE = [
  { to: '/admin/suppliers', label: 'Suppliers', icon: 'bi-buildings' },
  { to: '/admin/settings',  label: 'Settings',  icon: 'bi-gear' },
];

function SidebarNav({ onNavigate }) {
  const links = (list) => list.map((l) => (
    <Nav.Link key={l.to} as={NavLink} to={l.to} end={l.end} onClick={onNavigate}>
      <i className={`bi ${l.icon}`} /> {l.label}
    </Nav.Link>
  ));
  return (
    <div className="sidebar-nav">
      <Link to="/admin" className="d-flex align-items-center gap-2 text-decoration-none text-white mb-4 px-2">
        <span className="logo-tile"><i className="bi bi-wrench-adjustable" /></span>
        <span>
          <b className="display-cond fs-5 d-block">AutoFix Hub</b>
          <span className="mono-sm text-secondary d-block" style={{ fontSize: '.5rem' }}>Hub / Ops</span>
        </span>
      </Link>
      <div className="group">Workspace</div>
      <Nav className="flex-column">{links(WORKSPACE)}</Nav>
      <div className="group">Manage</div>
      <Nav className="flex-column">{links(MANAGE)}</Nav>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="admin" data-bs-theme="dark">
      <aside className="sidebar d-none d-lg-block"><SidebarNav /></aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <Button variant="outline-light" size="sm" className="d-lg-none" onClick={() => setOpen(true)} aria-label="Open menu">
            <i className="bi bi-list" />
          </Button>
          <span>Workspace <span className="mx-1">/</span> <span className="text-white">AutoFix Hub</span></span>
        </header>
        <main className="p-3 p-md-4"><Outlet /></main>
      </div>

      <Offcanvas show={open} onHide={() => setOpen(false)} placement="start" className="admin-offcanvas">
        <Offcanvas.Header closeButton closeVariant="white" />
        <Offcanvas.Body><SidebarNav onNavigate={() => setOpen(false)} /></Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}