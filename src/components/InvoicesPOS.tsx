import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Receipt,
  User,
  Phone,
  CreditCard,
  DollarSign,
  Printer,
  X,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, Invoice } from '../types';
import { InvoicePrintModal } from './InvoicePrintModal';

interface CartItem {
  product: Product;
  quantity: number;
}

interface InvoicesPOSProps {
  products: Product[];
  invoices: Invoice[];
  onCreateInvoice: (
    invoiceData: {
      customer_name: string;
      customer_phone?: string;
      discount: number;
      tax: number;
      payment_method: 'cash' | 'card' | 'transfer';
    },
    items: CartItem[]
  ) => Promise<{ invoice: Invoice; lowStockAlerts: Product[] }>;
}

export const InvoicesPOS: React.FC<InvoicesPOSProps> = ({
  products,
  invoices,
  onCreateInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('عميل نقدي');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(15);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [searchProduct, setSearchProduct] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Invoice for Print Modal
  const [selectedInvoiceToPrint, setSelectedInvoiceToPrint] = useState<Invoice | null>(null);

  // History search
  const [historySearch, setHistorySearch] = useState('');

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) return;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        if (currentQty >= product.stock_quantity) return prev; // max stock limit
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock_quantity) return item; // limit to available stock
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const rawTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const taxAmount = Math.max(0, rawTotal - discount) * (taxPercent / 100);
  const netTotal = Math.max(0, rawTotal - discount + taxAmount);

  const handleCheckout = async () => {
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await onCreateInvoice(
        {
          customer_name: customerName,
          customer_phone: customerPhone,
          discount,
          tax: taxPercent,
          payment_method: paymentMethod,
        },
        cart
      );

      // Trigger Confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Clear cart
      setCart([]);
      setCustomerName('عميل نقدي');
      setCustomerPhone('');
      setDiscount(0);

      // Open print modal immediately
      setSelectedInvoiceToPrint(result.invoice);
    } catch (e) {
      console.error('Failed to create invoice', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(historySearch.toLowerCase()) ||
    inv.customer_name.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'pos'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          إصدار فاتورة جديدة (نقطة البيع POS)
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          سجل الفواتير الصادرة ({invoices.length})
        </button>
      </div>

      {/* POS TAB CONTENT */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Selector Grid (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="اختر صنف أو ابحث بالاسم والرمز..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <span className="text-xs text-slate-400 shrink-0 font-medium">
                {filteredProducts.length} منتج متوفر
              </span>
            </div>

            {/* Product Cards Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredProducts.map(product => {
                const isOutOfStock = product.stock_quantity <= 0;
                const inCart = cart.find(c => c.product.id === product.id);

                return (
                  <button
                    key={product.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(product)}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between relative group ${
                      isOutOfStock
                        ? 'bg-slate-900/30 border-slate-800/50 opacity-50 cursor-not-allowed'
                        : inCart
                        ? 'bg-emerald-950/20 border-emerald-500 shadow-md shadow-emerald-950/20'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute top-2 left-2 w-5 h-5 bg-emerald-500 text-slate-950 text-[10px] font-black font-mono rounded-full flex items-center justify-center shadow">
                        {inCart.quantity}
                      </span>
                    )}

                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">{product.sku}</span>
                      <h4 className="text-xs font-bold text-white mt-1 line-clamp-2 leading-snug">{product.name}</h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                        {product.price.toFixed(2)} ر.س
                      </span>
                      <span className={`text-[10px] ${isOutOfStock ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                        {isOutOfStock ? 'نفد' : `${product.stock_quantity} ${product.unit}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Invoice Cart & Checkout Panel (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-800/40 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                سلة عناصر الفاتورة
              </h3>
              <span className="text-xs text-slate-400 font-mono">{cart.length} أصناف</span>
            </div>

            {/* Customer Inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  اسم العميل
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  الهاتف (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="05xxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500 dir-ltr"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  انقر على المنتجات من القائمة المجاورة لإضافتها للفاتورة
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.product.id}
                    className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{item.product.name}</div>
                      <div className="text-[11px] text-emerald-400 font-mono tabular-nums">
                        {item.product.price.toFixed(2)} × {item.quantity} = {(item.product.price * item.quantity).toFixed(2)} ر.س
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateCartQty(item.product.id, -1)}
                        className="p-1 bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-6 text-center font-bold font-mono text-white text-xs">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateCartQty(item.product.id, 1)}
                        className="p-1 bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-rose-400 hover:text-rose-300 transition-colors mr-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Billing Summary & Payment Details */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>المجموع الفرعي:</span>
                <span className="font-mono text-white tabular-nums">{rawTotal.toFixed(2)} ر.س</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">خصم الفاتورة (ر.س)</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">الضريبة المضافة (%)</label>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">طريقة الدفع</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-1.5 px-2 rounded-lg font-medium text-[11px] transition-colors border ${
                      paymentMethod === 'cash'
                        ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    نقدي (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-1.5 px-2 rounded-lg font-medium text-[11px] transition-colors border ${
                      paymentMethod === 'card'
                        ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    بطاقة مدى
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`py-1.5 px-2 rounded-lg font-medium text-[11px] transition-colors border ${
                      paymentMethod === 'transfer'
                        ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    تحويل بنكي
                  </button>
                </div>
              </div>

              {/* Net Total Display */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-baseline justify-between pt-2">
                <span className="text-sm font-bold text-white">الصافي المطلوب:</span>
                <span className="text-xl font-black font-mono text-emerald-400 tabular-nums">
                  {netTotal.toFixed(2)} ر.س/ج.م
                </span>
              </div>

              <button
                disabled={cart.length === 0 || isSubmitting}
                onClick={handleCheckout}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>جاري تسجيل الفاتورة في Supabase...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>تأكيد الفاتورة وخصم المخزون</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY TAB CONTENT */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث باسم العميل أو رقم الفاتورة..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold">
                    <th className="p-4">رقم الفاتورة</th>
                    <th className="p-4">اسم العميل</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">طريقة الدفع</th>
                    <th className="p-4">صافي الفاتورة</th>
                    <th className="p-4 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        لا توجد فواتير مسجلة
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-mono font-bold text-white">{inv.invoice_number}</td>
                        <td className="p-4 text-slate-200 font-medium">{inv.customer_name}</td>
                        <td className="p-4 text-slate-400 font-mono text-[11px]">
                          {new Date(inv.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
                            {inv.payment_method === 'cash' ? 'نقدي' : inv.payment_method === 'card' ? 'بطاقة' : 'تحويل'}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-400 tabular-nums">
                          {inv.net_amount.toFixed(2)} ر.س/ج.م
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedInvoiceToPrint(inv)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors inline-flex items-center gap-1.5 text-xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-400" />
                            طباعة / معاينة
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print Modal */}
      <InvoicePrintModal
        invoice={selectedInvoiceToPrint}
        onClose={() => setSelectedInvoiceToPrint(null)}
      />
    </div>
  );
};
