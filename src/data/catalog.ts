import { Product, ProductOptionGroup, ProductRecord, PrintSizeOption } from "@/types/store";

export const printSizes = [
  { label: "No print", price: 0 },
  { label: "A6 print", price: 20 },
  { label: "A5 print", price: 35 },
  { label: "A4 print", price: 55 },
];

const polyesterTeeGallery = [
  "/store-products/clothing_tshirt_unisex_polyester(1).png",
  "/store-products/clothing_tshirt_unisex_polyester(2).png",
  "/store-products/clothing_tshirt_unisex_polyester(3).png",
  "/store-products/clothing_tshirt_unisex_polyester(4).png",
  "/store-products/clothing_tshirt_unisex_polyester(5).png",
  "/store-products/clothing_tshirt_unisex_polyester(6).png",
  "/store-products/clothing_tshirt_unisex_polyester(7).png",
];

const meshCapGallery = [
  "/store-products/accessories_cap_5panel_mesh(1).png",
  "/store-products/accessories_cap_5panel_mesh(2).png",
  "/store-products/accessories_cap_5panel_mesh(3).png",
  "/store-products/accessories_cap_5panel_mesh(4).png",
  "/store-products/accessories_cap_5panel_mesh(5).png",
  "/store-products/accessories_cap_5panel_mesh(6).png",
  "/store-products/accessories_cap_5panel_mesh(7).png",
];

const structuredCapGallery = [
  "/store-products/accessories_cap_5panel_structured(1).png",
  "/store-products/accessories_cap_5panel_structured(2).png",
  "/store-products/accessories_cap_5panel_structured(3).png",
  "/store-products/accessories_cap_5panel_structured(4).png",
  "/store-products/accessories_cap_5panel_structured(5).png",
  "/store-products/accessories_cap_5panel_structured(6).png",
  "/store-products/accessories_cap_5panel_structured(7).png",
  "/store-products/accessories_cap_5panel_structured(8).png",
  "/store-products/accessories_cap_5panel_structured(9).png",
];

const stoneSlabGallery = [
  "/store-products/decor_photo_stone_slab(1).png",
  "/store-products/decor_photo_stone_slab(2).png",
  "/store-products/decor_photo_stone_slab(3).png",
  "/store-products/decor_photo_stone_slab(4).png",
];

const categoryOrder = [
  "Clothing",
  "Caps",
  "Accessories",
  "Decor",
  "Drinkware",
  "Kitchen",
  "Marketing Essentials",
  "Packaging",
  "Seasonal",
  "Stickers",
];

const readyMadeProductSlugs = new Set([
  "photo-stone-slab",
  "custom-a4-puzzle",
  "custom-gift-bag",
  "wine-tumbler",
  "skinny-tumbler",
  "ceramic-coffee-mug",
  "christmas-hat",
]);

