export default function OrderStatusBadge({ status }) {
  const s = (status || 'pending').toLowerCase();
  switch (s) {
    case 'pending':
      return <span className="badge-pill badge-pending">Pending</span>;
    case 'confirmed':
      return <span className="badge-pill badge-confirmed">Confirmed</span>;
    case 'packed':
      return <span className="badge-pill badge-packed">Packed</span>;
    case 'shipped':
      return <span className="badge-pill badge-shipped">Shipped</span>;
    case 'out_for_delivery':
      return <span className="badge-pill badge-out-for-delivery">Out for delivery</span>;
    case 'delivered':
      return <span className="badge-pill badge-delivered">Delivered</span>;
    case 'cancelled':
      return <span className="badge-pill badge-cancelled">Cancelled</span>;
    default:
      return <span className="badge-pill badge-pending">{status}</span>;
  }
}
