import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  Store,
  ShieldCheck,
  ArrowRight,
  Phone,
  MapPin,
  Truck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, ZoneId, RegisteredAccount } from '../types';
import {
  loginWithGooglePopup,
  registerWithFirebaseEmailPassword,
  loginWithFirebaseEmailPassword,
  getUserFromFirestore
} from '../firebase';

export const AuthModal: React.FC = () => {
  const {
    language,
    t,
    isAuthModalOpen,
    setIsAuthModalOpen,
    setRole,
    setActiveView,
    setUser,
    registerVendor,
    registerRider,
    registeredAccounts,
    saveAccount,
    zones,
    addToast
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [authRole, setAuthRole] = useState<UserRole>('customer');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Login form field: Can be either Gmail/Email OR Phone Number
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Vendor specific fields
  const [shopNameEn, setShopNameEn] = useState('');
  const [shopNameUr, setShopNameUr] = useState('');
  const [vendorZone, setVendorZone] = useState<ZoneId>('kissa-khwani');
  const [marketAddressEn, setMarketAddressEn] = useState('');

  // Rider specific fields
  const [vehicleNo, setVehicleNo] = useState('');
  const [riderZone, setRiderZone] = useState<ZoneId>('hayatabad');

  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setErrorMessage('');
      const googleUser = await loginWithGooglePopup();
      if (!googleUser || !googleUser.email) {
        throw new Error('Google sign-in did not return email');
      }

      const emailLower = googleUser.email.toLowerCase();
      // Check if admin
      if (emailLower === 'admin@gmail.com') {
        const adminAccount: RegisteredAccount = {
          id: googleUser.uid,
          name: googleUser.displayName || 'Platform Administrator',
          email: emailLower,
          role: 'admin'
        };
        saveAccount(adminAccount);
        setUser(adminAccount);
        setRole('admin');
        setActiveView('admin');
        setIsAuthModalOpen(false);
        addToast(
          language === 'ur'
            ? 'گوگل کے ذریعے بطور ایڈمن لاگ ان کامیاب!'
            : 'Logged in as Admin with Google Account!',
          'success'
        );
        return;
      }

      // Check existing account
      const existing = registeredAccounts.find(
        (a) => a.email && a.email.toLowerCase() === emailLower
      );

      if (existing) {
        if (existing.role === 'vendor' && !existing.vendorId) {
          existing.vendorId = 'v-' + existing.id;
          existing.shopNameEn = existing.shopNameEn || existing.name;
          saveAccount(existing);
        }
        setUser(existing);
        setRole(existing.role);
        if (existing.role === 'admin') setActiveView('admin');
        else if (existing.role === 'vendor') setActiveView('vendor');
        else if (existing.role === 'rider') setActiveView('rider');
        else setActiveView('store');
        setIsAuthModalOpen(false);
        addToast(
          language === 'ur'
            ? `گوگل کے ذریعے خوش آمدید (${existing.name})`
            : `Welcome back via Google (${existing.name})`,
          'success'
        );
      } else {
        // Create new account
        const newAcc: RegisteredAccount = {
          id: googleUser.uid,
          name: googleUser.displayName || emailLower.split('@')[0],
          email: emailLower,
          role: authRole,
          vendorId: authRole === 'vendor' ? 'v-' + googleUser.uid : undefined,
          shopNameEn: authRole === 'vendor' ? (googleUser.displayName || emailLower.split('@')[0]) : undefined,
          createdAt: new Date().toISOString()
        };
        saveAccount(newAcc);
        setUser(newAcc);
        setRole(authRole);
        if (authRole === 'vendor') setActiveView('vendor');
        else if (authRole === 'rider') setActiveView('rider');
        else setActiveView('store');
        setIsAuthModalOpen(false);
        addToast(
          language === 'ur'
            ? `گوگل اکاؤنٹ سے لاگ ان کامیاب! (${emailLower})`
            : `Signed in with Google (${emailLower})!`,
          'success'
        );
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setErrorMessage(
        errMsg || (language === 'ur' ? 'گوگل لاگ ان ناکام رہا' : 'Google sign-in failed')
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const identifier = loginIdentifier.trim();
    if (!identifier) {
      setErrorMessage(
        language === 'ur'
          ? 'برائے مہربانی اپنا فون نمبر یا جی میل ایڈریس درج کریں'
          : 'Please enter your Phone number or Gmail address'
      );
      return;
    }

    if (!loginPassword) {
      setErrorMessage(
        language === 'ur' ? 'پاس ورڈ درج کریں' : 'Please enter your password'
      );
      return;
    }

    // 1. Check Master Admin Login (admin@gmail.com / 123)
    if (identifier.toLowerCase() === 'admin@gmail.com') {
      if (loginPassword === '123') {
        const adminUser: RegisteredAccount = {
          id: 'u-admin-123',
          name: 'Platform Administrator',
          email: 'admin@gmail.com',
          phone: '03001234567',
          role: 'admin'
        };
        saveAccount(adminUser);
        setUser(adminUser);
        setRole('admin');
        setActiveView('admin');
        setIsAuthModalOpen(false);
        addToast(
          language === 'ur'
            ? 'بطور ایڈمن لاگ ان کامیاب ہو گیا!'
            : 'Logged in as System Administrator (admin@gmail.com)',
          'success'
        );
        return;
      } else {
        setErrorMessage(
          language === 'ur'
            ? 'غلط ایڈمن پاسورڈ! صحیح پاسورڈ 123 ہے'
            : 'Invalid password for admin@gmail.com! Please enter correct password (123).'
        );
        return;
      }
    }

    // 2. Check if user already registered by Phone OR Email/Gmail in local/Firestore accounts
    const cleanPhone = identifier.replace(/\D/g, '');
    const isEmailInput = identifier.includes('@');

    const matchedAccount = registeredAccounts.find((acc) => {
      if (isEmailInput && acc.email) {
        return acc.email.toLowerCase() === identifier.toLowerCase();
      }
      if (acc.phone) {
        const accClean = acc.phone.replace(/\D/g, '');
        return accClean && cleanPhone && accClean === cleanPhone;
      }
      return false;
    });

    if (matchedAccount) {
      if (matchedAccount.password && matchedAccount.password !== loginPassword) {
        setErrorMessage(
          language === 'ur'
            ? 'غلط پاس ورڈ! برائے مہربانی درست پاس ورڈ درج کریں'
            : 'Incorrect password. Please enter the correct password for this account.'
        );
        return;
      }

      // Log in existing account
      if (matchedAccount.role === 'vendor' && !matchedAccount.vendorId) {
        matchedAccount.vendorId = 'v-' + matchedAccount.id;
        matchedAccount.shopNameEn = matchedAccount.shopNameEn || matchedAccount.name;
        saveAccount(matchedAccount);
      }
      setUser(matchedAccount);
      setRole(matchedAccount.role);
      if (matchedAccount.role === 'admin') setActiveView('admin');
      else if (matchedAccount.role === 'vendor') setActiveView('vendor');
      else if (matchedAccount.role === 'rider') setActiveView('rider');
      else setActiveView('store');

      setIsAuthModalOpen(false);
      addToast(
        language === 'ur'
          ? `خوش آمدید! لاگ ان کامیاب (${matchedAccount.name})`
          : `Welcome back! Logged in as ${matchedAccount.name}`,
        'success'
      );
      return;
    }

    // 3. Try Firebase Auth with Email if user provided email
    setAuthLoading(true);
    let firebaseUserUid: string | null = null;
    if (isEmailInput) {
      try {
        const fbUser = await loginWithFirebaseEmailPassword(identifier.toLowerCase(), loginPassword);
        if (fbUser) {
          firebaseUserUid = fbUser.uid;
          const cloudDoc = await getUserFromFirestore(fbUser.uid);
          if (cloudDoc) {
            setUser(cloudDoc);
            setRole(cloudDoc.role);
            if (cloudDoc.role === 'admin') setActiveView('admin');
            else if (cloudDoc.role === 'vendor') setActiveView('vendor');
            else if (cloudDoc.role === 'rider') setActiveView('rider');
            else setActiveView('store');
            setIsAuthModalOpen(false);
            addToast(
              language === 'ur'
                ? `فائر بیس لاگ ان کامیاب! (${cloudDoc.name})`
                : `Firebase login successful! (${cloudDoc.name})`,
              'success'
            );
            setAuthLoading(false);
            return;
          }
        }
      } catch (fbErr: any) {
        console.warn('Firebase email login notice:', fbErr?.message || fbErr);
      }
    }

    // 4. If account not found: register/login new user directly and save to Firebase Firestore!
    const generatedVendorId = authRole === 'vendor' ? 'v-' + (firebaseUserUid || Date.now()) : undefined;
    const vendorNameStr = isEmailInput ? identifier.split('@')[0] : `Shop ${identifier.slice(-4)}`;

    const newAccount: RegisteredAccount = {
      id: firebaseUserUid || 'u-' + Date.now(),
      name: isEmailInput ? identifier.split('@')[0] : `User ${identifier.slice(-4)}`,
      email: isEmailInput ? identifier : undefined,
      phone: !isEmailInput ? identifier : undefined,
      password: loginPassword,
      role: authRole,
      vendorId: generatedVendorId,
      shopNameEn: authRole === 'vendor' ? vendorNameStr : undefined,
      createdAt: new Date().toISOString()
    };

    saveAccount(newAccount);
    setUser(newAccount);
    setRole(authRole);
    if (authRole === 'vendor') setActiveView('vendor');
    else if (authRole === 'rider') setActiveView('rider');
    else setActiveView('store');

    setAuthLoading(false);
    setIsAuthModalOpen(false);
    addToast(
      language === 'ur'
        ? `آپ کا نیا اکاؤنٹ بن گیا اور فائر بیس پر محفوظ ہو گیا! (${identifier})`
        : `Account created & saved to Firebase Firestore! (${identifier})`,
      'success'
    );
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage(language === 'ur' ? 'پورا نام درج کریں' : 'Please enter your full name');
      return;
    }

    // At least one of Phone or Gmail must be provided
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (!cleanPhone && !cleanEmail) {
      setErrorMessage(
        language === 'ur'
          ? 'برائے مہربانی موبائل فون نمبر یا جی میل ایڈریس درج کریں'
          : 'Please enter at least a Phone Number or Gmail Address'
      );
      return;
    }

    if (!password || password.length < 3) {
      setErrorMessage(
        language === 'ur'
          ? 'پاس ورڈ کم از کم 3 حروف کا ہونا چاہیے'
          : 'Password must be at least 3 characters'
      );
      return;
    }

    setAuthLoading(true);

    // If Email provided, register with Firebase Auth
    let fbUid: string | null = null;
    if (cleanEmail) {
      try {
        const fbUser = await registerWithFirebaseEmailPassword(cleanEmail, password, name.trim());
        if (fbUser) {
          fbUid = fbUser.uid;
        }
      } catch (fbErr: any) {
        console.warn('Firebase Auth signup notice:', fbErr?.message || fbErr);
        // If email already in Firebase Auth, continue with linking
      }
    }

    const userId = fbUid || 'u-' + Date.now();

    // Vendor Registration
    if (authRole === 'vendor') {
      if (!shopNameEn.trim()) {
        setErrorMessage(
          language === 'ur' ? 'دکان کا نام درج کرنا ضروری ہے' : 'Shop name is required for vendor registration'
        );
        setAuthLoading(false);
        return;
      }

      const newVendor = registerVendor({
        shopNameEn: shopNameEn.trim(),
        shopNameUr: shopNameUr.trim() || shopNameEn.trim(),
        ownerName: name.trim(),
        phone: cleanPhone || '03001234567',
        whatsapp: cleanPhone || '03001234567',
        email: cleanEmail || `${shopNameEn.toLowerCase().replace(/\s+/g, '')}@digitalbazar.pk`,
        zone: vendorZone,
        marketAddressEn: marketAddressEn.trim() || 'Peshawar Central Market',
        marketAddressUr: marketAddressEn.trim() || 'پشاور مارکیٹ',
        isVerified: true
      });

      const vendorAccount: RegisteredAccount = {
        id: userId,
        name: name.trim(),
        email: cleanEmail || undefined,
        phone: cleanPhone || undefined,
        password,
        role: 'vendor',
        vendorId: newVendor.id,
        shopNameEn: shopNameEn.trim(),
        zone: vendorZone,
        createdAt: new Date().toISOString()
      };

      saveAccount(vendorAccount);
      setUser(vendorAccount);
      setRole('vendor');
      setActiveView('vendor');
      setAuthLoading(false);
      setIsAuthModalOpen(false);
      addToast(
        language === 'ur'
          ? 'دکاندار اکاؤنٹ کامیابی سے بن گیا اور فائر بیس پر محفوظ ہو گیا!'
          : 'Vendor account registered & saved to Firebase successfully!',
        'success'
      );
      return;
    }

    // Rider Registration
    if (authRole === 'rider') {
      const newRider = registerRider({
        name: name.trim(),
        phone: cleanPhone || '03001234567',
        vehicleNo: vehicleNo.trim() || 'KPK-2026',
        assignedZone: riderZone
      });

      const riderAccount: RegisteredAccount = {
        id: userId,
        name: name.trim(),
        email: cleanEmail || undefined,
        phone: cleanPhone || undefined,
        password,
        role: 'rider',
        vehicleNo: vehicleNo.trim() || 'KPK-2026',
        zone: riderZone,
        createdAt: new Date().toISOString()
      };

      saveAccount(riderAccount);
      setUser(riderAccount);
      setRole('rider');
      setActiveView('rider');
      setAuthLoading(false);
      setIsAuthModalOpen(false);
      addToast(
        language === 'ur'
          ? 'رائڈر اکاؤنٹ کامیابی سے بن گیا اور فائر بیس پر محفوظ ہو گیا!'
          : 'Rider account registered & saved to Firebase successfully!',
        'success'
      );
      return;
    }

    // Customer Registration
    const customerAccount: RegisteredAccount = {
      id: userId,
      name: name.trim(),
      email: cleanEmail || undefined,
      phone: cleanPhone || undefined,
      password,
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    saveAccount(customerAccount);
    setUser(customerAccount);
    setRole('customer');
    setActiveView('store');
    setAuthLoading(false);
    setIsAuthModalOpen(false);
    addToast(
      language === 'ur'
        ? 'کسٹمر اکاؤنٹ کامیابی سے بن گیا اور فائر بیس پر محفوظ ہو گیا!'
        : 'Customer Account created & saved to Firebase successfully!',
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#151515] border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl relative text-[#E5E5E5] my-2 sm:my-6 p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[96vh] sm:max-h-[92vh] overflow-y-auto">
        {/* Header & Close */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-serif-display font-bold text-2xl text-white">
              {mode === 'login'
                ? language === 'ur'
                  ? 'لاگ ان کریں'
                  : 'Welcome Back / Log In'
                : language === 'ur'
                ? 'نیا اکاؤنٹ بنائیں'
                : 'Create Account / Sign Up'}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {language === 'ur'
                ? 'موبائل نمبر یا جی میل کے ذریعے لاگ ان اور رجسٹر کریں'
                : 'Sign in or register easily with Mobile Phone Number or Gmail'}
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[#1A1A1A] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher: Login vs Sign Up */}
        <div className="flex rounded-xl bg-[#0A0A0A] p-1 border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[#C5A059] text-black shadow-md font-extrabold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {language === 'ur' ? 'لاگ ان (موبائل یا جی میل)' : 'Log In (Phone or Gmail)'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-[#C5A059] text-black shadow-md font-extrabold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {language === 'ur' ? 'نیا اکاؤنٹ (Sign Up)' : 'Sign Up / New Account'}
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Account Role Selector */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            {language === 'ur' ? 'اکاؤنٹ کی قسم منتخب کریں:' : 'Select Account Type:'}
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setAuthRole('customer')}
              className={`p-2.5 rounded-xl border font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                authRole === 'customer'
                  ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059]'
                  : 'bg-[#0A0A0A] border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{language === 'ur' ? 'خریدار' : 'Customer'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthRole('vendor')}
              className={`p-2.5 rounded-xl border font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                authRole === 'vendor'
                  ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059]'
                  : 'bg-[#0A0A0A] border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{language === 'ur' ? 'دکاندار' : 'Vendor / Shop'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthRole('rider')}
              className={`p-2.5 rounded-xl border font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                authRole === 'rider'
                  ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059]'
                  : 'bg-[#0A0A0A] border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{language === 'ur' ? 'ڈلیوری رائڈر' : 'Delivery Rider'}</span>
            </button>
          </div>
        </div>

        {/* Google One-Click Sign-In via Firebase */}
        <button
          type="button"
          disabled={googleLoading}
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md border border-neutral-300 disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>
            {googleLoading
              ? (language === 'ur' ? 'رابطہ ہو رہا ہے...' : 'Connecting to Google...')
              : (language === 'ur' ? 'گوگل اکاؤنٹ سے ایک کلک لاگ ان' : 'Sign in with Google')}
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
            {language === 'ur' ? 'یا فون / جی میل کے ذریعے' : 'Or with Phone / Gmail'}
          </span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        {/* 1. LOGIN FORM (Supports either Gmail OR Mobile Phone Number) */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                {language === 'ur'
                  ? 'موبائل نمبر یا جی میل ایڈریس *'
                  : 'Mobile Phone Number or Gmail / Email *'}
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="03001234567 or user@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5A059] text-xs font-medium"
                />
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">
                {language === 'ur'
                  ? 'آپ نے جس نمبر یا جی میل سے اکاؤنٹ بنایا تھا وہ درج کریں۔'
                  : 'Enter the mobile number or Gmail address associated with your account.'}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">{t.password} *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-1.5"
            >
              <span>{t.login}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* 2. SIGN UP FORM (Register with Phone OR Gmail OR Both) */
          <form onSubmit={handleSignUpSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                {language === 'ur' ? 'پورا نام *' : 'Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Haji Gul Khan"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  {language === 'ur' ? 'موبائل نمبر (فون یا واٹس ایپ)' : 'Mobile Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  {language === 'ur' ? 'جی میل / ای میل ایڈریس' : 'Gmail / Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[#C5A059] bg-[#C5A059]/10 p-2 rounded-lg border border-[#C5A059]/20">
              {language === 'ur'
                ? 'نوٹ: آپ اپنے موبائل نمبر یا جی میل ایڈریس میں سے کسی ایک یا دونوں سے رجسٹر ہو سکتے ہیں۔'
                : 'Note: You can register using your Phone Number, Gmail address, or both.'}
            </p>

            {/* Vendor Specific Registration Fields */}
            {authRole === 'vendor' && (
              <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-2.5">
                <p className="font-bold text-[#C5A059] flex items-center gap-1 text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>{language === 'ur' ? 'دکان کی تفصیلات:' : 'Vendor Shop Details:'}</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Shop Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={shopNameEn}
                      onChange={(e) => setShopNameEn(e.target.value)}
                      placeholder="e.g. Peshawar Chappal Store"
                      className="w-full p-2 rounded-lg bg-[#151515] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Shop Name (Urdu / اختیاری)
                    </label>
                    <input
                      type="text"
                      value={shopNameUr}
                      onChange={(e) => setShopNameUr(e.target.value)}
                      placeholder="مثلاً پشاور چپل اسٹور"
                      className="w-full p-2 rounded-lg bg-[#151515] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Market Zone *
                    </label>
                    <select
                      value={vendorZone}
                      onChange={(e) => setVendorZone(e.target.value as ZoneId)}
                      className="w-full p-2 rounded-lg bg-[#151515] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                    >
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.nameEn} ({z.nameUr})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Shop / Market Address
                    </label>
                    <input
                      type="text"
                      value={marketAddressEn}
                      onChange={(e) => setMarketAddressEn(e.target.value)}
                      placeholder="Shop #12, Kissa Khwani Bazaar"
                      className="w-full p-2 rounded-lg bg-[#151515] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Rider Specific Registration Fields */}
            {authRole === 'rider' && (
              <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-2.5">
                <p className="font-bold text-[#C5A059] flex items-center gap-1 text-xs">
                  <Truck className="w-4 h-4" />
                  <span>{language === 'ur' ? 'ڈلیوری رائڈر تفصیلات:' : 'Delivery Rider Details:'}</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Bike / Vehicle No *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      placeholder="e.g. KPK-9821"
                      className="w-full p-2 rounded-lg bg-[#151515] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Assigned Peshawar Zone
                    </label>
                    <select
                      value={riderZone}
                      onChange={(e) => setRiderZone(e.target.value as ZoneId)}
                      className="w-full p-2 rounded-lg bg-[#151515] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                    >
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">{t.password} *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-1.5"
            >
              <span>{language === 'ur' ? 'رجسٹر کریں اور اکاؤنٹ بنائیں' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
