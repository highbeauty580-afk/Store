import React from 'react';
import {
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Package,
  History
} from 'lucide-react';
import { Product, InventoryMovement, Invoice } from '../types';

interface InventoryReportsProps {
  products: Product[];
  invoices: Invoice[];
  movements: InventoryMovement[];
}

export const InventoryReports: React.FC<InventoryReportsProps> = ({
  products,
  invoices,
  movements,
}) => {
  // Calculations
  const totalSalesRevenue = invoices.reduce((sum, inv) => sum + inv.net_amount, 0);

  // Profit calculation based on invoice items or product margins
  let totalCostEstimate = 0;
  invoices.forEach(inv => {
    inv.items?.forEach(item => {
      const p = products.find(prod => prod.id === item.product_id);
      if (p) {
        totalCostEstimate += p.cost * item.quantity;
      }
    });
  });

  const estimatedGrossProfit = Math.max(0, totalSalesRevenue - totalCostEstimate);
  const profitMarginPercent = totalSalesRevenue > 0 ? (estimatedGrossProfit / totalSalesRevenue) * 100 : 0;

  // Export CSV Helper
  const exportToCSV = () => {
    const headers = ['رقم المنتج SKU', 'اسم المنتج', 'التصنيف', 'الكمية الحالية', 'سعر البيع', 'التكلفة'];
    const rows = products.map(p => [
      p.sku,
      `"${p.name}"`,
      p.category,
      p.stock_quantity,
      p.price,
      p.cost,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `تقرير_المخزون_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Export Bar */}
      <div className="flex items-center justify-between bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            سجل حركة المخزون والتقارير المالية
          </h3>
          <p className="text-xs text-slate-400">متابعة دقيقة لكل عمليات الصرف والتوريد وتكاليف المنتجات</p>
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          تصدير تقرير المخزون CSV
        </button>
      </div>

      {/* Financial Profitability Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-medium text-slate-400 block">إجمالي إيرادات المبيعات</span>
          <div className="mt-2 text-2xl font-black font-mono text-emerald-400 tabular-nums">
            {totalSalesRevenue.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-sans text-slate-400">ر.س/ج.م</span>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-medium text-slate-400 block">تقدير التكلفة الإجمالية</span>
          <div className="mt-2 text-2xl font-black font-mono text-slate-300 tabular-nums">
            {totalCostEstimate.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-sans text-slate-400">ر.س/ج.م</span>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-medium text-slate-400 block">صافي الربح التقديري (هامش الربح)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
              {estimatedGrossProfit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              +{profitMarginPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Inventory Movements Log Table */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200">سجل التحركات الأخيرة للمخزون (الدفتر اليومي)</h4>
          <span className="text-xs text-slate-500 font-mono">{movements.length} حركة مسجلة</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold">
                <th className="p-4">اسم المنتج</th>
                <th className="p-4">نوع الحركة</th>
                <th className="p-4">تغير الكمية</th>
                <th className="p-4">الكمية السابقة ← الجديدة</th>
                <th className="p-4">الملاحظات</th>
                <th className="p-4">الوقت والتاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    لا توجد حركة مسجلة بالمخزون حالياً
                  </td>
                </tr>
              ) : (
                movements.map(mov => (
                  <tr key={mov.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-bold text-white">{mov.product_name}</td>

                    <td className="p-4">
                      {mov.type === 'sale' ? (
                        <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium inline-flex items-center gap-1">
                          <ArrowDownLeft className="w-3 h-3" />
                          مبيعات (خصم)
                        </span>
                      ) : mov.type === 'restock' ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium inline-flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" />
                          توريد شحنة (إضافة)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium inline-flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          تعديل جردي
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-mono font-bold text-sm tabular-nums">
                      <span className={mov.quantity_change > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {mov.quantity_change > 0 ? `+${mov.quantity_change}` : mov.quantity_change}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-slate-300 tabular-nums">
                      {mov.previous_quantity} ← <strong className="text-white">{mov.new_quantity}</strong>
                    </td>

                    <td className="p-4 text-slate-400">{mov.note || '-'}</td>

                    <td className="p-4 font-mono text-slate-400 text-[11px]">
                      {new Date(mov.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
