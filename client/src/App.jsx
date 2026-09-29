import { Routes, Route } from 'react-router-dom';
import StoreLayout from './layouts/StoreLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/store/Home';
import Products from './pages/admin/Products';

const Soon = ({ title }) => (
  <div><p className="eyebrow mb-1">Coming soon</p><h1 className="display-cond display-5">{title}</h1></div>
);
import TrackOrder from './pages/store/TrackOrder';
import Checkout from './pages/store/Checkout';
import OrderConfirmation from './pages/store/OrderConfirmation';
import OrderHistory from './pages/store/OrderHistory';
import ProductDetail from './pages/store/ProductDetail';
import Wishlist from './pages/store/Wishlist';

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Soon title="Overview" />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Soon title="Orders" />} />
        <Route path="tracking" element={<Soon title="Tracking" />} />
        <Route path="suppliers" element={<Soon title="Suppliers" />} />
        <Route path="settings" element={<Soon title="Settings" />} />
      </Route>
    </Routes>
  );
}