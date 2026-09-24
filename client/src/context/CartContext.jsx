import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const add = (p) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product_id === p.product_id);
      return found
        ? prev.map((i) => (i.product_id === p.product_id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...p, qty: 1 }];
    });
    setOpen(true);
  };
  const remove = (id) => setItems((prev) => prev.filter((i) => i.product_id !== id));
  const value = useMemo(() => ({
    items, add, remove, open, setOpen,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
  }), [items, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}