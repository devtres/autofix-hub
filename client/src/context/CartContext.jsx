import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('autofix-hub-wishlist') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const add = (p) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product_id === p.product_id);
      return found
        ? prev.map((i) => (i.product_id === p.product_id ? { ...i, qty: Math.min(i.qty + 1, p.stock_qty) } : i))
        : [...prev, { ...p, qty: 1 }];
    });
    setOpen(true);
  };
  const remove = (id) => setItems((prev) => prev.filter((i) => i.product_id !== id));
  const setQuantity = (id, quantity) => {
    if (quantity < 1) return remove(id);
    setItems((prev) => prev.map((item) => item.product_id === id ? { ...item, qty: quantity } : item));
  };
  const clear = () => setItems([]);
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const next = prev.some((item) => item.product_id === product.product_id)
        ? prev.filter((item) => item.product_id !== product.product_id)
        : [...prev, product];
      return next;
    });
  };
  useEffect(() => {
    window.localStorage.setItem('autofix-hub-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);
  const value = useMemo(() => ({
    items, add, remove, setQuantity, clear, open, setOpen, wishlist, toggleWishlist,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
  }), [items, open, wishlist]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}