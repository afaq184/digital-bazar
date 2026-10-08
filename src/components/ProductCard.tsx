import React from 'react';
import {
  ShoppingBag,
  Star,
  MapPin,
  MessageCircle,
  Heart,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    language,
    t,
    addToCart,
    wishlist,
    toggleWishlist,
    setSelectedProductModal,
    zones
  } = useApp();

  const isWishlisted = wishlist.includes(product.id);
  const zoneObj = zones.find((z) => z.id === product.zone);
  const zoneName = zoneObj
    ? language === 'ur'
      ? zoneObj.nameUr
      : zoneObj.nameEn
    : product.zone;

  const title = language === 'ur' ? product.titleUr : product.titleEn;
  const description = language === 'ur' ? product.descriptionUr : product.descriptionEn;

  // Calculate discount percentage
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Generate WhatsApp order pre-filled message
  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = product.vendorPhone.startsWith('92')
      ? product.vendorPhone
      : '92' + product.vendorPhone.replace(/^0/, '');

    const message = language === 'ur'
      ? `سلام! میں ڈجیٹل بازار پشاور سے یہ پروڈکٹ خریدنا چاہتا ہوں:\n\n*پروڈکٹ:* ${product.titleUr}\n*قیمت:* PKR ${product.price.toLocaleString()}\n*دکان:* ${product.vendorName} (${zoneName})\n\nبرائے مہربانی ڈلیوری کی تفصیلات فراہم کریں۔`
      : `Salam! I want to order this product from Digital Bazar Peshawar:\n\n*Product:* ${product.titleEn}\n*Price:* PKR ${product.price.toLocaleString()}\n*Shop:* ${product.vendorName} (${zoneName})\n\nPlease share availability and delivery details.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => setSelectedProductModal(product)}
      className="group bg-[#151515] rounded-xl border border-white/10 hover:border-[#C5A059]/40 shadow-xl hover:shadow-[#C5A059]/5 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-[#0A0A0A]">
        <img
          src={product.images[0]}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-[#C5A059] text-black font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
            {discountPercent}% {t.discount}
          </span>
        )}

        {/* Zone Badge */}
        <span className="absolute bottom-3 left-3 bg-[#0A0A0A]/85 backdrop-blur-md text-[#C5A059] border border-white/10 font-medium text-[10px] uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 shadow">
          <MapPin className="w-3 h-3 text-[#C5A059] shrink-0" />
          <span className="truncate max-w-[130px]">{zoneName}</span>
        </span>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-lg backdrop-blur-md border transition-all ${
            isWishlisted
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              : 'bg-[#0A0A0A]/60 border-white/10 text-neutral-300 hover:text-white hover:bg-[#151515]'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Quick View Hover Overlay Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProductModal(product);
          }}
          className="absolute inset-0 bg-[#0A0A0A]/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-medium text-xs backdrop-blur-[2px] transition-opacity duration-300"
        >
          <span className="bg-[#151515] border border-white/15 px-3 py-1.5 rounded flex items-center gap-1.5 shadow-xl text-neutral-200">
            <Eye className="w-4 h-4 text-[#C5A059]" />
            <span className="text-xs uppercase tracking-wider">{t.quickView}</span>
          </span>
        </button>
      </div>

      {/* Product Information Body */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          {/* Vendor Name */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-neutral-400 mb-1">
            <span className="flex items-center gap-1 text-neutral-300 font-medium truncate max-w-[65%]">
              {product.vendorName}
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C5A059] shrink-0" />
            </span>
            <div className="flex items-center gap-1 text-[#C5A059] shrink-0 font-semibold text-[11px]">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#C5A059]" />
              <span>{product.rating}</span>
              <span className="text-neutral-500 text-[9px] sm:text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-white text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#C5A059] transition-colors">
            {title}
          </h3>

          {/* Short Description */}
          <p className="text-[11px] sm:text-xs text-neutral-400 line-clamp-1 mt-1 hidden xs:block">
            {description}
          </p>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-baseline justify-between mb-2 flex-wrap gap-1">
            <div>
              <span className="text-[10px] sm:text-xs text-[#C5A059] font-bold mr-1">{t.pkr}</span>
              <span className="text-sm sm:text-lg font-bold text-white">
                {product.price.toLocaleString()}
              </span>
              {/* Unit / Kilogram Indicator */}
              <span className="text-[9px] sm:text-[11px] font-bold text-[#C5A059] ml-1 bg-[#C5A059]/10 px-1.5 py-0.5 rounded border border-[#C5A059]/25 inline-block">
                {language === 'ur'
                  ? (product.unitLabelUr || (product.unit === 'kg' ? 'فی 1 کلو' : 'فی عدد'))
                  : (product.unitLabelEn || (product.unit === 'kg' ? '/ 1 Kg' : '/ Item'))}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] text-neutral-500 line-through ml-1 hidden sm:inline">
                  PKR {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <span
              className={`text-[9px] sm:text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded ${
                product.stock > 10
                  ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20'
                  : product.stock > 0
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {product.stock > 0 ? `${product.stock} ${t.inStock}` : t.outOfStock}
            </span>
          </div>

          {/* Quick 1 Kilogram Price Tag for Meat / Weight items */}
          {product.unit === 'kg' && (
            <div className="mb-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-[#0A0A0A] border border-emerald-500/30 text-[10px] sm:text-[11px] text-emerald-400 flex items-center justify-between font-medium">
              <span>{language === 'ur' ? '⚖️ 1 کلو ریٹ:' : '⚖️ 1 Kg:'}</span>
              <span className="font-bold text-white">PKR {product.price.toLocaleString()}</span>
            </div>
          )}

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              disabled={product.stock <= 0}
              className="w-full py-1.5 sm:py-2 px-1.5 sm:px-3 rounded bg-[#C5A059] hover:bg-[#D4AF37] active:scale-[0.98] disabled:opacity-50 text-black font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{t.addToCart}</span>
            </button>

            <button
              onClick={handleWhatsAppOrder}
              className="w-full py-1.5 sm:py-2 px-1 sm:px-3 rounded bg-[#1A1A1A] border border-white/10 hover:border-[#C5A059]/40 active:scale-[0.98] text-neutral-200 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all"
              title="Chat directly on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A059] shrink-0" />
              <span className="truncate">{language === 'ur' ? 'واٹس ایپ' : 'WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
