import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  Navigation,
  Loader2,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LocationCoords, OrderStatus, Rider } from '../types';

export const RiderDashboard: React.FC = () => {
  const {
    language,
    t,
    user,
    setUser,
    riders,
    updateRiderLocation,
    orders,
    updateOrderStatus,
    zones,
    addToast
  } = useApp();

  // Find or default rider profile
  const fallbackRider: Rider = {
    id: user?.id || 'r-self',
    name: user?.name || 'Delivery Rider',
    phone: user?.phone || '03001234567',
    vehicleNo: user?.vehicleNo || 'KPK-2026',
    assignedZone: 'hayatabad',
    status: 'Available'
  };

  const currentRider =
    riders.find((r) => (user?.phone && r.phone === user.phone) || (user?.name && r.name === user.name)) ||
    riders[0] ||
    fallbackRider;

  const [riderName, setRiderName] = useState(user?.name || currentRider.name);
  const [riderPhone, setRiderPhone] = useState(user?.phone || currentRider.phone);
  const [vehicleNo, setVehicleNo] = useState(currentRider.vehicleNo || 'KPK-8899');
  const [assignedZone, setAssignedZone] = useState(currentRider.assignedZone || 'hayatabad');

  const [isLocating, setIsLocating] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<LocationCoords | null>(
    currentRider.coords || null
  );

  // Rider's assigned orders
  const riderOrders = orders.filter(
    (o) => o.rider?.id === currentRider.id || o.zone === assignedZone
  );

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setUser({
        ...user,
        name: riderName,
        phone: riderPhone,
        vehicleNo
      });
    }
    addToast(
      language === 'ur'
        ? 'رائڈر کی معلومات اپ ڈیٹ ہو گئیں!'
        : 'Rider profile updated successfully!',
      'success'
    );
  };

  const handleUpdateLiveLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: LocationCoords = {
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
            addressText: `Live GPS Pin (${assignedZone})`,
            timestamp: new Date().toLocaleTimeString()
          };
          setCurrentCoords(coords);
          updateRiderLocation(currentRider.id, coords);
          setIsLocating(false);
        },
        (error) => {
          // Fallback Peshawar GPS coordinates
          const defaultCoords: LocationCoords = {
            lat: 34.0151,
            lng: 71.5249,
            addressText: 'Peshawar City Center GPS',
            timestamp: new Date().toLocaleTimeString()
          };
          setCurrentCoords(defaultCoords);
          updateRiderLocation(currentRider.id, defaultCoords);
          setIsLocating(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      const defaultCoords: LocationCoords = {
        lat: 34.0151,
        lng: 71.5249,
        addressText: 'Peshawar Central GPS',
        timestamp: new Date().toLocaleTimeString()
      };
      setCurrentCoords(defaultCoords);
      updateRiderLocation(currentRider.id, defaultCoords);
      setIsLocating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-24 md:pb-8 space-y-6 text-[#E5E5E5]">
      {/* Title Header */}
      <div className="bg-[#151515] border border-white/10 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-serif-display font-bold text-white">
                Rider Delivery Portal / ڈلیوری رائڈر پورٹل
              </h1>
              <span className="bg-[#C5A059]/10 text-[#C5A059] text-xs px-2.5 py-0.5 rounded border border-[#C5A059]/30 font-bold uppercase tracking-wider">
                Active Rider
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live Delivery GPS Tracking & Order Status Updates (Digital Bazar Peshawar)
            </p>
          </div>
        </div>

        {/* Live Location Trigger Button */}
        <button
          onClick={handleUpdateLiveLocation}
          disabled={isLocating}
          className="px-4 py-2.5 rounded bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Fetching GPS Coordinates...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>Broadcast My Live Location</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Rider Information & GPS Status */}
        <div className="space-y-6">
          {/* Information Form */}
          <div className="bg-[#151515] border border-white/10 rounded-xl p-5 space-y-4">
            <h3 className="font-serif-display font-bold text-lg text-white border-b border-white/10 pb-2">
              Rider Profile Details
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Rider Name</label>
                <input
                  type="text"
                  required
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={riderPhone}
                  onChange={(e) => setRiderPhone(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Bike / Vehicle No</label>
                <input
                  type="text"
                  required
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. KPK-9821"
                  className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Assigned Peshawar Zone</label>
                <select
                  value={assignedZone}
                  onChange={(e) => setAssignedZone(e.target.value as any)}
                  className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.nameEn} ({z.nameUr})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded bg-[#0A0A0A] hover:bg-[#1A1A1A] border border-white/10 text-neutral-200 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Save Rider Info
              </button>
            </form>
          </div>

          {/* Current Live GPS Location Status */}
          <div className="bg-[#151515] border border-white/10 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-serif-display font-bold text-base text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C5A059]" />
                <span>Rider GPS Broadcast</span>
              </span>
              <span className="text-[10px] bg-[#C5A059]/10 text-[#C5A059] px-2 py-0.5 rounded border border-[#C5A059]/30 font-bold">
                LIVE
              </span>
            </div>

            {currentCoords ? (
              <div className="p-3 rounded bg-[#0A0A0A] border border-[#C5A059]/30 space-y-2 text-xs">
                <p className="text-neutral-300 font-semibold">Broadcasting Live Coordinates:</p>
                <div className="grid grid-cols-2 gap-2 text-neutral-400 font-mono text-[11px]">
                  <p>Latitude: <span className="text-white font-bold">{currentCoords.lat}</span></p>
                  <p>Longitude: <span className="text-white font-bold">{currentCoords.lng}</span></p>
                </div>
                <p className="text-[10px] text-neutral-500">Updated: {currentCoords.timestamp}</p>
                <a
                  href={`https://maps.google.com/?q=${currentCoords.lat},${currentCoords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#C5A059] font-bold text-xs underline mt-1"
                >
                  <span>Open Live Map in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                Click "Broadcast My Live Location" above to send your live GPS coordinates to customer order tracker.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Assigned Delivery Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#151515] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif-display font-bold text-lg text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C5A059]" />
                <span>Assigned Orders ({riderOrders.length})</span>
              </h3>
              <span className="text-xs text-neutral-400">Zone: {assignedZone}</span>
            </div>

            {riderOrders.length === 0 ? (
              <p className="text-xs text-neutral-400 py-8 text-center italic">
                No orders assigned to your zone currently.
              </p>
            ) : (
              <div className="space-y-4">
                {riderOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded bg-[#0A0A0A] border border-white/10 space-y-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                      <div>
                        <span className="font-bold text-white text-sm">Order {ord.id}</span>
                        <span className="ml-2 text-neutral-400 text-[11px]">
                          (PKR {ord.totalAmount.toLocaleString()} - {ord.paymentMethod})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-[#C5A059]/10 text-[#C5A059] font-bold border border-[#C5A059]/30">
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-neutral-300">
                      <div>
                        <p className="font-bold text-[#C5A059]">Customer Info:</p>
                        <p className="text-white font-semibold">{ord.customerName}</p>
                        <p className="text-neutral-400">{ord.customerPhone}</p>
                        <p className="text-neutral-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#C5A059] inline mr-1" />
                          {ord.address}
                        </p>
                        {ord.customerCoords && (
                          <a
                            href={`https://maps.google.com/?q=${ord.customerCoords.lat},${ord.customerCoords.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#C5A059] font-bold text-[11px] underline mt-1"
                          >
                            <span>Customer GPS Pin ({ord.customerCoords.lat}, {ord.customerCoords.lng})</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-[#C5A059]">Update Order Delivery Status:</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(['Preparing', 'Dispatched', 'Delivered'] as OrderStatus[]).map((st) => (
                            <button
                              key={st}
                              onClick={() => updateOrderStatus(ord.id, st, currentRider)}
                              className={`px-3 py-1.5 rounded font-bold transition-all text-xs ${
                                ord.status === st
                                  ? 'bg-[#C5A059] text-black shadow'
                                  : 'bg-[#151515] border border-white/10 text-neutral-300 hover:text-white'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
