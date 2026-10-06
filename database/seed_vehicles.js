import db from '../server/db.js';

const VEHICLES = [
  // --- CARS: TOYOTA ---
  { vehicle_type: 'Car', make: 'Toyota', model: 'GR86', year_start: 2022, year_end: 2026, engine_displacement: '2.4L Boxer' },
  { vehicle_type: 'Car', make: 'Toyota', model: 'Supra', year_start: 1993, year_end: 2002, engine_displacement: '3.0L Twin-Turbo 2JZ' },
  { vehicle_type: 'Car', make: 'Toyota', model: 'GR Supra', year_start: 2020, year_end: 2026, engine_displacement: '3.0L Turbo B58' },
  { vehicle_type: 'Car', make: 'Toyota', model: 'GR Yaris', year_start: 2021, year_end: 2026, engine_displacement: '1.6L Turbo G16E' },
  { vehicle_type: 'Car', make: 'Toyota', model: 'Corolla Altis', year_start: 2019, year_end: 2026, engine_displacement: '1.8L Dual VVT-i' },
  { vehicle_type: 'Car', make: 'Toyota', model: 'Vios', year_start: 2018, year_end: 2026, engine_displacement: '1.5L Dual VVT-i' },
  { vehicle_type: 'Car', make: 'Toyota', model: 'Fortuner', year_start: 2016, year_end: 2026, engine_displacement: '2.8L Turbo Diesel' },
  { vehicle_type: 'Car', make: 'Toyota', model: 'Hilux', year_start: 2016, year_end: 2026, engine_displacement: '2.8L Turbo Diesel' },
  { vehicle_type: 'Car', make: 'Toyota', model: 'Land Cruiser 300', year_start: 2022, year_end: 2026, engine_displacement: '3.3L Twin-Turbo' },

  // --- CARS: HONDA ---
  { vehicle_type: 'Car', make: 'Honda', model: 'Civic Type R', year_start: 2023, year_end: 2026, engine_displacement: '2.0L Turbo K20C1' },
  { vehicle_type: 'Car', make: 'Honda', model: 'Civic Type R (FK8)', year_start: 2017, year_end: 2021, engine_displacement: '2.0L Turbo K20C1' },
  { vehicle_type: 'Car', make: 'Honda', model: 'Civic', year_start: 2022, year_end: 2026, engine_displacement: '1.5L VTEC Turbo' },
  { vehicle_type: 'Car', make: 'Honda', model: 'City', year_start: 2020, year_end: 2026, engine_displacement: '1.5L DOHC i-VTEC' },
  { vehicle_type: 'Car', make: 'Honda', model: 'CR-V', year_start: 2023, year_end: 2026, engine_displacement: '1.5L Turbo' },
  { vehicle_type: 'Car', make: 'Honda', model: 'Integra Type R', year_start: 1997, year_end: 2001, engine_displacement: '1.8L B18C' },
  { vehicle_type: 'Car', make: 'Honda', model: 'S2000', year_start: 2000, year_end: 2009, engine_displacement: '2.0L F20C' },

  // --- CARS: BMW ---
  { vehicle_type: 'Car', make: 'BMW', model: 'M3', year_start: 2021, year_end: 2026, engine_displacement: '3.0L Twin-Turbo S58' },
  { vehicle_type: 'Car', make: 'BMW', model: 'M4', year_start: 2021, year_end: 2026, engine_displacement: '3.0L Twin-Turbo S58' },
  { vehicle_type: 'Car', make: 'BMW', model: 'M2', year_start: 2023, year_end: 2026, engine_displacement: '3.0L Twin-Turbo' },
  { vehicle_type: 'Car', make: 'BMW', model: '3 Series (G20)', year_start: 2019, year_end: 2026, engine_displacement: '2.0L Turbo B48' },
  { vehicle_type: 'Car', make: 'BMW', model: '5 Series (G30)', year_start: 2017, year_end: 2024, engine_displacement: '2.0L/3.0L Turbo' },

  // --- CARS: NISSAN ---
  { vehicle_type: 'Car', make: 'Nissan', model: 'GT-R (R35)', year_start: 2008, year_end: 2025, engine_displacement: '3.8L Twin-Turbo VR38DETT' },
  { vehicle_type: 'Car', make: 'Nissan', model: 'Skyline GT-R (R34)', year_start: 1999, year_end: 2002, engine_displacement: '2.6L Twin-Turbo RB26DETT' },
  { vehicle_type: 'Car', make: 'Nissan', model: '370Z', year_start: 2009, year_end: 2020, engine_displacement: '3.7L V6 VQ37VHR' },
  { vehicle_type: 'Car', make: 'Nissan', model: 'Z (RZ34)', year_start: 2023, year_end: 2026, engine_displacement: '3.0L Twin-Turbo VR30DDTT' },
  { vehicle_type: 'Car', make: 'Nissan', model: 'Silvia (S15)', year_start: 1999, year_end: 2002, engine_displacement: '2.0L Turbo SR20DET' },
  { vehicle_type: 'Car', make: 'Nissan', model: 'Navara', year_start: 2016, year_end: 2026, engine_displacement: '2.5L Turbo Diesel' },

  // --- CARS: SUBARU ---
  { vehicle_type: 'Car', make: 'Subaru', model: 'WRX STI', year_start: 2015, year_end: 2021, engine_displacement: '2.5L Turbo Boxer EJ257' },
  { vehicle_type: 'Car', make: 'Subaru', model: 'WRX', year_start: 2022, year_end: 2026, engine_displacement: '2.4L Turbo FA24' },
  { vehicle_type: 'Car', make: 'Subaru', model: 'BRZ', year_start: 2022, year_end: 2026, engine_displacement: '2.4L Boxer FA24' },
  { vehicle_type: 'Car', make: 'Subaru', model: 'Forester', year_start: 2019, year_end: 2026, engine_displacement: '2.0L/2.5L Boxer' },

  // --- CARS: MITSUBISHI ---
  { vehicle_type: 'Car', make: 'Mitsubishi', model: 'Lancer Evolution X', year_start: 2008, year_end: 2016, engine_displacement: '2.0L Turbo 4B11T' },
  { vehicle_type: 'Car', make: 'Mitsubishi', model: 'Lancer Evolution IX', year_start: 2005, year_end: 2007, engine_displacement: '2.0L Turbo 4G63' },
  { vehicle_type: 'Car', make: 'Mitsubishi', model: 'Montero Sport', year_start: 2016, year_end: 2026, engine_displacement: '2.4L MIVEC Diesel' },
  { vehicle_type: 'Car', make: 'Mitsubishi', model: 'Strada', year_start: 2016, year_end: 2026, engine_displacement: '2.4L MIVEC Diesel' },

  // --- CARS: MAZDA ---
  { vehicle_type: 'Car', make: 'Mazda', model: 'MX-5 Miata (ND)', year_start: 2016, year_end: 2026, engine_displacement: '2.0L SkyActiv-G' },
  { vehicle_type: 'Car', make: 'Mazda', model: 'Mazda 3', year_start: 2019, year_end: 2026, engine_displacement: '2.0L SkyActiv-G' },
  { vehicle_type: 'Car', make: 'Mazda', model: 'RX-7 (FD3S)', year_start: 1992, year_end: 2002, engine_displacement: '1.3L Twin-Turbo 13B-REW' },
  { vehicle_type: 'Car', make: 'Mazda', model: 'CX-5', year_start: 2018, year_end: 2026, engine_displacement: '2.5L Turbo SkyActiv' },

  // --- CARS: FORD ---
  { vehicle_type: 'Car', make: 'Ford', model: 'Mustang GT', year_start: 2018, year_end: 2024, engine_displacement: '5.0L Coyote V8' },
  { vehicle_type: 'Car', make: 'Ford', model: 'Ranger Raptor', year_start: 2023, year_end: 2026, engine_displacement: '3.0L Twin-Turbo EcoBoost' },
  { vehicle_type: 'Car', make: 'Ford', model: 'Everest', year_start: 2023, year_end: 2026, engine_displacement: '2.0L Bi-Turbo Diesel' },

  // --- CARS: PORSCHE ---
  { vehicle_type: 'Car', make: 'Porsche', model: '911 GT3 (992)', year_start: 2021, year_end: 2026, engine_displacement: '4.0L Flat-6' },
  { vehicle_type: 'Car', make: 'Porsche', model: '718 Cayman GT4', year_start: 2020, year_end: 2025, engine_displacement: '4.0L Flat-6' },

  // --- MOTORCYCLES: HONDA ---
  { vehicle_type: 'Motorcycle', make: 'Honda', model: 'Click 160', year_start: 2022, year_end: 2026, engine_displacement: '160cc eSP+' },
  { vehicle_type: 'Motorcycle', make: 'Honda', model: 'ADV 160', year_start: 2022, year_end: 2026, engine_displacement: '160cc eSP+' },
  { vehicle_type: 'Motorcycle', make: 'Honda', model: 'PCX 160', year_start: 2021, year_end: 2026, engine_displacement: '160cc eSP+' },
  { vehicle_type: 'Motorcycle', make: 'Honda', model: 'CBR650R', year_start: 2019, year_end: 2026, engine_displacement: '649cc Inline-4' },
  { vehicle_type: 'Motorcycle', make: 'Honda', model: 'CB650R', year_start: 2019, year_end: 2026, engine_displacement: '649cc Inline-4' },
  { vehicle_type: 'Motorcycle', make: 'Honda', model: 'CRF300L', year_start: 2021, year_end: 2026, engine_displacement: '286cc Single' },
  { vehicle_type: 'Motorcycle', make: 'Honda', model: 'Winner X', year_start: 2021, year_end: 2026, engine_displacement: '149cc DOHC' },

  // --- MOTORCYCLES: YAMAHA ---
  { vehicle_type: 'Motorcycle', make: 'Yamaha', model: 'NMAX 155', year_start: 2021, year_end: 2026, engine_displacement: '155cc VVA' },
  { vehicle_type: 'Motorcycle', make: 'Yamaha', model: 'Aerox 155', year_start: 2021, year_end: 2026, engine_displacement: '155cc VVA' },
  { vehicle_type: 'Motorcycle', make: 'Yamaha', model: 'XMAX 300', year_start: 2020, year_end: 2026, engine_displacement: '292cc Blue Core' },
  { vehicle_type: 'Motorcycle', make: 'Yamaha', model: 'YZF-R3', year_start: 2019, year_end: 2026, engine_displacement: '321cc Parallel-Twin' },
  { vehicle_type: 'Motorcycle', make: 'Yamaha', model: 'YZF-R7', year_start: 2022, year_end: 2026, engine_displacement: '689cc CP2 Twin' },
  { vehicle_type: 'Motorcycle', make: 'Yamaha', model: 'MT-09', year_start: 2021, year_end: 2026, engine_displacement: '890cc CP3 Triple' },
  { vehicle_type: 'Motorcycle', make: 'Yamaha', model: 'Sniper 155', year_start: 2021, year_end: 2026, engine_displacement: '155cc VVA' },

  // --- MOTORCYCLES: KAWASAKI ---
  { vehicle_type: 'Motorcycle', make: 'Kawasaki', model: 'Ninja 400', year_start: 2018, year_end: 2024, engine_displacement: '399cc Parallel-Twin' },
  { vehicle_type: 'Motorcycle', make: 'Kawasaki', model: 'ZX-4RR', year_start: 2023, year_end: 2026, engine_displacement: '399cc Inline-4' },
  { vehicle_type: 'Motorcycle', make: 'Kawasaki', model: 'ZX-6R', year_start: 2019, year_end: 2026, engine_displacement: '636cc Inline-4' },
  { vehicle_type: 'Motorcycle', make: 'Kawasaki', model: 'Z900', year_start: 2020, year_end: 2026, engine_displacement: '948cc Inline-4' },

  // --- MOTORCYCLES: SUZUKI ---
  { vehicle_type: 'Motorcycle', make: 'Suzuki', model: 'Raider R150 Fi', year_start: 2017, year_end: 2026, engine_displacement: '147cc DOHC' },
  { vehicle_type: 'Motorcycle', make: 'Suzuki', model: 'GSX-R150', year_start: 2017, year_end: 2024, engine_displacement: '147cc DOHC' },
  { vehicle_type: 'Motorcycle', make: 'Suzuki', model: 'Burgman Street 125', year_start: 2021, year_end: 2026, engine_displacement: '124cc SEP' },

  // --- MOTORCYCLES: KTM ---
  { vehicle_type: 'Motorcycle', make: 'KTM', model: 'Duke 390', year_start: 2017, year_end: 2026, engine_displacement: '373cc / 399cc Single' },
  { vehicle_type: 'Motorcycle', make: 'KTM', model: 'RC 390', year_start: 2017, year_end: 2026, engine_displacement: '373cc Single' },

  // --- MOTORCYCLES: DUCATI ---
  { vehicle_type: 'Motorcycle', make: 'Ducati', model: 'Panigale V4', year_start: 2020, year_end: 2026, engine_displacement: '1103cc Desmosedici V4' },
  { vehicle_type: 'Motorcycle', make: 'Ducati', model: 'Monster 937', year_start: 2021, year_end: 2026, engine_displacement: '937cc Testastretta' },

  // --- MOTORCYCLES: VESPA ---
  { vehicle_type: 'Motorcycle', make: 'Vespa', model: 'Sprint 150', year_start: 2020, year_end: 2026, engine_displacement: '155cc i-get' },
  { vehicle_type: 'Motorcycle', make: 'Vespa', model: 'Primavera 150', year_start: 2020, year_end: 2026, engine_displacement: '155cc i-get' },
];

