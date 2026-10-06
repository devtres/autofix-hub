import { useEffect, useState } from 'react';
import { Button, Modal, Row, Col, Form, Badge, Spinner } from 'react-bootstrap';
import http from '../../api/http';
import { useVehicle } from '../../context/VehicleContext';

const PRESETS = [
  // Performance Cars
  { vehicle_type: 'Car', make: 'Honda', model: 'Civic Type R', year: 2023, displacement: '2.0L Turbo', label: '2023 Civic Type R' },
  { vehicle_type: 'Car', make: 'Toyota', model: 'GR86', year: 2022, displacement: '2.4L', label: '2022 Toyota GR86' },
  { vehicle_type: 'Car', make: 'Subaru', model: 'WRX STI', year: 2021, displacement: '2.5L Turbo', label: '2021 Subaru WRX STI' },
  { vehicle_type: 'Car', make: 'Nissan', model: 'GT-R (R35)', year: 2022, displacement: '3.8L Twin-Turbo', label: '2022 Nissan GT-R' },
  { vehicle_type: 'Car', make: 'BMW', model: 'M3', year: 2023, displacement: '3.0L', label: '2023 BMW M3' },
  { vehicle_type: 'Car', make: 'Mazda', model: 'MX-5 Miata (ND)', year: 2022, displacement: '2.0L', label: '2022 Mazda MX-5' },
  { vehicle_type: 'Car', make: 'Toyota', model: 'Supra', year: 1998, displacement: '3.0L Twin-Turbo', label: '1998 Toyota Supra' },
  // Performance Motorcycles
  { vehicle_type: 'Motorcycle', make: 'Kawasaki', model: 'Ninja 400', year: 2023, displacement: '399cc', label: '2023 Ninja 400' },
  { vehicle_type: 'Motorcycle', make: 'Yamaha', model: 'Aerox 155', year: 2022, displacement: '155cc', label: '2022 Aerox 155' },
  { vehicle_type: 'Motorcycle', make: 'Honda', model: 'Click 160', year: 2023, displacement: '160cc', label: '2023 Click 160' },
  { vehicle_type: 'Motorcycle', make: 'Yamaha', model: 'NMAX 155', year: 2022, displacement: '155cc', label: '2022 NMAX 155' },
];

