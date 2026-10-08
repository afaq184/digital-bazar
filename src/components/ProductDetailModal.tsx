import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Truck,
  Shield,
  Heart,
  User,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProductDetailModal: React.FC = () => {
  const {
    language,
    t,
    selectedProductModal,
    setSelectedProductModal,
    addToCart,
    wishlist,
    toggleWishlist,
    zones,
    reviews,
    addReview,
    setIsCartOpen,
    user
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  if (!selectedProductModal) return null;

  const product = selectedProductModal;
  const isWishlisted = wishlist.includes(product.id);
  const title = language === 'ur' ? product.titleUr : product.titleEn;
  const description = language === 'ur' ? product.descriptionUr : product.descriptionEn;

  const zoneObj = zones.find((z) => z.id === product.zone);
  const zoneName = zoneObj
    ? language === 'ur'
      ? zoneObj.nameUr
      : zoneObj.nameEn
    : product.zone;

  const productReviews = reviews.filter((r) => r.productId === product.id);

  const handleWhatsAppOrder = () => {
    const phone = product.vendorPhone.startsWith('92')
      ? product.vendorPhone
      : '92' + product.vendorPhone.replace(/^0/, '');

    const message = language === 'ur'
      ? `سلام! میں ڈجیٹل بازار پشاور سے یہ پروڈکٹ خریدنا چاہتا ہوں:\n\n*پروڈکٹ:* ${product.titleUr}\n*تعداد:* ${quantity}\n*قیمت:* PKR ${(product.price * quantity).toLocaleString()}\n*دکان:* ${product.vendorName} (${zoneName})\n\nبرائے مہربانی ڈلیوری کا وقت اور تفصیلات بتائیں۔`
      : `Salam! I want to order this product from Digital Bazar Peshawar:\n\n*Product:* ${product.titleEn}\n*Quantity:* ${quantity}\n*Price:* PKR ${(product.price * quantity).toLocaleString()}\n*Shop:* ${product.vendorName} (${zoneName})\n\nPlease share availability and delivery timeframe.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setSelectedProductModal(null);
    setIsCartOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addReview({
      productId: product.id,
      userName: user ? user.name : 'Anonymous Customer (Peshawar)',
      rating: newRating,
      comment: newComment.trim(),
      verifiedPurchase: true
    });

    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#151515] border border-white/10 rounded-xl max-w-4xl w-full max-h-[96vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative text-[#E5E5E5] my-2 sm:my-8">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProductModal(null)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-[#0A0A0A]/80 text-neutral-300 hover:text-white hover:bg-[#1A1A1A] transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/10">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 left-4 p-2.5 rounded-lg backdrop-blur-md border transition-all ${
                  isWishlisted
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-[#0A0A0A]/60 border-white/10 text-neutral-300 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-[#C5A059] scale-105' : 'border-white/10 opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Vendor Details Box */}
            <div className="p-4 rounded bg-[#0A0A0A] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">{t.vendor}:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  {product.vendorName}
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059]" />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Market Zone:</span>
                <span className="text-[#C5A059] font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {zoneName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Doorstep Delivery:</span>
                <span className="text-neutral-300 font-medium flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                  Same-Day Peshawar Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Order Actions */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#C5A059]/10 text-[#C5A059] text-xs px-2.5 py-1 rounded border border-[#C5A059]/30 font-semibold uppercase tracking-wider">
                  {zoneName}
                </span>
                <div className="flex items-center gap-1 text-[#C5A059] text-xs font-bold">
                  <Star className="w-4 h-4 fill-[#C5A059]" />
                  <span>{product.rating}</span>
                  <span className="text-neutral-400">({product.reviewCount} {t.reviews})</span>
                </div>
              </div>

              <h1 className="text-xl md:text-2xl font-serif-display font-bold text-white leading-tight">
                {title}
              </h1>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-bold text-[#C5A059]">
                  PKR {product.price.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-[#C5A059] bg-[#C5A059]/15 px-2.5 py-1 rounded border border-[#C5A059]/30">
                  {language === 'ur'
                    ? (product.unitLabelUr || (product.unit === 'kg' ? 'فی 1 کلو گرام' : 'فی عدد'))
                    : (product.unitLabelEn || (product.unit === 'kg' ? 'Per 1 Kg' : 'Per Item'))}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-neutral-500 line-through">
                    PKR {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Dedicated 1 Kilogram Price Spotlight if unit is kg or meat/gaye */}
              {(product.unit === 'kg' || product.pricePerKg) && (
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#C5A059]/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚖️</span>
                    <div>
                      <p className="font-bold text-white">
                        {language === 'ur' ? '1 کلو گرام کی قیمت (Price per 1 Kg):' : 'Rate for 1 Kilogram (1 Kg Price):'}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {language === 'ur' ? 'ڈیجیٹل سکیل پر تصدیق شدہ خالص وزن' : 'Verified fresh scale weight per kg'}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-black text-base text-[#C5A059]">
                    PKR {(product.pricePerKg || product.price).toLocaleString()} / kg
                  </span>
                </div>
              )}

              <p className="text-sm text-neutral-300 leading-relaxed pt-2 border-t border-white/10">
                {description}
              </p>

              {/* Quantity / Weight Selector */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">
                    {product.unit === 'kg'
                      ? (language === 'ur' ? 'وزن منتخب کریں (Kilograms):' : 'Select Weight (Kilograms):')
                      : (language === 'ur' ? 'تعداد منتخب کریں:' : 'Select Quantity:')}
                  </span>
                  <span className="font-bold text-[#C5A059]">
                    {quantity} {product.unit === 'kg' ? (language === 'ur' ? 'کلو گرام' : 'Kg') : (language === 'ur' ? 'عدد' : 'Items')}
                  </span>
                </div>

                {/* Quick Kg buttons if product is sold in kilograms */}
                {product.unit === 'kg' && (
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 3, 5, 10].map((kg) => (
                      <button
                        key={kg}
                        type="button"
                        onClick={() => setQuantity(kg)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          quantity === kg
                            ? 'bg-[#C5A059] text-black shadow'
                            : 'bg-[#0A0A0A] text-neutral-300 hover:text-white border border-white/10 hover:border-[#C5A059]/40'
                        }`}
                      >
                        {kg} {language === 'ur' ? 'کلو' : 'Kg'}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center bg-[#0A0A0A] border border-white/10 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-1.5 text-neutral-300 hover:text-white hover:bg-[#1A1A1A] font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold text-white min-w-[36px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3.5 py-1.5 text-neutral-300 hover:text-white hover:bg-[#1A1A1A] font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {language === 'ur' ? 'کل رقم:' : 'Total Amount:'}{' '}
                    <strong className="text-base font-bold text-[#C5A059]">
                      PKR {(product.price * quantity).toLocaleString()}
                    </strong>
                    {product.unit === 'kg' && (
                      <span className="text-[11px] text-neutral-400 ml-1">
                        ({quantity} {language === 'ur' ? 'کلو گرام' : 'Kg'})
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="py-3 px-4 rounded bg-[#1A1A1A] hover:bg-[#222] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                  <span>{t.addToCart}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3 px-4 rounded bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span>{t.buyNow}</span>
                </button>
              </div>

              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-3 px-4 rounded bg-[#0A0A0A] border border-white/10 hover:border-[#C5A059]/40 text-neutral-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-5 h-5 text-[#C5A059]" />
                <span>{t.chatOnWhatsApp}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="p-6 bg-[#0A0A0A] border-t border-white/10 space-y-6">
          <h3 className="text-base font-bold font-serif-display text-white flex items-center gap-2 tracking-wide">
            <Star className="w-5 h-5 text-[#C5A059] fill-[#C5A059]" />
            <span>{t.reviews} ({productReviews.length})</span>
          </h3>

          {/* Add Review Form */}
          <form onSubmit={handleSubmitReview} className="bg-[#151515] p-4 rounded border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">{t.writeReview}:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-0.5 text-[#C5A059] hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${star <= newRating ? 'fill-[#C5A059]' : 'text-neutral-600'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your feedback about product quality and vendor delivery in Peshawar..."
              className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5A059]"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-1.5 rounded bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.submitReview}</span>
              </button>
            </div>
          </form>

          {/* Reviews List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {productReviews.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-4">No reviews yet. Be the first customer from Peshawar to review!</p>
            ) : (
              productReviews.map((rev) => (
                <div key={rev.id} className="p-3.5 rounded bg-[#151515] border border-white/5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#C5A059]" />
                      {rev.userName}
                    </span>
                    <span className="text-neutral-500 text-[11px]">{rev.date}</span>
                  </div>

                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= rev.rating ? 'text-[#C5A059] fill-[#C5A059]' : 'text-neutral-700'}`}
                      />
                    ))}
                  </div>

                  <p className="text-neutral-300 leading-normal pt-1">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
