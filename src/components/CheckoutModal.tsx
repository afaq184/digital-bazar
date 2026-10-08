import React, { useState } from 'react';
import { X, CheckCircle2, MapPin, Phone, User as UserIcon, Building, CreditCard, ShieldCheck, Navigation, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ZoneId, PaymentMethod, LocationCoords } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const {
    language,
    t,
    cart,
    zones,
    selectedZone,
    placeOrder,
    setActiveOrderInvoice,
    user,
    addToast,
    setIsAddZoneModalOpen
  } = useApp();

  const [customerName, setCustomerName] = useState(user ? user.name : '');
  const [customerPhone, setCustomerPhone] = useState(user ? user.phone : '');
  const [customerEmail, setCustomerEmail] = useState(user ? user.email : '');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState<ZoneId>(selectedZone !== 'all' ? selectedZone : 'hayatabad');
  const [landmark, setLandmark] = useState('');
  const [customerCoords, setCustomerCoords] = useState<LocationCoords | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [transactionId, setTransactionId] = useState('');

  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
            addressText: 'Peshawar Live GPS Pin',
            timestamp: new Date().toLocaleTimeString()
          };
          setCustomerCoords(coords);
          setIsLocating(false);
          if (!address) {
            setAddress(`Live GPS: Lat ${coords.lat}, Lng ${coords.lng} (Peshawar)`);
          }
        },
        (error) => {
          // Fallback Peshawar GPS coordinates if geolocation permission denied in iframe
          const defaultCoords = {
            lat: 34.0151,
            lng: 71.5249,
            addressText: 'Hayatabad Phase 3, Peshawar',
            timestamp: new Date().toLocaleTimeString()
          };
          setCustomerCoords(defaultCoords);
          setIsLocating(false);
          if (!address) {
            setAddress('Hayatabad Phase 3, Ring Road, Peshawar');
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      const defaultCoords = {
        lat: 34.0151,
        lng: 71.5249,
        addressText: 'Peshawar City Center',
        timestamp: new Date().toLocaleTimeString()
      };
      setCustomerCoords(defaultCoords);
      setIsLocating(false);
    }
  };

  if (!isOpen) return null;

  const currentZone = zones.find((z) => z.id === zone) || zones[0];
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = currentZone.deliveryFee;
  const totalAmount = subtotal + shippingFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerPhone || !address) {
      addToast(language === 'ur' ? 'برائے مہربانی تمام ضروری خانے پر کریں' : 'Please fill all required fields (Name, Phone, Address)', 'error');
      return;
    }

    if ((paymentMethod === 'EasyPaisa' || paymentMethod === 'JazzCash') && !transactionId.trim()) {
      addToast(language === 'ur' ? 'برائے مہربانی موبائل والیٹ ٹرانزیکشن آئی ڈی درج کریں' : 'Please enter your Mobile Wallet Transaction ID (TID).', 'error');
      return;
    }

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      productTitleEn: item.product.titleEn,
      productTitleUr: item.product.titleUr,
      price: item.product.price,
      quantity: item.quantity,
      unit: item.product.unit,
      unitLabelEn: item.product.unitLabelEn,
      unitLabelUr: item.product.unitLabelUr,
      vendorId: item.product.vendorId,
      vendorName: item.product.vendorName
    }));

    const createdOrder = placeOrder({
      customerName,
      customerPhone,
      customerEmail,
      address,
      zone,
      landmark,
      customerCoords: customerCoords || undefined,
      items: orderItems,
      subtotal,
      shippingFee,
      discount: 0,
      totalAmount,
      paymentMethod,
      paymentTransactionId: transactionId.trim() || undefined
    });

    onClose();
    setActiveOrderInvoice(createdOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#151515] border border-white/10 rounded-xl max-w-2xl w-full max-h-[96vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative text-[#E5E5E5] my-2 sm:my-8 p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#C5A059]" />
            <h2 className="font-serif-display font-bold text-2xl text-white">{t.checkoutTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#1A1A1A] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="space-y-5">
          {/* Customer Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {t.fullName} *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Arshad Ali"
                  className="w-full pl-9 pr-3 py-2 rounded bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {t.phone} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full pl-9 pr-3 py-2 rounded bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          </div>

          {/* Delivery Zone & Address */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-300">
                  {language === 'ur' ? 'پشاور ڈلیوری زون منتخب کریں *' : 'Select Peshawar Delivery Zone *'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddZoneModalOpen(true)}
                  className="text-[11px] text-[#C5A059] hover:underline font-bold"
                >
                  + {language === 'ur' ? 'اپنا نیا بازار شامل کریں' : 'Add Custom Bazaar'}
                </button>
              </div>
              <select
                value={zone}
                onChange={(e) => {
                  if (e.target.value === '__ADD_NEW__') {
                    setIsAddZoneModalOpen(true);
                  } else {
                    setZone(e.target.value as ZoneId);
                  }
                }}
                className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C5A059] cursor-pointer"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {language === 'ur' ? z.nameUr : z.nameEn} (Fee: PKR {z.deliveryFee} | Est: {z.estimatedTime}) {z.isCustom ? '★' : ''}
                  </option>
                ))}
                <option value="__ADD_NEW__">
                  + {language === 'ur' ? 'نیا بازار یا علاقہ شامل کریں...' : 'Add New Bazaar / Area...'}
                </option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-300">
                  {t.address} *
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="px-2.5 py-1 rounded bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] font-bold text-[11px] hover:bg-[#C5A059]/20 flex items-center gap-1 transition-all"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Locating GPS...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{language === 'ur' ? 'میری لائیو لوکیشن لیں' : 'Get Live GPS Location'}</span>
                    </>
                  )}
                </button>
              </div>

              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House #, Street #, Sector/Phase, Peshawar"
                className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C5A059]"
              />

              {customerCoords && (
                <div className="mt-2 p-2.5 rounded bg-[#0A0A0A] border border-[#C5A059]/30 text-[11px] text-[#C5A059] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="font-bold">Live Location Captured!</p>
                      <p className="text-neutral-300 text-[10px]">
                        Lat: <span className="font-mono text-white">{customerCoords.lat}</span>, Lng:{' '}
                        <span className="font-mono text-white">{customerCoords.lng}</span> ({customerCoords.timestamp})
                      </p>
                    </div>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${customerCoords.lat},${customerCoords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold text-xs"
                  >
                    View Map
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {t.landmark}
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Board Bazaar Chowk or Tatara Park"
                className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-neutral-300">
              {t.paymentMethod} *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 rounded border text-left transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059] font-bold'
                    : 'bg-[#0A0A0A] border-white/10 text-neutral-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{t.cod}</span>
                  {paymentMethod === 'COD' && <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Pay Cash upon Doorstep Delivery</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('EasyPaisa')}
                className={`p-3 rounded border text-left transition-all ${
                  paymentMethod === 'EasyPaisa'
                    ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059] font-bold'
                    : 'bg-[#0A0A0A] border-white/10 text-neutral-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{t.easypaisa}</span>
                  {paymentMethod === 'EasyPaisa' && <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Online Mobile Wallet</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('JazzCash')}
                className={`p-3 rounded border text-left transition-all ${
                  paymentMethod === 'JazzCash'
                    ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059] font-bold'
                    : 'bg-[#0A0A0A] border-white/10 text-neutral-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{t.jazzcash}</span>
                  {paymentMethod === 'JazzCash' && <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Online Mobile Wallet</p>
              </button>
            </div>

            {/* Wallet Details Note & Transaction ID */}
            {paymentMethod === 'EasyPaisa' && (
              <div className="p-3 rounded bg-[#0A0A0A] border border-white/10 space-y-2 text-xs">
                <p className="text-neutral-300">{t.easypaisaNote}</p>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={t.transactionId}
                  className="w-full p-2 rounded bg-[#151515] border border-white/10 text-xs text-[#C5A059] focus:outline-none"
                />
              </div>
            )}

            {paymentMethod === 'JazzCash' && (
              <div className="p-3 rounded bg-[#0A0A0A] border border-white/10 space-y-2 text-xs">
                <p className="text-neutral-300">{t.jazzcashNote}</p>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={t.transactionId}
                  className="w-full p-2 rounded bg-[#151515] border border-white/10 text-xs text-[#C5A059] focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Order Summary & Submit */}
          <div className="p-4 rounded bg-[#0A0A0A] border border-white/10 space-y-2">
            <div className="flex justify-between text-xs text-neutral-300">
              <span>Items Total ({cart.length} products):</span>
              <span>PKR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-300">
              <span>Peshawar Zone Shipping ({currentZone.nameEn}):</span>
              <span>PKR {shippingFee}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
              <span>Total Payable:</span>
              <span className="text-[#C5A059]">PKR {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider shadow-xl transition-all"
          >
            {t.placeOrder}
          </button>
        </form>
      </div>
    </div>
  );
};
