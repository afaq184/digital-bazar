import React, { useState } from 'react';
import {
  Store,
  Search,
  MapPin,
  ShoppingBag,
  Truck,
  Globe,
  User as UserIcon,
  ShieldCheck,
  Building2,
  SlidersHorizontal,
  Menu,
  X,
  LogOut,
  Package,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ZoneId, CategoryId, ActiveView } from '../types';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    role,
    activeView,
    setActiveView,
    user,
    logout,
    selectedZone,
    setSelectedZone,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    cart,
    zones,
    categories,
    setIsCartOpen,
    setIsTrackOrderOpen,
    setIsAuthModalOpen,
    setIsAddZoneModalOpen,
    firebaseConnected,
    firebaseProjectId
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isAdmin = user?.role === 'admin';
  const isVendor = user?.role === 'vendor';
  const isRider = user?.role === 'rider';
  const isCustomer = !user || user.role === 'customer';

  return (
    <header className="sticky top-0 z-40 bg-[#0F0F0F]/95 backdrop-blur-md border-b border-white/10 shadow-2xl">
      {/* Top Banner if logged in as Admin */}
      {isAdmin && (
        <div className="bg-[#1A1508] border-b border-[#C5A059]/30 px-4 py-1.5 text-xs text-[#C5A059]">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#C5A059] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Mode
              </span>
              <span className="text-[11px] text-neutral-300 hidden sm:inline">
                Signed in as Master Admin (<span className="text-white font-mono font-bold">admin@gmail.com</span>).
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Firebase Cloud: Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Upper Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setActiveView('store')}
            className="flex items-center gap-1.5 sm:gap-2 group text-left"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center group-hover:bg-[#C5A059]/20 transition-all shrink-0">
              <Store className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A059]" />
            </div>
            <div>
              <span className="font-serif-display font-bold text-lg sm:text-2xl tracking-wide text-white flex items-center gap-1 sm:gap-1.5">
                {language === 'ur' ? 'ڈجیٹل بازار' : 'Digital Bazar'}
                <span className="text-[9px] sm:text-[10px] uppercase font-sans tracking-wider px-1.5 py-0.5 rounded bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 hidden xs:inline-block">
                  {language === 'ur' ? 'پشاور' : 'Peshawar'}
                </span>
              </span>
              <p className="text-[11px] text-neutral-400 leading-none hidden sm:block">
                {t.appTagline}
              </p>
            </div>
          </button>
        </div>

        {/* Search Bar - Desktop (Visible when in store or customer dashboard) */}
        <div className="hidden md:flex flex-1 max-w-md items-center relative">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-10 py-2 rounded-lg bg-[#151515] border border-white/10 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#C5A059] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Role-Based View Switcher */}
        {/* 1. ADMIN SWITCHER (Admin can see ALL dashboards) */}
        {isAdmin && (
          <div className="hidden lg:flex items-center bg-[#151515] p-1 rounded-xl border border-[#C5A059]/40 gap-1 text-xs">
            <button
              onClick={() => setActiveView('admin')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'admin'
                  ? 'bg-[#C5A059] text-black shadow-md'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>

            <button
              onClick={() => setActiveView('vendor')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'vendor'
                  ? 'bg-[#C5A059] text-black shadow-md'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Vendor View</span>
            </button>

            <button
              onClick={() => setActiveView('store')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'store'
                  ? 'bg-[#C5A059] text-black shadow-md'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Customer Store</span>
            </button>

            <button
              onClick={() => setActiveView('rider')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'rider'
                  ? 'bg-[#C5A059] text-black shadow-md'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Rider View</span>
            </button>
          </div>
        )}

        {/* 2. VENDOR NAVIGATION (Vendor sees only Vendor Portal and Store) - NO ADMIN */}
        {isVendor && !isAdmin && (
          <div className="hidden md:flex items-center bg-[#151515] p-1 rounded-xl border border-white/10 gap-1 text-xs">
            <button
              onClick={() => setActiveView('vendor')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'vendor'
                  ? 'bg-[#C5A059] text-black shadow'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{language === 'ur' ? 'میرا دکاندار ڈیش بورڈ' : 'My Vendor Dashboard'}</span>
            </button>

            <button
              onClick={() => setActiveView('store')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'store'
                  ? 'bg-[#C5A059] text-black shadow'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'مارکیٹ دیکھیں' : 'View Store'}</span>
            </button>
          </div>
        )}

        {/* 3. RIDER NAVIGATION (Rider sees only Rider Portal and Store) - NO ADMIN */}
        {isRider && !isAdmin && (
          <div className="hidden md:flex items-center bg-[#151515] p-1 rounded-xl border border-white/10 gap-1 text-xs">
            <button
              onClick={() => setActiveView('rider')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'rider'
                  ? 'bg-[#C5A059] text-black shadow'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{language === 'ur' ? 'رائڈر پورٹل' : 'Rider Delivery Portal'}</span>
            </button>

            <button
              onClick={() => setActiveView('store')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'store'
                  ? 'bg-[#C5A059] text-black shadow'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <span>{language === 'ur' ? 'مارکیٹ' : 'Market Store'}</span>
            </button>
          </div>
        )}

        {/* 4. CUSTOMER NAVIGATION (Customer sees Store and Customer Dashboard) - NO ADMIN, NO VENDOR */}
        {isCustomer && !isAdmin && (
          <div className="hidden md:flex items-center bg-[#151515] p-1 rounded-xl border border-white/10 gap-1 text-xs">
            <button
              onClick={() => setActiveView('store')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeView === 'store'
                  ? 'bg-[#C5A059] text-black shadow'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              {language === 'ur' ? 'پشاور مارکیٹ' : 'Browse Bazaars'}
            </button>

            <button
              onClick={() => setActiveView('customer-dashboard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'customer-dashboard'
                  ? 'bg-[#C5A059] text-black shadow'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'میرے آرڈرز و ڈیش بورڈ' : 'My Orders & Dashboard'}</span>
            </button>
          </div>
        )}

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#151515] border border-white/10 hover:border-[#C5A059]/40 text-xs font-medium text-neutral-200 transition-all shrink-0"
            title="Switch Language / زبان تبدیل کریں"
          >
            <Globe className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold">{language === 'en' ? 'اردو' : 'EN'}</span>
          </button>

          {/* Order Tracking Button */}
          <button
            onClick={() => setIsTrackOrderOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151515] border border-white/10 hover:border-[#C5A059]/40 text-xs font-medium text-neutral-200 transition-all shrink-0"
          >
            <Truck className="w-4 h-4 text-[#C5A059]" />
            <span className="hidden md:inline">{t.trackOrder}</span>
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-1.5 sm:p-2 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] hover:bg-[#C5A059]/20 transition-all shrink-0"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#C5A059] text-black font-black text-[9px] sm:text-[10px] min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] rounded-full flex items-center justify-center px-0.5 sm:px-1 shadow-md">
                {cartTotalCount}
              </span>
            )}
          </button>

          {/* User Account / Auth Dropdown */}
          <div className="relative shrink-0">
            {user ? (
              <div>
                {/* Mobile version: compact, never clips or overflows */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="sm:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#151515] border border-white/10 hover:border-[#C5A059]/40 text-xs font-medium text-neutral-200 transition-all shrink-0"
                  title={`${user.name} (${user.role})`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                  <span className="font-bold max-w-[45px] truncate text-[11px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shrink-0"
                    title={`Role: ${user.role}`}
                  />
                  <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
                </button>

                {/* Tablet / Desktop version: full title & role badge */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151515] border border-white/10 hover:border-[#C5A059]/40 text-xs font-medium text-neutral-200 transition-all shrink-0"
                >
                  <UserIcon className="w-4 h-4 text-[#C5A059]" />
                  <span className="font-bold max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-[#C5A059]/10 text-[#C5A059]">
                    {user.role}
                  </span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-xl bg-[#151515] border border-white/10 shadow-2xl p-2 z-50 space-y-1 text-xs">
                    <div className="p-2 border-b border-white/10">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{user.email || user.phone}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#C5A059]/10 text-[#C5A059]">
                        Role: {user.role}
                      </span>
                    </div>

                    {/* Quick navigation based on role */}
                    {isCustomer && (
                      <button
                        onClick={() => {
                          setActiveView('customer-dashboard');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left p-2 rounded hover:bg-[#1F1F1F] text-neutral-200 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-[#C5A059]" />
                        <span>My Customer Orders</span>
                      </button>
                    )}

                    {isVendor && (
                      <button
                        onClick={() => {
                          setActiveView('vendor');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left p-2 rounded hover:bg-[#1F1F1F] text-neutral-200 flex items-center gap-2"
                      >
                        <Store className="w-4 h-4 text-[#C5A059]" />
                        <span>My Vendor Dashboard</span>
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setActiveView('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left p-2 rounded hover:bg-[#1F1F1F] text-[#C5A059] font-bold flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Admin Control Panel</span>
                      </button>
                    )}

                    {isRider && (
                      <button
                        onClick={() => {
                          setActiveView('rider');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left p-2 rounded hover:bg-[#1F1F1F] text-neutral-200 flex items-center gap-2"
                      >
                        <Truck className="w-4 h-4 text-[#C5A059]" />
                        <span>Delivery Rider Portal</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left p-2 rounded hover:bg-rose-500/10 text-rose-400 flex items-center gap-2 border-t border-white/5 pt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="sm:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs transition-all shadow-sm shrink-0"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{t.login}</span>
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs transition-all shadow-sm shrink-0"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{t.login}</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 text-neutral-300 hover:text-white shrink-0"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Always easily accessible on mobile & APK) */}
      <div className="md:hidden px-4 pb-2.5 pt-0.5">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="mobile-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ur' ? 'پشاور مارکیٹ سے تلاش کریں (گائے، چپل، قہوہ...)' : 'Search Peshawar (Beef, Chappal, Qahwa...)'}
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#151515] border border-white/10 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#C5A059] transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-Header Bar: Zone & Category Selectors (Always visible in store mode) */}
      {activeView === 'store' && (
        <div className="bg-[#0A0A0A]/95 border-t border-white/10 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
            {/* Zone Selector Dropdown */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
              <div className="flex items-center gap-1 text-[#C5A059] font-medium shrink-0">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase tracking-wider">{t.selectZone}:</span>
              </div>
              <select
                value={selectedZone}
                onChange={(e) => {
                  if (e.target.value === '__ADD_NEW_ZONE__') {
                    setIsAddZoneModalOpen(true);
                  } else {
                    setSelectedZone(e.target.value as ZoneId | 'all');
                  }
                }}
                className="bg-[#151515] text-neutral-100 border border-white/10 rounded px-2.5 py-1 focus:outline-none focus:border-[#C5A059] text-xs font-medium cursor-pointer shrink-0 max-w-[150px] sm:max-w-none truncate"
              >
                <option value="all">{t.allZones}</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {language === 'ur' ? zone.nameUr : zone.nameEn} {zone.isCustom ? '★' : ''}
                  </option>
                ))}
                <option value="__ADD_NEW_ZONE__">
                  + {language === 'ur' ? 'نیا بازار شامل کریں...' : 'Add New Bazaar / Zone...'}
                </option>
              </select>

              <button
                type="button"
                onClick={() => setIsAddZoneModalOpen(true)}
                className="px-2 py-1 rounded bg-[#C5A059]/10 hover:bg-[#C5A059] text-[#C5A059] hover:text-black border border-[#C5A059]/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                title={language === 'ur' ? 'پشاور کا نیا بازار شامل کریں' : 'Add any custom Peshawar bazaar zone'}
              >
                <span>+</span>
                <span className="whitespace-nowrap">{language === 'ur' ? 'نیا بازار' : 'Add Bazaar'}</span>
              </button>
            </div>

            {/* Categories Horizontal Scroll / Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'bg-[#151515] text-neutral-300 hover:bg-[#1A1A1A] hover:text-white border border-white/5'
                }`}
              >
                {t.allCategories}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as CategoryId)}
                  className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[#C5A059] text-black font-bold'
                      : 'bg-[#151515] text-neutral-300 hover:bg-[#1A1A1A] hover:text-white border border-white/5'
                  }`}
                >
                  {language === 'ur' ? cat.nameUr : cat.nameEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0F0F0F] border-b border-white/10 px-4 py-4 space-y-3">
          <div className="space-y-2">
            {/* View links according to role */}
            {isAdmin && (
              <div className="p-2 rounded-xl bg-[#151515] border border-[#C5A059]/40 space-y-1">
                <p className="text-[11px] font-bold text-[#C5A059] uppercase">Admin Platform Views:</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => {
                      setActiveView('admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded bg-[#0A0A0A] font-bold text-left text-white"
                  >
                    🛡️ Admin Panel
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('vendor');
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded bg-[#0A0A0A] font-bold text-left text-white"
                  >
                    🏪 Vendor View
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('store');
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded bg-[#0A0A0A] font-bold text-left text-white"
                  >
                    🛍️ Customer Store
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('rider');
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded bg-[#0A0A0A] font-bold text-left text-white"
                  >
                    🏍️ Rider Portal
                  </button>
                </div>
              </div>
            )}

            {isVendor && !isAdmin && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setActiveView('vendor');
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 rounded bg-[#151515] font-bold text-white border border-white/10"
                >
                  🏪 Vendor Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveView('store');
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 rounded bg-[#151515] font-bold text-white border border-white/10"
                >
                  🛍️ Store View
                </button>
              </div>
            )}

            {isCustomer && !isAdmin && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setActiveView('store');
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 rounded bg-[#151515] font-bold text-white border border-white/10"
                >
                  🛍️ Browse Store
                </button>
                <button
                  onClick={() => {
                    setActiveView('customer-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 rounded bg-[#151515] font-bold text-white border border-white/10"
                >
                  📦 My Orders
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setIsTrackOrderOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#151515] border border-white/10 text-xs text-neutral-200"
          >
            <Truck className="w-4 h-4 text-[#C5A059]" />
            <span>{t.trackOrder}</span>
          </button>
        </div>
      )}
    </header>
  );
};
