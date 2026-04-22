"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchHomePageBanners,
  humanizeHomePageBannerError,
} from "@/lib/home-page-banners";
import { getBrowserSupabaseClient, uploadGalleryImages } from "@/lib/supabase";
import { HomePageBanner } from "@/types/store";

type HomePageBannerFormState = {
  title: string;
  imageUrl: string;
  caption: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
  featured: boolean;
  sortOrder: string;
};

const EMPTY_HOME_PAGE_BANNER_FORM: HomePageBannerFormState = {
  title: "",
  imageUrl: "",
  caption: "",
  ctaLabel: "",
  ctaHref: "",
  active: true,
  featured: false,
  sortOrder: "0",
};

function createHomePageBannerFormState(item?: HomePageBanner): HomePageBannerFormState {
  if (!item) {
    return EMPTY_HOME_PAGE_BANNER_FORM;
  }

  return {
    title: item.title,
    imageUrl: item.image_url,
    caption: item.caption ?? "",
    ctaLabel: item.cta_label ?? "",
    ctaHref: item.cta_href ?? "",
    active: item.active,
    featured: item.featured,
    sortOrder: String(item.sort_order ?? 0),
  };
}

function sortHomePageBanners(items: HomePageBanner[]) {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
}

export function AdminHomeBannersManager({
  userId,
  onStatusChange,
}: {
  userId: string;
  onStatusChange: (message: string) => void;
}) {
  const [banners, setBanners] = useState<HomePageBanner[]>([]);
  const [formState, setFormState] = useState<HomePageBannerFormState>(EMPTY_HOME_PAGE_BANNER_FORM);
  const [editingBannerId, setEditingBannerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const sortedBanners = useMemo(() => sortHomePageBanners(banners), [banners]);

  useEffect(() => {
    let active = true;

    async function loadBanners() {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        if (!active) {
          return;
        }

        setBanners([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await fetchHomePageBanners(supabase, { activeOnly: false });

      if (!active) {
        return;
      }

      if (result.error) {
        setBanners([]);
        onStatusChange(humanizeHomePageBannerError(result.error.message));
        setLoading(false);
        return;
      }

      setBanners(result.items);
      setLoading(false);
    }

    void loadBanners();

    return () => {
      active = false;
    };
  }, [onStatusChange]);

  function updateField<Key extends keyof HomePageBannerFormState>(key: Key, value: HomePageBannerFormState[Key]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function focusEditor() {
    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function startNewBanner() {
    setEditingBannerId("");
    setFormState(EMPTY_HOME_PAGE_BANNER_FORM);
    onStatusChange("Ready to add a new home page banner.");
    focusEditor();
  }

  function editBanner(item: HomePageBanner) {
    setEditingBannerId(item.id);
    setFormState(createHomePageBannerFormState(item));
    onStatusChange(`Editing home page banner ${item.title}.`);
    focusEditor();
  }

  async function refreshBanners(preferredBannerId?: string) {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setBanners([]);
      return null;
    }

    const result = await fetchHomePageBanners(supabase, { activeOnly: false });

    if (result.error) {
      onStatusChange(humanizeHomePageBannerError(result.error.message));
      return null;
    }

    setBanners(result.items);

    if (preferredBannerId) {
      return result.items.find((item) => item.id === preferredBannerId) ?? null;
    }

    return null;
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const folderName =
      formState.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || editingBannerId || "home-page-banner";

    setUploading(true);
    onStatusChange(`Uploading ${files.length} home page banner image${files.length === 1 ? "" : "s"}...`);

    try {
      const uploadedUrls = await uploadGalleryImages(files, `home-banners/${folderName}`);
      if (uploadedUrls[0]) {
        setFormState((current) => ({
          ...current,
          imageUrl: uploadedUrls[0],
        }));
      }
      onStatusChange(`${uploadedUrls.length} home page banner image${uploadedUrls.length === 1 ? "" : "s"} uploaded.`);
      event.target.value = "";
    } catch (error) {
      onStatusChange(
        error instanceof Error
          ? humanizeHomePageBannerError(error.message)
          : "Could not upload the home page banner image.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      onStatusChange("Supabase is not connected yet, so home page banners cannot be saved.");
      return;
    }

    const payload = {
      title: formState.title.trim(),
      image_url: formState.imageUrl.trim(),
      caption: formState.caption.trim() || null,
      cta_label: formState.ctaLabel.trim() || null,
      cta_href: formState.ctaHref.trim() || null,
      active: formState.active,
      featured: formState.featured,
      sort_order: Number(formState.sortOrder) || 0,
    };

    if (!payload.title || !payload.image_url) {
      onStatusChange("Please add a title and image URL for the home page banner.");
      return;
    }

    setSaving(true);

    const { data, error } = await (editingBannerId
      ? supabase
          .from("home_page_banners")
          .update(payload as never)
          .eq("id", editingBannerId)
          .select("id")
          .single()
      : supabase
          .from("home_page_banners")
          .insert({
            ...payload,
            created_by: userId,
          } as never)
          .select("id")
          .single());

    if (error) {
      setSaving(false);
      onStatusChange(humanizeHomePageBannerError(error.message));
      return;
    }

    const savedBanner = await refreshBanners((data as { id: string } | null)?.id ?? editingBannerId);
    if (savedBanner) {
      setEditingBannerId(savedBanner.id);
      setFormState(createHomePageBannerFormState(savedBanner));
    } else if (!editingBannerId) {
      setFormState(EMPTY_HOME_PAGE_BANNER_FORM);
    }

    setSaving(false);
    onStatusChange(editingBannerId ? "Home page banner updated." : "Home page banner added.");
  }

  async function deleteBanner(itemId: string) {
    if (!window.confirm("Delete this home page banner from the app?")) {
      return;
    }

    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      onStatusChange("Supabase is not connected yet, so home page banners cannot be removed.");
      return;
    }

    const { error } = await supabase.from("home_page_banners").delete().eq("id", itemId);

    if (error) {
      onStatusChange(humanizeHomePageBannerError(error.message));
      return;
    }

    if (editingBannerId === itemId) {
      setEditingBannerId("");
      setFormState(EMPTY_HOME_PAGE_BANNER_FORM);
    }

    const nextItems = banners.filter((item) => item.id !== itemId);
    setBanners(nextItems);
    onStatusChange("Home page banner removed.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section ref={sectionRef} className="glass rounded-[2rem] p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
              Home page banners
            </p>
            <h3 className="mt-2 font-display text-3xl text-[var(--berry)]">
              {editingBannerId ? "Edit banner" : "Add a banner"}
            </h3>
          </div>
          <button type="button" className="button-secondary" onClick={startNewBanner}>
            Add new banner
          </button>
        </div>

        {editingBannerId ? (
          <div className="mt-4 rounded-[1.2rem] border border-[var(--line)] bg-white/75 px-4 py-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--mauve)]">Now editing</p>
            <p className="mt-2 font-bold text-[var(--berry)]">{formState.title}</p>
          </div>
        ) : null}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="text-sm text-[var(--berry)]">
            Banner title
            <input
              required
              value={formState.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>

          <label className="text-sm text-[var(--berry)]">
            Banner image URL
            <input
              required
              value={formState.imageUrl}
              onChange={(event) => updateField("imageUrl", event.target.value)}
              placeholder="/branding/your-banner.png or https://..."
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>

          <label className="text-sm text-[var(--berry)]">
            Upload banner image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
            />
            <span className="mt-2 block text-xs leading-6 text-[var(--mauve)]">
              Upload directly from your phone or computer. The uploaded image will fill the banner image URL for you.
            </span>
          </label>

          <label className="text-sm text-[var(--berry)]">
            Supporting text
            <textarea
              value={formState.caption}
              onChange={(event) => updateField("caption", event.target.value)}
              className="mt-2 min-h-24 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-[var(--berry)]">
              Button text
              <input
                value={formState.ctaLabel}
                onChange={(event) => updateField("ctaLabel", event.target.value)}
                placeholder="Shop the bundle"
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <label className="text-sm text-[var(--berry)]">
              Button link
              <input
                value={formState.ctaHref}
                onChange={(event) => updateField("ctaHref", event.target.value)}
                placeholder="/shop?slug=mothers-day-personalized-bundle"
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
          </div>

          <label className="text-sm text-[var(--berry)]">
            Display order
            <input
              type="number"
              value={formState.sortOrder}
              onChange={(event) => updateField("sortOrder", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-3 text-sm font-bold text-[var(--berry)]">
              <input
                type="checkbox"
                checked={formState.active}
                onChange={(event) => updateField("active", event.target.checked)}
              />
              Show this banner live
            </label>
            <label className="flex items-center gap-3 text-sm font-bold text-[var(--berry)]">
              <input
                type="checkbox"
                checked={formState.featured}
                onChange={(event) => updateField("featured", event.target.checked)}
              />
              Pin this banner first
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="button-primary" disabled={saving || uploading}>
              {saving
                ? "Saving banner..."
                : uploading
                  ? "Uploading banner..."
                  : editingBannerId
                    ? "Save banner changes"
                    : "Add banner"}
            </button>
            <button type="button" className="button-secondary" onClick={startNewBanner}>
              Clear form
            </button>
          </div>
        </form>
      </section>

      <section className="glass rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
              Current home page banners
            </p>
            <h3 className="mt-2 font-display text-3xl text-[var(--berry)]">Active specials and hero banners</h3>
          </div>
          <span className="rounded-full bg-[var(--blush)] px-4 py-2 text-sm font-bold text-[var(--rose-deep)]">
            {sortedBanners.length} banner{sortedBanners.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <p className="mt-5 text-sm text-[var(--mauve)]">Loading current banners...</p>
        ) : sortedBanners.length ? (
          <div className="mt-5 grid gap-4">
            {sortedBanners.map((banner) => (
              <article
                key={banner.id}
                className={`overflow-hidden rounded-[1.5rem] border bg-white/80 ${
                  editingBannerId === banner.id ? "border-[var(--rose)] shadow-sm" : "border-[var(--line)]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner.image_url} alt={banner.title} className="h-44 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[var(--berry)]">{banner.title}</p>
                      <p className="text-sm text-[var(--mauve)]">
                        Order {banner.sort_order} | {banner.active ? "Live" : "Hidden"}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {banner.featured ? (
                        <span className="rounded-full bg-[var(--blush)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--rose-deep)]">
                          Featured
                        </span>
                      ) : null}
                      {!banner.active ? (
                        <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--mauve)]">
                          Hidden
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {banner.caption ? (
                    <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">{banner.caption}</p>
                  ) : null}
                  {banner.cta_label || banner.cta_href ? (
                    <p className="mt-2 text-sm text-[var(--mauve)]">
                      Button: {banner.cta_label || "No label"} | Link: {banner.cta_href || "No link"}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="button-secondary px-4 py-2 text-sm"
                      onClick={() => editBanner(banner)}
                    >
                      Edit banner
                    </button>
                    <button
                      type="button"
                      className="button-secondary px-4 py-2 text-sm"
                      onClick={() => deleteBanner(banner.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-[var(--mauve)]">
            No home page banners have been added in Supabase yet. The website will keep showing the default Mother&apos;s Day banner until you add a new one here.
          </p>
        )}
      </section>
    </div>
  );
}
