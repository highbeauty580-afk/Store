import React from 'react';
import { X, Printer, CheckCircle2, Store } from 'lucide-react';
import { Invoice } from '../types';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const createdDate = new Date(invoice.created_at).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col print:shadow-none print:border-none print:w-full print:max-w-none print:bg-white print:text-black">
        {/* Actions Bar (Hidden during printing) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">معاينة الفاتورة للطباعة والمشاركة</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              طباعة الفاتورة
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Paper Frame */}
        <div className="p-8 space-y-6 text-slate-100 print:text-black print:p-0 bg-slate-900 print:bg-white" id="printable-invoice">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 print:border-slate-300 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 print:bg-emerald-100 print:text-emerald-800 rounded-lg">
                  <Store className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-white print:text-slate-900">متجر مخزوني الذكي</h1>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                نظام إدارة المبيعات والمخزون المتكامل - ص.ب 1012
              </p>
            </div>

            <div className="text-left font-mono">
              <div className="text-xs text-emerald-400 print:text-emerald-700 font-bold uppercase tracking-wider">
                فاتورة مبيعات
              </div>
              <div className="text-lg font-black text-white print:text-slate-900 mt-0.5">
                {invoice.invoice_number}
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-600 mt-1">
                {createdDate}
              </div>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-800/40 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 print:text-slate-500 block">اسم العميل:</span>
              <strong className="text-sm font-bold text-white print:text-slate-900 mt-0.5 block">
                {invoice.customer_name}
              </strong>
              {invoice.customer_phone && (
                <span className="text-slate-400 print:text-slate-600 font-mono mt-0.5 block">
                  {invoice.customer_phone}
                </span>
              )}
            </div>

            <div className="text-left">
              <span className="text-slate-400 print:text-slate-500 block">طريقة الدفع:</span>
              <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 print:bg-emerald-100 print:text-emerald-800 font-bold mt-1">
                {invoice.payment_method === 'cash' ? 'نقدي (Cash)' : invoice.payment_method === 'card' ? 'بطاقة مَدى / فيزا' : 'تحويل بنكي'}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-hidden border border-slate-800 print:border-slate-300 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-800/60 print:bg-slate-100 border-b border-slate-800 print:border-slate-300 text-slate-300 print:text-slate-700 font-bold">
                  <th className="p-3">#</th>
                  <th className="p-3">اسم المنتج / الصنف</th>
                  <th className="p-3 text-center">الكمية</th>
                  <th className="p-3">سعر الوحدة</th>
                  <th className="p-3 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                {invoice.items?.map((item, idx) => (
                  <tr key={idx} className="text-slate-200 print:text-slate-800">
                    <td className="p-3 font-mono text-slate-400 print:text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-bold">{item.product_name}</td>
                    <td className="p-3 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="p-3 font-mono">{item.unit_price.toFixed(2)} ر.س</td>
                    <td className="p-3 text-left font-mono font-bold text-emerald-400 print:text-slate-900">
                      {item.total_price.toFixed(2)} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-2 text-xs bg-slate-800/30 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-200">
              <div className="flex justify-between text-slate-400 print:text-slate-600">
                <span>المجموع الفرعي:</span>
                <span className="font-mono text-slate-200 print:text-slate-800">{invoice.total_amount.toFixed(2)} ر.س</span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>الخصم المطبق:</span>
                  <span className="font-mono">-{invoice.discount.toFixed(2)} ر.س</span>
                </div>
              )}

              {invoice.tax > 0 && (
                <div className="flex justify-between text-slate-400 print:text-slate-600">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span className="font-mono text-slate-200 print:text-slate-800">{invoice.tax.toFixed(2)} ر.س</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-700 print:border-slate-300 flex justify-between items-baseline text-sm font-black">
                <span className="text-white print:text-slate-900">الإجمالي النهائي:</span>
                <span className="font-mono text-emerald-400 print:text-slate-900 text-lg">
                  {invoice.net_amount.toFixed(2)} ر.س/ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note & Simulated QR Code */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex items-center justify-between text-[11px] text-slate-500 print:text-slate-600">
            <div>
              <p className="font-bold text-slate-400 print:text-slate-800">شكراً لتعاملكم معنا!</p>
              <p className="mt-0.5">البضاعة المباعة يمكن استبدالها خلال 14 يوماً مع إحضار الفاتورة.</p>
            </div>

            {/* QR Simulation Frame */}
            <div className="p-2 bg-white rounded-lg border border-slate-300 shrink-0 text-center text-[9px] font-mono text-slate-900">
              <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center font-bold text-xs rounded">
                QR
              </div>
              <span className="block mt-1">مشفر معتمد</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