export default function VehicleSelector() {
  const { selectedVehicle, setVehicle, clearVehicle } = useVehicle();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catalogVehicles, setCatalogVehicles] = useState([]);

  // Form states
  const [vType, setVType] = useState('Car');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');

  // Load distinct vehicles from API
  useEffect(() => {
    if (showModal) {
      setLoading(true);
      http
        .get('/catalog/vehicles')
        .then((res) => {
          setCatalogVehicles(res.data || []);
        })
        .catch((err) => {
          console.warn('Could not load vehicles from API, using fallback presets:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [showModal]);

  // Filter makes by classification
  const availableMakes = Array.from(
    new Set(
      catalogVehicles
        .filter((v) => (v.vehicle_type || '').toLowerCase() === vType.toLowerCase())
        .map((v) => v.make)
    )
  ).sort((a, b) => a.localeCompare(b));

  // Filter models by make
  const availableModels = Array.from(
    new Set(
      catalogVehicles
        .filter(
          (v) =>
            (v.vehicle_type || '').toLowerCase() === vType.toLowerCase() &&
            v.make.toLowerCase() === (make || '').toLowerCase()
        )
        .map((v) => v.model)
    )
  ).sort((a, b) => a.localeCompare(b));

  // Available year range for chosen model
  const matchedVehicle = catalogVehicles.find(
    (v) =>
      (v.vehicle_type || '').toLowerCase() === vType.toLowerCase() &&
      v.make.toLowerCase() === (make || '').toLowerCase() &&
      v.model.toLowerCase() === (model || '').toLowerCase()
  );

  const availableYears = matchedVehicle
    ? Array.from(
        { length: (matchedVehicle.year_end || 2026) - (matchedVehicle.year_start || 2020) + 1 },
        (_, i) => (matchedVehicle.year_end || 2026) - i
      )
    : [2026, 2025, 2024, 2023, 2022, 2021];

  const handleApplyPreset = (preset) => {
    setVehicle(preset);
    setShowModal(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!make || !model) return;
    setVehicle({
      vehicle_type: vType,
      make,
      model,
      year: year ? Number(year) : (matchedVehicle?.year_start || 2022),
      displacement: matchedVehicle?.engine_displacement || '',
    });
    setShowModal(false);
  };

  return (
    <>
      {/* Trigger Button */}
      {selectedVehicle ? (
        <div className="d-flex align-items-center">
          <Button
            variant="dark"
            className="rounded-pill px-3 py-2 d-flex align-items-center gap-2 border border-success"
            onClick={() => setShowModal(true)}
            title="Change selected vehicle"
          >
            <span className="dot" style={{ background: '#1F9D6B' }} />
            <span className="mono-sm text-white fw-bold">
              {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
            </span>
            <span
              className="ms-2 opacity-75 hover-opacity-100"
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                clearVehicle();
              }}
              title="Clear selected vehicle"
            >
              <i className="bi bi-x-circle-fill" />
            </span>
          </Button>
        </div>
      ) : (
        <Button
          variant="outline-dark"
          className="rounded-pill px-3 py-2 d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-car-front text-muted" />
          <span className="mono-sm">Select your vehicle</span>
        </Button>
      )}

      {/* Vehicle Selection Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <div>
              <p className="eyebrow mb-1">Catalog Compatibility</p>
              <Modal.Title className="display-cond fs-3 mb-0">Select Your Vehicle</Modal.Title>
            </div>
          </Modal.Header>

          <Modal.Body className="p-4">
            <p className="small text-muted mb-3">
              Filter performance parts and verify exact mechanical fitment before purchasing.
            </p>

            {/* Quick Demo Presets */}
            <div className="mb-4">
              <span className="mono-sm text-muted d-block mb-2">⚡ Quick Select Vehicle:</span>
              <div className="d-flex flex-wrap gap-1">
                {PRESETS.map((p) => (
                  <Badge
                    key={p.label}
                    bg="light"
                    text="dark"
                    className="border p-2 cursor-pointer font-monospace"
                    role="button"
                    onClick={() => handleApplyPreset(p)}
                  >
                    <i className="bi bi-lightning-charge-fill text-warning me-1" />
                    {p.label}
                  </Badge>
                ))}
              </div>
            </div>

            <hr className="my-3 opacity-25" />

            {/* Step-by-step picker */}
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" />
                <p className="mono-sm text-muted mt-2">Loading available vehicles...</p>
              </div>
            ) : (
              <Row className="g-3">
                <Col xs={12}>
                  <Form.Label className="mono-sm">1. Classification</Form.Label>
                  <div className="d-flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={vType === 'Car' ? 'dark' : 'outline-dark'}
                      className="rounded-pill px-3 w-50"
                      onClick={() => {
                        setVType('Car');
                        setMake('');
                        setModel('');
                      }}
                    >
                      <i className="bi bi-car-front me-2" /> Passenger Car
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={vType === 'Motorcycle' ? 'dark' : 'outline-dark'}
                      className="rounded-pill px-3 w-50"
                      onClick={() => {
                        setVType('Motorcycle');
                        setMake('');
                        setModel('');
                      }}
                    >
                      <i className="bi bi-bicycle me-2" /> Motorcycle
                    </Button>
                  </div>
                </Col>

                <Col md={6}>
                  <Form.Label className="mono-sm">2. Make / Brand</Form.Label>
                  <Form.Select
                    value={make}
                    onChange={(e) => {
                      setMake(e.target.value);
                      setModel('');
                    }}
                    required
                  >
                    <option value="">Select make...</option>
                    {availableMakes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Label className="mono-sm">3. Model</Form.Label>
                  <Form.Select
                    value={model}
                    onChange={(e) => {
                      setModel(e.target.value);
                    }}
                    disabled={!make}
                    required
                  >
                    <option value="">Select model...</option>
                    {availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Form.Select>
                  {matchedVehicle && (
                    <div className="small text-muted d-flex align-items-center gap-2 mt-2">
                      <span className="badge bg-dark border border-secondary text-white-50 mono-sm">
                        {matchedVehicle.engine_displacement || 'Standard Engine'}
                      </span>
                      <span>Years: {matchedVehicle.year_start}–{matchedVehicle.year_end}</span>
                    </div>
                  )}
                </Col>

                <Col md={12}>
                  <Form.Label className="mono-sm">4. Model Year</Form.Label>
                  <Form.Select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    disabled={!model}
                  >
                    <option value="">Select year (optional)...</option>
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            )}
          </Modal.Body>

          <Modal.Footer>
            {selectedVehicle && (
              <Button
                variant="outline-danger"
                size="sm"
                className="me-auto"
                onClick={() => {
                  clearVehicle();
                  setShowModal(false);
                }}
              >
                Clear Vehicle
              </Button>
            )}
            <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="dark" type="submit" disabled={!make || !model}>
              Apply Vehicle Filter
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
