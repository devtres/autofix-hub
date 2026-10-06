import { Routes, Route } from 'react-router-dom';
import StoreLayout from './layouts/StoreLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/store/Home';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Tracking from './pages/admin/Tracking';
import Overview from './pages/admin/Overview';
import Suppliers from './pages/admin/Suppliers';
import Settings from './pages/admin/Settings';
import TrackOrder from './pages/store/TrackOrder';
import Checkout from './pages/store/Checkout';
import OrderConfirmation from './pages/store/OrderConfirmation';
import OrderHistory from './pages/store/OrderHistory';
import ProductDetail from './pages/store/ProductDetail';
import Wishlist from './pages/store/Wishlist';
import { useAttachAuthToken } from './auth/useAuthedHttp';
import RequireAdmin from './auth/RequireAdmin';

export default function App() {
  useAttachAuthToken();

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

      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Overview />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="tracking" element={<Tracking />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}