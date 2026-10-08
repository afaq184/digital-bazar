import React from 'react';
import { Store, GraduationCap, MapPin, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { language, t, zones, setSelectedZone } = useApp();

  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10 text-neutral-400 text-xs">
      {/* Top Value Banner */}
      <div className="border-b border-white/10 bg-[#0F0F0F] py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">{t.verifiedLocalVendors}</p>
              <p className="text-[11px] text-neutral-400">Directly from Kissa Khwani & Namak Mandi</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">{t.sameDayDelivery}</p>
              <p className="text-[11px] text-neutral-400">Doorstep delivery across 9 Peshawar zones</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">{t.cashOnDelivery}</p>
              <p className="text-[11px] text-neutral-400">COD, EasyPaisa, & JazzCash Supported</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">Bilingual Platform</p>
              <p className="text-[11px] text-neutral-400">Full English & Urdu (RTL) Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Thesis Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded bg-[#C5A059]/20 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-serif-display font-bold text-xl tracking-tight">Digital Bazar Peshawar</span>
          </div>

          <p className="text-neutral-400 leading-relaxed text-xs">
            {language === 'ur'
              ? 'پشاور کی لوکل مارکیٹ اور دکانداروں کے لیے تیار کردہ ویب اور موبائل پورٹل جس کے ذریعے خریدار گھر بیٹھے قصہ خوانی، نمک منڈی اور دیگر بازاروں سے سامان منگوا سکتے ہیں۔'
              : 'A hyper-local e-commerce marketplace for Peshawar connecting customers with local bazaars for instant doorstep delivery.'}
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 font-semibold text-[11px]">
              <CheckCircle2 className="w-4 h-4" /> 100% Verified Peshawar Bazaars
            </span>
          </div>
        </div>

        {/* Peshawar Bazaars / Zones */}
        <div>
          <h4 className="font-bold font-serif-display text-white text-base mb-3 tracking-wide">Peshawar Bazaars & Zones</h4>
          <ul className="space-y-1.5 text-neutral-400">
            {zones.slice(0, 6).map((z) => (
              <li key={z.id}>
                <button
                  onClick={() => setSelectedZone(z.id)}
                  className="hover:text-[#C5A059] transition-colors flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-[#C5A059] shrink-0" />
                  <span>{language === 'ur' ? z.nameUr : z.nameEn}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Marketplace Guarantees & Support */}
        <div>
          <h4 className="font-bold font-serif-display text-white text-base mb-3 tracking-wide">Buyer & Seller Guarantees</h4>
          <div className="space-y-2 text-neutral-400">
            <div>
              <p className="font-semibold text-neutral-200">Authentic Products:</p>
              <p className="text-[11px]">Directly sourced from trusted master artisans of Peshawar.</p>
            </div>
            <div>
              <p className="font-semibold text-neutral-200">Express Delivery:</p>
              <p className="text-[11px]">Real-time rider tracking with doorstep COD verification.</p>
            </div>
            <div>
              <p className="font-semibold text-neutral-200">Payment Modes:</p>
              <p className="text-[11px]">Cash on Delivery, EasyPaisa, & JazzCash.</p>
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div>
          <h4 className="font-bold font-serif-display text-white text-base mb-3 tracking-wide">Local Support & Inquiries</h4>
          <div className="space-y-2 text-neutral-400">
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
              <span>0300-9876543 / 0312-5554321</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
              <span>support@digitalbazar.pk</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
              <span>Department of Computer Science, Govt. Superior Science College, Peshawar</span>
            </p>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/5 bg-[#080808] py-4 px-4 text-center text-[11px] text-neutral-500">
        <p>
          © 2025–2026 Digital Bazar: A Local Marketplace for Peshawar. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