const baseProducts: Omit<Product, "storeSection">[] = [
  {
    id: "adult-essential-tee",
    slug: "adult-essential-tee",
    name: "Unisex Essential T-Shirt",
    category: "Clothing",
    basePrice: 180,
    featured: true,
    description:
      "High-quality unisex cotton T-shirt for custom prints, gifting, and event wear.",
    summary: "Classic unisex cotton tee for everyday gifting, events, and branding.",
    leadTime: "2-4 business days",
    badges: ["Best Seller", "Custom Print Ready"],
    image: polyesterTeeGallery[0],
    galleryImages: polyesterTeeGallery,
    supportsGiftWrap: true,
    printSizes,
    variantOptions: [
      { label: "Size", values: ["XS", "S", "M", "L", "XL", "2XL", "3XL"] },
      {
        label: "Colour",
        values: [
          "Black",
          "White",
          "Navy",
          "Charcoal",
          "Grey",
          "Olive",
          "Burgundy",
          "Dusty Rose",
        ],
      },
    ],
  },
  {
    id: "polyester-unisex-tee",
    slug: "polyester-unisex-tee",
    name: "Polyester Unisex Tee",
    category: "Clothing",
    basePrice: 180,
    description:
      "Lightweight polyester tee designed for vibrant sublimation and sportswear designs.",
    summary: "Breathable short-sleeve tee for bold full-colour prints.",
    leadTime: "2-4 business days",
    image: polyesterTeeGallery[2],
    galleryImages: polyesterTeeGallery,
    printSizes,
    supportsGiftWrap: true,
    variantOptions: [
      { label: "Size", values: ["XS", "S", "M", "L", "XL", "2XL", "3XL"] },
      {
        label: "Colour",
        values: ["White", "Black", "Lime", "Red", "Royal Blue", "Turquoise", "Yellow"],
      },
    ],
  },
  {
    id: "kids-tee",
    slug: "kids-essential-tee",
    name: "Kids Essential Tee",
    category: "Clothing",
    basePrice: 150,
    description: "Durable and playful tee for birthdays, school events, and matching sets.",
    summary: "Bright and core colour T-shirts for kids.",
    leadTime: "2-4 business days",
    image: polyesterTeeGallery[4],
    galleryImages: polyesterTeeGallery,
    printSizes,
    supportsGiftWrap: true,
    variantOptions: [
      { label: "Size", values: ["1yr", "2yr", "3yr", "4yr", "5yr", "6yr", "7yr", "8yr", "10yr", "12yr"] },
      {
        label: "Colour",
        values: ["White", "Black", "Navy", "Grey", "Red", "Blue", "Pink", "Teal", "Yellow"],
      },
    ],
  },
  {
    id: "baby-vest",
    slug: "baby-vest",
    name: "Infant Vest",
    category: "Clothing",
    basePrice: 100,
    description: "Soft baby vest for delicate skin and sweet personalized gifting.",
    summary: "Sleeveless, short sleeve, or long sleeve babywear.",
    leadTime: "2-4 business days",
    printSizes,
    supportsGiftWrap: true,
    variantOptions: [
      { label: "Style", values: ["Sleeveless", "Short Sleeve", "Long Sleeve"] },
      { label: "Size", values: ["Newborn", "0-3m", "3-6m", "6-12m", "12-18m", "18-24m"] },
      { label: "Colour", values: ["Pure White", "Pale Pink", "Baby Blue", "Stone", "Cream", "Sage Green", "Grey"] },
    ],
  },
  {
    id: "mesh-cap",
    slug: "mesh-back-cap",
    name: "5-Panel Mesh Back Cap",
    category: "Caps",
    basePrice: 170,
    description: "Breathable cap for outdoor wear, gifting, and branded events.",
    summary: "Ventilated mesh cap with solid, two-tone, and camo options.",
    leadTime: "3-5 business days",
    image: meshCapGallery[0],
    galleryImages: meshCapGallery,
    supportsGiftWrap: true,
    variantOptions: [
      {
        label: "Colour",
        values: ["Black", "White", "Red", "Blue", "Green", "Navy / White", "Royal / White", "Camo"],
      },
    ],
  },
  {
    id: "structured-cap",
    slug: "structured-polyester-cap",
    name: "Structured Polyester Cap",
    category: "Caps",
    basePrice: 170,
    description: "Firm front panel cap that shows off logos and names beautifully.",
    summary: "Clean cap silhouette for corporate, casual, and event branding.",
    leadTime: "3-5 business days",
    image: structuredCapGallery[0],
    galleryImages: structuredCapGallery,
    supportsGiftWrap: true,
    variantOptions: [
      { label: "Colour", values: ["White", "Black", "Navy", "Red", "Royal Blue", "Orange", "Pink", "Green"] },
    ],
  },
  {
    id: "vinyl-sticker",
    slug: "custom-vinyl-sticker",
    name: "Custom Vinyl Sticker",
    category: "Stickers",
    basePrice: 0,
    featured: true,
    description:
      "Custom-cut vinyl sticker priced by custom dimensions for branding, labels, and decor.",
    summary: "Made-to-size vinyl sticker with live price calculation.",
    leadTime: "2-3 business days",
    supportsCustomVinyl: true,
    supportsGiftWrap: false,
    badges: ["Custom Size"],
    variantOptions: [{ label: "Finish", values: ["Standard Vinyl", "Gloss", "Matte"] }],
  },
  {
    id: "waterproof-a4-sticker-sheet",
    slug: "waterproof-a4-sticker-sheet",
    name: "Waterproof A4 Sticker Sheet",
    category: "Stickers",
    basePrice: 20,
    description: "A4 waterproof sheet for labels, packaging, and outdoor use.",
    summary: "Durable full-sheet sticker print option.",
    leadTime: "2-3 business days",
    supportsGiftWrap: false,
  },
  {
    id: "photo-stone-slab",
    slug: "photo-stone-slab",
    name: "Photo Stone Slab",
    category: "Decor",
    basePrice: 120,
    description: "Premium stone surface keeps memories vivid and gift-ready.",
    summary: "Durable printed display stone in multiple sizes.",
    leadTime: "3-5 business days",
    image: stoneSlabGallery[0],
    galleryImages: stoneSlabGallery,
    supportsGiftWrap: true,
    variantOptions: [{ label: "Size", values: ["120x220", "150x150", "150x200", "200x200"] }],
  },
  {
    id: "a4-puzzle",
    slug: "custom-a4-puzzle",
    name: "Custom A4 Puzzle",
    category: "Decor",
    basePrice: 50,
    description: "Turn a favourite photo or message into an affordable keepsake puzzle.",
    summary: "Personalized puzzle for birthdays and family gifts.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
  },
  {
    id: "gift-bag",
    slug: "custom-gift-bag",
    name: "Custom Gift Bag",
    category: "Packaging",
    basePrice: 25,
    description: "Branded or personalized gift bag to finish each order beautifully.",
    summary: "Gift bags in A6 to A4 landscape sizes.",
    leadTime: "2-3 business days",
    variantOptions: [{ label: "Size", values: ["A6", "A5", "A4 Portrait", "A4 Landscape"] }],
  },
  {
    id: "lanyard",
    slug: "custom-lanyard",
    name: "Custom Lanyard",
    category: "Accessories",
    basePrice: 30,
    description: "Single-sided printed lanyard for events, staff tags, and promotions.",
    summary: "Simple branded essential for schools, teams, and events.",
    leadTime: "3-5 business days",
    image: "/store-products/accessories_lanyard.png",
    galleryImages: ["/store-products/accessories_lanyard.png"],
  },
  {
    id: "mousepad",
    slug: "smooth-mousepad",
    name: "Smooth Mousepad",
    category: "Accessories",
    basePrice: 90,
    description: "Smooth print-ready surface for office gifts and promotional packs.",
    summary: "Desk-ready custom mousepad with photo or logo printing.",
    leadTime: "3-5 business days",
    image: "/store-products/accessories_mousepad.png",
    galleryImages: ["/store-products/accessories_mousepad.png"],
    supportsGiftWrap: true,
  },
  {
    id: "popsocket",
    slug: "custom-pop-socket",
    name: "Pop Socket",
    category: "Accessories",
    basePrice: 70,
    description: "Convenient phone grip and stand for names, logos, and artwork.",
    summary: "Everyday phone accessory in black or white.",
    leadTime: "2-4 business days",
    image: "/store-products/accessories_popsocket(1).png",
    galleryImages: [
      "/store-products/accessories_popsocket(1).png",
      "/store-products/accessories_popsocket(2).png",
    ],
    variantOptions: [{ label: "Colour", values: ["Black", "White"] }],
  },
  {
    id: "wooden-cutting-board",
    slug: "wooden-cutting-board",
    name: "Wooden Cutting Board",
    category: "Kitchen",
    basePrice: 250,
    description: "Solid wood cutting board suitable for engraving and statement gifting.",
    summary: "Premium kitchen piece for home gifts and corporate hampers.",
    leadTime: "4-6 business days",
    supportsGiftWrap: true,
  },
  {
    id: "wine-tumbler",
    slug: "wine-tumbler",
    name: "Wine Tumbler",
    category: "Drinkware",
    basePrice: 230,
    featured: true,
    description: "Stylish insulated wine tumbler ready for names, bridal gifts, and gifting sets.",
    summary: "Elegant custom tumbler for gifting and celebrations.",
    leadTime: "3-5 business days",
    supportsGiftWrap: true,
    variantOptions: [{ label: "Colour", values: ["White", "Blush Pink", "Lilac", "Black"] }],
  },
  {
    id: "skinny-tumbler",
    slug: "skinny-tumbler",
    name: "Skinny Tumbler",
    category: "Drinkware",
    basePrice: 240,
    description: "Tall insulated tumbler available in two sizes for standout personalization.",
    summary: "Popular gift item for bridesmaids, teachers, and event favors.",
    leadTime: "3-5 business days",
    supportsGiftWrap: true,
    variantOptions: [{ label: "Size", values: ["425ml", "570ml"] }],
  },
  {
    id: "ceramic-mug",
    slug: "ceramic-coffee-mug",
    name: "Ceramic Coffee Mug",
    category: "Drinkware",
    basePrice: 60,
    description: "Classic ceramic mug for affordable gifting, branding, and memorial designs.",
    summary: "Everyday custom mug with strong value pricing.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
  },
  {
    id: "business-cards-colour",
    slug: "colour-business-cards",
    name: "Colour Business Cards",
    category: "Marketing Essentials",
    basePrice: 110,
    description: "Full-colour business cards that elevate small business branding.",
    summary: "Available in popular print quantities with a vibrant finish.",
    leadTime: "2-4 business days",
    variantOptions: [{ label: "Quantity", values: ["50", "100", "500"] }],
  },
  {
    id: "flyers-a6",
    slug: "a6-flyers",
    name: "A6 Flyers",
    category: "Marketing Essentials",
    basePrice: 200,
    description: "Compact promotional flyers for launches, promotions, and events.",
    summary: "Single-sided or double-sided A6 flyer bundles.",
    leadTime: "2-4 business days",
    variantOptions: [
      { label: "Sides", values: ["Single Sided", "Double Sided"] },
      { label: "Quantity", values: ["500"] },
    ],
  },
  {
    id: "christmas-hat",
    slug: "christmas-hat",
    name: "Christmas Hat",
    category: "Seasonal",
    basePrice: 45,
    description: "Festive hat for family sets, holiday events, and December gifting.",
    summary: "Holiday favourite in adult and kids sizing.",
    leadTime: "2-3 business days",
    image: "/store-products/seasonal_christmas_hat(1).png",
    galleryImages: ["/store-products/seasonal_christmas_hat(1).png"],
    supportsGiftWrap: true,
    variantOptions: [{ label: "Type", values: ["Adults", "Kids"] }],
  },
];

