import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createApproximateRoute } from '../../utils/philippineLocations';
import { getSavedOrders } from '../../utils/orders';

const DEMO_ORDERS = [
  {
    orderNumber: 'AFH-20481',
    trackingNumber: 'AFH-PH-DEMO81',
    email: 'demo@autofixhub.ph',
    part: 'Apex Ceramic Brake Kit',
    destination: 'Makati, Metro Manila',
    status: 'In transit',
    eta: 'Today, 2:40–4:10 PM',
    carrier: 'AutoFix Express',
    delivered: false,
    center: [14.5547, 121.0244],
    route: createApproximateRoute({ center: [14.5547, 121.0244], hub: [14.5764, 121.0851] }),
    milestones: [
      { title: 'Payment confirmed', time: 'Today, 9:18 AM', complete: true },
      { title: 'Packed and labeled', time: 'Today, 10:42 AM', complete: true },
      { title: 'On the way', time: 'Today, 11:24 AM', complete: true, current: true },
      { title: 'Delivered', time: 'Estimated today', complete: false },
    ],
  },
  {
    orderNumber: 'AFH-20516',
    trackingNumber: 'AFH-PH-DEMO16',
    email: 'demo@autofixhub.ph',
    part: 'Pro Race Brake Fluid',
    destination: 'Quezon City, Metro Manila',
    status: 'Delivered',
    eta: 'Delivered today, 11:06 AM',
    carrier: 'AutoFix Express',
    delivered: true,
    center: [14.676, 121.0437],
    route: createApproximateRoute({ center: [14.676, 121.0437], hub: [14.5764, 121.0851] }),
    milestones: [
      { title: 'Payment confirmed', time: 'Yesterday, 8:12 AM', complete: true },
      { title: 'Packed and labeled', time: 'Yesterday, 12:30 PM', complete: true },
      { title: 'On the way', time: 'Today, 8:16 AM', complete: true },
      { title: 'Delivered', time: 'Today, 11:06 AM', complete: true, current: true },
    ],
  },
];

const liveIcon = L.divIcon({
  className: 'track-live-icon',
  html: '<span></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function findOrder(orderNumber, email) {
  const allOrders = [...getSavedOrders(), ...DEMO_ORDERS];
  return allOrders.find((order) => (
    order.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase() &&
    order.email.toLowerCase() === email.trim().toLowerCase()
  ));
}

function FitRoute({ route }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(route, { padding: [36, 36] });
  }, [map, route]);

  return null;
}

function interpolateRoute(route, progress) {
  const segment = Math.min(Math.floor(progress * (route.length - 1)), route.length - 2);
  const fraction = progress >= 1 ? 1 : progress * (route.length - 1) - segment;
  return [
    route[segment][0] + (route[segment + 1][0] - route[segment][0]) * fraction,
    route[segment][1] + (route[segment + 1][1] - route[segment][1]) * fraction,
  ];
}

function TrackingMap({ order, progress }) {
  const position = order.delivered
    ? order.route[order.route.length - 1]
    : order.status === 'In transit' ? interpolateRoute(order.route, progress) : order.route[0];

  return (
    <MapContainer key={order.orderNumber} center={order.center} zoom={12} scrollWheelZoom={false} className="tracking-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitRoute route={order.route} />
      <Polyline positions={order.route} pathOptions={{ color: '#E63B2F', weight: 4, opacity: 0.88, dashArray: '8 7' }} />
      <CircleMarker center={order.route[0]} radius={7} pathOptions={{ color: '#fff', weight: 3, fillColor: '#161A1B', fillOpacity: 1 }} />
      <CircleMarker center={order.route[order.route.length - 1]} radius={7} pathOptions={{ color: '#fff', weight: 3, fillColor: '#1F9D6B', fillOpacity: 1 }} />
      {!order.delivered && <Marker position={position} icon={liveIcon} />}
    </MapContainer>
  );
}

