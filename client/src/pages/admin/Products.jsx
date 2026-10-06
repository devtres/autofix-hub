import { useEffect, useState, useMemo } from 'react';
import { Button, Form, InputGroup, Table, Spinner, Alert, Badge, Row, Col, Collapse } from 'react-bootstrap';
import { fetchProducts } from '../../api/products';
import StatusBadge from '../../components/admin/StatusBadge';
import ProductFormModal from '../../components/admin/ProductFormModal';

const CATEGORIES = ['Brake Systems', 'Suspension', 'Engine', 'Electrical', 'Workshop Tools'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const load = () => {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch(() => setError('Could not load products. Is the server running?'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setShowModal(true);
  };

  const resetFilters = () => {
    setCategoryFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
    setQ('');
  };

  // Active filters count
  const activeFiltersCount =
    (categoryFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (typeFilter !== 'all' ? 1 : 0);

  // Multi-criteria filter calculation
  const list = useMemo(() => {
    return products.filter((p) => {
      // 1. Text search
      const term = q.toLowerCase().trim();
      const matchesSearch =
        !term ||
        `${p.name} ${p.sku} ${p.fitment || ''} ${p.category} ${p.make || ''} ${p.model || ''}`
          .toLowerCase()
          .includes(term);

      // 2. Category filter
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

      // 3. Status filter
      let matchesStatus = true;
      const isOut = p.stock_qty === 0;
      const isLow = p.stock_qty > 0 && p.stock_qty <= (p.low_stock_threshold || 10);
      const isHealthy = p.stock_qty > (p.low_stock_threshold || 10);

      if (statusFilter === 'healthy') matchesStatus = isHealthy;
      else if (statusFilter === 'low') matchesStatus = isLow;
      else if (statusFilter === 'out') matchesStatus = isOut;

      // 4. Vehicle Type filter
      let matchesType = true;
      const isUniversal = !!p.is_universal || !!p.universal;
      const vType = (p.vehicle_type || '').toLowerCase();

      if (typeFilter === 'universal') matchesType = isUniversal;
      else if (typeFilter === 'car') matchesType = !isUniversal && (vType === 'car' || !vType);
      else if (typeFilter === 'motorcycle') matchesType = !isUniversal && vType === 'motorcycle';

      return matchesSearch && matchesCategory && matchesStatus && matchesType;
    });
  }, [products, q, categoryFilter, statusFilter, typeFilter]);

  return (
    <>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <p className="eyebrow mb-1">Catalog / Inventory</p>
          <h1 className="display-cond display-5 mb-1">Product Command</h1>
          <p className="text-secondary small mb-0">Manage the parts that keep your partner garages moving.</p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          <i className="bi bi-plus-lg me-1" /> Add product
        </Button>
      </div>

      <div className="panel">
        {/* Search & Filter Toolbar */}
        <div className="p-3 d-flex gap-2">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search products, SKUs, fitment, or vehicle model…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <Button variant="outline-secondary" size="sm" onClick={() => setQ('')}>
                Clear
              </Button>
            )}
          </InputGroup>
          <Button
            variant={showFilters || activeFiltersCount > 0 ? 'light' : 'outline-light'}
            className="d-flex align-items-center text-nowrap"
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
          >
            <i className="bi bi-funnel me-1" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge bg="danger" className="ms-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Collapsible Filter Console */}
        <Collapse in={showFilters}>
          <div className="border-top border-secondary border-opacity-10 p-3 bg-black bg-opacity-25">
            <Row className="g-3 align-items-end">
              <Col xs={12} sm={6} md={3}>
                <Form.Label className="mono-sm text-secondary mb-1">Category</Form.Label>
                <Form.Select
                  size="sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col xs={12} sm={6} md={3}>
                <Form.Label className="mono-sm text-secondary mb-1">Stock Status</Form.Label>
                <Form.Select
                  size="sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="healthy">Healthy Stock</option>
                  <option value="low">Low Stock (≤ 10)</option>
                  <option value="out">Out of Stock (0)</option>
                </Form.Select>
              </Col>

              <Col xs={12} sm={6} md={3}>
                <Form.Label className="mono-sm text-secondary mb-1">Compatibility Type</Form.Label>
                <Form.Select
                  size="sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Vehicle Types</option>
                  <option value="car">Passenger Cars</option>
                  <option value="motorcycle">Motorcycles</option>
                  <option value="universal">Universal Parts Only</option>
                </Form.Select>
              </Col>

              <Col xs={12} md={3} className="d-flex gap-2 justify-content-md-end">
                {activeFiltersCount > 0 && (
                  <Button variant="outline-danger" size="sm" onClick={resetFilters}>
                    <i className="bi bi-x-circle me-1" /> Reset
                  </Button>
                )}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  Done
                </Button>
              </Col>
            </Row>

            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="d-flex flex-wrap gap-1 mt-3 pt-2 border-top border-secondary border-opacity-10 align-items-center">
                <span className="mono-sm text-secondary me-2">Active:</span>
                {categoryFilter !== 'all' && (
                  <Badge
                    bg="secondary"
                    className="p-1 px-2 cursor-pointer"
                    role="button"
                    onClick={() => setCategoryFilter('all')}
                  >
                    Category: {categoryFilter} <i className="bi bi-x ms-1" />
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge
                    bg="secondary"
                    className="p-1 px-2 cursor-pointer"
                    role="button"
                    onClick={() => setStatusFilter('all')}
                  >
                    Status: {statusFilter} <i className="bi bi-x ms-1" />
                  </Badge>
                )}
                {typeFilter !== 'all' && (
                  <Badge
                    bg="secondary"
                    className="p-1 px-2 cursor-pointer"
                    role="button"
                    onClick={() => setTypeFilter('all')}
                  >
                    Type: {typeFilter} <i className="bi bi-x ms-1" />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Collapse>

        {error && <Alert variant="danger" className="mx-3 mt-3">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" />
            <p className="mono-sm text-secondary mt-2">Loading catalog...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="d-none d-md-block">
              <Table responsive hover className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.product_id} role="button" onClick={() => openEdit(p)}>
                      <td>
                        <b className="d-block small text-white">{p.name}</b>
                        <span className="mono-sm text-secondary" style={{ fontSize: '.55rem' }}>
                          {p.sku} · {p.fitment || (p.is_universal ? 'Universal' : 'General Fitment')}
                        </span>
                      </td>
                      <td className="small">{p.category}</td>
                      <td className="small text-white fw-bold">₱{p.price.toLocaleString()}</td>
                      <td className="small">{p.stock_qty}</td>
                      <td>
                        <StatusBadge stock={p.stock_qty} isLow={p.is_low_stock} />
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-secondary">
                        <i className="bi bi-box-seam fs-2 d-block mb-2 opacity-50" />
                        <h6 className="fw-bold">No products match your criteria</h6>
                        <p className="small mb-3">Try adjusting your search keywords or active filters.</p>
                        {activeFiltersCount > 0 && (
                          <Button variant="outline-light" size="sm" onClick={resetFilters}>
                            Clear all filters
                          </Button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Mobile Cards View */}
            <div className="d-md-none">
              {list.map((p) => (
                <div key={p.product_id} className="mobile-row" role="button" onClick={() => openEdit(p)}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <b className="d-block small text-white">{p.name}</b>
                      <span className="mono-sm text-secondary" style={{ fontSize: '.55rem' }}>
                        {p.sku} · {p.fitment || (p.is_universal ? 'Universal' : 'General Fitment')}
                      </span>
                    </div>
                    <StatusBadge stock={p.stock_qty} isLow={p.is_low_stock} />
                  </div>
                  <div className="d-flex justify-content-between small mt-2 text-secondary">
                    <span>{p.category}</span>
                    <span className="text-white fw-bold">
                      ₱{p.price.toLocaleString()} · Stock {p.stock_qty}
                    </span>
                  </div>
                </div>
              ))}
              {list.length === 0 && (
                <div className="p-4 text-center text-secondary">
                  <i className="bi bi-box-seam fs-3 d-block mb-2 opacity-50" />
                  <p className="small mb-2">No products match your search or filter.</p>
                  {activeFiltersCount > 0 && (
                    <Button variant="outline-light" size="sm" onClick={resetFilters}>
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ProductFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSaved={load}
        product={editing}
      />
    </>
  );
}