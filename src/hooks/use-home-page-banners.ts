"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  DEFAULT_HOME_PAGE_BANNERS,
  fetchHomePageBanners,
  humanizeHomePageBannerError,
} from "@/lib/home-page-banners";
import { HomePageBanner } from "@/types/store";

export function useHomePageBanners() {
  const [banners, setBanners] = useState<HomePageBanner[]>(DEFAULT_HOME_PAGE_BANNERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBanners() {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        if (!active) {
          return;
        }

        setBanners(DEFAULT_HOME_PAGE_BANNERS);
        setLoading(false);
        setError("");
        return;
      }

      setLoading(true);
      const result = await fetchHomePageBanners(supabase);

      if (!active) {
        return;
      }

      if (result.error) {
        setBanners(DEFAULT_HOME_PAGE_BANNERS);
        setError(humanizeHomePageBannerError(result.error.message));
        setLoading(false);
        return;
      }

      setBanners(result.items.length ? result.items : DEFAULT_HOME_PAGE_BANNERS);
      setError("");
      setLoading(false);
    }

    void loadBanners();

    return () => {
      active = false;
    };
  }, []);

  return {
    banners,
    loading,
    error,
  };
}
