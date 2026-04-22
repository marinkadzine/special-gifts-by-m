"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { defaultProducts } from "@/data/catalog";
import { useStoreProducts } from "@/hooks/use-store-products";
import { getStoreSectionLabel } from "@/lib/store-navigation";
import { getBrowserSupabaseClient, uploadProductImages } from "@/lib/supabase";
import { formatCurrency } from "@/lib/pricing";
import { Product, ProductOptionGroup, ProductOptionPriceMap, PrintSizeOption, ProductRecord, StoreSection } from "@/types/store";

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
  variantOptions: ProductOptionGroup[];
  printSizes: string;
  featured: boolean;
  supportsGiftWrap: boolean;
  supportsCustomVinyl: boolean;
  active: boolean;
};

type VariantOptionTemplate = {
  id: string;
  buttonLabel: string;
  helper: string;
  optionGroup: ProductOptionGroup;
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
  variantOptions: [],
  printSizes: "",
  featured: false,
  supportsGiftWrap: false,
  supportsCustomVinyl: false,
  active: true,
};

function isCustomVinylStickerSlug(slug: string) {
  return slug.trim().toLowerCase() === "custom-vinyl-sticker";
}

function createEmptyVariantOptionGroup(): ProductOptionGroup {
  return {
    label: "",
    values: [""],
  };
}

const VARIANT_OPTION_TEMPLATES: VariantOptionTemplate[] = [
  {
    id: "size",
    buttonLabel: "Size",
    helper: "Common clothing or product sizing",
    optionGroup: {
      label: "Size",
      values: ["Small", "Medium", "Large"],
    },
  },
  {
    id: "colour",
    buttonLabel: "Colour",
    helper: "Popular colour choices",
    optionGroup: {
      label: "Colour",
      values: ["Black", "White", "Pink"],
    },
  },
  {
    id: "type",
    buttonLabel: "Type",
    helper: "Useful for adults, kids, standard, premium, and shape choices",
    optionGroup: {
      label: "Type",
      values: ["Standard", "Premium"],
    },
  },
  {
    id: "quantity",
    buttonLabel: "Quantity",
    helper: "Handy for print packs and marketing items",
    optionGroup: {
      label: "Quantity",
      values: ["1", "10", "50", "100"],
    },
  },
  {
    id: "socks-length",
    buttonLabel: "Socks Length",
    helper: "Preloads both sock prices",
    optionGroup: {
      label: "Length",
      values: ["Short Socks (25cm)", "Long Socks (40cm)"],
      prices: {
        "Short Socks (25cm)": 72,
        "Long Socks (40cm)": 75,
      },
    },
  },
];

function createVariantGroupFromTemplate(template: VariantOptionTemplate): ProductOptionGroup {
  return {
    label: template.optionGroup.label,
    values: [...template.optionGroup.values],
    ...(template.optionGroup.prices ? { prices: { ...template.optionGroup.prices } } : {}),
  };
}

