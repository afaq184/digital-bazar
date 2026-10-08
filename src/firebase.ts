import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Product, Vendor, Order, Rider, RegisteredAccount, Review, Zone } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Sanitizes object data before writing to Firestore.
 * Removes `undefined` values recursively because Firestore strictly rejects undefined.
 */
export function sanitizeForFirestore<T>(data: T): any {
  if (data === null || data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item));
  }
  if (typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        clean[key] = sanitizeForFirestore(val);
      }
    }
    return clean;
  }
  return data;
}

// Test Connection on startup
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: client is offline.');
    } else {
      console.warn('Initial connection probe completed:', error);
    }
    return false;
  }
}

// ==========================================
// 1. PRODUCTS CRUD & REAL-TIME SYNC
// ==========================================
export const subscribeProducts = (
  onUpdate: (products: Product[]) => void,
  onError?: (err: unknown) => void
) => {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Product);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Products listener notice:', error);
      if (onError) onError(error);
    }
  );
};

export const saveProductToFirestore = async (product: Product) => {
  const path = `products/${product.id}`;
  try {
    const cleanData = sanitizeForFirestore(product);
    await setDoc(doc(db, 'products', product.id), cleanData);
    console.log('Firebase: Product saved successfully to Firestore ->', product.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateProductInFirestore = async (id: string, updates: Partial<Product>) => {
  const path = `products/${id}`;
  try {
    const cleanData = sanitizeForFirestore(updates);
    await updateDoc(doc(db, 'products', id), cleanData);
    console.log('Firebase: Product updated in Firestore ->', id);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteProductFromFirestore = async (id: string) => {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
    console.log('Firebase: Product deleted from Firestore ->', id);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// ==========================================
// 2. VENDORS CRUD & REAL-TIME SYNC
// ==========================================
export const subscribeVendors = (
  onUpdate: (vendors: Vendor[]) => void,
  onError?: (err: unknown) => void
) => {
  const path = 'vendors';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Vendor[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Vendor);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Vendors listener notice:', error);
      if (onError) onError(error);
    }
  );
};

export const saveVendorToFirestore = async (vendor: Vendor) => {
  const path = `vendors/${vendor.id}`;
  try {
    const cleanData = sanitizeForFirestore(vendor);
    await setDoc(doc(db, 'vendors', vendor.id), cleanData);
    console.log('Firebase: Vendor saved successfully to Firestore ->', vendor.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateVendorInFirestore = async (id: string, updates: Partial<Vendor>) => {
  const path = `vendors/${id}`;
  try {
    const cleanData = sanitizeForFirestore(updates);
    await updateDoc(doc(db, 'vendors', id), cleanData);
    console.log('Firebase: Vendor updated in Firestore ->', id);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteVendorFromFirestore = async (id: string) => {
  const path = `vendors/${id}`;
  try {
    await deleteDoc(doc(db, 'vendors', id));
    console.log('Firebase: Vendor deleted from Firestore ->', id);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// ==========================================
// 2B. BAZAARS & ZONES CRUD & REAL-TIME SYNC
// ==========================================
export const subscribeZones = (
  onUpdate: (zones: Zone[]) => void,
  onError?: (err: unknown) => void
) => {
  const path = 'zones';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Zone[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Zone);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Zones listener notice:', error);
      if (onError) onError(error);
    }
  );
};

export const saveZoneToFirestore = async (zone: Zone) => {
  const path = `zones/${zone.id}`;
  try {
    const cleanData = sanitizeForFirestore(zone);
    await setDoc(doc(db, 'zones', zone.id), cleanData);
    console.log('Firebase: Zone saved successfully to Firestore ->', zone.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteZoneFromFirestore = async (id: string) => {
  const path = `zones/${id}`;
  try {
    await deleteDoc(doc(db, 'zones', id));
    console.log('Firebase: Zone deleted from Firestore ->', id);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// ==========================================
// 3. ORDERS CRUD & REAL-TIME SYNC
// ==========================================
export const subscribeOrders = (
  onUpdate: (orders: Order[]) => void,
  onError?: (err: unknown) => void
) => {
  const path = 'orders';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Order);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Orders listener notice:', error);
      if (onError) onError(error);
    }
  );
};

export const saveOrderToFirestore = async (order: Order) => {
  const path = `orders/${order.id}`;
  try {
    const cleanData = sanitizeForFirestore(order);
    await setDoc(doc(db, 'orders', order.id), cleanData);
    console.log('Firebase: Order saved successfully to Firestore ->', order.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateOrderInFirestore = async (id: string, updates: Partial<Order>) => {
  const path = `orders/${id}`;
  try {
    const cleanData = sanitizeForFirestore(updates);
    await updateDoc(doc(db, 'orders', id), cleanData);
    console.log('Firebase: Order updated in Firestore ->', id);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// ==========================================
// 4. RIDERS CRUD & REAL-TIME SYNC
// ==========================================
export const subscribeRiders = (
  onUpdate: (riders: Rider[]) => void,
  onError?: (err: unknown) => void
) => {
  const path = 'riders';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Rider[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Rider);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Riders listener notice:', error);
      if (onError) onError(error);
    }
  );
};

export const saveRiderToFirestore = async (rider: Rider) => {
  const path = `riders/${rider.id}`;
  try {
    const cleanData = sanitizeForFirestore(rider);
    await setDoc(doc(db, 'riders', rider.id), cleanData);
    console.log('Firebase: Rider saved successfully to Firestore ->', rider.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateRiderInFirestore = async (id: string, updates: Partial<Rider>) => {
  const path = `riders/${id}`;
  try {
    const cleanData = sanitizeForFirestore(updates);
    await updateDoc(doc(db, 'riders', id), cleanData);
    console.log('Firebase: Rider updated in Firestore ->', id);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// ==========================================
// 5. USER ACCOUNTS CRUD & REAL-TIME SYNC
// ==========================================
export const subscribeUsers = (
  onUpdate: (users: RegisteredAccount[]) => void,
  onError?: (err: unknown) => void
) => {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: RegisteredAccount[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as RegisteredAccount);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Users listener notice:', error);
      if (onError) onError(error);
    }
  );
};

export const saveUserToFirestore = async (account: RegisteredAccount) => {
  const path = `users/${account.id}`;
  try {
    const cleanData = sanitizeForFirestore(account);
    await setDoc(doc(db, 'users', account.id), cleanData);
    console.log('Firebase: User account saved successfully to Firestore ->', account.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserFromFirestore = async (userId: string): Promise<RegisteredAccount | null> => {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as RegisteredAccount;
    }
    return null;
  } catch (error) {
    console.warn('Could not fetch user document:', error);
    return null;
  }
};

// ==========================================
// 6. REVIEWS CRUD & REAL-TIME SYNC
// ==========================================
export const subscribeReviews = (
  onUpdate: (reviews: Review[]) => void,
  onError?: (err: unknown) => void
) => {
  const path = 'reviews';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Review[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Review);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Reviews listener notice:', error);
      if (onError) onError(error);
    }
  );
};

export const saveReviewToFirestore = async (review: Review) => {
  const path = `reviews/${review.id}`;
  try {
    const cleanData = sanitizeForFirestore(review);
    await setDoc(doc(db, 'reviews', review.id), cleanData);
    console.log('Firebase: Review saved successfully to Firestore ->', review.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// ==========================================
// 7. FIREBASE AUTHENTICATION HELPERS
// ==========================================

/**
 * Creates user in Firebase Auth with email and password
 */
export const registerWithFirebaseEmailPassword = async (
  email: string,
  pass: string,
  displayName?: string
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && userCredential.user) {
    try {
      await updateProfile(userCredential.user, { displayName });
    } catch (e) {
      console.warn('Profile name update error:', e);
    }
  }
  return userCredential.user;
};

/**
 * Signs in user in Firebase Auth with email and password
 */
export const loginWithFirebaseEmailPassword = async (email: string, pass: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
};

/**
 * Google Login Pop-up
 */
export const loginWithGooglePopup = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
};

/**
 * Firebase Sign Out
 */
export const logoutFirebaseAuth = async () => {
  try {
    await signOut(auth);
    console.log('Firebase Auth signed out');
  } catch (error) {
    console.error('Sign-out error:', error);
  }
};

/**
 * Auth state change subscriber
 */
export const subscribeAuthState = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
