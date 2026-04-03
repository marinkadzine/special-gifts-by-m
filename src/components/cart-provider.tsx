"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartItem } from "@/types/store";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "special-gifts-cart";

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem: (item: CartItem) => {
        setItems((current) => {
          const existing = current.find((entry) => entry.cartId === item.cartId);
          if (existing) {
            return current.map((entry) =>
              entry.cartId === item.cartId
                ? { ...entry, quantity: entry.quantity + item.quantity }
                : entry,
            );
          }
          return [...current, item];
        });
      },
      removeItem: (cartId: string) => {
        setItems((current) => current.filter((entry) => entry.cartId !== cartId));
      },
      updateQuantity: (cartId: string, quantity: number) => {
        setItems((current) =>
          current
            .map((entry) => (entry.cartId === cartId ? { ...entry, quantity } : entry))
            .filter((entry) => entry.quantity > 0),
        );
      },
      clearCart: () => setItems([]),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
