"use client";

import { createContext, useContext, useEffect, useState } from "react";

type WishlistContextValue = {
  items: string[];
  toggleItem: (slug: string) => void;
  hasItem: (slug: string) => boolean;
};

const STORAGE_KEY = "special-gifts-wishlist";

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    try {
      return JSON.parse(stored) as string[];
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function toggleItem(slug: string) {
    setItems((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  }

  function hasItem(slug: string) {
    return items.includes(slug);
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleItem,
        hasItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
}
