export default function StatusBadge({ stock, isLow }) {
  if (stock === 0) return <span className="badge-pill badge-out">Out of stock</span>;
  if (isLow) return <span className="badge-pill badge-low">Low stock</span>;
  return <span className="badge-pill badge-healthy">Healthy</span>;
}