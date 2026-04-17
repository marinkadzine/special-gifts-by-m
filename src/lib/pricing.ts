import { CartItem, DeliveryOption, Product, PudoLockerSize } from "@/types/store";

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
      "120x220": 120,
      "150x150": 130,
      "150x200": 135,
      "200x200": 140,
    },
  },
};

export const VINYL_PRICE_PER_SQUARE_CM = 3;

export function calculateVinylPrice(widthCm: number, heightCm: number) {
  const safeWidth = Math.max(widthCm, 5);
  const safeHeight = Math.max(heightCm, 5);

  return Math.round(safeWidth * safeHeight * VINYL_PRICE_PER_SQUARE_CM);
}

export function getOptionValuePrice(product: Product, groupLabel: string, value: string) {
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
  return Object.keys(PRODUCT_OPTION_BASE_PRICES[product.slug] ?? {});
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