export default function TrackOrder() {
  const routeState = useLocation().state;
  const [query, setQuery] = useState(routeState?.orderNumber ?? '');
  const [email, setEmail] = useState(routeState?.email ?? '');
  const [order, setOrder] = useState(() => routeState?.orderNumber ? findOrder(routeState.orderNumber, routeState.email) : null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0.38);

  useEffect(() => {
    if (!order || order.status !== 'In transit') return undefined;
    let direction = 1;
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 0.92) direction = -1;
        if (value <= 0.16) direction = 1;
        return value + 0.006 * direction;
      });
    }, 1200);
    return () => window.clearInterval(timer);
  }, [order]);

  function findOrderByDetails(event) {
    event.preventDefault();
    const match = findOrder(query, email);
    if (!match) {
      setOrder(null);
      setError('We could not find an order with that number and email. Check both details and try again.');
      return;
    }
    setOrder(match);
    setProgress(0.38);
    setQuery(match.orderNumber);
    setEmail(match.email);
    setError('');
  }

  function selectDemo(demoOrder) {
    setQuery(demoOrder.orderNumber);
    setEmail(demoOrder.email);
    setOrder(demoOrder);
    setProgress(0.38);
    setError('');
  }

  const partName = order?.part ?? order?.items.map((item) => `${item.qty} × ${item.name}`).join(', ');

  return (
    <main className="tracking-page">
      <Container className="py-5">
        <Row className="align-items-end g-4 tracking-heading">
          <Col lg>
            <p className="eyebrow mb-2">Logistics / Order lookup</p>
            <h1 className="display-cond tracking-title mb-2">Track a part.</h1>
            <p className="text-muted mb-0">Enter your order number and checkout email to see delivery progress in the Philippines.</p>
          </Col>
          <Col lg={5}>
            <Form onSubmit={findOrderByDetails}>
              <Row className="g-2">
                <Col sm={6}><Form.Label htmlFor="tracking-number" className="mono-sm mb-2">Order number</Form.Label><Form.Control id="tracking-number" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="AFH-XXXXXXXX" required /></Col>
                <Col sm={6}><Form.Label htmlFor="tracking-email" className="mono-sm mb-2">Checkout email</Form.Label><Form.Control type="email" id="tracking-email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></Col>
                <Col xs={12}><Button type="submit" variant="dark" className="tracking-submit"><i className="bi bi-search" /> Find order</Button></Col>
              </Row>
              {error && <div className="tracking-error" role="alert">{error}</div>}
              <div className="tracking-samples mono-sm">Try a demo:
                {DEMO_ORDERS.map((demoOrder) => <button key={demoOrder.orderNumber} type="button" onClick={() => selectDemo(demoOrder)}>{demoOrder.orderNumber}</button>)}
              </div>
            </Form>
          </Col>
        </Row>

        {order ? (
          <section className="tracking-result" aria-live="polite">
            <div className="tracking-orderbar">
              <div>
                <span className="mono-sm text-muted">{order.orderNumber} / {order.trackingNumber}</span>
                <h2>{partName}</h2>
              </div>
              <div className={`tracking-status ${order.delivered ? 'is-delivered' : ''}`}><span className="tracking-status-dot" />{order.status}</div>
            </div>

            <Row className="g-0 tracking-content">
              <Col lg={8} className="tracking-map-column">
                <div className="tracking-map-frame">
                  <TrackingMap order={order} progress={progress} />
                  <div className="map-demo-label"><span className="tracking-status-dot" />{order.delivered ? 'ROUTE COMPLETE' : 'APPROXIMATE ROUTE / DEMO LOCATION'}</div>
                  <div className="map-destination"><i className="bi bi-geo-alt-fill" /> {order.destination}</div>
                </div>
                <div className="tracking-map-foot mono-sm">
                  <span><i className="bi bi-box-seam" /> {order.trackingNumber}</span>
                  <span><i className="bi bi-clock" /> {order.delivered ? 'Delivery complete' : 'Preview location updates automatically'}</span>
                  <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
                </div>
              </Col>

              <Col lg={4}>
                <aside className="tracking-details">
                  <div className="tracking-eta">
                    <span className="mono-sm">{order.delivered ? 'Delivery status' : 'Estimated arrival'}</span>
                    <strong>{order.eta}</strong>
                    <span className="tracking-demo-note">Approximate route preview. Carrier GPS is not connected.</span>
                  </div>
                  <div className="tracking-timeline">
                    <h3 className="mono-sm">Shipment progress</h3>
                    {order.milestones.map((milestone, index) => (
                      <div className={`tracking-milestone ${milestone.complete ? 'is-complete' : ''} ${milestone.current ? 'is-current' : ''}`} key={`${milestone.title}-${index}`}>
                        <span className="milestone-mark">{milestone.complete && <i className={`bi ${milestone.current && order.delivered ? 'bi-check-lg' : 'bi-check'}`} />}</span>
                        <div><strong>{milestone.title}</strong><span>{milestone.time}</span></div>
                        {index < order.milestones.length - 1 && <span className="milestone-line" />}
                      </div>
                    ))}
                  </div>
                  <div className="tracking-address">
                    <span className="mono-sm">Delivering to</span>
                    <strong><i className="bi bi-geo-alt" /> {order.customer ? `${order.customer.fullName} · ` : ''}{order.destination}</strong>
                  </div>
                </aside>
              </Col>
            </Row>
          </section>
        ) : (
          <section className="tracking-empty"><i className="bi bi-map" /><h2>Ready when your parts are.</h2><p>Enter the order number and email used at checkout. New orders are saved in this browser.</p><span className="mono-sm">Delivery coverage: Manila · Quezon City · Makati · Cebu · Davao</span></section>
        )}
      </Container>
    </main>
  );
}