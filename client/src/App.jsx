import { Routes, Route } from 'react-router-dom';
import StoreLayout from './layouts/StoreLayout';
import Home from './pages/store/Home';
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
    </Routes>
  );
}