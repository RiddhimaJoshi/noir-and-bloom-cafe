import React, { createContext, useContext, useEffect, useState } from "react";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nb_cart") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("nb_cart", JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product_id === product.id);
      if (found) {
        return prev.map((i) => i.product_id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, image: product.image, quantity: qty }];
    });
  };
  const remove = (pid) => setItems((prev) => prev.filter((i) => i.product_id !== pid));
  const setQty = (pid, q) => setItems((prev) => prev.map((i) => i.product_id === pid ? { ...i, quantity: Math.max(1, q) } : i));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartCtx.Provider value={{ items, add, remove, setQty, clear, count }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);