export const defaultProducts: Product[] = baseProducts.map((product) => ({
  ...product,
  storeSection: readyMadeProductSlugs.has(product.slug) ? "ready-made" : "personalized",
}));

export const products = defaultProducts;

export const categories = getCategories(defaultProducts);

export const featuredProducts = defaultProducts.filter((product) => product.featured);

export const personalizedProducts = defaultProducts.filter((product) => product.storeSection === "personalized");

export const readyMadeProducts = defaultProducts.filter((product) => product.storeSection === "ready-made");

export const getProductBySlug = (slug: string) =>
  defaultProducts.find((product) => product.slug === slug);

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => String(entry).trim())
    .filter(Boolean);
}

function normalizeVariantOptions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const option = entry as { label?: unknown; values?: unknown };
      const label = typeof option.label === "string" ? option.label.trim() : "";
      const values = Array.isArray(option.values)
        ? option.values.map((item) => String(item).trim()).filter(Boolean)
        : [];

      if (!label || !values.length) {
        return null;
      }

      return {
        label,
        values,
      } satisfies ProductOptionGroup;
    })
    .filter((entry): entry is ProductOptionGroup => Boolean(entry));
}

function normalizePrintSizes(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const option = entry as { label?: unknown; price?: unknown };
      const label = typeof option.label === "string" ? option.label.trim() : "";
      const price = Number(option.price);

      if (!label || Number.isNaN(price)) {
        return null;
      }

      return {
        label,
        price,
      } satisfies PrintSizeOption;
    })
    .filter((entry): entry is PrintSizeOption => Boolean(entry));
}

