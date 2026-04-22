import { CartItem, DeliveryOption, Product, ProductOptionGroup, PudoLockerSize } from "@/types/store";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

export const GIFT_WRAP_FEE = 35;

export const COLLECTION_FEE = 0;

export const PUDO_LOCKER_OPTIONS: Record<
  PudoLockerSize,
  { label: string; maxItems: number; fee: number; dimensions: string }
> = {
  XS: { label: "Extra Small", maxItems: 1, fee: 60, dimensions: "60 x 17 x 8 cm" },
  S: { label: "Small", maxItems: 2, fee: 75, dimensions: "60 x 41 x 8 cm" },
  M: { label: "Medium", maxItems: 4, fee: 85, dimensions: "60 x 41 x 19 cm" },
  L: { label: "Large", maxItems: 8, fee: 110, dimensions: "60 x 41 x 41 cm" },
  XL: { label: "Extra Large", maxItems: Number.POSITIVE_INFINITY, fee: 140, dimensions: "60 x 41 x 69 cm" },
};

const PRODUCT_OPTION_BASE_PRICES: Record<string, Record<string, Record<string, number>>> = {
  "photo-stone-slab": {
    Size: {
      "120x220": 130,
      "150x150": 120,
      "150x200": 130,
      "200x200": 140,
    },
  },
  "wood-mdf-frame": {
    Size: {
      "120x120": 24,
      "200x200": 58,
      "150x150": 34,
      A4: 83,
      A5: 41,
    },
  },
  "wood-mdf-photo-display": {
    Type: {
      "001": 36,
      "002": 42,
      "004": 35,
      "005": 40,
    },
  },
  "custom-gift-bag": {
    Size: {
      A6: 25,
      A5: 30,
      "A4 Portrait": 35,
      "A4 Landscape": 35,
    },
  },
  "custom-pop-socket": {
    Colour: {
      Black: 70,
      White: 70,
    },
  },
  "custom-hand-fan": {
    Shape: {
      Round: 35,
      Square: 35,
    },
  },
  "custom-hair-brush": {
    Type: {
      Kids: 35,
      Adults: 100,
    },
  },
  "custom-coasters": {
    Type: {
      "Cardboard (4 Pack)": 30,
      Polymer: 40,
    },
  },
  "christmas-hat": {
    Type: {
      Kids: 45,
      Adults: 50,
    },
  },
  "can-tumbler": {
    Size: {
      "250ml": 165,
      "400ml": 190,
    },
  },
  "skinny-tumbler": {
    Size: {
      "425ml": 240,
      "570ml": 250,
    },
  },
  "minimalist-business-cards": {
    Quantity: {
      "50": 80,
      "100": 150,
      "500": 600,
    },
  },
  "colour-business-cards": {
    Quantity: {
      "50": 110,
      "100": 210,
      "500": 350,
    },
  },
  "double-sided-minimalist-business-cards": {
    Quantity: {
      "50": 100,
      "100": 190,
      "500": 800,
    },
  },
  "double-sided-colour-business-cards": {
    Quantity: {
      "50": 130,
      "100": 250,
      "500": 1150,
    },
  },
  "a6-flyers": {
    Sides: {
      "Single Sided": 200,
      "Double Sided": 300,
    },
  },
};

const SOCK_LENGTH_PRICE_KEYWORDS: Array<{ matches: string[]; price: number }> = [
  { matches: ["long socks", "long sock", "long", "40cm", "40 cm", "40"], price: 75 },
  { matches: ["short socks", "short sock", "short", "25cm", "25 cm", "25"], price: 72 },
];

export const VINYL_PRICE_PER_SQUARE_CM = 3;

function normalizePriceLookupValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getOptionGroup(product: Product, groupLabel: string) {
  return product.variantOptions?.find((group) => group.label === groupLabel);
}

function getInlineOptionPrice(group: ProductOptionGroup | undefined, value: string) {
  if (!group?.prices) {
    return undefined;
  }

  const configuredPrice = group.prices[value];
  if (typeof configuredPrice === "number") {
    return configuredPrice;
  }

  const normalizedValue = normalizePriceLookupValue(value);
  const matchingEntry = Object.entries(group.prices).find(([configuredValue]) => {
    return normalizePriceLookupValue(configuredValue) === normalizedValue;
  });

  return typeof matchingEntry?.[1] === "number" ? matchingEntry[1] : undefined;
}

