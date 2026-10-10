export type Role = 'owner' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface StoreMembership {
  id: string;
  storeId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: Role;
  permissions: {
    canManageProducts: boolean;
    canManageOrders: boolean;
    canEditTheme: boolean;
    canViewAnalytics: boolean;
    canManageStaff: boolean;
    canDeleteStore: boolean;
  };
  createdAt: string;
}

export type ThemeId = 'minimal' | 'luxe' | 'bold' | 'natural';

export interface StoreThemeConfig {
  themeId: ThemeId;
  primaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  heroBannerUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroLayout: 'split' | 'centered' | 'full-bleed';
  productCardStyle: 'clean' | 'card' | 'bordered';
  visibleSections: {
    hero: boolean;
    featuredCategories: boolean;
    featuredProducts: boolean;
    promoBanner: boolean;
    bestsellers: boolean;
    newsletter: boolean;
  };
}

export interface StoreSettings {
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR' | 'JPY';
  currencySymbol: string;
  taxRate: number; // percentage, e.g. 8.5
  taxInclusive: boolean;
  shippingFlatRate: number;
  freeShippingThreshold: number;
  shippingPolicy: string;
  returnPolicy: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
  };
  announcementBar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  businessType: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  logoUrl?: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  themeConfig: StoreThemeConfig;
  settings: StoreSettings;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  imageUrl?: string;
  productCount: number;
  isCustom?: boolean;
}

export interface ProductVariant {
  name: string; // e.g., 'Size', 'Color'
  options: string[]; // e.g., ['S', 'M', 'L'] or ['Black', 'Navy']
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  category: string;
  images: string[];
  variants?: ProductVariant[];
  stockQuantity: number;
  lowStockThreshold: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariant?: string;
  imageUrl?: string;
  category?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
}

export type OrderFulfillmentStatus = 'Placed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Test Mode';

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderStatusHistoryItem {
  status: OrderFulfillmentStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: OrderStatusHistoryItem[];
}

export interface InventoryMovement {
  id: string;
  storeId: string;
  productId: string;
  productName: string;
  type: 'order' | 'restock' | 'adjustment' | 'cancellation';
  quantityChange: number;
  newStock: number;
  reason: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  storeId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface ImportRowError {
  row: number;
  field: string;
  error: string;
  suggestedCorrection: string;
  originalValue?: string;
}

export interface ImportReport {
  id: string;
  storeId: string;
  fileName: string;
  totalRows: number;
  importedCount: number;
  failedCount: number;
  errors: ImportRowError[];
  timestamp: string;
}
