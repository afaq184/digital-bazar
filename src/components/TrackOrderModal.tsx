import React, { useState } from 'react';
import {
  X,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  PackageCheck,
  MapPin,
  Phone,
  Printer,
  User,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';

export const TrackOrderModal: React.FC = () => {
  const {
    language,
    t,
    isTrackOrderOpen,
    setIsTrackOrderOpen,
    orders,
    setActiveOrderInvoice,
    zones
  } = useApp();

  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrders, setFoundOrders] = useState<Order[]>([]);

  if (!isTrackOrderOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const trimmed = query.trim().toLowerCase();
    const matched = orders.filter(
      (o) =>
        o.id.toLowerCase() === trimmed ||
        o.customerPhone.includes(trimmed)
    );

    setFoundOrders(matched);
    setSearched(true);
  };

  const statusSteps: OrderStatus[] = ['Received', 'Preparing', 'Dispatched', 'Delivered'];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    return statusSteps.indexOf(status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#151515] border border-white/10 rounded-xl max-w-2xl w-full max-h-[96vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative text-[#E5E5E5] my-2 sm:my-8 p-4 sm:p-6 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#C5A059]" />
            <h2 className="font-serif-display font-bold text-xl text-white">{t.orderTracker}</h2>
          </div>
          <button
            onClick={() => setIsTrackOrderOpen(false)}
            className="p-1.5 rounded hover:bg-[#1A1A1A] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.enterOrderIdOrPhone}
              className="w-full pl-9 pr-3 py-2.5 rounded bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5A059]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider transition-all"
          >
            {t.searchOrder}
          </button>
        </form>

        {/* Search Results */}
        {searched && (
          <div className="space-y-4">
            {foundOrders.length === 0 ? (
              <div className="p-6 rounded bg-[#0A0A0A] text-center text-neutral-400 text-xs space-y-2 border border-white/10">
                <AlertCircle className="w-8 h-8 text-[#C5A059] mx-auto" />
                <p>{t.orderNotFound}</p>
                <p className="text-[11px] text-neutral-500">
                  Tip: Try searching demo orders like <strong className="text-[#C5A059]">DB-1001</strong> or <strong className="text-[#C5A059]">DB-1002</strong> or phone <strong className="text-[#C5A059]">03018889900</strong>
                </p>
              </div>
            ) : (
              foundOrders.map((order) => {
                const currentStepIdx = getStepIndex(order.status);
                const zoneObj = zones.find((z) => z.id === order.zone);
                const zoneName = zoneObj
                  ? language === 'ur'
                    ? zoneObj.nameUr
                    : zoneObj.nameEn
                  : order.zone;

                return (
                  <div
                    key={order.id}
                    className="p-5 rounded bg-[#0A0A0A] border border-white/10 space-y-4 text-xs"
                  >
                    {/* Order Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <span className="text-neutral-400">Order ID: </span>
                        <strong className="text-white text-sm">{order.id}</strong>
                        <span className="ml-2 text-[11px] text-neutral-500">
                          ({new Date(order.createdAt).toLocaleDateString()})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-[#C5A059]/10 text-[#C5A059] font-bold border border-[#C5A059]/30 uppercase tracking-wider">
                          {order.status}
                        </span>
                        <button
                          onClick={() => {
                            setIsTrackOrderOpen(false);
                            setActiveOrderInvoice(order);
                          }}
                          className="px-2.5 py-1 rounded bg-[#151515] hover:bg-[#1A1A1A] text-neutral-200 flex items-center gap-1 border border-white/10 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>

                    {/* Visual Progress Timeline */}
                    <div className="py-2">
                      <div className="grid grid-cols-4 gap-2 relative">
                        {statusSteps.map((step, idx) => {
                          const isCompleted = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div key={step} className="flex flex-col items-center text-center space-y-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  isCompleted
                                    ? 'bg-[#C5A059] text-black shadow-md'
                                    : 'bg-[#151515] border border-white/10 text-neutral-500'
                                }`}
                              >
                                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[11px] leading-tight ${
                                  isCurrent
                                    ? 'text-[#C5A059] font-bold'
                                    : isCompleted
                                    ? 'text-neutral-300 font-medium'
                                    : 'text-neutral-500'
                                }`}
                              >
                                {step === 'Received' && t.orderReceived}
                                {step === 'Preparing' && t.preparing}
                                {step === 'Dispatched' && t.dispatched}
                                {step === 'Delivered' && t.delivered}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delivery & Rider Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                      <div className="space-y-1 text-neutral-300">
                        <p className="flex items-center gap-1 font-semibold text-white">
                          <User className="w-3.5 h-3.5 text-[#C5A059]" />
                          {order.customerName}
                        </p>
                        <p className="flex items-center gap-1 text-neutral-400">
                          <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                          <span>{order.address} ({zoneName})</span>
                        </p>
                        {order.customerCoords && (
                          <div className="mt-1 pt-1 border-t border-white/5 text-[10px] text-[#C5A059]">
                            <span>Customer Live GPS Pin: Lat {order.customerCoords.lat}, Lng {order.customerCoords.lng}</span>
                            <a
                              href={`https://maps.google.com/?q=${order.customerCoords.lat},${order.customerCoords.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 font-bold underline text-white"
                            >
                              [Open Customer Map]
                            </a>
                          </div>
                        )}
                      </div>

                      {order.rider && (
                        <div className="p-2.5 rounded bg-[#151515] border border-white/10 space-y-1">
                          <p className="font-bold text-[#C5A059]">{t.assignedRider}:</p>
                          <p className="text-neutral-200">{order.rider.name} ({order.rider.vehicleNo})</p>
                          <p className="text-neutral-400 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#C5A059]" />
                            {order.rider.phone}
                          </p>
                          {order.rider.coords && (
                            <div className="mt-1 pt-1 border-t border-white/5 text-[10px] text-[#C5A059]">
                              <span>Rider Live GPS: Lat {order.rider.coords.lat}, Lng {order.rider.coords.lng}</span>
                              <a
                                href={`https://maps.google.com/?q=${order.rider.coords.lat},${order.rider.coords.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 font-bold underline text-white"
                              >
                                [Track Rider Live]
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