function getSocksOptionPrice(product: Product, value: string) {
  const normalizedProduct = normalizePriceLookupValue(`${product.slug} ${product.name}`);

  if (!normalizedProduct.includes("sock")) {
    return undefined;
  }

  const normalizedValue = normalizePriceLookupValue(value);
  const compactValue = normalizedValue.replace(/\s+/g, "");
  const match = SOCK_LENGTH_PRICE_KEYWORDS.find((entry) =>
    entry.matches.some((keyword) => {
      const normalizedKeyword = normalizePriceLookupValue(keyword);
      return normalizedValue.includes(normalizedKeyword) || compactValue.includes(normalizedKeyword.replace(/\s+/g, ""));
    }),
  );
  return match?.price;
}

export function getProductPriceRange(product: Product) {
  const priceOptions = new Set<number>([product.basePrice]);

  product.variantOptions?.forEach((group) => {
    group.values.forEach((value) => {
      const optionPrice = getOptionValuePrice(product, group.label, value);

      if (typeof optionPrice === "number") {
        priceOptions.add(optionPrice);
      }
    });
  });

  const prices = Array.from(priceOptions).sort((left, right) => left - right);
  const min = prices[0] ?? product.basePrice;
  const max = prices[prices.length - 1] ?? product.basePrice;

  return {
    min,
    max,
    hasRange: min !== max,
  };
}

export function calculateVinylPrice(widthCm: number, heightCm: number) {
  const safeWidth = Math.max(widthCm, 5);
  const safeHeight = Math.max(heightCm, 5);

  return Math.round(safeWidth * safeHeight * VINYL_PRICE_PER_SQUARE_CM);
}

export function getOptionValuePrice(product: Product, groupLabel: string, value: string) {
  const inlinePrice = getInlineOptionPrice(getOptionGroup(product, groupLabel), value);

  if (typeof inlinePrice === "number") {
    return inlinePrice;
  }

  const socksPrice = getSocksOptionPrice(product, value);

  if (typeof socksPrice === "number") {
    return socksPrice;
  }

  return PRODUCT_OPTION_BASE_PRICES[product.slug]?.[groupLabel]?.[value];
}

export function getConfiguredBasePrice(product: Product, selectedOptions: Record<string, string>) {
  for (const [groupLabel, value] of Object.entries(selectedOptions)) {
    const configuredPrice = getOptionValuePrice(product, groupLabel, value);

    if (typeof configuredPrice === "number") {
      return configuredPrice;
    }
  }

  return product.basePrice;
}

export function getRequiredPricedOptionGroups(product: Product) {
  const staticGroups = Object.keys(PRODUCT_OPTION_BASE_PRICES[product.slug] ?? {});
  const dynamicGroups =
    product.variantOptions
      ?.filter((group) =>
        group.values.some((value) => typeof getOptionValuePrice(product, group.label, value) === "number"),
      )
      .map((group) => group.label) ?? [];

  return Array.from(new Set([...staticGroups, ...dynamicGroups]));
}

export function calculateLineItemTotal(basePrice: number, printUpcharge = 0, customVinylPrice = 0) {
  return basePrice + printUpcharge + customVinylPrice;
}

export function calculateCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.totalPrice * item.quantity, 0);
}

export function calculateCartUnitCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function estimatePudoLockerSize(items: CartItem[]): PudoLockerSize {
  const unitCount = calculateCartUnitCount(items);

  if (unitCount <= PUDO_LOCKER_OPTIONS.XS.maxItems) {
    return "XS";
  }

  if (unitCount <= PUDO_LOCKER_OPTIONS.S.maxItems) {
    return "S";
  }

  if (unitCount <= PUDO_LOCKER_OPTIONS.M.maxItems) {
    return "M";
  }

  if (unitCount <= PUDO_LOCKER_OPTIONS.L.maxItems) {
    return "L";
  }

  return "XL";
}

export function calculateGiftWrapFee(items: CartItem[]) {
  return items.length * GIFT_WRAP_FEE;
}

export function getDeliveryFee(method: DeliveryOption, items: CartItem[]) {
  if (method === "collection") {
    return COLLECTION_FEE;
  }

  return PUDO_LOCKER_OPTIONS[estimatePudoLockerSize(items)].fee;
}
