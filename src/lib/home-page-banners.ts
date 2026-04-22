import type { SupabaseClient } from "@supabase/supabase-js";
import { HomePageBanner } from "@/types/store";

const HOME_PAGE_BANNER_SELECT =
  "id, title, image_url, caption, cta_label, cta_href, active, featured, sort_order, created_at";

type HomePageBannerQueryRecord = {
  id: string;
  title: string;
  image_url: string;
  caption: string | null;
  cta_label: string | null;
  cta_href: string | null;
  active: boolean;
  featured: boolean;
  sort_order: number | null;
  created_at: string;
};

export const DEFAULT_HOME_PAGE_BANNERS: HomePageBanner[] = [
  {
    id: "default-mothers-day-bundle",
    title: "Mother's Day Personalized Bundle",
    image_url: "/branding/mothers-day-banner.png",
    caption:
      "Thoughtful gifts made with love. All for R250 with a regular mug, 10x10cm stone photo slab, Aero chocolate, and gift bag.",
    cta_label: "Customize this bundle",
    cta_href: "/shop?slug=mothers-day-personalized-bundle",
    active: true,
    featured: true,
    sort_order: 0,
    created_at: "2026-04-22T00:00:00.000Z",
  },
];

function normalizeHomePageBanner(item: HomePageBannerQueryRecord): HomePageBanner {
  return {
    ...item,
    sort_order: Number.isFinite(item.sort_order) ? Number(item.sort_order) : 0,
  };
}

export function humanizeHomePageBannerError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("home_page_banners")) {
    return "The home page banner section needs its Supabase table first. Please run supabase/home-page-banners.sql and try again.";
  }

  if (normalized.includes("gallery-images")) {
    return "The gallery-images storage bucket is missing or blocked. Please re-run supabase/schema.sql so banner uploads can work.";
  }

  return message;
}

export async function fetchHomePageBanners(
  supabase: SupabaseClient,
  options?: {
    activeOnly?: boolean;
    limit?: number;
  },
) {
  let query = supabase
    .from("home_page_banners")
    .select(HOME_PAGE_BANNER_SELECT)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (options?.activeOnly !== false) {
    query = query.eq("active", true);
  }

  if (typeof options?.limit === "number") {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    return {
      items: [] as HomePageBanner[],
      error,
    };
  }

  return {
    items: ((data as HomePageBannerQueryRecord[] | null) ?? []).map(normalizeHomePageBanner),
    error: null,
  };
}
