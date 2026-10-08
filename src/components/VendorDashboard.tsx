import React, { useState } from 'react';
import {
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageCircle,
  X,
  Star,
  Tag,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, OrderStatus, CategoryId, ZoneId, Vendor, ProductUnit } from '../types';

import { ImageBBFileUploader } from './ImageBBFileUploader';

export const VendorDashboard: React.FC = () => {
  const {
    language,
    t,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    vendors,
    categories,
    zones,
    user,
    setIsAddZoneModalOpen
  } = useApp();

  // Find vendor associated with the logged-in user
  const matchedVendor = vendors.find(
    (v) =>
      (user?.vendorId && v.id === user.vendorId) ||
      (user?.id && (v.id === user.id || v.id === `v-${user.id}`)) ||
      (user?.email && v.email && v.email.toLowerCase() === user.email.toLowerCase()) ||
      (user?.phone && v.phone && v.phone.replace(/\D/g, '') === user.phone.replace(/\D/g, '')) ||
      (user?.name && v.ownerName && v.ownerName.trim().toLowerCase() === user.name.trim().toLowerCase())
  );

  const myVendorId = matchedVendor?.id || user?.vendorId || (user?.id ? `v-${user.id}` : 'v-vendor');

  const fallbackVendor: Vendor = {
    id: myVendorId,
    shopNameEn: user?.shopNameEn || user?.name || 'My Peshawar Shop',
    shopNameUr: user?.shopNameUr || user?.shopNameEn || user?.name || 'میری دکان',
    ownerName: user?.name || 'Shop Owner',
    phone: user?.phone || '03001234567',
    whatsapp: user?.phone || '03001234567',
    email: user?.email || 'vendor@digitalbazar.pk',
    zone: (user?.zone as ZoneId) || 'kissa-khwani',
    marketAddressEn: user?.marketAddressEn || 'Peshawar Central Market',
    marketAddressUr: 'پشاور مارکیٹ',
    isVerified: true,
    rating: 5.0,
    joinedDate: new Date().toISOString().split('T')[0]
  };

  const activeVendor: Vendor = matchedVendor || fallbackVendor;

  // Selected vendor shop (for Admin inspection switcher)
  const [adminSelectedVendorId, setAdminSelectedVendorId] = useState<string>(activeVendor.id);

  const currentVendorId = user?.role === 'admin' ? adminSelectedVendorId : activeVendor.id;
  const vendorObj = (user?.role === 'admin' && vendors.find((v) => v.id === currentVendorId)) || activeVendor;

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [catalogViewMode, setCatalogViewMode] = useState<'my-shop' | 'all'>('my-shop');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Add / Edit product
  const [formData, setFormData] = useState({
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
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=800&auto=format&fit=crop'
  });

  // Filter products belonging to this vendor
  const vendorProducts = products.filter((p) => {
    // If admin is inspecting
    if (user?.role === 'admin') {
      if (adminSelectedVendorId === 'all') return true;
      return p.vendorId === adminSelectedVendorId || p.vendorId === activeVendor.id;
    }

    // 1. Direct vendor ID match
    if (
      p.vendorId === activeVendor.id ||
      p.vendorId === myVendorId ||
      (user?.vendorId && p.vendorId === user.vendorId) ||
      (user?.id && (p.vendorId === user.id || p.vendorId === `v-${user.id}`))
    ) {
      return true;
    }

    // 2. Vendor Name match (case-insensitive)
    const pVendorName = (p.vendorName || '').trim().toLowerCase();
    const uName = (user?.name || '').trim().toLowerCase();
    const uShop = (user?.shopNameEn || '').trim().toLowerCase();
    const vShop = (activeVendor.shopNameEn || '').trim().toLowerCase();
    const vOwner = (activeVendor.ownerName || '').trim().toLowerCase();

    if (uName && pVendorName === uName) return true;
    if (uShop && pVendorName === uShop) return true;
    if (vShop && pVendorName === vShop) return true;
    if (vOwner && pVendorName === vOwner) return true;

    // 3. Vendor Phone match
    if (user?.phone && p.vendorPhone) {
      const uPhoneClean = user.phone.replace(/\D/g, '');
      const pPhoneClean = p.vendorPhone.replace(/\D/g, '');
      if (uPhoneClean && pPhoneClean && uPhoneClean === pPhoneClean) return true;
    }

    return false;
  });

  // Base list depending on view mode
  const baseCatalogList = catalogViewMode === 'all' ? products : vendorProducts;
  const displayedProducts = baseCatalogList.filter((p) => {
    if (!productSearchTerm.trim()) return true;
    const term = productSearchTerm.toLowerCase();
    return (
      p.titleEn.toLowerCase().includes(term) ||
      p.titleUr.includes(term) ||
      p.id.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  });

  // Filter orders containing items from this vendor
  const isMyOrderItem = (item: { vendorId: string; vendorName?: string }) => {
    if (user?.role === 'admin') {
      if (adminSelectedVendorId === 'all') return true;
      return item.vendorId === adminSelectedVendorId;
    }

    if (
      item.vendorId === activeVendor.id ||
      item.vendorId === myVendorId ||
      (user?.vendorId && item.vendorId === user.vendorId) ||
      (user?.id && (item.vendorId === user.id || item.vendorId === `v-${user.id}`))
    ) {
      return true;
    }

    const itemVName = (item.vendorName || '').trim().toLowerCase();
    const uName = (user?.name || '').trim().toLowerCase();
    const vShop = (activeVendor.shopNameEn || '').trim().toLowerCase();
    if (uName && itemVName === uName) return true;
    if (vShop && itemVName === vShop) return true;

    return false;
  };

  const vendorOrders = orders.filter((o) => o.items.some(isMyOrderItem));

  const totalRevenue = vendorOrders.reduce((sum, o) => {
    const vItems = o.items.filter(isMyOrderItem);
    return sum + vItems.reduce((sub, item) => sub + item.price * item.quantity, 0);
  }, 0);

  const lowStockProducts = vendorProducts.filter((p) => p.stock < 5);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
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
      category: 'food-sweets',
      zone: activeVendor.zone || 'namak-mandi',
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=800&auto=format&fit=crop'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      titleEn: p.titleEn,
      titleUr: p.titleUr,
      descriptionEn: p.descriptionEn,
      descriptionUr: p.descriptionUr,
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      unit: p.unit || 'kg',
      unitLabelEn: p.unitLabelEn || (p.unit === 'kg' ? 'Per 1 Kg' : 'Per Item'),
      unitLabelUr: p.unitLabelUr || (p.unit === 'kg' ? 'فی 1 کلو گرام' : 'فی عدد'),
      weightOrVolume: p.weightOrVolume || (p.unit === 'kg' ? '1 Kg' : '1 Item'),
      pricePerKg: p.pricePerKg || (p.unit === 'kg' ? p.price : undefined),
      category: p.category,
      zone: p.zone,
      stock: p.stock,
      imageUrl: p.images[0] || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = Number(formData.price) || 0;
    const isKg = formData.unit === 'kg';
    const computedPricePerKg = isKg ? priceNum : undefined;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        titleEn: formData.titleEn,
        titleUr: formData.titleUr,
        descriptionEn: formData.descriptionEn,
        descriptionUr: formData.descriptionUr,
        price: priceNum,
        originalPrice: Number(formData.originalPrice) || priceNum,
        unit: formData.unit,
        unitLabelEn: formData.unitLabelEn || (isKg ? 'Per 1 Kg' : 'Per Item'),
        unitLabelUr: formData.unitLabelUr || (isKg ? 'فی 1 کلو گرام' : 'فی عدد'),
        weightOrVolume: formData.weightOrVolume || (isKg ? '1 Kg' : '1 Item'),
        pricePerKg: computedPricePerKg,
        category: formData.category,
        zone: formData.zone,
        stock: Number(formData.stock),
        images: [formData.imageUrl]
      });
    } else {
      addProduct({
        titleEn: formData.titleEn,
        titleUr: formData.titleUr || formData.titleEn,
        descriptionEn: formData.descriptionEn,
        descriptionUr: formData.descriptionUr || formData.descriptionEn,
        price: priceNum,
        originalPrice: Number(formData.originalPrice) || priceNum,
        unit: formData.unit,
        unitLabelEn: formData.unitLabelEn || (isKg ? 'Per 1 Kg' : 'Per Item'),
        unitLabelUr: formData.unitLabelUr || (isKg ? 'فی 1 کلو گرام' : 'فی عدد'),
        weightOrVolume: formData.weightOrVolume || (isKg ? '1 Kg' : '1 Item'),
        pricePerKg: computedPricePerKg,
        category: formData.category,
        zone: formData.zone,
        vendorId: activeVendor.id,
        vendorName: activeVendor.shopNameEn || user?.shopNameEn || user?.name || 'Vendor Shop',
        vendorPhone: activeVendor.phone || user?.phone || '03001234567',
        images: [formData.imageUrl],
        stock: Number(formData.stock),
        rating: 5.0,
        reviewCount: 1,
        isFeatured: true
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-24 md:pb-8 space-y-6 text-[#E5E5E5]">
      {/* Vendor Top Banner & Switcher */}
      <div className="bg-[#151515] border border-white/10 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-serif-display font-bold text-white">
                {language === 'ur' ? vendorObj.shopNameUr : vendorObj.shopNameEn}
              </h1>
              {vendorObj.isVerified && (
                <span className="bg-[#C5A059]/10 text-[#C5A059] text-xs px-2.5 py-0.5 rounded border border-[#C5A059]/30 font-bold flex items-center gap-1 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Shop
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {vendorObj.marketAddressEn} | WhatsApp: {vendorObj.whatsapp}
            </p>
          </div>
        </div>

        {/* If Admin is inspecting, allow switching shops. If Vendor, show zone */}
        {user?.role === 'admin' ? (
          <div className="flex items-center gap-2 bg-[#0A0A0A] p-2 rounded-xl border border-white/10 text-xs">
            <span className="text-neutral-400 font-semibold">Admin Shop Switcher:</span>
            <select
              value={adminSelectedVendorId}
              onChange={(e) => setAdminSelectedVendorId(e.target.value)}
              className="bg-[#151515] text-[#C5A059] border border-white/10 rounded px-2 py-1 font-bold focus:outline-none focus:border-[#C5A059]"
            >
              <option value="all">All Shops ({products.length} Products)</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.shopNameEn} ({v.zone})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-[#0A0A0A] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            <span className="text-neutral-400">Market Zone:</span>
            <span className="text-[#C5A059] font-bold uppercase">{vendorObj.zone}</span>
          </div>
        )}
      </div>

      {/* Low Stock Warning Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-xl flex items-center gap-3 text-xs font-medium shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong>Low Stock Alert ({lowStockProducts.length} items):</strong> Some products are running low in stock. Update quantities to prevent orders cancellation.
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151515] border border-white/10 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-400">{t.totalSales}</p>
            <p className="text-2xl font-bold text-[#C5A059] mt-1">
              PKR {totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#151515] border border-white/10 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-400">{t.totalOrders}</p>
            <p className="text-2xl font-bold text-white mt-1">{vendorOrders.length}</p>
          </div>
          <div className="p-3 bg-[#1A1A1A] border border-white/10 text-neutral-300 rounded-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#151515] border border-white/10 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-400">{t.activeProducts}</p>
            <p className="text-2xl font-bold text-white mt-1">{vendorProducts.length}</p>
          </div>
          <div className="p-3 bg-[#1A1A1A] border border-white/10 text-neutral-300 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#151515] border border-white/10 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-400">Shop Rating</p>
            <p className="text-2xl font-bold text-[#C5A059] mt-1 flex items-center gap-1">
              {vendorObj.rating} <Star className="w-5 h-5 fill-[#C5A059]" />
            </p>
          </div>
          <div className="p-3 bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] rounded-lg">
            <Star className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs, Search Bar & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('products');
              setCatalogViewMode('my-shop');
            }}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'products' && catalogViewMode === 'my-shop'
                ? 'bg-[#C5A059] text-black shadow-md'
                : 'bg-[#151515] text-neutral-300 hover:text-white border border-white/10'
            }`}
          >
            {language === 'ur' ? 'میری دکان کی پروڈکٹس' : 'My Shop Catalog'} ({vendorProducts.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('products');
              setCatalogViewMode('all');
            }}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'products' && catalogViewMode === 'all'
                ? 'bg-[#C5A059] text-black shadow-md'
                : 'bg-[#151515] text-neutral-300 hover:text-white border border-white/10'
            }`}
          >
            {language === 'ur' ? 'پشاور مارکیٹ کی تمام پروڈکٹس' : 'All Listed Products'} ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'orders'
                ? 'bg-[#C5A059] text-black shadow-md'
                : 'bg-[#151515] text-neutral-300 hover:text-white border border-white/10'
            }`}
          >
            {t.totalOrders} ({vendorOrders.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'products' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                placeholder={language === 'ur' ? 'پروڈکٹ تلاش کریں...' : 'Search products...'}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[#151515] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C5A059] w-40 sm:w-48"
              />
            </div>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addProduct}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Products Table */}
      {activeTab === 'products' && (
        <div className="bg-[#151515] border border-white/10 rounded-xl overflow-hidden text-xs shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0A0A0A] text-neutral-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="p-4">Product Info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price (PKR)</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center mx-auto text-[#C5A059]">
                          <Package className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-white text-sm">
                          {language === 'ur' ? 'کوئی پروڈکٹ موجود نہیں' : 'No products found'}
                        </p>
                        <p className="text-neutral-400 text-xs">
                          {catalogViewMode === 'my-shop'
                            ? language === 'ur'
                              ? 'آپ کی دکان میں ابھی کوئی پروڈکٹ نہیں ہے۔ نئی پروڈکٹ شامل کریں یا "تمام پروڈکٹس" کے ٹیب سے مارکیٹ پروڈکٹس دیکھیں۔'
                              : 'No products listed yet under this shop. Click "Add Product" above or switch to "All Listed Products".'
                            : language === 'ur'
                            ? 'نئی پروڈکٹ شامل کریں تاکہ وہ خریداروں کو نظر آئے۔'
                            : 'Click Add Product above to list a new item on the marketplace.'}
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            onClick={handleOpenAddModal}
                            className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{language === 'ur' ? 'پروڈکٹ شامل کریں' : 'Add Product'}</span>
                          </button>
                          {catalogViewMode === 'my-shop' && products.length > 0 && (
                            <button
                              onClick={() => setCatalogViewMode('all')}
                              className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-neutral-200 border border-white/10 font-bold text-xs"
                            >
                              {language === 'ur' ? 'تمام پروڈکٹس دیکھیں' : 'View All Marketplace Products'}
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedProducts.map((p) => {
                    const title = language === 'ur' ? p.titleUr : p.titleEn;
                    return (
                      <tr key={p.id} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={title}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded object-cover bg-[#0A0A0A] border border-white/10 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-white max-w-xs truncate">{title}</p>
                              <p className="text-[11px] text-neutral-400">ID: {p.id}</p>
                              <span className="text-[10px] text-[#C5A059]">{p.vendorName}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 capitalize text-neutral-300">
                          {p.category.replace('-', ' ')}
                        </td>

                        <td className="p-4 font-bold text-[#C5A059]">
                          <div>
                            <span className="text-sm">PKR {p.price.toLocaleString()}</span>
                            <span className="block text-[10px] font-semibold text-emerald-400">
                              {p.unit === 'kg'
                                ? (language === 'ur' ? '⚖️ فی 1 کلو گرام' : '⚖️ / 1 Kg')
                                : (language === 'ur' ? (p.unitLabelUr || 'فی عدد') : (p.unitLabelEn || '/ Item'))}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider ${
                              p.stock > 10
                                ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30'
                                : p.stock > 0
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>

                        <td className="p-4 font-semibold text-[#C5A059] flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-[#C5A059]" />
                          <span>{p.rating}</span>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="px-3 py-1.5 rounded-lg bg-[#C5A059]/10 hover:bg-[#C5A059] text-[#C5A059] hover:text-black border border-[#C5A059]/30 font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer text-xs"
                            title={language === 'ur' ? 'ترمیم کریں' : 'Edit Product'}
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>{language === 'ur' ? 'ترمیم' : 'Edit'}</span>
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer text-xs"
                            title={language === 'ur' ? 'حذف کریں' : 'Delete Product'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{language === 'ur' ? 'حذف' : 'Delete'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Table */}
      {activeTab === 'orders' && (
        <div className="bg-[#151515] border border-white/10 rounded-xl overflow-hidden text-xs shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0A0A0A] text-neutral-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Ordered Items</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vendorOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-500">
                      No incoming customer orders for this shop yet.
                    </td>
                  </tr>
                ) : (
                  vendorOrders.map((ord) => {
                    const shopItems = ord.items.filter((i) => i.vendorId === currentVendorId);

                    return (
                      <tr key={ord.id} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="p-4">
                          <p className="font-extrabold text-white">{ord.id}</p>
                          <p className="text-[11px] text-neutral-400">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </p>
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-neutral-200">{ord.customerName}</p>
                          <p className="text-neutral-400 text-[11px]">{ord.customerPhone}</p>
                          <p className="text-neutral-500 text-[10px] truncate max-w-[150px]">{ord.address}</p>
                        </td>

                        <td className="p-4">
                          <ul className="space-y-1">
                            {shopItems.map((it, idx) => (
                              <li key={idx} className="text-neutral-300 font-medium">
                                {it.quantity}x {language === 'ur' ? it.productTitleUr : it.productTitleEn}
                              </li>
                            ))}
                          </ul>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-[#C5A059]">{ord.paymentMethod}</span>
                        </td>

                        <td className="p-4">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              updateOrderStatus(ord.id, e.target.value as OrderStatus)
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
                          <a
                            href={`https://wa.me/92${ord.customerPhone.replace(/^0/, '')}?text=${encodeURIComponent(
                              `Salam ${ord.customerName}! Update regarding your Digital Bazar Peshawar Order ${ord.id}: Current Status is ${ord.status}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0A0A0A] border border-white/10 text-neutral-200 hover:border-[#C5A059]/40 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#151515] border border-white/10 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-[#E5E5E5] my-8 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif-display font-bold text-lg text-white">
                {editingProduct ? t.editProduct : t.addProduct}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded hover:bg-[#1A1A1A] text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates / Presets (Especially for Gaye / Cow meat per kg, livestock, etc.) */}
            <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-1.5">
              <span className="text-[11px] font-semibold text-neutral-400 block">
                {language === 'ur' ? '⚡ فوری نمونے (ایک کلک سے معلومات پر کریں):' : '⚡ Quick Presets (Click to Auto-Fill):'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
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
                  🐄 {language === 'ur' ? 'گائے کا گوشت (950 / کلو)' : 'Cow / Beef (Rs 950/kg)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
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
                  🐂 {language === 'ur' ? 'زندہ دیسی گائے (650 / کلو)' : 'Live Cow (Rs 650/kg)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
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
                  🥩 {language === 'ur' ? 'دنبہ و بکرے کا گوشت (1950/کلو)' : 'Mutton (Rs 1950/kg)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
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
                  🧈 {language === 'ur' ? 'دیسی گھی (2400/کلو)' : 'Desi Ghee (Rs 2400/kg)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      titleEn: 'Handmade Norozi Peshawari Chappal',
                      titleUr: 'اصلی چمڑے کی نوروزی پشاوری چپل',
                      price: 3499,
                      originalPrice: 4200,
                      unit: 'item',
                      unitLabelEn: 'Per Pair',
                      unitLabelUr: 'فی جوڑا',
                      weightOrVolume: '1 Pair',
                      category: 'peshawari-chappal',
                      descriptionEn: 'Genuine cowhide leather handmade Norozi chappal.',
                      descriptionUr: 'اصلی چمڑے کی روایتی نوروزی پشاوری چپل۔',
                      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop'
                    });
                  }}
                  className="px-2.5 py-1 rounded bg-[#1F1F1F] hover:bg-[#C5A059] hover:text-black text-[11px] font-bold text-neutral-200 transition-colors cursor-pointer"
                >
                  👞 {language === 'ur' ? 'پشاوری چپل' : 'Peshawari Chappal'}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    {t.productTitleEn} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="e.g. Fresh Farm Cow Meat / Handmade Chappal"
                    className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    {t.productTitleUr} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titleUr}
                    onChange={(e) => setFormData({ ...formData, titleUr: e.target.value })}
                    placeholder="مثال: تازہ گائے کا گوشت / نوروزی چپل"
                    className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as CategoryId })
                    }
                    className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn} ({c.nameUr})
                      </option>
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
                      + {language === 'ur' ? 'نیا بازار شامل کریں' : 'Add New Bazaar'}
                    </button>
                  </div>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value as ZoneId })}
                    className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {language === 'ur' ? z.nameUr : z.nameEn} {z.isCustom ? '★' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Unit of Measurement / Weight Specification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-[#0A0A0A] border border-white/10">
                <div>
                  <label className="block font-semibold text-neutral-200 mb-1">
                    {language === 'ur' ? 'وزن یا پیمانہ (یونٹ) *' : 'Unit of Measurement / Weight *'}
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => {
                      const u = e.target.value as ProductUnit;
                      setFormData({
                        ...formData,
                        unit: u,
                        unitLabelEn: u === 'kg' ? 'Per 1 Kg' : u === 'gram' ? 'Per 500g' : u === 'liter' ? 'Per Liter' : u === 'dozen' ? 'Per Dozen' : 'Per Item',
                        unitLabelUr: u === 'kg' ? 'فی 1 کلو گرام' : u === 'gram' ? 'فی 500 گرام' : u === 'liter' ? 'فی لیٹر' : u === 'dozen' ? 'فی درجن' : 'فی عدد',
                        weightOrVolume: u === 'kg' ? '1 Kg' : ''
                      });
                    }}
                    className="w-full p-2 rounded-lg bg-[#151515] border border-[#C5A059]/40 text-white font-bold focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="kg">⚖️ Kilogram (کلو گرام / 1 Kg) - گوشت، گائے، بیف، گھی، مٹن</option>
                    <option value="gram">⚖️ Gram (گرام - e.g. 250g, 500g)</option>
                    <option value="item">📦 Item / Piece / Pair (عدد / جوڑا / جانور)</option>
                    <option value="liter">🥛 Liter (لیٹر)</option>
                    <option value="dozen">🥚 Dozen (درجن)</option>
                    <option value="pack">🛍️ Pack / Box (پیکٹ / ڈبہ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-200 mb-1">
                    {formData.unit === 'kg'
                      ? (language === 'ur' ? 'ایک کلو گرام کی قیمت (PKR) *' : 'Price per 1 Kilogram (PKR) *')
                      : (language === 'ur' ? 'یونٹ قیمت (PKR) *' : 'Price per Unit (PKR) *')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-[#151515] border border-white/10 text-white focus:outline-none focus:border-[#C5A059] font-bold"
                    />
                    {formData.unit === 'kg' && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#C5A059]">
                        / 1 Kg
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 1 Kilogram Live Indicator */}
              {formData.unit === 'kg' && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>⚖️</span>
                    <span>
                      {language === 'ur'
                        ? 'خریداروں کو 1 کلو گرام کا واضح ریٹ اور وزن منتخب کرنے کا آپشن ملے گا:'
                        : 'Shoppers will see clear 1 Kg rate and weight selection in Kilograms:'}
                    </span>
                  </div>
                  <strong className="text-white font-mono text-xs">
                    PKR {Number(formData.price || 0).toLocaleString()} / 1 Kg
                  </strong>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Original Price (For Discount Display)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">{t.stock} *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <ImageBBFileUploader
                imageUrl={formData.imageUrl}
                onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
              />

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  {t.descriptionEn}
                </label>
                <textarea
                  rows={2}
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  className="w-full p-2.5 rounded bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                {t.saveProduct}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#151515] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-white">
                {language === 'ur' ? 'پروڈکٹ حذف کرنے کی تصدیق' : 'Confirm Product Deletion'}
              </h3>
              <p className="text-xs text-neutral-400">
                {language === 'ur'
                  ? `کیا آپ واقعی "${productToDelete.titleUr || productToDelete.titleEn}" کو پشاور بازار اور فائر بیس سے حذف کرنا چاہتے ہیں؟`
                  : `Are you sure you want to permanently delete "${productToDelete.titleEn}" from Peshawar Bazar and Firebase?`}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 bg-[#0A0A0A] hover:bg-[#1F1F1F] text-neutral-300 font-bold text-xs cursor-pointer"
              >
                {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 cursor-pointer"
              >
                {language === 'ur' ? 'ہاں، حذف کریں' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
