import React, { useState } from 'react';
import { X, MapPin, Plus, CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AddZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PESHAWAR_AREA_SUGGESTIONS = [
  { nameEn: 'Kohat Road Bazaar', nameUr: 'کوہاٹ روڈ بازار', fee: 140, time: '40-60 mins' },
  { nameEn: 'Dalazak Road', nameUr: 'ڈلازاک روڈ', fee: 130, time: '45-60 mins' },
  { nameEn: 'Tehkal Payan / Bala', nameUr: 'تہکال پایاں / بالا', fee: 100, time: '30-45 mins' },
  { nameEn: 'Charsadda Road', nameUr: 'چارسدہ روڈ', fee: 150, time: '50-70 mins' },
  { nameEn: 'Ring Road Peshawar', nameUr: 'رنگ روڈ پشاور', fee: 120, time: '35-50 mins' },
  { nameEn: 'Dabgari Gardens', nameUr: 'ڈابگری گارڈنز', fee: 110, time: '30-45 mins' },
  { nameEn: 'Peshawar City Cantt', nameUr: 'پشاور سٹی کینٹ', fee: 100, time: '25-40 mins' },
  { nameEn: 'Pajaggi Road', nameUr: 'پاجگی روڈ', fee: 130, time: '40-55 mins' }
];

export const AddZoneModal: React.FC<AddZoneModalProps> = ({ isOpen, onClose }) => {
  const { language, addCustomZone } = useApp();

  const [nameEn, setNameEn] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(120);
  const [estimatedTime, setEstimatedTime] = useState('45-60 mins');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApplySuggestion = (s: typeof PESHAWAR_AREA_SUGGESTIONS[0]) => {
    setNameEn(s.nameEn);
    setNameUr(s.nameUr);
    setDeliveryFee(s.fee);
    setEstimatedTime(s.time);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEn = nameEn.trim() || nameUr.trim();
    const finalUr = nameUr.trim() || nameEn.trim();
    if (!finalEn) return;

    setIsSubmitting(true);
    addCustomZone({
      nameEn: finalEn,
      nameUr: finalUr,
      deliveryFee: Number(deliveryFee) || 120,
      estimatedTime: estimatedTime.trim() || '45-60 mins'
    });

    setIsSubmitting(false);
    setNameEn('');
    setNameUr('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#151515] border border-white/10 rounded-2xl max-w-lg w-full max-h-[96vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative text-[#E5E5E5] p-4 sm:p-6 space-y-4 sm:space-y-5 my-2 sm:my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display font-bold text-lg text-white">
                {language === 'ur' ? 'نیا بازار / زون شامل کریں' : 'Add New Bazaar / Zone'}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {language === 'ur'
                  ? 'پشاور کا کوئی بھی نیا علاقہ یا بازار شامل کریں جو فائر بیس میں محفوظ ہو گا'
                  : 'Add any Peshawar bazaar area to list products & filter delivery'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#202020] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Peshawar Suggestions */}
        <div>
          <label className="text-[11px] font-semibold text-neutral-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C5A059]" />
            <span>{language === 'ur' ? 'پشاور کے مشہور علاقوں کی تجاویز:' : 'Quick Peshawar Suggestions:'}</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PESHAWAR_AREA_SUGGESTIONS.map((s) => (
              <button
                key={s.nameEn}
                type="button"
                onClick={() => handleApplySuggestion(s)}
                className="px-2.5 py-1 rounded-lg bg-[#0A0A0A] border border-white/10 hover:border-[#C5A059] text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                + {language === 'ur' ? s.nameUr : s.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              {language === 'ur' ? 'بازار / علاقے کا نام (English) *' : 'Bazaar / Area Name (English) *'}
            </label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Kohat Road Bazaar"
              className="w-full p-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              {language === 'ur' ? 'بازار / علاقے کا نام (اردو) *' : 'Bazaar / Area Name (Urdu) *'}
            </label>
            <input
              type="text"
              required
              value={nameUr}
              onChange={(e) => setNameUr(e.target.value)}
              placeholder="مثال: کوہاٹ روڈ بازار"
              className="w-full p-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                {language === 'ur' ? 'ڈیلیوری فیس (PKR) *' : 'Delivery Fee (PKR) *'}
              </label>
              <input
                type="number"
                required
                min={0}
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                {language === 'ur' ? 'تخمینی وقت (Delivery Time)' : 'Estimated Delivery Time'}
              </label>
              <input
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="e.g. 40-60 mins"
                className="w-full p-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-[11px] text-neutral-400 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            <span>
              {language === 'ur'
                ? 'یہ نیا بازار فائر بیس میں خودکار طور پر محفوظ ہو جائے گا اور تمام خریدار اور دکاندار اسے فوری استعمال کر سکیں گے۔'
                : 'This bazaar zone will automatically be saved to Firebase Firestore and become instantly available for all shoppers and vendors.'}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 bg-[#0A0A0A] hover:bg-[#1F1F1F] text-neutral-300 font-bold text-xs cursor-pointer"
            >
              {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!nameEn.trim() && !nameUr.trim())}
              className="flex-1 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#C5A059]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              <span>{language === 'ur' ? 'بازار شامل کریں' : 'Save Bazaar Zone'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
