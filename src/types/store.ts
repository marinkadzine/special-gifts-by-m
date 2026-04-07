export type ProductOptionGroup = {
  label: string;
  values: string[];
};

export type PrintSizeOption = {
  label: string;
  price: number;
};

export type StoreSection = "personalized" | "ready-made";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  storeSection: StoreSection;
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

export type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  category: string;
  store_section?: StoreSection | null;
  base_price: number;
  description: string;
  summary: string;
  lead_time: string;
  featured: boolean;
  supports_gift_wrap: boolean;
  supports_custom_vinyl: boolean;
  variant_options?: ProductOptionGroup[] | null;
  print_sizes?: PrintSizeOption[] | null;
  badges?: string[] | null;
  image_url?: string | null;
  gallery_images?: string[] | null;
  active?: boolean | null;
  created_at?: string;
};

export type UploadedReference = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
};

export type CartItem = {
  cartId: string;
  productId: string;
  slug: string;
  name: string;
  category: string;
  storeSection: StoreSection;
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
  customizationNotes?: string;
  referenceFiles?: UploadedReference[];
};

export type DeliveryMethod = "pudo" | "courier" | "collection";
export type PaymentMethod = "eft" | "payfast" | "scan_to_pay";
export type PudoLockerSize = "XS" | "S" | "M" | "L" | "XL";

export type CheckoutInput = {
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  deliveryMethod: DeliveryMethod;
  pudoSize?: PudoLockerSize;
  lockerId?: string;
  address?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "customer" | "admin";
  created_at: string;
};

export type OrderRecord = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  delivery_method: DeliveryMethod;
  delivery_fee: number;
  payment_method: PaymentMethod;
  locker_id: string | null;
  pudo_size: PudoLockerSize | null;
  address: string | null;
  notes: string | null;
  subtotal: number;
  total: number;
  status: string;
  items?: CartItem[];
  created_at: string;
};

export type CallbackRequest = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  preferred_time: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  category: string | null;
  image_url: string;
  caption: string | null;
  featured: boolean;
  created_at: string;
};
