export type ProductOptionGroup = {
  label: string;
  values: string[];
};

export type PrintSizeOption = {
  label: string;
  price: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  basePrice: number;
  description: string;
  leadTime: string;
  featured?: boolean;
  summary: string;
  badges?: string[];
  image?: string;
  galleryImages?: string[];
  variantOptions?: ProductOptionGroup[];
  printSizes?: PrintSizeOption[];
  supportsCustomVinyl?: boolean;
  supportsGiftWrap?: boolean;
};

export type CartItem = {
  cartId: string;
  productId: string;
  slug: string;
  name: string;
  category: string;
  basePrice: number;
  totalPrice: number;
  quantity: number;
  size?: string;
  color?: string;
  variant?: string;
  printSize?: string;
  customVinyl?: {
    widthCm: number;
    heightCm: number;
    price: number;
  };
  isGift: boolean;
  giftWrap: boolean;
  giftNote?: string;
};

export type DeliveryMethod = "pudo" | "courier" | "collection";

export type CheckoutInput = {
  customerName: string;
  phone: string;
  email?: string;
  deliveryMethod: DeliveryMethod;
  lockerId?: string;
  address?: string;
  notes?: string;
  paymentMethod: "eft" | "whatsapp";
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};
