import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  UserRole,
  ActiveView,
  User,
  RegisteredAccount,
  ZoneId,
  Zone,
  CategoryId,
  Product,
  Vendor,
  Order,
  OrderStatus,
  Review,
  CartItem,
  ToastNotification,
  Rider,
  LocationCoords
} from '../types';
import {
  INITIAL_ZONES,
  INITIAL_CATEGORIES,
  INITIAL_VENDORS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_RIDERS
} from '../data/mockData';
import { translations } from '../translations/translations';
import {
  testFirestoreConnection,
  subscribeProducts,
  saveProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  subscribeVendors,
  saveVendorToFirestore,
  updateVendorInFirestore,
  deleteVendorFromFirestore,
  subscribeZones,
  saveZoneToFirestore,
  deleteZoneFromFirestore,
  subscribeOrders,
  saveOrderToFirestore,
  updateOrderInFirestore,
  subscribeRiders,
  saveRiderToFirestore,
  updateRiderInFirestore,
  subscribeUsers,
  saveUserToFirestore,
  subscribeReviews,
  saveReviewToFirestore,
  logoutFirebaseAuth
} from '../firebase';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  
  // Firebase Live Cloud Status
  firebaseConnected: boolean;
  firebaseProjectId: string;
  
  // Filters & Search
  selectedZone: ZoneId | 'all';
  setSelectedZone: (zone: ZoneId | 'all') => void;
  selectedCategory: CategoryId | 'all';
  setSelectedCategory: (category: CategoryId | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Cart & Wishlist
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedWeight?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  // Data
  zones: Zone[];
  addCustomZone: (zoneData: Omit<Zone, 'id'>) => Zone;
  categories: typeof INITIAL_CATEGORIES;
  products: Product[];
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  vendors: Vendor[];
  registerVendor: (v: Omit<Vendor, 'id' | 'rating' | 'joinedDate'>) => Vendor;
  approveVendor: (id: string) => void;
  rejectVendor: (id: string) => void;
  orders: Order[];
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, rider?: Rider) => void;
  riders: Rider[];
  registerRider: (r: Omit<Rider, 'id'>) => Rider;
  updateRiderLocation: (riderId: string, coords: LocationCoords) => void;
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;

  // UI state
  toasts: ToastNotification[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  selectedProductModal: Product | null;
  setSelectedProductModal: (p: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isTrackOrderOpen: boolean;
  setIsTrackOrderOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAddZoneModalOpen: boolean;
  setIsAddZoneModalOpen: (open: boolean) => void;
  activeOrderInvoice: Order | null;
  setActiveOrderInvoice: (order: Order | null) => void;
  registeredAccounts: RegisteredAccount[];
  saveAccount: (account: RegisteredAccount) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'digital_bazar_peshawar_v2_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clear any old legacy mock data from localStorage on start
  useEffect(() => {
    try {
      const oldKeys = [
        'digital_bazar_peshawar_products',
        'digital_bazar_peshawar_orders',
        'digital_bazar_peshawar_vendors',
        'digital_bazar_peshawar_riders',
        'digital_bazar_peshawar_cart',
        'digital_bazar_peshawar_wishlist'
      ];
      oldKeys.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      // ignore
    }
  }, []);

  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_PREFIX + 'language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'language', lang);
    document.dir = lang === 'ur' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language]);

  const t = translations[language];

  // User Authentication (Starts as null so new visitors start fresh)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      if (user.role === 'vendor' && !user.vendorId) {
        const repaired = {
          ...user,
          vendorId: 'v-' + user.id,
          shopNameEn: user.shopNameEn || user.name || 'Peshawar Shop'
        };
        setUser(repaired);
        saveAccount(repaired);
        return;
      }
      localStorage.setItem(LOCAL_STORAGE_PREFIX + 'current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'current_user');
    }
  }, [user]);

  // Firebase Live Cloud Status
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);
  const firebaseProjectId = 'trusty-hulling-65xj8';

  // Registered Accounts (stored in localStorage and synced with Firestore)
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'accounts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'accounts', JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

  const saveAccount = (account: RegisteredAccount) => {
    setRegisteredAccounts((prev) => {
      const filtered = prev.filter(
        (a) =>
          !(
            (account.email && a.email && a.email.toLowerCase() === account.email.toLowerCase()) ||
            (account.phone && a.phone && a.phone === account.phone)
          )
      );
      return [...filtered, account];
    });
    // Persist to Firebase Firestore
    saveUserToFirestore(account).catch((e) => console.warn('Firebase user save error:', e));
  };

  // Role & ActiveView (synced with logged-in user)
  const [role, setRoleState] = useState<UserRole>(() => (user ? user.role : 'customer'));
  const [activeView, setActiveViewState] = useState<ActiveView>(() => {
    if (user?.role === 'admin') return 'admin';
    if (user?.role === 'vendor') return 'vendor';
    if (user?.role === 'rider') return 'rider';
    return 'store';
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'admin') {
      setActiveViewState('admin');
    } else if (newRole === 'vendor') {
      setActiveViewState('vendor');
    } else if (newRole === 'rider') {
      setActiveViewState('rider');
    } else {
      setActiveViewState('store');
    }
  };

  const setActiveView = (view: ActiveView) => {
    // Access control rule:
    // Only admin can access admin dashboard!
    if (view === 'admin' && user?.role !== 'admin') {
      addToast(
        language === 'ur'
          ? 'ایڈمن پورٹل تک رسائی صرف ایڈمن (admin@gmail.com) کے لیے ہے!'
          : 'Access Denied: Only Administrator (admin@gmail.com) can access the Admin Portal!',
        'error'
      );
      setIsAuthModalOpen(true);
      return;
    }
    // Only vendor or admin can access vendor dashboard!
    if (view === 'vendor' && user?.role !== 'vendor' && user?.role !== 'admin') {
      addToast(
        language === 'ur'
          ? 'دکاندار پورٹل کے لیے پہلے دکاندار کے طور پر لاگ ان کریں!'
          : 'Access Denied: Please log in as a Vendor to access the Vendor Portal!',
        'error'
      );
      setIsAuthModalOpen(true);
      return;
    }
    // Only rider or admin can access rider dashboard!
    if (view === 'rider' && user?.role !== 'rider' && user?.role !== 'admin') {
      addToast(
        language === 'ur'
          ? 'رائڈر پورٹل کے لیے پہلے رائڈر کے طور پر لاگ ان کریں!'
          : 'Access Denied: Please log in as a Delivery Rider to access this portal!',
        'error'
      );
      setIsAuthModalOpen(true);
      return;
    }
    setActiveViewState(view);
  };

  const logout = () => {
    setUser(null);
    setRoleState('customer');
    setActiveViewState('store');
    logoutFirebaseAuth().catch(() => {});
    addToast(
      language === 'ur' ? 'آپ لاگ آؤٹ ہو چکے ہیں' : 'Logged out successfully',
      'info'
    );
  };

  // Zones (Default Peshawar zones + custom user-added zones from Firestore)
  const [zones, setZones] = useState<Zone[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'zones');
      return saved ? JSON.parse(saved) : INITIAL_ZONES;
    } catch {
      return INITIAL_ZONES;
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'zones', JSON.stringify(zones));
  }, [zones]);

  const [isAddZoneModalOpen, setIsAddZoneModalOpen] = useState(false);

  // Firestore Live Real-Time Subscriptions
  useEffect(() => {
    testFirestoreConnection();

    const unsubZones = subscribeZones(
      (items) => {
        if (items && items.length > 0) {
          const merged = [...INITIAL_ZONES];
          items.forEach((item) => {
            if (!merged.some((m) => m.id === item.id)) {
              merged.push(item);
            }
          });
          setZones(merged);
        } else {
          INITIAL_ZONES.forEach((z) => {
            saveZoneToFirestore(z).catch(() => {});
          });
          setZones(INITIAL_ZONES);
        }
        setFirebaseConnected(true);
      },
      (err) => console.warn('Zones sync notice:', err)
    );

    const unsubProducts = subscribeProducts(
      (items) => {
        if (items && items.length > 0) {
          // Merge Firestore items with INITIAL_PRODUCTS so all diverse catalog products are populated and auto-saved to Firestore
          const merged = [...items];
          INITIAL_PRODUCTS.forEach((initP) => {
            if (!merged.some((m) => m.id === initP.id)) {
              merged.push(initP);
              saveProductToFirestore(initP).catch(() => {});
            }
          });
          setProducts(merged);
        } else {
          // If Firestore has no products yet, populate initial Peshawar catalog
          INITIAL_PRODUCTS.forEach((p) => {
            saveProductToFirestore(p).catch(() => {});
          });
          setProducts(INITIAL_PRODUCTS);
        }
        setFirebaseConnected(true);
      },
      (err) => console.warn('Products sync notice:', err)
    );

    const unsubVendors = subscribeVendors(
      (items) => {
        if (items && items.length > 0) {
          setVendors(items);
        } else {
          // If Firestore has no vendors yet, populate initial Peshawar vendors
          INITIAL_VENDORS.forEach((v) => {
            saveVendorToFirestore(v).catch(() => {});
          });
          setVendors(INITIAL_VENDORS);
        }
        setFirebaseConnected(true);
      },
      (err) => console.warn('Vendors sync notice:', err)
    );

    const unsubOrders = subscribeOrders(
      (items) => {
        setOrders(items);
        setFirebaseConnected(true);
      },
      (err) => console.warn('Orders sync notice:', err)
    );

    const unsubRiders = subscribeRiders(
      (items) => {
        if (items && items.length > 0) {
          setRiders(items);
        } else {
          INITIAL_RIDERS.forEach((r) => {
            saveRiderToFirestore(r).catch(() => {});
          });
          setRiders(INITIAL_RIDERS);
        }
        setFirebaseConnected(true);
      },
      (err) => console.warn('Riders sync notice:', err)
    );

    const unsubUsers = subscribeUsers(
      (items) => {
        if (items && items.length > 0) {
          setRegisteredAccounts(items);
        }
        setFirebaseConnected(true);
      },
      (err) => console.warn('Users sync notice:', err)
    );

    const unsubReviews = subscribeReviews(
      (items) => {
        setReviews(items);
        setFirebaseConnected(true);
      },
      (err) => console.warn('Reviews sync notice:', err)
    );

    return () => {
      unsubZones();
      unsubProducts();
      unsubVendors();
      unsubOrders();
      unsubRiders();
      unsubUsers();
      unsubReviews();
    };
  }, []);

  const addCustomZone = (zoneData: Omit<Zone, 'id'>): Zone => {
    const raw = zoneData.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newId = `z-${raw || 'bazaar'}-${Date.now().toString().slice(-4)}`;
    const newZone: Zone = {
      ...zoneData,
      id: newId,
      isCustom: true
    };
    setZones((prev) => {
      if (prev.some((z) => z.id === newZone.id)) return prev;
      return [...prev, newZone];
    });
    saveZoneToFirestore(newZone).catch((e) => console.warn('Firestore zone save error:', e));
    setSelectedZone(newZone.id);
    addToast(
      language === 'ur'
        ? `نیا بازار "${newZone.nameUr || newZone.nameEn}" شامل ہو گیا اور فائر بیس میں محفوظ ہو گیا!`
        : `New bazaar area "${newZone.nameEn}" added & saved to Firebase!`,
      'success'
    );
    return newZone;
  };

  // Filters
  const [selectedZone, setSelectedZone] = useState<ZoneId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'cart', JSON.stringify(cart));
  }, [cart]);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Products (Peshawar authentic products catalog merged with local/Firestore additions)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p) => p.id));
          const merged = [...parsed];
          INITIAL_PRODUCTS.forEach((ip) => {
            if (!existingIds.has(ip.id)) {
              merged.push(ip);
            }
          });
          return merged;
        }
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'products', JSON.stringify(products));
  }, [products]);

  // Vendors (Peshawar local registered vendors)
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'vendors');
      if (saved) {
        const parsed: Vendor[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((v) => v.id));
          const merged = [...parsed];
          INITIAL_VENDORS.forEach((iv) => {
            if (!existingIds.has(iv.id)) {
              merged.push(iv);
            }
          });
          return merged;
        }
      }
      return INITIAL_VENDORS;
    } catch {
      return INITIAL_VENDORS;
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'vendors', JSON.stringify(vendors));
  }, [vendors]);

  // Orders (Clean start with no dummy data)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'orders', JSON.stringify(orders));
  }, [orders]);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'reviews');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modals & Drawers
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeOrderInvoice, setActiveOrderInvoice] = useState<Order | null>(null);

  // Cart actions
  const addToCart = (product: Product, quantity: number = 1, selectedWeight?: string) => {
    const weightToUse = selectedWeight || product.weightOrVolume || (product.unit === 'kg' ? '1 Kg' : undefined);
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedWeight === weightToUse
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedWeight === weightToUse
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedWeight: weightToUse }];
    });
    const unitNotice = weightToUse ? ` (${weightToUse})` : '';
    addToast(`${language === 'ur' ? 'کارٹ میں شامل کر دیا گیا' : 'Added to cart'}: ${language === 'ur' ? product.titleUr : product.titleEn}${unitNotice}`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast(language === 'ur' ? 'پروڈکٹ کارٹ سے ہٹا دیا گیا' : 'Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast(language === 'ur' ? 'پسندیدہ فہرست سے ہٹا دیا گیا' : 'Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        addToast(language === 'ur' ? 'پسندیدہ فہرست میں شامل کر دیا گیا' : 'Saved to wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: 'p-' + Date.now().toString().slice(-6),
      createdAt: new Date().toISOString()
    };
    setProducts((prev) => [newProduct, ...prev]);
    saveProductToFirestore(newProduct).catch((e) => console.warn('Firestore product write:', e));
    addToast(language === 'ur' ? 'نئی پروڈکٹ کامیابی سے شامل کر دی گئی' : 'New product listed successfully', 'success');
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    updateProductInFirestore(id, updated).catch((e) => console.warn('Firestore product update:', e));
    addToast(language === 'ur' ? 'پروڈکٹ اپ ڈیٹ ہو گئی' : 'Product updated successfully', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductFromFirestore(id).catch((e) => console.warn('Firestore product delete:', e));
    addToast(language === 'ur' ? 'پروڈکٹ حذف کر دی گئی' : 'Product deleted', 'info');
  };

  // Vendor Approval
  const approveVendor = (id: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isVerified: true } : v))
    );
    updateVendorInFirestore(id, { isVerified: true }).catch((e) => console.warn('Firestore vendor approve:', e));
    addToast(language === 'ur' ? 'دکاندار کی تصدیق کر دی گئی' : 'Vendor approved and verified', 'success');
  };

  const rejectVendor = (id: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
    deleteVendorFromFirestore(id).catch((e) => console.warn('Firestore vendor reject:', e));
    addToast(language === 'ur' ? 'دکاندار کی درخواست رد کر دی گئی' : 'Vendor application rejected', 'info');
  };

  // Riders State
  const [riders, setRiders] = useState<Rider[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'riders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'riders', JSON.stringify(riders));
  }, [riders]);

  const registerVendor = (vendorData: Omit<Vendor, 'id' | 'rating' | 'joinedDate'>): Vendor => {
    const newVendor: Vendor = {
      ...vendorData,
      id: 'v-' + Date.now(),
      rating: 5.0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setVendors((prev) => [newVendor, ...prev]);
    saveVendorToFirestore(newVendor).catch((e) => console.warn('Firestore vendor write:', e));
    addToast(
      language === 'ur'
        ? 'دکاندار اکاؤنٹ کامیابی سے رجسٹر ہو گیا!'
        : 'Vendor account registered successfully!',
      'success'
    );
    return newVendor;
  };

  const registerRider = (riderData: Omit<Rider, 'id'>): Rider => {
    const newRider: Rider = {
      ...riderData,
      id: 'r-' + Date.now(),
      status: 'Available'
    };
    setRiders((prev) => [newRider, ...prev]);
    saveRiderToFirestore(newRider).catch((e) => console.warn('Firestore rider write:', e));
    addToast(
      language === 'ur'
        ? 'رائڈر اکاؤنٹ رجسٹر ہو گیا!'
        : 'Rider account registered successfully!',
      'success'
    );
    return newRider;
  };

  const updateRiderLocation = (riderId: string, coords: LocationCoords) => {
    setRiders((prev) =>
      prev.map((r) => (r.id === riderId ? { ...r, coords, status: 'On Delivery' } : r))
    );
    updateRiderInFirestore(riderId, { coords, status: 'On Delivery' }).catch((e) => console.warn('Firestore rider location:', e));
    // Also update order riderCoords if order is assigned to this rider
    setOrders((prev) =>
      prev.map((o) => {
        if (o.rider?.id === riderId) {
          updateOrderInFirestore(o.id, { riderCoords: coords, updatedAt: new Date().toISOString() }).catch(() => {});
          return { ...o, riderCoords: coords, updatedAt: new Date().toISOString() };
        }
        return o;
      })
    );
    addToast(
      language === 'ur'
        ? 'آپ کی براہ راست لوکیشن اپ ڈیٹ کر دی گئی!'
        : 'Your live location updated successfully!',
      'info'
    );
  };
  const placeOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Order => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: `DB-${randomNum}`,
      status: 'Received',
      rider: riders.length > 0 ? riders[Math.floor(Math.random() * riders.length)] : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOrders((prev) => [newOrder, ...prev]);
    saveOrderToFirestore(newOrder).catch((e) => console.warn('Firestore order write:', e));
    clearCart();
    addToast(language === 'ur' ? 'آرڈر کامیابی سے درج ہو گیا!' : 'Order placed successfully!', 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, rider?: Rider) => {
    const updates: Partial<Order> = {
      status,
      ...(rider ? { rider } : {}),
      updatedAt: new Date().toISOString()
    };
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            ...updates
          };
        }
        return ord;
      })
    );
    updateOrderInFirestore(orderId, updates).catch((e) => console.warn('Firestore order status update:', e));
    addToast(
      language === 'ur'
        ? `آرڈر ${orderId} کی حالت تبدیل ہو کر: ${status}`
        : `Order ${orderId} updated to ${status}`,
      'info'
    );
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setReviews((prev) => [newReview, ...prev]);
    saveReviewToFirestore(newReview).catch((e) => console.warn('Firestore review write:', e));

    // Update product rating and review count
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === reviewData.productId) {
          const productReviews = [...reviews.filter((r) => r.productId === p.id), newReview];
          const newAvg = Number(
            (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
          );
          const pUpdates = {
            rating: newAvg,
            reviewCount: productReviews.length
          };
          updateProductInFirestore(p.id, pUpdates).catch(() => {});
          return {
            ...p,
            ...pUpdates
          };
        }
        return p;
      })
    );

    addToast(language === 'ur' ? 'رائے شامل کر دی گئی' : 'Thank you for your review!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        role,
        setRole,
        activeView,
        setActiveView,
        user,
        setUser,
        logout,
        firebaseConnected,
        firebaseProjectId,
        selectedZone,
        setSelectedZone,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        zones,
        addCustomZone,
        categories: INITIAL_CATEGORIES,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        vendors,
        registerVendor,
        approveVendor,
        rejectVendor,
        orders,
        placeOrder,
        updateOrderStatus,
        riders,
        registerRider,
        updateRiderLocation,
        reviews,
        addReview,
        toasts,
        addToast,
        removeToast,
        selectedProductModal,
        setSelectedProductModal,
        isCartOpen,
        setIsCartOpen,
        isTrackOrderOpen,
        setIsTrackOrderOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAddZoneModalOpen,
        setIsAddZoneModalOpen,
        activeOrderInvoice,
        setActiveOrderInvoice,
        registeredAccounts,
        saveAccount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
