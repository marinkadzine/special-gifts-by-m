import { CheckoutInput } from "@/types/store";
import { formatCurrency } from "@/lib/pricing";

export function buildWhatsAppOrderMessage(order: CheckoutInput) {
  const lines = [
    "Hello Special Gifts by M, I would like to place this order:",
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email || "Not provided"}`,
    `Delivery: ${order.deliveryMethod}`,
    order.lockerId ? `PUDO Locker: ${order.lockerId}` : "",
    order.address ? `Address: ${order.address}` : "",
    "",
    "Items:",
    ...order.items.map((item) => {
      const detailParts = [
        item.size ? `Size: ${item.size}` : "",
        item.color ? `Colour: ${item.color}` : "",
        item.variant ? `Variant: ${item.variant}` : "",
        item.printSize ? `Print: ${item.printSize}` : "",
        item.customVinyl
          ? `Vinyl: ${item.customVinyl.widthCm}x${item.customVinyl.heightCm}cm`
          : "",
        item.giftWrap ? "Gift wrap included" : "",
        item.giftNote ? `Gift note: ${item.giftNote}` : "",
      ].filter(Boolean);

      return `- ${item.quantity} x ${item.name} (${formatCurrency(item.totalPrice)})${detailParts.length ? ` | ${detailParts.join(", ")}` : ""}`;
    }),
    "",
    `Subtotal: ${formatCurrency(order.subtotal)}`,
    `Delivery: ${formatCurrency(order.deliveryFee)}`,
    `Total: ${formatCurrency(order.total)}`,
    `Payment method: ${order.paymentMethod.toUpperCase()}`,
    order.notes ? `Checkout notes: ${order.notes}` : "",
  ].filter(Boolean);

  return encodeURIComponent(lines.join("\n"));
}