function getFallbackStoreSection(slug: string) {
  return readyMadeProductSlugs.has(slug) ? "ready-made" : "personalized";
}

function createProductFromRecord(record: ProductRecord): Product {
  const galleryImages = normalizeStringArray(record.gallery_images);
  const image = typeof record.image_url === "string" && record.image_url.trim() ? record.image_url.trim() : undefined;

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    category: record.category,
    storeSection: record.store_section ?? getFallbackStoreSection(record.slug),
    basePrice: Number(record.base_price),
    description: record.description,
    summary: record.summary,
    leadTime: record.lead_time,
    featured: record.featured,
    badges: normalizeStringArray(record.badges),
    image,
    galleryImages: galleryImages.length ? galleryImages : image ? [image] : undefined,
    variantOptions: normalizeVariantOptions(record.variant_options),
    printSizes: normalizePrintSizes(record.print_sizes),
    supportsCustomVinyl: record.supports_custom_vinyl,
    supportsGiftWrap: record.supports_gift_wrap,
  };
}

function mergeProductWithRecord(product: Product, record: ProductRecord): Product {
  const galleryImages = record.gallery_images === null || record.gallery_images === undefined
    ? product.galleryImages
    : normalizeStringArray(record.gallery_images);
  const variantOptions = record.variant_options === null || record.variant_options === undefined
    ? product.variantOptions
    : normalizeVariantOptions(record.variant_options);
  const resolvedPrintSizes = record.print_sizes === null || record.print_sizes === undefined
    ? product.printSizes
    : normalizePrintSizes(record.print_sizes);
  const badges = record.badges === null || record.badges === undefined
    ? product.badges
    : normalizeStringArray(record.badges);
  const image = record.image_url === null || record.image_url === undefined || record.image_url.trim() === ""
    ? product.image
    : record.image_url.trim();

  return {
    ...product,
    id: record.id,
    slug: record.slug,
    name: record.name,
    category: record.category,
    storeSection: record.store_section ?? product.storeSection,
    basePrice: Number(record.base_price),
    description: record.description,
    summary: record.summary,
    leadTime: record.lead_time,
    featured: record.featured,
    badges,
    image,
    galleryImages,
    variantOptions,
    printSizes: resolvedPrintSizes,
    supportsCustomVinyl: record.supports_custom_vinyl,
    supportsGiftWrap: record.supports_gift_wrap,
  };
}

