import { Routes, Route } from 'react-router-dom';
import StoreLayout from './layouts/StoreLayout';
import Home from './pages/store/Home';

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/track" element={<div className="container py-5"><h1 className="display-cond">Track an order</h1></div>} />
      </Route>
    </Routes>
  );
}