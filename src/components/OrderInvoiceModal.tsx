import React from 'react';
import { X, Printer, Store, CheckCircle2, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrderInvoiceModal: React.FC = () => {
  const {
    language,
    t,
    activeOrderInvoice,
    setActiveOrderInvoice,
    zones
  } = useApp();

  if (!activeOrderInvoice) return null;

  const order = activeOrderInvoice;
  const zoneObj = zones.find((z) => z.id === order.zone);
  const zoneName = zoneObj
    ? language === 'ur'
      ? zoneObj.nameUr
      : zoneObj.nameEn
    : order.zone;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const textContent = `================================================
DIGITAL BAZAR PESHAWAR - OFFICIAL ORDER RECEIPT
================================================
Invoice No: ${order.id}
Date: ${new Date(order.createdAt).toLocaleString()}

CUSTOMER DETAILS:
Name: ${order.customerName}
Phone: ${order.customerPhone}
Email: ${order.customerEmail || 'N/A'}
Address: ${order.address} (${zoneName})
Landmark: ${order.landmark || 'N/A'}

ORDER ITEMS:
${order.items
  .map(
    (item, i) =>
      `${i + 1}. ${item.productTitleEn} - Qty: ${item.quantity} x PKR ${item.price.toLocaleString()} = PKR ${(
        item.quantity * item.price
      ).toLocaleString()} [Vendor: ${item.vendorName}]`
  )
  .join('\n')}

FINANCIAL SUMMARY:
Subtotal: PKR ${order.subtotal.toLocaleString()}
Peshawar Shipping Fee: PKR ${order.shippingFee}
TOTAL PAYABLE: PKR ${order.totalAmount.toLocaleString()}

PAYMENT & STATUS:
Payment Method: ${order.paymentMethod}
Transaction ID: ${order.paymentTransactionId || 'N/A'}
Order Status: ${order.status}

Verified Digital Bazar Peshawar Receipt
Supervised by Govt Superior Science College Peshawar
================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        id="printable-invoice"
        className="bg-[#151515] border border-white/10 rounded-xl max-w-2xl w-full max-h-[96vh] sm:max-h-[92vh] overflow-y-auto shadow-2xl relative text-[#E5E5E5] my-2 sm:my-4 p-4 sm:p-6 space-y-4 sm:space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:max-h-none print:overflow-visible"
      >
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 no-print print:hidden">
          <span className="text-xs font-bold text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-1 rounded border border-[#C5A059]/30 uppercase tracking-wider">
            Official Peshawar Order Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="px-3 py-1.5 rounded bg-[#0A0A0A] hover:bg-[#1A1A1A] text-neutral-200 border border-white/10 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Download Receipt
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printInvoice}</span>
            </button>
            <button
              onClick={() => setActiveOrderInvoice(null)}
              className="p-1.5 rounded hover:bg-[#1A1A1A] text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="space-y-6 print:space-y-4">
          {/* Receipt Header */}
          <div className="flex justify-between items-start border-b border-white/10 print:border-slate-300 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[#C5A059] print:text-slate-900">
                <Store className="w-6 h-6" />
                <h1 className="text-xl font-serif-display font-bold tracking-tight">Digital Bazar Peshawar</h1>
              </div>
              <p className="text-xs text-neutral-400 print:text-slate-600 mt-0.5">
                Local Marketplace System (BS CS Thesis Project - Govt. Superior Science College)
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-neutral-400 print:text-slate-600">INVOICE NO:</span>
              <p className="text-lg font-bold text-white print:text-slate-900">{order.id}</p>
              <p className="text-xs text-neutral-400 print:text-slate-600">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-[#0A0A0A] print:bg-slate-50 p-4 rounded border border-white/10 print:border-slate-300">
            <div>
              <p className="font-bold text-[#C5A059] print:text-slate-900 mb-1">Customer Info:</p>
              <p className="font-semibold text-white print:text-slate-800">{order.customerName}</p>
              <p className="text-neutral-300 print:text-slate-700">{order.customerPhone}</p>
              {order.customerEmail && (
                <p className="text-neutral-400 print:text-slate-600">{order.customerEmail}</p>
              )}
            </div>

            <div>
              <p className="font-bold text-[#C5A059] print:text-slate-900 mb-1">Delivery Destination:</p>
              <p className="text-neutral-300 print:text-slate-700 font-medium">{order.address}</p>
              <p className="text-neutral-400 print:text-slate-600">Zone: {zoneName}</p>
              {order.landmark && (
                <p className="text-neutral-400 print:text-slate-600">Landmark: {order.landmark}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-white/10 print:border-slate-300 rounded overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#0A0A0A] print:bg-slate-100 text-neutral-300 print:text-slate-800 font-bold border-b border-white/10 print:border-slate-300">
                <tr>
                  <th className="p-3">Product Item</th>
                  <th className="p-3">Vendor / Shop</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-slate-200">
                {order.items.map((item, idx) => {
                  const title = language === 'ur' ? item.productTitleUr : item.productTitleEn;
                  return (
                    <tr key={idx} className="text-neutral-200 print:text-slate-800">
                      <td className="p-3 font-semibold">
                        <div>
                          <span>{title}</span>
                          {item.unit === 'kg' && (
                            <span className="block text-[10px] text-emerald-400 print:text-emerald-700 font-medium">
                              {language === 'ur' ? '⚖️ وزن: فی 1 کلو گرام' : '⚖️ Weight: Per 1 Kg'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-neutral-400 print:text-slate-600">{item.vendorName}</td>
                      <td className="p-3 text-center font-bold">
                        {item.quantity} {item.unit === 'kg' ? (language === 'ur' ? 'کلو' : 'Kg') : ''}
                      </td>
                      <td className="p-3 text-right">PKR {item.price.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-[#C5A059] print:text-slate-900">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="flex justify-between items-end pt-2">
            <div className="text-xs space-y-1 text-neutral-400 print:text-slate-600">
              <p className="flex items-center gap-1 font-semibold text-neutral-300 print:text-slate-800">
                Payment Method: <span className="text-[#C5A059] print:text-slate-900 font-bold">{order.paymentMethod}</span>
              </p>
              {order.paymentTransactionId && (
                <p>Transaction ID: <span className="text-white print:text-slate-800 font-mono">{order.paymentTransactionId}</span></p>
              )}
              <p className="flex items-center gap-1">
                Order Status: <span className="text-white print:text-slate-800 font-bold">{order.status}</span>
              </p>
            </div>

            <div className="text-right space-y-1 text-xs">
              <div className="text-neutral-400 print:text-slate-600">
                Subtotal: <span className="text-white print:text-slate-900">PKR {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="text-neutral-400 print:text-slate-600">
                Peshawar Delivery: <span className="text-white print:text-slate-900">PKR {order.shippingFee}</span>
              </div>
              <div className="text-base font-bold text-[#C5A059] print:text-slate-900 pt-1 border-t border-white/10 print:border-slate-300">
                Total Amount: PKR {order.totalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Official Stamp */}
          <div className="pt-4 border-t border-white/10 print:border-slate-300 flex items-center justify-between text-[11px] text-neutral-500 print:text-slate-600">
            <div className="flex items-center gap-1 text-[#C5A059] print:text-slate-800 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Digital Bazar Peshawar Receipt</span>
            </div>
            <span>Supervised by Dr. Ikram Ullah | Govt Superior Science College</span>
          </div>
        </div>
      </div>
    </div>
  );
};