export function mergeStoreProducts(records: ProductRecord[] = []) {
  const recordsBySlug = new Map(records.map((record) => [record.slug, record]));
  const mergedProducts: Product[] = [];

  for (const product of defaultProducts) {
    const record = recordsBySlug.get(product.slug);

    if (!record) {
      mergedProducts.push(product);
      continue;
    }

    recordsBySlug.delete(product.slug);

    if (record.active === false) {
      continue;
    }

    mergedProducts.push(mergeProductWithRecord(product, record));
  }

  for (const record of recordsBySlug.values()) {
    if (record.active === false) {
      continue;
    }

    mergedProducts.push(createProductFromRecord(record));
  }

  return mergedProducts;
}

export function getCategories(items: Product[]) {
  const orderedCategories = categoryOrder.filter((category) =>
    items.some((product) => product.category === category),
  );
  const extraCategories = Array.from(
    new Set(
      items
        .map((product) => product.category)
        .filter((category) => !categoryOrder.includes(category)),
    ),
  );

  return [...orderedCategories, ...extraCategories];
}

export function buildStoreCollections(items: Product[]) {
  return {
    categories: getCategories(items),
    featuredProducts: items.filter((product) => product.featured),
    personalizedProducts: items.filter((product) => product.storeSection === "personalized"),
    readyMadeProducts: items.filter((product) => product.storeSection === "ready-made"),
  };
}
