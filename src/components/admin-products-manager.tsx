"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useStoreProducts } from "@/hooks/use-store-products";
import { getStoreSectionLabel } from "@/lib/store-navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/pricing";
import { Product, ProductOptionGroup, PrintSizeOption, ProductRecord, StoreSection } from "@/types/store";

type ProductFormState = {
  slug: string;
  name: string;
  category: string;
  storeSection: StoreSection;
  basePrice: string;
  description: string;
  summary: string;
  leadTime: string;
  imageUrl: string;
  galleryImages: string;
  badges: string;
  variantOptions: string;
  printSizes: string;
  featured: boolean;
  supportsGiftWrap: boolean;
  supportsCustomVinyl: boolean;
  active: boolean;
};

const EMPTY_PRODUCT_FORM: ProductFormState = {
  slug: "",
  name: "",
  category: "",
  storeSection: "personalized",
  basePrice: "",
  description: "",
  summary: "",
  leadTime: "2-4 business days",
  imageUrl: "",
  galleryImages: "",
  badges: "",
  variantOptions: "",
  printSizes: "",
  featured: false,
  supportsGiftWrap: false,
  supportsCustomVinyl: false,
  active: true,
};

function isCustomVinylStickerSlug(slug: string) {
  return slug.trim().toLowerCase() === "custom-vinyl-sticker";
}

function formatOptionGroups(optionGroups?: ProductOptionGroup[]) {
  return optionGroups?.length ? JSON.stringify(optionGroups, null, 2) : "";
}

function formatPrintSizes(printSizes?: PrintSizeOption[]) {
  return printSizes?.length ? printSizes.map((option) => `${option.label}|${option.price}`).join("\n") : "";
}

function createFormState(product?: Product): ProductFormState {
  if (!product) {
    return EMPTY_PRODUCT_FORM;
  }

  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    storeSection: product.storeSection,
    basePrice: String(product.basePrice),
    description: product.description,
    summary: product.summary,
    leadTime: product.leadTime,
    imageUrl: product.image ?? "",
    galleryImages: product.galleryImages?.join("\n") ?? "",
    badges: product.badges?.join(", ") ?? "",
    variantOptions: isCustomVinylStickerSlug(product.slug) ? "" : formatOptionGroups(product.variantOptions),
    printSizes: formatPrintSizes(product.printSizes),
    featured: Boolean(product.featured),
    supportsGiftWrap: Boolean(product.supportsGiftWrap),
    supportsCustomVinyl: Boolean(product.supportsCustomVinyl),
    active: true,
  };
}

function createFormStateFromRecord(record: ProductRecord): ProductFormState {
  return {
    slug: record.slug,
    name: record.name,
    category: record.category,
    storeSection: record.store_section ?? "personalized",
    basePrice: String(record.base_price),
    description: record.description,
    summary: record.summary,
    leadTime: record.lead_time,
    imageUrl: record.image_url ?? "",
    galleryImages: Array.isArray(record.gallery_images) ? record.gallery_images.map((entry) => String(entry)).join("\n") : "",
    badges: Array.isArray(record.badges) ? record.badges.map((entry) => String(entry)).join(", ") : "",
    variantOptions: isCustomVinylStickerSlug(record.slug)
      ? ""
      : formatOptionGroups(Array.isArray(record.variant_options) ? (record.variant_options as ProductOptionGroup[]) : undefined),
    printSizes: formatPrintSizes(Array.isArray(record.print_sizes) ? (record.print_sizes as PrintSizeOption[]) : undefined),
    featured: Boolean(record.featured),
    supportsGiftWrap: Boolean(record.supports_gift_wrap),
    supportsCustomVinyl: Boolean(record.supports_custom_vinyl),
    active: record.active !== false,
  };
}

function parseLineList(value: string) {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseVariantOptions(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = JSON.parse(value) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Variant options must be a JSON array.");
  }

  const optionGroups = parsed.map((entry) => {
    if (!entry || typeof entry !== "object") {
      throw new Error("Each variant option must be an object with label and values.");
    }

    const option = entry as { label?: unknown; values?: unknown };
    const label = typeof option.label === "string" ? option.label.trim() : "";

    if (!label) {
      throw new Error("Each variant option needs a label.");
    }

    if (!Array.isArray(option.values) || !option.values.length) {
      throw new Error(`The variant option "${label}" needs at least one value.`);
    }

    const values = option.values.map((item) => String(item).trim()).filter(Boolean);

    if (!values.length) {
      throw new Error(`The variant option "${label}" needs at least one value.`);
    }

    return {
      label,
      values,
    } satisfies ProductOptionGroup;
  });

  return optionGroups;
}