// Additional high-grade parts for newly added vehicles
const NEW_PRODUCTS = [
  {
    sku: 'AF-ENG-FL5',
    name: 'K-Series High-Flow Cold Air Intake',
    description: 'Precision rotationally molded airbox and low-restriction intake tube designed for high-boost applications.',
    category: 'Engine',
    fitment_details: 'Honda Civic Type R / 2023+ 2.0L Turbo',
    price: 28500.00,
    stock: 8,
    vehicle_type: 'Car',
    make: 'Honda',
    model: 'Civic Type R',
    year_start: 2023,
    year_end: 2026,
    engine_displacement: '2.0L Turbo K20C1',
  },
  {
    sku: 'AF-SUS-STI',
    name: 'STI Heavy-Duty Anti-Roll Sway Bar Kit',
    description: '24mm front and rear solid chromoly anti-roll bars engineered to dramatically reduce body roll.',
    category: 'Suspension',
    fitment_details: 'Subaru WRX STI / 2015-2021 2.5L Turbo',
    price: 18900.00,
    stock: 6,
    vehicle_type: 'Car',
    make: 'Subaru',
    model: 'WRX STI',
    year_start: 2015,
    year_end: 2021,
    engine_displacement: '2.5L Turbo Boxer EJ257',
  },
  {
    sku: 'AF-ENG-R35',
    name: 'VR38 Cast Stainless Turbo Downpipes',
    description: 'Direct bolt-on 76mm dual downpipe system reducing backpressure and spool time for twin-turbo setups.',
    category: 'Engine',
    fitment_details: 'Nissan GT-R (R35) / 2008-2025 3.8L Twin-Turbo',
    price: 49500.00,
    stock: 4,
    vehicle_type: 'Car',
    make: 'Nissan',
    model: 'GT-R (R35)',
    year_start: 2008,
    year_end: 2025,
    engine_displacement: '3.8L Twin-Turbo VR38DETT',
  },
  {
    sku: 'AF-SUS-NA6',
    name: 'ClubSport Adjustable Coilover Suspension',
    description: 'Monotube damping system tuned for the responsive chassis of the lightweight roadster.',
    category: 'Suspension',
    fitment_details: 'Mazda MX-5 Miata (ND) / 2016-2026 2.0L',
    price: 34500.00,
    stock: 5,
    vehicle_type: 'Car',
    make: 'Mazda',
    model: 'MX-5 Miata (ND)',
    year_start: 2016,
    year_end: 2026,
    engine_displacement: '2.0L SkyActiv-G',
  },
  {
    sku: 'AF-MTO-N40',
    name: 'Carbon Slip-On Racing Exhaust',
    description: 'Ultra-lightweight titanium sleeve with real carbon fiber end cap, tuned for rich exhaust tone and weight reduction.',
    category: 'Engine',
    fitment_details: 'Kawasaki Ninja 400 / 2018-2024 399cc',
    price: 14800.00,
    stock: 14,
    vehicle_type: 'Motorcycle',
    make: 'Kawasaki',
    model: 'Ninja 400',
    year_start: 2018,
    year_end: 2024,
    engine_displacement: '399cc Parallel-Twin',
  },
  {
    sku: 'AF-MTO-ARX',
    name: 'Performance CVT Pulley & Roller Kit',
    description: 'CNC machined drive face and balanced roller weights for instant throttle response and higher top speed.',
    category: 'Engine',
    fitment_details: 'Yamaha Aerox 155 / 2021+ 155cc',
    price: 3400.00,
    stock: 22,
    vehicle_type: 'Motorcycle',
    make: 'Yamaha',
    model: 'Aerox 155',
    year_start: 2021,
    year_end: 2026,
    engine_displacement: '155cc VVA',
  },
];

