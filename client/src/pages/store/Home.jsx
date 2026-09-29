import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Alert, Placeholder } from 'react-bootstrap';
import Hero from '../../components/store/Hero';
import ProductCard from '../../components/store/ProductCard';
import { fetchProducts } from '../../api/products';

const CATEGORIES = ['All parts', 'Brake Systems', 'Suspension', 'Engine', 'Electrical', 'Workshop Tools'];

const FEATURES = [
  { icon: 'bi-shield-check', title: 'Fitment checked', sub: 'Buy with confidence' },
  { icon: 'bi-truck',        title: 'Fast dispatch',   sub: 'Most orders ship same day' },
  { icon: 'bi-clock',        title: 'Real human help', sub: 'Support from enthusiasts' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cat, setCat] = useState('All parts');
  const [q, setQ] = useState('');

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError('Could not load products. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  const list = products.filter((p) =>
    (cat === 'All parts' || p.category === cat) &&
    `\({p.name}\){p.sku} ${p.fitment}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>