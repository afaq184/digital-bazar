import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, MapPin, Tag, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    language,
    t,
    cart,
    removeFromCart,
    updateCartQuantity,
    isCartOpen,
    setIsCartOpen,
    selectedZone,
    zones,
    addToast
  } = useApp();

  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Determine delivery fee based on selected zone
  const currentZone = zones.find((z) => z.id === selectedZone) || zones[0];
  const shippingFee = cart.length > 0 ? currentZone.deliveryFee : 0;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'PESHAWAR10') {
      const disc = Math.round(subtotal * 0.1);
      setDiscountAmount(disc);
      setPromoApplied(true);
      addToast(language === 'ur' ? '10% پشاور پرومو ڈسکاؤنٹ لاگو ہو گیا!' : '10% Peshawar Promo Code applied!', 'success');
    } else {
      addToast(language === 'ur' ? 'غیر معتبر پرومو کوڈ' : 'Invalid promo code. Try: PESHAWAR10', 'error');
    }
  };

  const grandTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <div className="w-full sm:w-screen sm:max-w-md bg-[#0F0F0F] border-l border-white/10 text-[#E5E5E5] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
              <h2 className="font-bold text-base font-serif-display tracking-wide">{t.yourCart}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#151515] border border-white/10 text-neutral-300 uppercase tracking-wider">
                {cart.length} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded hover:bg-[#151515] text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#151515] border border-white/10 mx-auto flex items-center justify-center text-neutral-500">
                  <ShoppingBag className="w-8 h-8 text-[#C5A059]/60" />
                </div>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                  {t.emptyCart}
                </p>
              </div>
            ) : (
              cart.map((item) => {
                const title = language === 'ur' ? item.product.titleUr : item.product.titleEn;
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 rounded-lg bg-[#151515] border border-white/10 items-center"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded object-cover bg-[#0A0A0A] shrink-0 border border-white/5"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{title}</h4>
                      <p className="text-[11px] text-neutral-400">{item.product.vendorName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {item.product.unit === 'kg'
                            ? `PKR ${item.product.price.toLocaleString()}/kg (${item.quantity} ${language === 'ur' ? 'کلو گرام' : 'Kg'})`
                            : `PKR ${item.product.price.toLocaleString()} × ${item.quantity}`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-[#C5A059]">
                          PKR {(item.product.price * item.quantity).toLocaleString()}
                        </span>

                        <div className="flex items-center bg-[#0A0A0A] border border-white/10 rounded">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-neutral-300 hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-neutral-300 hover:text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Pricing Summary */}
          {cart.length > 0 && (
            <div className="p-4 bg-[#0A0A0A] border-t border-white/10 space-y-3">
              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo Code (PESHAWAR10)"
                    disabled={promoApplied}
                    className="w-full pl-8 pr-3 py-1.5 rounded bg-[#151515] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C5A059] uppercase"
                  />
                </div>
                <button
                  type="submit"
                  disabled={promoApplied || !promoCode.trim()}
                  className="px-3 py-1.5 rounded bg-[#151515] border border-white/10 hover:border-[#C5A059] text-xs font-bold text-[#C5A059] disabled:opacity-50"
                >
                  {promoApplied ? <Check className="w-4 h-4 text-[#C5A059]" /> : 'Apply'}
                </button>
              </form>

              {/* Delivery Zone Notice */}
              <div className="flex items-center justify-between text-xs text-neutral-400 bg-[#151515] p-2.5 rounded border border-white/5">
                <span className="flex items-center gap-1 text-[#C5A059]">
                  <MapPin className="w-3.5 h-3.5" />
                  {language === 'ur' ? currentZone.nameUr : currentZone.nameEn}
                </span>
                <span>{t.deliveryFee}: PKR {shippingFee}</span>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-300 pt-1">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#C5A059] font-semibold">
                    <span>Promo Discount</span>
                    <span>- PKR {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t.shipping}</span>
                  <span>PKR {shippingFee}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>{t.total}</span>
                  <span className="text-[#C5A059]">PKR {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="w-full py-3 px-4 rounded bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>{t.proceedToCheckout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
