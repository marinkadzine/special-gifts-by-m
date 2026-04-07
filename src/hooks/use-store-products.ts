"use client";

import { useEffect, useState } from "react";
import { buildStoreCollections, defaultProducts, mergeStoreProducts } from "@/data/catalog";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { Product, ProductRecord } from "@/types/store";

export function useStoreProducts() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        if (!active) {
          return;
        }

        setProducts(defaultProducts);
        setLoading(false);
        setError("");
        return;
      }

      setLoading(true);

      const { data, error: loadError } = await supabase.from("products").select("*").order("created_at", { ascending: true });

      if (!active) {
        return;
      }

      if (loadError) {
        setProducts(defaultProducts);
        setError(loadError.message);
        setLoading(false);
        return;
      }

      setProducts(mergeStoreProducts((data as ProductRecord[] | null) ?? []));
      setError("");
      setLoading(false);
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  function refresh() {
    setRefreshKey((current) => current + 1);
  }

  return {
    products,
    loading,
    error,
    refresh,
    ...buildStoreCollections(products),
  };
}