async function seed() {
  console.log('--- Seeding Vehicles Master Table ---');

  // 1. Ensure vehicles_master exists
  await db.query(`
    CREATE TABLE IF NOT EXISTS vehicles_master (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vehicle_type ENUM('Car', 'Motorcycle') NOT NULL DEFAULT 'Car',
      make VARCHAR(100) NOT NULL,
      model VARCHAR(100) NOT NULL,
      year_start INT NOT NULL,
      year_end INT NOT NULL,
      engine_displacement VARCHAR(50) DEFAULT NULL,
      UNIQUE KEY uq_vehicle (vehicle_type, make, model, engine_displacement)
    )
  `);

  // 2. Insert master vehicles
  for (const v of VEHICLES) {
    await db.query(`
      INSERT INTO vehicles_master (vehicle_type, make, model, year_start, year_end, engine_displacement)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        year_start = VALUES(year_start),
        year_end = VALUES(year_end),
        engine_displacement = VALUES(engine_displacement)
    `, [v.vehicle_type, v.make, v.model, v.year_start, v.year_end, v.engine_displacement]);
  }
  console.log(`✓ Inserted/Updated ${VEHICLES.length} master vehicles.`);

  // 3. Insert new sample products & compatibility
  for (const p of NEW_PRODUCTS) {
    const [existing] = await db.query('SELECT id FROM products WHERE sku = ?', [p.sku]);
    let prodId;
    if (existing.length > 0) {
      prodId = existing[0].id;
      await db.query(`
        UPDATE products 
        SET name = ?, description = ?, category = ?, fitment_details = ?, price = ?, stock = ?
        WHERE id = ?
      `, [p.name, p.description, p.category, p.fitment_details, p.price, p.stock, prodId]);
    } else {
      const [res] = await db.query(`
        INSERT INTO products (sku, name, description, category, fitment_details, price, stock, is_universal, is_low_stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, FALSE)
      `, [p.sku, p.name, p.description, p.category, p.fitment_details, p.price, p.stock]);
      prodId = res.insertId;
    }

    // Insert/update compatibility
    await db.query(`
      DELETE FROM vehicle_compatibility WHERE product_id = ?
    `, [prodId]);

    await db.query(`
      INSERT INTO vehicle_compatibility (product_id, vehicle_type, make, model, year_start, year_end, engine_displacement)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [prodId, p.vehicle_type, p.make, p.model, p.year_start, p.year_end, p.engine_displacement]);
  }
  console.log(`✓ Inserted/Updated ${NEW_PRODUCTS.length} new parts & vehicle compatibility mappings.`);

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
