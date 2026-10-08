import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { OrderInvoiceModal } from './components/OrderInvoiceModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { VendorDashboard } from './components/VendorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RiderDashboard } from './components/RiderDashboard';
import { AuthModal } from './components/AuthModal';
import { AddZoneModal } from './components/AddZoneModal';
import { ToastContainer } from './components/ToastContainer';
import { MobileBottomNav } from './components/MobileBottomNav';

import {
  ShoppingBag,
  Store,
  MapPin,
  Truck,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  Map,
  Plus
} from 'lucide-react';
import { ZoneId, CategoryId } from './types';

function MainAppContent() {
  const {
    language,
    t,
    role,
    setRole,
    activeView,
    setActiveView,
    user,
    products,
    selectedZone,
    setSelectedZone,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    zones,
    categories,
    setIsAuthModalOpen,
    setIsTrackOrderOpen,
    isAddZoneModalOpen,
    setIsAddZoneModalOpen
  } = useApp();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Filter products based on selectedZone, selectedCategory, and searchQuery
  const filteredProducts = products.filter((product) => {
    // Zone filter
    if (selectedZone !== 'all' && product.zone !== selectedZone) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = product.titleEn.toLowerCase().includes(q) || product.descriptionEn.toLowerCase().includes(q) || product.vendorName.toLowerCase().includes(q);
      const matchUr = product.titleUr.includes(q) || product.descriptionUr.includes(q);
      if (!matchEn && !matchUr) return false;
    }

    return true;
  });

  const featuredProducts = products.filter((p) => p.isFeatured);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Primary Navigation Header */}
      <Header />

      {/* Dynamic Main Body Content Based on Active View and Role Access Control */}
      <main className="flex-1">
        {activeView === 'admin' && user?.role === 'admin' ? (
          <AdminDashboard />
        ) : activeView === 'vendor' && (user?.role === 'vendor' || user?.role === 'admin') ? (
          <VendorDashboard />
        ) : activeView === 'rider' && (user?.role === 'rider' || user?.role === 'admin') ? (
          <RiderDashboard />
        ) : activeView === 'customer-dashboard' ? (
          <CustomerDashboard onBackToStore={() => setActiveView('store')} />
        ) : (
          /* Customer Store View */
          <div className="space-y-8 sm:space-y-12 pb-24 md:pb-16">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800 py-12 md:py-16">
              {/* Background Glow Accents */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.verifiedLocalVendors}</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                      {t.heroTitle}
                    </h1>

                    <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                      {t.heroSubtitle}
                    </p>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                      <a
                        href="#catalog"
                        className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/15 transition-all"
                      >
                        <span>{t.shopNow}</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => {
                          setRole('vendor');
                          setIsAuthModalOpen(true);
                        }}
                        className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 flex items-center gap-2 transition-all"
                      >
                        <Store className="w-4 h-4 text-emerald-400" />
                        <span>{t.becomeVendor}</span>
                      </button>

                      <button
                        onClick={() => setIsTrackOrderOpen(true)}
                        className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-sm border border-slate-800 flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Truck className="w-4 h-4" />
                        <span>{t.trackOrder}</span>
                      </button>

                      <button
                        onClick={() => setIsAddZoneModalOpen(true)}
                        className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-[#1A1A1A] text-[#C5A059] font-bold text-sm border border-[#C5A059]/40 flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                      >
                        <MapPin className="w-4 h-4 text-[#C5A059]" />
                        <span>{language === 'ur' ? '+ اپنی مرضی کا بازار شامل کریں' : '+ Add Custom Bazaar'}</span>
                      </button>
                    </div>

                    {/* Quick Trust Badges */}
                    <div className="grid grid-cols-3 gap-2 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-center text-xs text-slate-400">
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <strong className="block text-white text-sm">9 Bazaars</strong>
                        <span>Peshawar Coverage</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <strong className="block text-emerald-400 text-sm">Same-Day</strong>
                        <span>Doorstep Delivery</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <strong className="block text-white text-sm">COD & Wallet</strong>
                        <span>EasyPaisa / JazzCash</span>
                      </div>
                    </div>
                  </div>

                  {/* Hero Right Visual Banner */}
                  <div className="lg:col-span-5 relative">
                    <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group">
                      <img
                        src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop"
                        alt="Peshawari Chappal Craftsmanship"
                        className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-6">
                        <span className="bg-emerald-500 text-slate-950 font-bold text-xs px-2.5 py-1 rounded-lg w-fit shadow">
                          Featured Bazaar Highlight
                        </span>
                        <h3 className="text-xl font-bold text-white mt-2">
                          Kissa Khwani Bazaar Norozi & Kaptan Chappals
                        </h3>
                        <p className="text-xs text-slate-300 mt-1">
                          Crafted by master artisans with authentic leather & comfortable tire soles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Peshawar Bazaars Grid Shortcuts */}
            <div id="bazaars-section" className="max-w-7xl mx-auto px-4 scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Map className="w-5 h-5 text-emerald-400" />
                  <span>{language === 'ur' ? 'پشاور کے مشہور بازار اور زونز' : 'Explore Famous Peshawar Markets'}</span>
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddZoneModalOpen(true)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#C5A059]/15 hover:bg-[#C5A059] text-[#C5A059] hover:text-black border border-[#C5A059]/40 font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'ur' ? 'اپنی مرضی کا بازار شامل کریں' : '+ Add Custom Bazaar'}</span>
                  </button>
                  {selectedZone !== 'all' && (
                    <button
                      onClick={() => setSelectedZone('all')}
                      className="text-xs text-emerald-400 hover:underline font-semibold"
                    >
                      {language === 'ur' ? 'تمام بازار دیکھیں' : 'View All Zones'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-2.5">
                {zones.map((zone) => {
                  const isSelected = selectedZone === zone.id;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZone(isSelected ? 'all' : zone.id)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mb-1 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                      <span className="text-xs font-semibold leading-tight line-clamp-1">
                        {language === 'ur' ? zone.nameUr : zone.nameEn.split(' ')[0]} {zone.isCustom ? '★' : ''}
                      </span>
                    </button>
                  );
                })}

                {/* Add Custom Bazaar shortcut card in the grid */}
                <button
                  type="button"
                  onClick={() => setIsAddZoneModalOpen(true)}
                  className="p-2.5 sm:p-3 rounded-xl border border-dashed border-[#C5A059]/60 hover:border-[#C5A059] bg-[#C5A059]/10 hover:bg-[#C5A059]/20 text-[#C5A059] text-center transition-all flex flex-col items-center justify-between cursor-pointer group shadow"
                  title={language === 'ur' ? 'اپنی مرضی کا نیا بازار شامل کریں' : 'Add your custom Peshawar bazaar'}
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-1 group-hover:scale-125 transition-transform" />
                  <span className="text-xs font-bold leading-tight line-clamp-1">
                    {language === 'ur' ? 'نیا بازار +' : '+ Add Bazaar'}
                  </span>
                </button>
              </div>
            </div>

            {/* Product Catalog Section */}
            <div id="catalog" className="max-w-7xl mx-auto px-4 space-y-6 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-400" />
                    <span>Peshawar Market Catalog</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {filteredProducts.length} Items
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedZone !== 'all' ? `Showing items from ${selectedZone}` : 'Showing all Peshawar vendors'}
                  </p>
                </div>

                {/* Filter indicators */}
                <div className="flex items-center gap-2 text-xs">
                  {selectedZone !== 'all' && (
                    <span className="bg-slate-800 text-emerald-300 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
                      Zone: {selectedZone}
                    </span>
                  )}
                  {selectedCategory !== 'all' && (
                    <span className="bg-slate-800 text-emerald-300 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
                      Category: {selectedCategory}
                    </span>
                  )}
                  {(selectedZone !== 'all' || selectedCategory !== 'all' || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedZone('all');
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      className="text-xs text-rose-400 hover:underline font-semibold ml-2"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Product Grid */}
              {products.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-[#151515] rounded-3xl border border-white/10 p-8 max-w-2xl mx-auto shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/30 mx-auto flex items-center justify-center text-[#C5A059]">
                    <Store className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {language === 'ur' ? 'ابھی کوئی پروڈکٹ موجود نہیں ہے' : 'No Products Listed Yet'}
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                    {language === 'ur'
                      ? 'نئے دکاندار یا ایڈمن لاگ ان کر کے نئی اصلی پروڈکٹس شامل کر سکتے ہیں۔'
                      : 'Vendors and admin can add fresh authentic products with live images.'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setRole('vendor');
                        setIsAuthModalOpen(true);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow"
                    >
                      {language === 'ur' ? 'دکاندار اکاؤنٹ بنائیں اور پروڈکٹ لگائیں' : 'Register Shop & Add Products'}
                    </button>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-[#1A1A1A] text-neutral-200 border border-white/10 font-bold text-xs"
                    >
                      {t.login}
                    </button>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center space-y-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-200">No products match your criteria</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Try changing your selected bazaar zone or clearing search keywords.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedZone('all');
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#C5A059] text-black font-bold text-xs"
                  >
                    View All Listed Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Primary Footer */}
      <Footer />

      {/* Global Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <TrackOrderModal />
      <OrderInvoiceModal />
      <AuthModal />
      <AddZoneModal isOpen={isAddZoneModalOpen} onClose={() => setIsAddZoneModalOpen(false)} />
      <ToastContainer />
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