function parsePrintSizeLines(value: string) {
  if (!value.trim()) {
    return null;
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf("|");

      if (separatorIndex === -1) {
        throw new Error(`Print size "${line}" must use the format Label|Price.`);
      }

      const label = line.slice(0, separatorIndex).trim();
      const priceText = line.slice(separatorIndex + 1).trim();
      const price = Number(priceText);

      if (!label || Number.isNaN(price)) {
        throw new Error(`Print size "${line}" must use the format Label|Price.`);
      }

      return {
        label,
        price,
      } satisfies PrintSizeOption;
    });
}

function humanizeSaveError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("column") || normalized.includes("schema")) {
    return "The products table needs the latest Supabase schema before store updates can be saved. Please re-run supabase/schema.sql and try again.";
  }

  return message;
}

export function AdminProductsManager() {
  const { loading, products, refresh } = useStoreProducts();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [editingSlug, setEditingSlug] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [hiddenProducts, setHiddenProducts] = useState<ProductRecord[]>([]);
  const formSectionRef = useRef<HTMLElement | null>(null);

  const sortedProducts = [...products].sort((left, right) =>
    left.category === right.category
      ? left.name.localeCompare(right.name)
      : left.category.localeCompare(right.category),
  );

  function syncEditorLocation(slug?: string) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (slug) {
      nextParams.set("edit", slug);
    } else {
      nextParams.delete("edit");
    }

    const query = nextParams.toString();
    const nextUrl = query ? `${pathname}?${query}#store-item-editor` : `${pathname}#store-item-editor`;
    router.replace(nextUrl, { scroll: false });
  }

  useEffect(() => {
    let active = true;

    async function loadHiddenProducts() {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        return;
      }

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("active", false)
        .order("created_at", { ascending: true });

      if (!active) {
        return;
      }

      setHiddenProducts((data as ProductRecord[] | null) ?? []);
    }

    void loadHiddenProducts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const requestedSlug = searchParams.get("edit");

    if (!requestedSlug) {
      return;
    }

    const product = sortedProducts.find((entry) => entry.slug === requestedSlug);

    if (product && editingSlug !== requestedSlug) {
      setEditingSlug(product.slug);
      setFormState(createFormState(product));
      setStatus(`Editing ${product.name}.`);
      focusEditor();
      return;
    }

    const hiddenProduct = hiddenProducts.find((entry) => entry.slug === requestedSlug);

    if (hiddenProduct && editingSlug !== requestedSlug) {
      setEditingSlug(hiddenProduct.slug);
      setFormState(createFormStateFromRecord(hiddenProduct));
      setStatus(`Editing hidden item ${hiddenProduct.name}.`);
      focusEditor();
    }
  }, [editingSlug, hiddenProducts, searchParams, sortedProducts]);

  function updateField<Key extends keyof ProductFormState>(key: Key, value: ProductFormState[Key]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function focusEditor() {
    formSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function startNewProduct() {
    setEditingSlug("");
    setFormState(EMPTY_PRODUCT_FORM);
    setStatus("Ready to add a new store item.");
    syncEditorLocation();
    focusEditor();
  }

  function editProduct(product: Product) {
    setEditingSlug(product.slug);
    setFormState(createFormState(product));
    setStatus(`Editing ${product.name}.`);
    syncEditorLocation(product.slug);
    focusEditor();
  }

  function editHiddenProduct(product: ProductRecord) {
    setEditingSlug(product.slug);
    setFormState(createFormStateFromRecord(product));
    setStatus(`Editing hidden item ${product.name}.`);
    syncEditorLocation(product.slug);
    focusEditor();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Supabase is not connected yet, so store changes cannot be saved.");
      return;
    }

    const trimmedSlug = formState.slug.trim().toLowerCase().replace(/\s+/g, "-");
    const basePrice = Number(formState.basePrice);

    if (!trimmedSlug) {
      setStatus("Please add a slug for this product.");
      return;
    }

    if (Number.isNaN(basePrice)) {
      setStatus("Please enter a valid base price.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        slug: trimmedSlug,
        name: formState.name.trim(),
        category: formState.category.trim(),
        store_section: formState.storeSection,
        base_price: basePrice,
        description: formState.description.trim(),
        summary: formState.summary.trim(),
        lead_time: formState.leadTime.trim(),
        featured: formState.featured,
        supports_gift_wrap: formState.supportsGiftWrap,
        supports_custom_vinyl: formState.supportsCustomVinyl,
        image_url: formState.imageUrl.trim() || null,
        gallery_images: parseLineList(formState.galleryImages),
        badges: parseCommaList(formState.badges),
        variant_options: isCustomVinylStickerSlug(trimmedSlug) ? null : parseVariantOptions(formState.variantOptions),
        print_sizes: parsePrintSizeLines(formState.printSizes),
        active: formState.active,
      };

      const { error } = await supabase.from("products").upsert(payload as never, { onConflict: "slug" });

      if (error) {
        setStatus(humanizeSaveError(error.message));
        setSaving(false);
        return;
      }

      refresh();
      const hiddenSupabase = getBrowserSupabaseClient();

      if (hiddenSupabase) {
        const { data } = await hiddenSupabase
          .from("products")
          .select("*")
          .eq("active", false)
          .order("created_at", { ascending: true });
        setHiddenProducts((data as ProductRecord[] | null) ?? []);
      }

      setEditingSlug(trimmedSlug);
      setStatus("Store item saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save the store item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section id="store-item-editor" ref={formSectionRef} className="glass rounded-[2rem] p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">Store management</p>
            <h3 className="mt-2 font-display text-3xl text-[var(--berry)]">Add or edit store items</h3>
          </div>
          <button type="button" className="button-secondary" onClick={startNewProduct}>
            Add new item
          </button>
        </div>
        {editingSlug ? (
          <div className="mt-4 rounded-[1.2rem] border border-[var(--line)] bg-white/75 px-4 py-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--mauve)]">Now editing</p>
            <p className="mt-2 font-bold text-[var(--berry)]">{formState.name || editingSlug}</p>
            <p className="text-sm text-[var(--mauve)]">{editingSlug}</p>
          </div>
        ) : null}
        {status ? <p className="mt-4 text-sm text-[var(--mauve)]">{status}</p> : null}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-[var(--berry)]">
              Product name
              <input
                required
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <label className="text-sm text-[var(--berry)]">
              Slug
              <input
                required
                value={formState.slug}
                onChange={(event) => updateField("slug", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm text-[var(--berry)]">
              Category
              <input
                required
                value={formState.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <label className="text-sm text-[var(--berry)]">
              Store section
              <select
                value={formState.storeSection}
                onChange={(event) => updateField("storeSection", event.target.value as StoreSection)}
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              >
                <option value="personalized">Personalized</option>
                <option value="ready-made">Designed</option>
              </select>
            </label>
            <label className="text-sm text-[var(--berry)]">
              Base price
              <input
                required
                type="number"
                min={0}
                step="0.01"
                value={formState.basePrice}
                onChange={(event) => updateField("basePrice", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-[var(--berry)]">
              Lead time
              <input
                required
                value={formState.leadTime}
                onChange={(event) => updateField("leadTime", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <label className="text-sm text-[var(--berry)]">
              Cover image URL
              <input
                value={formState.imageUrl}
                onChange={(event) => updateField("imageUrl", event.target.value)}
                placeholder="/store-products/item.png or https://..."
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
          </div>

          <label className="text-sm text-[var(--berry)]">
            Summary
            <textarea
              required
              value={formState.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              className="mt-2 min-h-24 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>

          <label className="text-sm text-[var(--berry)]">
            Description
            <textarea
              required
              value={formState.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="mt-2 min-h-32 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>

          <label className="text-sm text-[var(--berry)]">
            Gallery image URLs
            <textarea
              value={formState.galleryImages}
              onChange={(event) => updateField("galleryImages", event.target.value)}
              placeholder="/store-products/item-1.png&#10;/store-products/item-2.png"
              className="mt-2 min-h-24 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-[var(--berry)]">
              Badges
              <input
                value={formState.badges}
                onChange={(event) => updateField("badges", event.target.value)}
                placeholder="Best Seller, Custom Print Ready"
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <label className="text-sm text-[var(--berry)]">
              Print sizes
              <textarea
                value={formState.printSizes}
                onChange={(event) => updateField("printSizes", event.target.value)}
                placeholder="No print|0&#10;A6 print|20&#10;A5 print|35"
                className="mt-2 min-h-24 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
          </div>

          <label className="text-sm text-[var(--berry)]">
            Variant options JSON
            <textarea
              value={formState.variantOptions}
              onChange={(event) => updateField("variantOptions", event.target.value)}
              placeholder={
                isCustomVinylStickerSlug(formState.slug)
                  ? "Vinyl stickers now use only the live size calculator, so no extra finish options are needed here."
                  : '[{"label":"Size","values":["S","M","L"]}]'
              }
              className="mt-2 min-h-36 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 font-mono text-xs"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
            <label className="flex items-center gap-3 rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-sm font-bold text-[var(--berry)]">
              <input
                type="checkbox"
                checked={formState.featured}
                onChange={(event) => updateField("featured", event.target.checked)}
              />
              Featured item
            </label>
            <label className="flex items-center gap-3 rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-sm font-bold text-[var(--berry)]">
              <input
                type="checkbox"
                checked={formState.active}
                onChange={(event) => updateField("active", event.target.checked)}
              />
              Visible in store
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="button-primary" disabled={saving}>
              {saving ? "Saving item..." : editingSlug ? "Save changes" : "Add item to store"}
            </button>
            <button type="button" className="button-secondary" onClick={startNewProduct}>
              Clear form
            </button>
          </div>
        </form>
      </section>

      <section className="glass rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">Current store items</p>
            <h3 className="mt-2 font-display text-3xl text-[var(--berry)]">Live catalogue</h3>
          </div>
          <span className="rounded-full bg-[var(--blush)] px-4 py-2 text-sm font-bold text-[var(--rose-deep)]">
            {products.length} items
          </span>
        </div>
        <div className="mt-5 space-y-3">
          {loading ? (
            <p className="text-sm text-[var(--mauve)]">Loading store items...</p>
          ) : (
            <>
              {sortedProducts.map((product) => (
                <article
                  key={product.slug}
                  className={`rounded-[1.2rem] border bg-white/80 p-4 ${
                    editingSlug === product.slug ? "border-[var(--rose)] shadow-sm" : "border-[var(--line)]"
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-bold text-[var(--berry)]">{product.name}</p>
                      <p className="text-sm text-[var(--mauve)]">
                        {product.category} | {getStoreSectionLabel(product.storeSection)}
                      </p>
                      <p className="mt-1 text-sm text-[var(--mauve)]">{product.slug}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-bold text-[var(--berry)]">{formatCurrency(product.basePrice)}</p>
                      <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
                      <Link
                        href={`/admin?edit=${encodeURIComponent(product.slug)}#store-item-editor`}
                        className="button-secondary px-4 py-2 text-sm"
                        onClick={() => editProduct(product)}
                      >
                        Open editor
                      </Link>
                      <Link
                        href={`/shop?slug=${encodeURIComponent(product.slug)}`}
                        className="button-secondary px-4 py-2 text-sm"
                      >
                        Open item
                      </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {hiddenProducts.length ? (
                <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--light-grey)] p-4">
                  <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
                    Hidden items
                  </p>
                  <div className="mt-3 space-y-3">
                    {hiddenProducts.map((product) => (
                      <article
                        key={product.slug}
                        className={`rounded-[1.2rem] border bg-white/80 p-4 ${
                          editingSlug === product.slug ? "border-[var(--rose)] shadow-sm" : "border-[var(--line)]"
                        }`}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="font-bold text-[var(--berry)]">{product.name}</p>
                            <p className="text-sm text-[var(--mauve)]">
                              {product.category} | {product.store_section ?? "personalized"}
                            </p>
                            <p className="mt-1 text-sm text-[var(--mauve)]">{product.slug}</p>
                          </div>
                          <Link
                            href={`/admin?edit=${encodeURIComponent(product.slug)}#store-item-editor`}
                            className="button-secondary px-4 py-2 text-sm"
                            onClick={() => editHiddenProduct(product)}
                          >
                            Open editor
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </section>
  );
}