function cloneOptionGroups(optionGroups?: ProductOptionGroup[]) {
  return (
    optionGroups?.map((group) => ({
      label: group.label,
      values: [...group.values],
      ...(group.prices ? { prices: { ...group.prices } } : {}),
    })) ?? []
  );
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
    variantOptions: isCustomVinylStickerSlug(product.slug) ? [] : cloneOptionGroups(product.variantOptions),
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
      ? []
      : cloneOptionGroups(Array.isArray(record.variant_options) ? (record.variant_options as ProductOptionGroup[]) : undefined),
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

function buildGalleryImageList(imageUrl: string, galleryImagesText: string) {
  return Array.from(new Set([imageUrl.trim(), ...parseLineList(galleryImagesText)].filter(Boolean)));
}

function buildProductMediaFolderName(formState: ProductFormState, editingSlug: string) {
  return (
    formState.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
    formState.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
    editingSlug ||
    "store-item"
  );
}

function parseVariantOptions(optionGroups: ProductOptionGroup[]) {
  if (!optionGroups.length) {
    return null;
  }

  const sanitizedGroups = optionGroups.flatMap((group) => {
    const label = group.label.trim();
    const values = group.values.map((value) => value.trim()).filter(Boolean);

    if (!label && !values.length) {
      return [];
    }

    if (!label) {
      throw new Error("Each variant option needs a label.");
    }

    if (!values.length) {
      throw new Error(`The variant option "${label}" needs at least one value.`);
    }

    const prices = Object.fromEntries(
      Object.entries(group.prices ?? {})
        .map(([value, rawPrice]) => [value.trim(), Number(rawPrice)] as const)
        .filter(([value, rawPrice]) => value && Number.isFinite(rawPrice)),
    ) as ProductOptionPriceMap;

    const scopedPrices = Object.fromEntries(values.flatMap((value) => (value in prices ? [[value, prices[value]]] : [])));

    return [
      {
        label,
        values,
        ...(Object.keys(scopedPrices).length ? { prices: scopedPrices } : {}),
      } satisfies ProductOptionGroup,
    ];
  });

  return sanitizedGroups.length ? sanitizedGroups : null;
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

  if (normalized.includes("gallery-images")) {
    return "The shared admin media bucket is missing or blocked. Please re-run supabase/schema.sql so uploads from your device can work.";
  }

  return message;
}

function createProductRecordPayload(product: Product, active: boolean): Omit<ProductRecord, "id" | "created_at"> {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    store_section: product.storeSection,
    base_price: product.basePrice,
    description: product.description,
    summary: product.summary,
    lead_time: product.leadTime,
    featured: Boolean(product.featured),
    supports_gift_wrap: Boolean(product.supportsGiftWrap),
    supports_custom_vinyl: Boolean(product.supportsCustomVinyl),
    variant_options: product.variantOptions ?? null,
    print_sizes: product.printSizes ?? null,
    badges: product.badges ?? null,
    image_url: product.image ?? null,
    gallery_images: product.galleryImages ?? null,
    active,
  };
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
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false);
  const [hiddenProducts, setHiddenProducts] = useState<ProductRecord[]>([]);
  const formSectionRef = useRef<HTMLElement | null>(null);
  const builtInProductSlugs = useRef(new Set(defaultProducts.map((product) => product.slug)));

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

  async function refreshHiddenProducts() {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("active", false)
      .order("created_at", { ascending: true });

    setHiddenProducts((data as ProductRecord[] | null) ?? []);
  }

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

  function updateVariantGroups(
    updater: (current: ProductOptionGroup[]) => ProductOptionGroup[],
  ) {
    setFormState((current) => ({
      ...current,
      variantOptions: updater(current.variantOptions),
    }));
  }

  function addVariantGroup() {
    updateVariantGroups((current) => [...current, createEmptyVariantOptionGroup()]);
    setStatus("Blank variant group added.");
  }

  function addVariantGroupFromTemplate(templateId: string) {
    const template = VARIANT_OPTION_TEMPLATES.find((entry) => entry.id === templateId);

    if (!template) {
      return;
    }

    updateVariantGroups((current) => [...current, createVariantGroupFromTemplate(template)]);
    setStatus(`${template.optionGroup.label} options added. Adjust the values or prices if needed.`);
  }

  function removeVariantGroup(groupIndex: number) {
    updateVariantGroups((current) => current.filter((_, index) => index !== groupIndex));
  }

  function duplicateVariantGroup(groupIndex: number) {
    updateVariantGroups((current) => {
      const group = current[groupIndex];

      if (!group) {
        return current;
      }

      const clonedGroup = cloneOptionGroups([group])[0];
      return [...current.slice(0, groupIndex + 1), clonedGroup, ...current.slice(groupIndex + 1)];
    });
    setStatus("Variant group duplicated.");
  }

  function updateVariantGroupLabel(groupIndex: number, value: string) {
    updateVariantGroups((current) =>
      current.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              label: value,
            }
          : group,
      ),
    );
  }

  function addVariantValue(groupIndex: number) {
    updateVariantGroups((current) =>
      current.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              values: [...group.values, ""],
            }
          : group,
      ),
    );
  }

  function removeVariantValue(groupIndex: number, valueIndex: number) {
    updateVariantGroups((current) =>
      current.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        const nextValues = group.values.filter((_, currentValueIndex) => currentValueIndex !== valueIndex);
        const removedValue = group.values[valueIndex];
        const nextPrices = { ...(group.prices ?? {}) };

        if (removedValue) {
          delete nextPrices[removedValue];
        }

        return {
          ...group,
          values: nextValues.length ? nextValues : [""],
          ...(Object.keys(nextPrices).length ? { prices: nextPrices } : { prices: undefined }),
        };
      }),
    );
  }

  function updateVariantValue(groupIndex: number, valueIndex: number, nextValue: string) {
    updateVariantGroups((current) =>
      current.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        const previousValue = group.values[valueIndex];
        const nextValues = [...group.values];
        nextValues[valueIndex] = nextValue;
        const nextPrices = { ...(group.prices ?? {}) };

        if (previousValue && previousValue !== nextValue && previousValue in nextPrices) {
          nextPrices[nextValue] = nextPrices[previousValue];
          delete nextPrices[previousValue];
        }

        return {
          ...group,
          values: nextValues,
          ...(Object.keys(nextPrices).length ? { prices: nextPrices } : { prices: undefined }),
        };
      }),
    );
  }

  function updateVariantPrice(groupIndex: number, value: string, priceText: string) {
    updateVariantGroups((current) =>
      current.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        const nextPrices = { ...(group.prices ?? {}) };
        const normalizedValue = value.trim();

        if (!normalizedValue) {
          return group;
        }

        if (!priceText.trim()) {
          delete nextPrices[normalizedValue];
        } else {
          nextPrices[normalizedValue] = Number(priceText);
        }

        return {
          ...group,
          ...(Object.keys(nextPrices).length ? { prices: nextPrices } : { prices: undefined }),
        };
      }),
    );
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

  async function handleCoverImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const folderName = buildProductMediaFolderName(formState, editingSlug);
    setUploadingCoverImage(true);
    setStatus("Uploading cover image...");

    try {
      const [uploadedUrl] = await uploadProductImages([file], folderName);

      if (!uploadedUrl) {
        throw new Error("Could not create a public URL for the uploaded cover image.");
      }

      setFormState((current) => ({
        ...current,
        imageUrl: uploadedUrl,
        galleryImages: parseLineList(current.galleryImages)
          .filter((image) => image !== uploadedUrl)
          .join("\n"),
      }));
      setStatus("Cover image uploaded.");
      event.target.value = "";
    } catch (error) {
      setStatus(error instanceof Error ? humanizeSaveError(error.message) : "Could not upload the cover image.");
    } finally {
      setUploadingCoverImage(false);
    }
  }

  async function handleGalleryImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const folderName = buildProductMediaFolderName(formState, editingSlug);
    setUploadingGalleryImages(true);
    setStatus(`Uploading ${files.length} product image${files.length === 1 ? "" : "s"}...`);

    try {
      const uploadedUrls = await uploadProductImages(files, folderName);
      const coverImage = formState.imageUrl.trim() || uploadedUrls[0] || "";
      const nextGalleryImages = Array.from(
        new Set([...parseLineList(formState.galleryImages), ...uploadedUrls].filter((image) => image !== coverImage)),
      );

      setFormState((current) => ({
        ...current,
        imageUrl: coverImage || current.imageUrl,
        galleryImages: nextGalleryImages.join("\n"),
      }));
      setStatus(`${uploadedUrls.length} product image${uploadedUrls.length === 1 ? "" : "s"} uploaded.`);
      event.target.value = "";
    } catch (error) {
      setStatus(error instanceof Error ? humanizeSaveError(error.message) : "Could not upload the product images.");
    } finally {
      setUploadingGalleryImages(false);
    }
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
        gallery_images: buildGalleryImageList(formState.imageUrl, formState.galleryImages),
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

  async function handleRemove(slug: string, name: string) {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Supabase is not connected, so items cannot be deleted.");
      return;
    }

    const isBuiltInItem = builtInProductSlugs.current.has(slug);
    const confirmationMessage = isBuiltInItem
      ? `Delete "${name}" from the live store list? It will be hidden from customers but can still be restored later from the admin panel.`
      : `Delete "${name}" from the store permanently? This cannot be undone.`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    try {
      setSaving(true);
      let error: { message: string } | null = null;

      if (isBuiltInItem) {
        const currentProduct = products.find((product) => product.slug === slug);

        if (!currentProduct) {
          setStatus("This product could not be found in the current catalogue.");
          return;
        }

        const result = await supabase
          .from("products")
          .upsert(createProductRecordPayload(currentProduct, false) as never, {
            onConflict: "slug",
          });

        error = result.error;
      } else {
        const result = await supabase.from("products").delete().eq("slug", slug);
        error = result.error;
      }

      if (error) {
        setStatus(`Could not delete item: ${error.message}`);
        return;
      }

      if (editingSlug === slug) {
        setEditingSlug("");
        setFormState(EMPTY_PRODUCT_FORM);
        syncEditorLocation();
      }

      refresh();
      await refreshHiddenProducts();
      setStatus(
        isBuiltInItem
          ? `"${name}" has been hidden from the live store.`
          : `"${name}" has been deleted from the store.`,
      );
    } finally {
      setSaving(false);
    }
  }

  const uploadingMedia = uploadingCoverImage || uploadingGalleryImages;
  const productMediaPreview = buildGalleryImageList(formState.imageUrl, formState.galleryImages);

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
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">Cover image</p>
              <input
                value={formState.imageUrl}
                onChange={(event) => updateField("imageUrl", event.target.value)}
                placeholder="/store-products/item.png or https://..."
                className="mt-3 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
              />
              <label className="mt-3 block text-sm text-[var(--berry)]">
                Upload from this device
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
                />
              </label>
              <span className="mt-2 block text-xs leading-6 text-[var(--mauve)]">
                Paste a URL if you already have one, or upload directly from the phone or laptop the admin is using.
              </span>
            </div>
          </div>

          {productMediaPreview.length ? (
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-4">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">Current media preview</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {productMediaPreview.map((image, index) => (
                  <div key={`${image}-${index}`} className="overflow-hidden rounded-[1rem] border border-[var(--line)] bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={`${formState.name || "Product"} preview ${index + 1}`} className="h-24 w-24 object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

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

          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">Extra gallery media</p>
            <label className="mt-3 block text-sm text-[var(--berry)]">
              Upload one or more extra images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryImageUpload}
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <label className="mt-4 block text-sm text-[var(--berry)]">
              Extra image URLs
              <textarea
                value={formState.galleryImages}
                onChange={(event) => updateField("galleryImages", event.target.value)}
                placeholder="/store-products/item-1.png&#10;/store-products/item-2.png"
                className="mt-2 min-h-24 w-full rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <span className="mt-2 block text-xs leading-6 text-[var(--mauve)]">
              Uploaded images are added automatically. You can still paste extra URLs if needed.
            </span>
          </div>

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

          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--mauve)]">Variant options</p>
                <p className="mt-1 text-xs leading-6 text-[var(--mauve)]">
                  Add choices like Size, Colour, Sleeve, Long Socks, or Short Socks. Leave price blank if that option
                  should keep the normal product price.
                </p>
              </div>
              {!isCustomVinylStickerSlug(formState.slug) ? (
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="button-secondary px-4 py-2 text-sm" onClick={addVariantGroup}>
                    Add blank group
                  </button>
                </div>
              ) : null}
            </div>

            {isCustomVinylStickerSlug(formState.slug) ? (
              <p className="mt-4 rounded-[1rem] bg-[var(--light-grey)] px-4 py-3 text-sm leading-7 text-[var(--berry)]">
                Vinyl stickers now use the live size calculator, so no extra finish or option group is needed here.
              </p>
            ) : (
              <>
                <div className="mt-4 rounded-[1rem] border border-[var(--line)] bg-[var(--light-grey)]/80 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--mauve)]">Quick add templates</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {VARIANT_OPTION_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        className="button-secondary px-4 py-2 text-sm"
                        onClick={() => addVariantGroupFromTemplate(template.id)}
                      >
                        {template.buttonLabel}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {VARIANT_OPTION_TEMPLATES.map((template) => (
                      <p key={`${template.id}-helper`} className="text-xs leading-6 text-[var(--mauve)]">
                        <span className="font-bold text-[var(--berry)]">{template.buttonLabel}:</span> {template.helper}
                      </p>
                    ))}
                  </div>
                </div>
                {formState.variantOptions.length ? (
              <div className="mt-4 space-y-4">
                {formState.variantOptions.map((group, groupIndex) => (
                  <div key={`variant-group-${groupIndex}`} className="rounded-[1.2rem] border border-[var(--line)] bg-white p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <input
                        value={group.label}
                        onChange={(event) => updateVariantGroupLabel(groupIndex, event.target.value)}
                        placeholder="Option label, for example Size or Length"
                        className="flex-1 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="button-secondary px-4 py-2 text-sm"
                          onClick={() => duplicateVariantGroup(groupIndex)}
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          className="button-secondary px-4 py-2 text-sm"
                          onClick={() => removeVariantGroup(groupIndex)}
                        >
                          Remove group
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-[var(--mauve)]">
                      Add each choice and, if needed, enter the exact price for that choice. Blank prices will keep the
                      normal base price.
                    </p>
                    <div className="mb-2 mt-4 hidden grid-cols-[1.2fr_0.8fr_auto] gap-3 px-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--mauve)] md:grid">
                      <span>Option value</span>
                      <span>Price</span>
                      <span>Action</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {group.values.map((value, valueIndex) => (
                        <div key={`variant-value-${groupIndex}-${valueIndex}`} className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto]">
                          <input
                            value={value}
                            onChange={(event) => updateVariantValue(groupIndex, valueIndex, event.target.value)}
                            placeholder="Option value, for example Long Socks (40cm)"
                            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
                          />
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={value && group.prices?.[value] !== undefined ? String(group.prices[value]) : ""}
                            onChange={(event) => updateVariantPrice(groupIndex, value, event.target.value)}
                            placeholder={value.trim() ? "Optional price" : "Add value first"}
                            disabled={!value.trim()}
                            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm disabled:cursor-not-allowed disabled:bg-[var(--light-grey)]"
                          />
                          <button
                            type="button"
                            className="button-secondary px-4 py-2 text-sm"
                            onClick={() => removeVariantValue(groupIndex, valueIndex)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="button-secondary mt-4 px-4 py-2 text-sm"
                      onClick={() => addVariantValue(groupIndex)}
                    >
                      Add value
                    </button>
                  </div>
                ))}
              </div>
                ) : (
              <p className="mt-4 rounded-[1rem] bg-[var(--light-grey)] px-4 py-3 text-sm leading-7 text-[var(--berry)]">
                No variant groups added yet. Use the button above for choices like Size, Colour, Sleeve, Shape, or
                Socks length.
              </p>
                )}
              </>
            )}
          </div>

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
            <button type="submit" className="button-primary" disabled={saving || uploadingMedia}>
              {saving ? "Saving item..." : uploadingMedia ? "Uploading media..." : editingSlug ? "Save changes" : "Add item to store"}
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
                      <button
                        type="button"
                        disabled={saving}
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                        onClick={() => handleRemove(product.slug, product.name)}
                      >
                        Delete
                      </button>
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
                              {product.category} | {getStoreSectionLabel(product.store_section ?? "personalized")}
                            </p>
                            <p className="mt-1 text-sm text-[var(--mauve)]">{product.slug}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin?edit=${encodeURIComponent(product.slug)}#store-item-editor`}
                            className="button-secondary px-4 py-2 text-sm"
                            onClick={() => editHiddenProduct(product)}
                          >
                            Open editor
                          </Link>
                          <button
                            type="button"
                            disabled={saving}
                            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                            onClick={() => handleRemove(product.slug, product.name)}
                          >
                            Delete
                          </button>
                          </div>
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
