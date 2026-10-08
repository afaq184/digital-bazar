import React, { useState } from 'react';
import {
  User,
  Package,
  Heart,
  MapPin,
  Phone,
  Mail,
  Truck,
  Receipt,
  ShoppingBag,
  ExternalLink,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Navigation
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';

export const CustomerDashboard: React.FC<{ onBackToStore: () => void }> = ({ onBackToStore }) => {
  const {
    language,
    t,
    user,
    orders,
    wishlist,
    products,
    addToCart,
    toggleWishlist,
    setIsTrackOrderOpen,
    setActiveOrderInvoice,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');

  // Customer orders (filter by customer phone or email or name)
  const customerOrders = orders.filter((o) => {
    if (!user) return false;
    const cleanUserPhone = user.phone ? user.phone.replace(/\D/g, '') : '';
    const cleanOrderPhone = o.customerPhone ? o.customerPhone.replace(/\D/g, '') : '';
    return (
      (cleanUserPhone && cleanOrderPhone && cleanUserPhone === cleanOrderPhone) ||
      (o.customerEmail && user.email && o.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
      (o.customerName && user.name && o.customerName.toLowerCase() === user.name.toLowerCase())
    );
  });

  const displayOrders = customerOrders;

  // Wishlist products
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      case 'Dispatched':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      case 'Preparing':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-24 md:pb-8 space-y-6 text-[#E5E5E5]">
      {/* Top Banner with Profile Header */}
      <div className="bg-[#151515] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
            <User className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-serif-display font-bold text-white">
                {language === 'ur' ? 'کسٹمر ڈیش بورڈ' : 'Customer Dashboard'}
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider">
                {language === 'ur' ? 'خریدار اکاؤنٹ' : 'Customer Account'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {user ? `${user.name} • ${user.phone || user.email}` : 'Guest Customer • Digital Bazar Peshawar'}
            </p>
          </div>
        </div>

        <button
          onClick={onBackToStore}
          className="px-4 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-[#1A1A1A] border border-white/10 text-xs font-bold text-neutral-200 flex items-center gap-2 transition-all hover:border-[#C5A059]/40"
        >
          <ArrowLeft className="w-4 h-4 text-[#C5A059]" />
          <span>{language === 'ur' ? 'بازار میں واپس جائیں' : 'Back to Shopping Catalog'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-[#C5A059] text-black shadow-md'
              : 'bg-[#151515] text-neutral-300 hover:text-white border border-white/10'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{language === 'ur' ? 'میرے آرڈرز' : 'My Orders'} ({displayOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'wishlist'
              ? 'bg-[#C5A059] text-black shadow-md'
              : 'bg-[#151515] text-neutral-300 hover:text-white border border-white/10'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>{language === 'ur' ? 'پسندیدہ اشیاء' : 'Saved Wishlist'} ({wishlistProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-[#C5A059] text-black shadow-md'
              : 'bg-[#151515] text-neutral-300 hover:text-white border border-white/10'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{language === 'ur' ? 'پروفائل اور پتہ' : 'Profile & Address'}</span>
        </button>
      </div>

      {/* TAB 1: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {displayOrders.length === 0 ? (
            <div className="p-12 text-center bg-[#151515] border border-white/10 rounded-2xl space-y-3">
              <Package className="w-10 h-10 text-neutral-600 mx-auto" />
              <h3 className="text-base font-bold text-neutral-200">
                {language === 'ur' ? 'آپ نے ابھی تک کوئی آرڈر نہیں کیا' : 'No orders placed yet'}
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                {language === 'ur'
                  ? 'پشاور کے روایتی بازاروں سے اشیاء منتخب کریں اور اسی دن ڈلیوری حاصل کریں۔'
                  : 'Explore Kissa Khwani, Namak Mandi, and Saddar to place your first order.'}
              </p>
              <button
                onClick={onBackToStore}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#C5A059] text-black font-extrabold text-xs"
              >
                {language === 'ur' ? 'خریداری شروع کریں' : 'Start Shopping Now'}
              </button>
            </div>
          ) : (
            displayOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#151515] border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg hover:border-white/20 transition-all"
              >
                {/* Order Top Line */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-white text-base font-mono">
                      {order.id}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-[#C5A059] font-medium bg-[#C5A059]/10 px-2 py-0.5 rounded border border-[#C5A059]/20">
                      {order.zone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <span className="text-xs font-bold text-[#C5A059] bg-[#0A0A0A] px-2.5 py-1 rounded border border-white/10">
                      PKR {order.totalAmount.toLocaleString()} ({order.paymentMethod})
                    </span>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-2">
                    <p className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                      {language === 'ur' ? 'شامل اشیاء:' : 'Purchased Items:'}
                    </p>
                    <div className="space-y-1.5">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#0A0A0A] border border-white/5">
                          <span className="font-medium text-neutral-200">
                            {it.quantity}x {language === 'ur' ? it.productTitleUr : it.productTitleEn}
                          </span>
                          <span className="text-[#C5A059] font-bold">
                            PKR {(it.price * it.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                      {language === 'ur' ? 'ڈلیوری کی تفصیلات:' : 'Delivery & Rider Details:'}
                    </p>
                    <div className="p-2.5 rounded bg-[#0A0A0A] border border-white/5 space-y-1 text-neutral-300">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                        <span className="truncate">{order.address}</span>
                      </p>
                      {order.rider && (
                        <p className="flex items-center gap-1.5 text-emerald-400 font-medium pt-1 border-t border-white/5">
                          <Truck className="w-3.5 h-3.5 shrink-0" />
                          <span>Rider: {order.rider.name} ({order.rider.vehicleNo})</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Track Live Order & View Invoice */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setIsTrackOrderOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#0A0A0A] hover:bg-[#1A1A1A] text-neutral-200 font-bold text-xs flex items-center gap-1.5 border border-white/10 transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{t.trackOrder}</span>
                  </button>

                  <button
                    onClick={() => setActiveOrderInvoice(order)}
                    className="px-3.5 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>{language === 'ur' ? 'رسید / انوائس دیکھیں' : 'View Official Invoice'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="p-12 text-center bg-[#151515] border border-white/10 rounded-2xl space-y-3">
              <Heart className="w-10 h-10 text-neutral-600 mx-auto" />
              <h3 className="text-base font-bold text-neutral-200">
                {language === 'ur' ? 'آپ کی پسندیدہ فہرست خالی ہے' : 'Your wishlist is empty'}
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                {language === 'ur'
                  ? 'کسی بھی پروڈکٹ پر دل کے نشان کو دبا کر اپنی پسندیدہ فہرست میں شامل کریں۔'
                  : 'Click the heart icon on any product to save it here for quick purchase.'}
              </p>
              <button
                onClick={onBackToStore}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#C5A059] text-black font-extrabold text-xs"
              >
                {language === 'ur' ? 'بازار دیکھیں' : 'Explore Catalog'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlistProducts.map((product) => {
                const title = language === 'ur' ? product.titleUr : product.titleEn;
                return (
                  <div
                    key={product.id}
                    className="bg-[#151515] border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3 group hover:border-[#C5A059]/40 transition-all"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-[#0A0A0A]">
                      <img
                        src={product.images[0]}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-rose-400 hover:scale-110 transition-all"
                        title="Remove from wishlist"
                      >
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{title}</h4>
                      <p className="text-xs text-neutral-400">{product.vendorName}</p>
                      <p className="text-sm font-extrabold text-[#C5A059] mt-1">
                        PKR {product.price.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => addToCart(product, 1)}
                      className="w-full py-2 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t.addToCart}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CUSTOMER PROFILE & ADDRESS */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-[#151515] border border-white/10 rounded-2xl p-6 space-y-5">
          <h3 className="font-serif-display font-bold text-lg text-white border-b border-white/10 pb-3">
            {language === 'ur' ? 'خریدار کی پروفائل کی تفصیلات' : 'Customer Account Profile'}
          </h3>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/5 space-y-1">
                <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                  Full Name:
                </span>
                <p className="text-white font-bold text-sm">{user?.name || 'Customer'}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/5 space-y-1">
                <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                  Phone Number:
                </span>
                <p className="text-white font-bold text-sm">{user?.phone || '0300-1234567'}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/5 space-y-1">
                <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                  Email Address:
                </span>
                <p className="text-white font-bold text-sm">{user?.email || 'customer@digitalbazar.pk'}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/5 space-y-1">
                <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                  Account Role:
                </span>
                <p className="text-emerald-400 font-bold text-sm">Customer (Buyer)</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/5 space-y-2">
              <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                Primary Peshawar Delivery Address:
              </span>
              <p className="text-neutral-200 text-xs">
                House #14, Street 2, Phase 3 Chowk, Hayatabad, Peshawar, Khyber Pakhtunkhwa
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
