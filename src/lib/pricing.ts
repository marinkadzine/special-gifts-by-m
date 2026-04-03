import { CartItem, DeliveryMethod, Product } from "@/types/store";

export const GIFT_WRAP_FEE = 35;

export const DELIVERY_FEES: Record<DeliveryMethod, number> = {
  pudo: 110,
  courier: 120,
  collection: 0,
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculateVinylPrice(widthCm: number, heightCm: number) {
  const safeWidth = Math.max(widthCm, 5);
  const safeHeight = Math.max(heightCm, 5);

  // Assumption for MVP: custom vinyl is billed at R3 per total edge centimetre.
  return Math.round((safeWidth + safeHeight) * 3);
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
