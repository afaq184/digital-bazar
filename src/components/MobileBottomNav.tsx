import React from 'react';
import {
  Store,
  ShoppingBag,
  MapPin,
  Search,
  User as UserIcon,
  ShieldCheck,
  Building2,
  Truck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MobileBottomNavProps {
  onSearchClick?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onSearchClick }) => {
  const {
    language,
    t,
    activeView,
    setActiveView,
    user,
    cart,
    setIsCartOpen,
    setIsAuthModalOpen,
    setIsAddZoneModalOpen,
    selectedZone,
    setSelectedZone
  } = useApp();

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isAdmin = user?.role === 'admin';
  const isVendor = user?.role === 'vendor';
  const isRider = user?.role === 'rider';

  const handleProfileClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (isAdmin) {
      setActiveView(activeView === 'admin' ? 'store' : 'admin');
    } else if (isVendor) {
      setActiveView(activeView === 'vendor' ? 'store' : 'vendor');
    } else if (isRider) {
      setActiveView(activeView === 'rider' ? 'store' : 'rider');
    } else {
      setActiveView(activeView === 'customer-dashboard' ? 'store' : 'customer-dashboard');
    }
  };

  const getProfileLabel = () => {
    if (!user) return t.login;
    if (isAdmin) return 'Admin';
    if (isVendor) return language === 'ur' ? 'دکان' : 'Vendor';
    if (isRider) return language === 'ur' ? 'رائڈر' : 'Rider';
    return language === 'ur' ? 'اکاؤنٹ' : 'Account';
  };

  const isProfileActive =
    (isAdmin && activeView === 'admin') ||
    (isVendor && activeView === 'vendor') ||
    (isRider && activeView === 'rider') ||
    (!isAdmin && !isVendor && !isRider && activeView === 'customer-dashboard');

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F0F0F]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] pb-[calc(env(safe-area-inset-bottom,0px)+0.375rem)]"
      aria-label="Mobile Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center text-center">
        {/* 1. Store / Home */}
        <button
          onClick={() => setActiveView('store')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeView === 'store'
              ? 'text-[#C5A059]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Store className={`w-5 h-5 ${activeView === 'store' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight truncate max-w-full">
            {language === 'ur' ? 'ہوم' : 'Store'}
          </span>
        </button>

        {/* 2. Bazaars / Zones */}
        <button
          onClick={() => {
            if (activeView !== 'store') {
              setActiveView('store');
            }
            const el = document.getElementById('bazaars-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else {
              setIsAddZoneModalOpen(true);
            }
          }}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            selectedZone !== 'all' ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight truncate max-w-full">
            {language === 'ur' ? 'بازار' : 'Bazaars'}
          </span>
        </button>

        {/* 3. Search */}
        <button
          onClick={() => {
            if (onSearchClick) {
              onSearchClick();
            } else {
              const searchInput = document.getElementById('mobile-search-input');
              if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }}
          className="flex flex-col items-center justify-center py-1 text-neutral-400 hover:text-white transition-all"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight truncate max-w-full">
            {language === 'ur' ? 'تلاش' : 'Search'}
          </span>
        </button>

        {/* 4. Cart with badge */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center py-1 text-neutral-400 hover:text-[#C5A059] relative transition-all"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#C5A059] text-black font-black text-[9px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5 shadow-md">
                {cartTotalCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight truncate max-w-full">
            {language === 'ur' ? 'کارٹ' : 'Cart'}
          </span>
        </button>

        {/* 5. Account / Dashboard */}
        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            isProfileActive ? 'text-[#C5A059]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {isAdmin ? (
            <ShieldCheck className="w-5 h-5" />
          ) : isVendor ? (
            <Building2 className="w-5 h-5" />
          ) : isRider ? (
            <Truck className="w-5 h-5" />
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight truncate max-w-full">
            {getProfileLabel()}
          </span>
        </button>
      </div>
    </nav>
  );
};
