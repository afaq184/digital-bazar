export type Language = 'en' | 'ur';

export type UserRole = 'customer' | 'vendor' | 'admin' | 'rider';

export type ActiveView = 'store' | 'customer-dashboard' | 'vendor' | 'admin' | 'rider';

export interface LocationCoords {
  lat: number;
  lng: number;
  addressText?: string;
  timestamp?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  vendorId?: string; // If user is a vendor
  shopNameEn?: string;
  shopNameUr?: string;
  zone?: ZoneId;
  marketAddressEn?: string;
  vehicleNo?: string;
}

export interface RegisteredAccount extends User {
  password?: string;
  createdAt?: string;
}

export type ZoneId = string;

export interface Zone {
  id: ZoneId;
  nameEn: string;
  nameUr: string;
  deliveryFee: number;
  estimatedTime: string;
  isCustom?: boolean;
}

export type CategoryId = 
  | 'peshawari-chappal' 
  | 'dry-fruits-spices' 
  | 'handicrafts-textiles' 
  | 'food-sweets' 
  | 'electronics' 
  | 'jewelry-gems' 
  | 'general-household';

export interface Category {
  id: CategoryId;
  nameEn: string;
  nameUr: string;
  icon: string;
  descriptionEn: string;
  descriptionUr: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export type ProductUnit = 'kg' | 'item' | 'gram' | 'liter' | 'dozen' | 'pack';

export interface Product {
  id: string;
  titleEn: string;
  titleUr: string;
  descriptionEn: string;
  descriptionUr: string;
  price: number;
  originalPrice?: number;
  unit?: ProductUnit; // e.g. 'kg' for meat, cow/gaye, dry fruits, desi ghee; 'item' for shoes
  unitLabelEn?: string; // e.g. "Per 1 Kg", "Per Item", "Per Pair"
  unitLabelUr?: string; // e.g. "فی 1 کلو گرام", "فی عدد", "فی جوڑا"
  weightOrVolume?: string; // e.g. "1 Kg", "500g", "1 Liter"
  pricePerKg?: number; // Explicit rate for 1 kilogram
  category: CategoryId;
  zone: ZoneId;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  createdAt: string;
}

export interface Vendor {
  id: string;
  shopNameEn: string;
  shopNameUr: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  zone: ZoneId;
  marketAddressEn: string;
  marketAddressUr: string;
  isVerified: boolean;
  rating: number;
  joinedDate: string;
  cnic?: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight?: string;
}

export type OrderStatus = 'Received' | 'Preparing' | 'Dispatched' | 'Delivered' | 'Cancelled';

export type PaymentMethod = 'COD' | 'EasyPaisa' | 'JazzCash';

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicleNo: string;
  assignedZone: ZoneId;
  coords?: LocationCoords;
  status?: 'Available' | 'On Delivery' | 'Offline';
}

export interface Order {
  id: string; // e.g. DB-84920
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  zone: ZoneId;
  landmark?: string;
  customerCoords?: LocationCoords;
  items: {
    productId: string;
    productTitleEn: string;
    productTitleUr: string;
    price: number;
    quantity: number;
    vendorId: string;
    vendorName: string;
  }[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentTransactionId?: string;
  status: OrderStatus;
  rider?: Rider;
  riderCoords?: LocationCoords;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
