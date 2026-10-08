import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  TrendingUp,
  Award,
  Database,
  Cloud,
  Check,
  Trash2,
  Plus,
  Package,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderStatus, Rider, CategoryId, ZoneId, ProductUnit } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    language,
    t,
    vendors,
    approveVendor,
    rejectVendor,
    orders,
    updateOrderStatus,
    products,
    addProduct,
    deleteProduct,
    categories,
    riders,
    zones,
    registeredAccounts,
    firebaseConnected,
    firebaseProjectId,
    setActiveOrderInvoice,
    setIsAddZoneModalOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState<'vendors' | 'products' | 'orders' | 'zones' | 'database'>('vendors');
  const [isAdminAddModalOpen, setIsAdminAddModalOpen] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    titleEn: '',
    titleUr: '',
    descriptionEn: '',
    descriptionUr: '',
    price: 950,
    originalPrice: 1100,
    unit: 'kg' as ProductUnit,
    unitLabelEn: 'Per 1 Kg',
    unitLabelUr: 'فی 1 کلو گرام',
    weightOrVolume: '1 Kg',
    pricePerKg: 950,
    category: 'food-sweets' as CategoryId,
    zone: 'namak-mandi' as ZoneId,
    stock: 30,
    vendorName: 'Peshawar Central Merchant',
    vendorPhone: '03001234567',
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=800&auto=format&fit=crop'
  });

  const handleAdminAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(newProductForm.price) || 0;
    const isKg = newProductForm.unit === 'kg';
    const computedPricePerKg = isKg ? priceNum : undefined;

    addProduct({
      titleEn: newProductForm.titleEn,
      titleUr: newProductForm.titleUr || newProductForm.titleEn,
      descriptionEn: newProductForm.descriptionEn || 'Authentic handmade Peshawar product',
      descriptionUr: newProductForm.descriptionUr || 'پشاور کی روایتی معیاری پروڈکٹ',
      price: priceNum,
      originalPrice: Number(newProductForm.originalPrice) || priceNum,
      unit: newProductForm.unit,
      unitLabelEn: newProductForm.unitLabelEn || (isKg ? 'Per 1 Kg' : 'Per Item'),
      unitLabelUr: newProductForm.unitLabelUr || (isKg ? 'فی 1 کلو گرام' : 'فی عدد'),
      weightOrVolume: newProductForm.weightOrVolume || (isKg ? '1 Kg' : '1 Item'),
      pricePerKg: computedPricePerKg,
      category: newProductForm.category,
      zone: newProductForm.zone,
      vendorId: 'v-admin-listed',
      vendorName: newProductForm.vendorName,
      vendorPhone: newProductForm.vendorPhone,
      images: [newProductForm.imageUrl],
      stock: Number(newProductForm.stock),
      rating: 5.0,
      reviewCount: 0,
      isFeatured: true
    });
    setIsAdminAddModalOpen(false);
    setNewProductForm({
      titleEn: '',
      titleUr: '',
      descriptionEn: '',
      descriptionUr: '',
      price: 950,
      originalPrice: 1100,
      unit: 'kg',
      unitLabelEn: 'Per 1 Kg',
      unitLabelUr: 'فی 1 کلو گرام',
      weightOrVolume: '1 Kg',
      pricePerKg: 950,
      category: 'food-sweets',
      zone: 'namak-mandi',
      stock: 30,
      vendorName: 'Peshawar Central Merchant',
      vendorPhone: '03001234567',
      imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=800&auto=format&fit=crop'
    });
  };

  const totalPlatformRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingVendors = vendors.filter((v) => !v.isVerified);
  const verifiedVendors = vendors.filter((v) => v.isVerified);

  // Sales Volume by Zone breakdown
  const zoneSales = zones.map((z) => {
    const zoneOrders = orders.filter((o) => o.zone === z.id);
    const revenue = zoneOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      zone: z,
      orderCount: zoneOrders.length,
      revenue
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-24 md:pb-8 space-y-6 text-[#E5E5E5]">
      {/* Admin Title Banner */}
      <div className="bg-[#151515] border border-white/10 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-serif-display font-bold text-white">{t.adminPortal}</h1>
              <span className="bg-[#C5A059]/10 text-[#C5A059] text-xs px-2.5 py-0.5 rounded border border-[#C5A059]/30 font-bold uppercase tracking-wider">
                System Administrator
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Digital Bazar Peshawar Platform Administration & Governance (admin@gmail.com)
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#151515] border border-white/10 p-4 rounded-xl space-y-1">
          <p className="text-xs font-semibold text-neutral-400">Total Revenue</p>
          <p className="text-xl font-bold text-[#C5A059]">
            PKR {totalPlatformRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-[#151515] border border-white/10 p-4 rounded-xl space-y-1">
          <p className="text-xs font-semibold text-neutral-400">Total Orders</p>
          <p className="text-xl font-bold text-white">{orders.length}</p>
        </div>

        <div className="bg-[#151515] border border-white/10 p-4 rounded-xl space-y-1">
          <p className="text-xs font-semibold text-neutral-400">Verified Vendors</p>
          <p className="text-xl font-bold text-neutral-200">{verifiedVendors.length}</p>
        </div>

        <div className="bg-[#151515] border border-white/10 p-4 rounded-xl space-y-1">
          <p className="text-xs font-semibold text-neutral-400">{t.pendingVendors}</p>
          <p className="text-xl font-bold text-[#C5A059]">{pendingVendors.length}</p>
        </div>

        <div className="bg-[#151515] border border-white/10 p-4 rounded-xl space-y-1">
          <p className="text-xs font-semibold text-neutral-400">Total Listed Products</p>
          <p className="text-xl font-bold text-neutral-200">{products.length}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'vendors'
              ? 'bg-[#C5A059] text-black shadow-md'
              : 'bg-[#151515] text-neutral-300 hover:text-white border border-white/10'
          }`}
        >
          Vendor Approvals ({vendors.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'products'
              ? 'bg-[#C5A059] text-black shadow-md'
              : 'bg-[#151515] text-neutral-300 hover:text-white border border-white/10'
          }`}
        >
          All Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'orders'
              ? 'bg-[#C5A059] text-black shadow-md'
              : 'bg-[#151515] text-neutral-300 hover:text-white border border-white/10'
          }`}
        >
          All Orders & Rider Dispatch ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'zones'
              ? 'bg-[#C5A059] text-black shadow-md'
              : 'bg-[#151515] text-neutral-300 hover:text-white border border-white/10'
          }`}
        >
          Sales Analytics by Zone
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
            activeTab === 'database'
              ? 'bg-emerald-500 text-black shadow-md font-black'
              : 'bg-[#151515] text-emerald-400 hover:text-white border border-emerald-500/30'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Firebase Cloud Database (Live)</span>
        </button>
      </div>

      {/* Tab 1: Vendor Verification */}
      {activeTab === 'vendors' && (
        <div className="bg-[#151515] border border-white/10 rounded-xl overflow-hidden text-xs shadow-md">
          <div className="p-4 bg-[#0A0A0A] border-b border-white/10 flex justify-between items-center">
            <h3 className="font-serif-display font-bold text-sm text-white flex items-center gap-2 tracking-wide">
              <Store className="w-4 h-4 text-[#C5A059]" />
              <span>Vendor Shop Management & Verification</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0A0A0A] text-neutral-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="p-4">Shop Name</th>
                  <th className="p-4">Owner Name</th>
                  <th className="p-4">Market Zone</th>
                  <th className="p-4">Phone / WhatsApp</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-500">
                      {language === 'ur'
                        ? 'ابھی کوئی دکاندار رجسٹر نہیں ہوا۔ نئے دکاندار کے رجسٹر ہونے پر وہ یہاں تصدیق کے لیے نظر آئیں گے۔'
                        : 'No vendors registered yet. New shops will appear here for verification.'}
                    </td>
                  </tr>
                ) : (
                  vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="p-4 font-bold text-white">
                      {language === 'ur' ? v.shopNameUr : v.shopNameEn}
                      <p className="text-[11px] text-neutral-400 font-normal">{v.marketAddressEn}</p>
                    </td>
                    <td className="p-4 text-neutral-300">{v.ownerName}</td>
                    <td className="p-4 text-[#C5A059] font-semibold">{v.zone}</td>
                    <td className="p-4 text-neutral-300">{v.phone}</td>
                    <td className="p-4">
                      {v.isVerified ? (
                        <span className="px-2.5 py-0.5 rounded bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-[10px] uppercase tracking-wider w-fit">
                          Pending Approval
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {!v.isVerified ? (
                        <button
                          onClick={() => approveVendor(v.id)}
                          className="px-3 py-1 rounded bg-[#C5A059] text-black font-extrabold hover:bg-[#D4AF37] text-xs uppercase tracking-wider"
                        >
                          {t.approve}
                        </button>
                      ) : (
                        <button
                          onClick={() => rejectVendor(v.id)}
                          className="px-3 py-1 rounded bg-[#0A0A0A] hover:bg-[#1A1A1A] text-rose-400 border border-white/10 font-medium"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Products Management (Saved in Firebase) */}
      {activeTab === 'products' && (
        <div className="bg-[#151515] border border-white/10 rounded-xl overflow-hidden text-xs shadow-md space-y-4 p-4">
          <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="font-serif-display font-bold text-sm text-white flex items-center gap-2 tracking-wide">
                <Package className="w-4 h-4 text-[#C5A059]" />
                <span>All Products in Firebase Cloud Database ({products.length})</span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                All products stored in Google Firebase Firestore are live across customer mobile and web views.
              </p>
            </div>

            <button
              onClick={() => setIsAdminAddModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product to Firebase</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0A0A0A] text-neutral-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Peshawar Zone</th>
                  <th className="p-3">Vendor / Shop</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-500">
                      No products added yet. Click &quot;Add New Product to Firebase&quot; or vendors can add products from their shop dashboard.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#1A1A1A] transition-colors">
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=200'}
                          alt={p.titleEn}
                          className="w-10 h-10 rounded object-cover border border-white/10"
                        />
                        <div>
                          <p className="font-bold text-white">{language === 'ur' ? p.titleUr : p.titleEn}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">ID: {p.id}</p>
                        </div>
                      </td>
                      <td className="p-3 text-neutral-300 font-medium capitalize">{p.category.replace(/-/g, ' ')}</td>
                      <td className="p-3 text-[#C5A059] font-medium capitalize">{p.zone.replace(/-/g, ' ')}</td>
                      <td className="p-3 text-neutral-300 font-semibold">{p.vendorName}</td>
                      <td className="p-3 font-bold text-emerald-400">PKR {p.price.toLocaleString()}</td>
                      <td className="p-3 text-neutral-300 font-bold">{p.stock}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${p.titleEn}" from Firebase database?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
                          title="Delete product from Firebase"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: All Orders & Rider Dispatch */}
      {activeTab === 'orders' && (
        <div className="bg-[#151515] border border-white/10 rounded-xl overflow-hidden text-xs shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0A0A0A] text-neutral-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Peshawar Zone</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Assigned Rider</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-500">
                      {language === 'ur'
                        ? 'ابھی تک کوئی آرڈر موصول نہیں ہوا۔ نئے کسٹمر آرڈرز یہاں ظاہر ہوں گے۔'
                        : 'No orders received yet. Customer orders will appear here for dispatch.'}
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="p-4 font-bold text-white">{ord.id}</td>
                    <td className="p-4">
                      <p className="font-semibold text-neutral-200">{ord.customerName}</p>
                      <p className="text-[11px] text-neutral-400">{ord.customerPhone}</p>
                    </td>
                    <td className="p-4 text-[#C5A059] font-medium">{ord.zone}</td>
                    <td className="p-4 font-bold text-white">PKR {ord.totalAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <select
                        value={ord.rider?.id || ''}
                        onChange={(e) => {
                          const r = riders.find((rd) => rd.id === e.target.value);
                          updateOrderStatus(ord.id, ord.status, r);
                        }}
                        className="bg-[#0A0A0A] border border-white/10 text-xs text-neutral-200 rounded px-2 py-1 focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="">Select Delivery Rider</option>
                        {riders.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.vehicleNo})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          updateOrderStatus(ord.id, e.target.value as OrderStatus, ord.rider)
                        }
                        className="bg-[#0A0A0A] border border-white/10 text-xs font-bold text-[#C5A059] rounded px-2 py-1 focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="Received">Received</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveOrderInvoice(ord)}
                        className="px-2.5 py-1 rounded bg-[#0A0A0A] hover:bg-[#1A1A1A] text-neutral-200 font-medium border border-white/10 transition-colors"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Sales by Zone Analytics */}
      {activeTab === 'zones' && (
        <div className="bg-[#151515] border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="font-serif-display font-bold text-base text-white flex items-center gap-2 tracking-wide">
            <TrendingUp className="w-5 h-5 text-[#C5A059]" />
            <span>Peshawar Zone Market Activity</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {zoneSales.map((item) => (
              <div
                key={item.zone.id}
                className="p-4 rounded bg-[#0A0A0A] border border-white/10 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#C5A059] text-sm">{item.zone.nameEn}</span>
                  <span className="text-neutral-400">Fee: PKR {item.zone.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Completed Orders:</span>
                  <span className="font-bold text-white">{item.orderCount}</span>
                </div>
                <div className="flex justify-between text-neutral-300 border-t border-white/10 pt-2 font-bold">
                  <span>Total Sales:</span>
                  <span className="text-[#C5A059]">PKR {item.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Firebase Cloud Database Status */}
      {activeTab === 'database' && (
        <div className="bg-[#151515] border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif-display font-bold text-lg text-white flex items-center gap-2">
                  <span>Firebase Firestore Database</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live & Connected
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  All marketplace products, vendors, customer orders, registered users, and rider dispatches are synchronized in Google Firebase Cloud.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-emerald-400">PROJECT: {firebaseProjectId}</span>
            </div>
          </div>

          {/* Cloud Config Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-neutral-400 font-semibold">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Google Firebase Project</span>
              </div>
              <p className="text-sm font-mono font-bold text-white truncate">{firebaseProjectId}</p>
              <p className="text-[11px] text-neutral-500">Official Cloud Instance</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-neutral-400 font-semibold">
                <Database className="w-4 h-4 text-[#C5A059]" />
                <span>Firestore Database ID</span>
              </div>
              <p className="text-xs font-mono font-bold text-[#C5A059] truncate">
                ai-studio-digitalbazarpesh-58aaa365...
              </p>
              <p className="text-[11px] text-neutral-500">Enterprise High-Availability Tier</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-neutral-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Real-Time Sync State</span>
              </div>
              <p className="text-sm font-bold text-emerald-400">
                {firebaseConnected ? 'Active (onSnapshot)' : 'Connecting...'}
              </p>
              <p className="text-[11px] text-neutral-500">Auto-updates on any device instantly</p>
            </div>
          </div>

          {/* Collections Overview */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-neutral-200">Synchronized Firestore Collections:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10 text-center">
                <p className="text-lg font-bold text-white">{products.length}</p>
                <p className="text-[11px] text-neutral-400 font-mono">/products</p>
              </div>

              <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10 text-center">
                <p className="text-lg font-bold text-white">{vendors.length}</p>
                <p className="text-[11px] text-neutral-400 font-mono">/vendors</p>
              </div>

              <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10 text-center">
                <p className="text-lg font-bold text-white">{orders.length}</p>
                <p className="text-[11px] text-neutral-400 font-mono">/orders</p>
              </div>

              <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10 text-center">
                <p className="text-lg font-bold text-white">{riders.length}</p>
                <p className="text-[11px] text-neutral-400 font-mono">/riders</p>
              </div>

              <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10 text-center">
                <p className="text-lg font-bold text-white">{registeredAccounts.length}</p>
                <p className="text-[11px] text-neutral-400 font-mono">/users</p>
              </div>

              <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10 text-center">
                <p className="text-lg font-bold text-white">Live</p>
                <p className="text-[11px] text-neutral-400 font-mono">/reviews</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add Product to Firebase Modal */}
      {isAdminAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#151515] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-6 text-[#E5E5E5] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif-display font-bold text-xl text-white">
                  Add New Product to Firebase
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Directly saved to Google Firebase Firestore database and synced across apps.
                </p>
              </div>
              <button
                onClick={() => setIsAdminAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#1A1A1A] text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates / Presets (Especially for Gaye / Cow meat per kg, livestock, etc.) */}
            <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-1.5">
              <span className="text-[11px] font-semibold text-neutral-400 block">
                ⚡ Quick Presets (Click to Auto-Fill):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setNewProductForm({
                      ...newProductForm,
                      titleEn: 'Fresh Farm Cow Meat / Beef (Mix & Boneless)',
                      titleUr: 'تازہ گائے کا گوشت / بیف (مکس اور بغیر ہڈی)',
                      price: 950,
                      originalPrice: 1100,
                      unit: 'kg',
                      unitLabelEn: 'Per 1 Kg',
                      unitLabelUr: 'فی 1 کلو گرام',
                      weightOrVolume: '1 Kg',
                      pricePerKg: 950,
                      category: 'food-sweets',
                      descriptionEn: 'Daily fresh butchered Peshawar farm cow meat per 1 kg.',
                      descriptionUr: 'پشاور کے مقامی فارمز کا روزانہ کا تازہ گائے کا گوشت فی 1 کلو گرام۔',
                      imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=800&auto=format&fit=crop'
                    });
                  }}
                  className="px-2.5 py-1 rounded bg-[#1F1F1F] hover:bg-[#C5A059] hover:text-black text-[11px] font-bold text-neutral-200 transition-colors cursor-pointer"
                >
                  🐄 Cow / Beef (Rs 950/kg)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewProductForm({
                      ...newProductForm,
                      titleEn: 'Peshawari Desi Gaye / Live Farm Cow',
                      titleUr: 'پشاوری دیسی گائے (زندہ وزن فی کلو گرام)',
                      price: 650,
                      originalPrice: 750,
                      unit: 'kg',
                      unitLabelEn: 'Per 1 Kg Live Weight',
                      unitLabelUr: 'فی 1 کلو گرام زندہ وزن',
                      weightOrVolume: '1 Kg Live',
                      pricePerKg: 650,
                      category: 'general-household',
                      descriptionEn: 'Healthy grass-fed organic Desi cow directly weighed on scale per kg.',
                      descriptionUr: 'پشاور کے ڈیری فارم کی صحت مند دیسی گائے، زندہ وزن فی کلو گرام۔',
                      imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=800&auto=format&fit=crop'
                    });
                  }}
                  className="px-2.5 py-1 rounded bg-[#1F1F1F] hover:bg-[#C5A059] hover:text-black text-[11px] font-bold text-neutral-200 transition-colors cursor-pointer"
                >
                  🐂 Live Cow (Rs 650/kg)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewProductForm({
                      ...newProductForm,
                      titleEn: 'Shinwari Fresh Mutton / Dumbah',
                      titleUr: 'شینواری تازہ دنبہ و بکرے کا گوشت',
                      price: 1950,
                      originalPrice: 2200,
                      unit: 'kg',
                      unitLabelEn: 'Per 1 Kg',
                      unitLabelUr: 'فی 1 کلو گرام',
                      weightOrVolume: '1 Kg',
                      pricePerKg: 1950,
                      category: 'food-sweets',
                      descriptionEn: 'Authentic Shinwari mutton from Namak Mandi, weighed fresh per 1 kg.',
                      descriptionUr: 'نمک منڈی کا اصلی شینواری مٹن، فی کلو گرام خالص وزن۔',
                      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop'
                    });
                  }}
                  className="px-2.5 py-1 rounded bg-[#1F1F1F] hover:bg-[#C5A059] hover:text-black text-[11px] font-bold text-neutral-200 transition-colors cursor-pointer"
                >
                  🥩 Mutton (Rs 1950/kg)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewProductForm({
                      ...newProductForm,
                      titleEn: 'Pure Organic Desi Ghee',
                      titleUr: 'خالص دیسی گھی (100٪ قدرتی)',
                      price: 2400,
                      originalPrice: 2800,
                      unit: 'kg',
                      unitLabelEn: 'Per 1 Kg',
                      unitLabelUr: 'فی 1 کلو گرام',
                      weightOrVolume: '1 Kg',
                      pricePerKg: 2400,
                      category: 'food-sweets',
                      descriptionEn: '100% pure organic cow/buffalo desi ghee per kilogram.',
                      descriptionUr: 'خالص قدرتی دیسی گھی فی 1 کلو گرام۔',
                      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop'
                    });
                  }}
                  className="px-2.5 py-1 rounded bg-[#1F1F1F] hover:bg-[#C5A059] hover:text-black text-[11px] font-bold text-neutral-200 transition-colors cursor-pointer"
                >
                  🧈 Desi Ghee (Rs 2400/kg)
                </button>
              </div>
            </div>

            <form onSubmit={handleAdminAddProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Product Title (English) *</label>
                <input
                  type="text"
                  required
                  value={newProductForm.titleEn}
                  onChange={(e) => setNewProductForm({ ...newProductForm, titleEn: e.target.value })}
                  placeholder="e.g. Fresh Farm Cow Meat / Traditional Norozi Chappal"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Product Title (Urdu) *</label>
                <input
                  type="text"
                  required
                  dir="rtl"
                  value={newProductForm.titleUr}
                  onChange={(e) => setNewProductForm({ ...newProductForm, titleUr: e.target.value })}
                  placeholder="مثال: تازہ گائے کا گوشت / روایتی نوروزی پشاوری چپل"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Unit of Measurement / Weight Specification */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0A0A0A] border border-white/10">
                <div>
                  <label className="block font-semibold text-neutral-200 mb-1">Unit of Measurement / Weight *</label>
                  <select
                    value={newProductForm.unit}
                    onChange={(e) => {
                      const u = e.target.value as ProductUnit;
                      setNewProductForm({
                        ...newProductForm,
                        unit: u,
                        unitLabelEn: u === 'kg' ? 'Per 1 Kg' : u === 'gram' ? 'Per 500g' : u === 'liter' ? 'Per Liter' : u === 'dozen' ? 'Per Dozen' : 'Per Item',
                        unitLabelUr: u === 'kg' ? 'فی 1 کلو گرام' : u === 'gram' ? 'فی 500 گرام' : u === 'liter' ? 'فی لیٹر' : u === 'dozen' ? 'فی درجن' : 'فی عدد',
                        weightOrVolume: u === 'kg' ? '1 Kg' : ''
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#151515] border border-[#C5A059]/40 text-white font-bold focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="kg">⚖️ Kilogram (1 Kg / کلو گرام) - Meat, Cow, Ghee</option>
                    <option value="gram">⚖️ Gram (e.g. 250g, 500g)</option>
                    <option value="item">📦 Item / Piece / Pair (عدد / جوڑا)</option>
                    <option value="liter">🥛 Liter (لیٹر)</option>
                    <option value="dozen">🥚 Dozen (درجن)</option>
                    <option value="pack">🛍️ Pack / Box (پیکٹ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-200 mb-1">
                    {newProductForm.unit === 'kg' ? 'Price per 1 Kilogram (PKR) *' : 'Price per Unit (PKR) *'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      value={newProductForm.price}
                      onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-[#151515] border border-white/10 text-white focus:outline-none focus:border-[#C5A059] font-bold"
                    />
                    {newProductForm.unit === 'kg' && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#C5A059]">
                        / 1 Kg
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 1 Kilogram Live Indicator */}
              {newProductForm.unit === 'kg' && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
                  <span>⚖️ Sold by verified weight:</span>
                  <strong className="text-white font-mono">
                    PKR {Number(newProductForm.price || 0).toLocaleString()} / 1 Kilogram
                  </strong>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Original Price (For Discount)</label>
                  <input
                    type="number"
                    value={newProductForm.originalPrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Category *</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value as CategoryId })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-neutral-300">Peshawar Zone *</label>
                    <button
                      type="button"
                      onClick={() => setIsAddZoneModalOpen(true)}
                      className="text-[10px] text-[#C5A059] hover:underline font-bold"
                    >
                      + Add New Bazaar
                    </button>
                  </div>
                  <select
                    value={newProductForm.zone}
                    onChange={(e) => setNewProductForm({ ...newProductForm, zone: e.target.value as ZoneId })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.nameEn} {z.isCustom ? '★' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Shop / Vendor Name</label>
                  <input
                    type="text"
                    value={newProductForm.vendorName}
                    onChange={(e) => setNewProductForm({ ...newProductForm, vendorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Vendor Contact Phone</label>
                  <input
                    type="text"
                    value={newProductForm.vendorPhone}
                    onChange={(e) => setNewProductForm({ ...newProductForm, vendorPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={newProductForm.imageUrl}
                  onChange={(e) => setNewProductForm({ ...newProductForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdminAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#151515] border border-white/10 hover:bg-[#202020] text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold shadow uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save to Firebase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
