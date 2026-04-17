import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { GalleryItem } from "@/types/store";

const GALLERY_SELECT_WITH_IMAGES = "id, title, category, image_url, gallery_images, caption, featured, created_at";
const GALLERY_SELECT_LEGACY = "id, title, category, image_url, caption, featured, created_at";

type GalleryQueryRecord = {
  id: string;
  title: string;
  category: string | null;
  image_url: string;
  gallery_images?: unknown;
  caption: string | null;
  featured: boolean;
  created_at: string;
};

function isMissingGalleryImagesColumn(error: PostgrestError | null) {
  const message = error?.message.toLowerCase() ?? "";
  return message.includes("gallery_images");
}

function normalizeGalleryImageList(imageUrl: string, galleryImages?: unknown) {
  const normalized = Array.isArray(galleryImages)
    ? galleryImages.map((entry) => String(entry).trim()).filter(Boolean)
    : [];

  if (imageUrl.trim()) {
    normalized.unshift(imageUrl.trim());
  }

  return Array.from(new Set(normalized));
}

export function getGalleryImages(item: GalleryItem) {
  return normalizeGalleryImageList(item.image_url, item.gallery_images);
}

function normalizeGalleryItem(item: GalleryQueryRecord): GalleryItem {
  return {
    ...item,
    gallery_images: normalizeGalleryImageList(item.image_url, item.gallery_images),
  };
}

export async function fetchGalleryItems(supabase: SupabaseClient, limit?: number) {
  let query = supabase
    .from("gallery_items")
    .select(GALLERY_SELECT_WITH_IMAGES)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (!error) {
    return {
      items: ((data as GalleryQueryRecord[] | null) ?? []).map(normalizeGalleryItem),
      error: null,
    };
  }

  if (!isMissingGalleryImagesColumn(error)) {
    return {
      items: [] as GalleryItem[],
      error,
    };
  }

  let legacyQuery = supabase
    .from("gallery_items")
    .select(GALLERY_SELECT_LEGACY)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (typeof limit === "number") {
    legacyQuery = legacyQuery.limit(limit);
  }

  const { data: legacyData, error: legacyError } = await legacyQuery;

  return {
    items: ((legacyData as GalleryQueryRecord[] | null) ?? []).map(normalizeGalleryItem),
    error: legacyError,
  };
}
