import { CartItem, DeliveryMethod, Product, PudoLockerSize } from "@/types/store";

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

export function calculateVinylPrice(widthCm: number, heightCm: number) {
  const safeWidth = Math.max(widthCm, 5);
  const safeHeight = Math.max(heightCm, 5);

  return Math.round(safeWidth * safeHeight * 3);
}

export function calculateLineItemTotal(
  product: Product,
  printUpcharge = 0,
  giftWrap = false,
  customVinylPrice = 0,
) {
  return product.basePrice + printUpcharge + customVinylPrice + (giftWrap ? GIFT_WRAP_FEE : 0);
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

export function getDeliveryFee(method: DeliveryMethod, items: CartItem[]) {
  if (method === "collection") {
    return COLLECTION_FEE;
  }

  return PUDO_LOCKER_OPTIONS[estimatePudoLockerSize(items)].fee;
}
