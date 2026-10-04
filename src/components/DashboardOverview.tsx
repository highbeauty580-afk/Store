import React from 'react';
import {
  TrendingUp,
  Package,
  Receipt,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  PlusCircle,
  Database
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Product, Invoice } from '../types';

interface DashboardOverviewProps {
  products: Product[];
  invoices: Invoice[];
  onOpenRestock: (product: Product) => void;
  onOpenNewInvoice: () => void;
  onOpenSupabaseModal: () => void;
  isConnectedToSupabase: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products,
  invoices,
  onOpenRestock,
  onOpenNewInvoice,
  onOpenSupabaseModal,
  isConnectedToSupabase,
}) => {
  // Calculations
  const totalSales = invoices.reduce((sum, inv) => sum + inv.net_amount, 0);
  const totalInvoicesCount = invoices.length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock_quantity, 0);
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.min_stock_alert);

  // Sales trend chart data grouped by date
  const salesByDateMap: { [date: string]: number } = {};
  invoices.forEach(inv => {
    const d = new Date(inv.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    salesByDateMap[d] = (salesByDateMap[d] || 0) + inv.net_amount;
  });

  const salesChartData = Object.keys(salesByDateMap).length > 0
    ? Object.keys(salesByDateMap).map(date => ({ date, amount: salesByDateMap[date] }))
    : [
        { date: 'الأحد', amount: 450 },
        { date: 'الإثنين', amount: 890 },
        { date: 'الثلاثاء', amount: 1250 },
        { date: 'الأربعاء', amount: 980 },
        { date: 'الخميس', amount: 2100 },
        { date: 'الجمعة', amount: 1800 },
        { date: 'السبت', amount: 1400 },
      ];

  // Category breakdown
  const categoryMap: { [cat: string]: number } = {};
  products.forEach(p => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + p.stock_quantity;
  });

  const categoryColors = ['#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6'];
  const categoryChartData = Object.keys(categoryMap).map((cat, idx) => ({
    name: cat,
    value: categoryMap[cat],
    color: categoryColors[idx % categoryColors.length],
  }));

  // Top stock items
  const stockBarData = products.slice(0, 6).map(p => ({
    name: p.name.length > 14 ? p.name.substring(0, 14) + '...' : p.name,
    stock: p.stock_quantity,
    min: p.min_stock_alert,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner Notice for Supabase status */}
      <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isConnectedToSupabase ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {isConnectedToSupabase ? 'متصل ومزامن لحظياً عبر Supabase Cloud' : 'وضع الاتصال الافتراضي السحابي'}
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                isConnectedToSupabase ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnectedToSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isConnectedToSupabase ? 'تحديث تلقائي فعال' : 'إعداد الاتصال'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              تتم مزامنة أي عمليات بيع أو تعديل للمخزون أونلاين فوراً لتظهر على كافة الأجهزة المفتوحة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSupabaseModal}
            className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors"
          >
            إعدادات Supabase
          </button>
          <button
            onClick={onOpenNewInvoice}
            className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            فاتورة جديدة
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-slate-800/50 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">إجمالي المبيعات</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {totalSales.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-medium text-emerald-400">ر.س / ج.م</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            مكتمل ومسجل بالسجل اللحظي
          </p>
        </div>

        {/* Total Invoices */}
        <div className="bg-slate-800/50 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">عدد الفواتير الصادرة</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {totalInvoicesCount}
            </span>
            <span className="text-xs text-slate-400">فاتورة</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">متابعة فورية للمبيعات</p>
        </div>

        {/* Total Stock Units */}
        <div className="bg-slate-800/50 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">إجمالي قطع المخزون</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {totalStockUnits}
            </span>
            <span className="text-xs text-slate-400">وحدة متوفرة</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">موزعة على {products.length} منتج</p>
        </div>

        {/* Low Stock Warning Card */}
        <div className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${
          lowStockProducts.length > 0
            ? 'bg-amber-950/20 border-amber-500/30'
            : 'bg-slate-800/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">تنبيهات النواقص</span>
            <div className={`p-2 rounded-xl ${lowStockProducts.length > 0 ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono tabular-nums ${
              lowStockProducts.length > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {lowStockProducts.length}
            </span>
            <span className="text-xs text-slate-400">منتجات تنقص بالمخزون</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {lowStockProducts.length > 0 ? 'تحتاج تزويد كميات عاجل' : 'المخزون بوضع آمن وممتاز'}
          </p>
        </div>
      </div>

      {/* Main Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Timeline Area Chart (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                مخطط حركة المبيعات والإيرادات
              </h3>
              <p className="text-xs text-slate-400">متابعة بيانية لتطور المبيعات اليومية</p>
            </div>
          </div>

          <div className="h-64 w-full dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} ر.س/ج.م`, 'المبيعات']}
                />
                <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Stock Distribution Pie Chart */}
        <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-1">توزيع المخزون حسب التصنيف</h3>
          <p className="text-xs text-slate-400 mb-4">نسبة توفر البضائع في الأقسام</p>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {categoryChartData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-300">{cat.name}</span>
                </div>
                <span className="font-mono text-slate-400 font-medium tabular-nums">{cat.value} قطعة</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Automatic Alerts Section */}
      <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">التنبيهات التلقائية لنواقص المنتجات</h3>
              <p className="text-xs text-slate-400">متابعة فورية للمنتجات التي وصلت لحد التنبيه بالمخزون</p>
            </div>
          </div>
          {lowStockProducts.length > 0 && (
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {lowStockProducts.length} منتجات تحتاج إعادة شحن
            </span>
          )}
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="p-6 text-center bg-slate-900/40 rounded-xl border border-slate-800">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-200">جميع المنتجات متوفرة بكميات كافية</p>
            <p className="text-xs text-slate-400 mt-0.5">لا توجد نواقص تنبيه حالياً في مخزون المتجر</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map(product => (
              <div
                key={product.id}
                className="bg-slate-900/60 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between hover:border-amber-500 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">{product.sku}</span>
                    <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded">
                      {product.stock_quantity === 0 ? 'منتهي بالمخزون' : 'مخزون منخفض'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{product.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    المتبقي: <strong className="text-amber-400 font-mono text-sm">{product.stock_quantity}</strong> {product.unit} (حد التنبيه: {product.min_stock_alert})
                  </p>
                </div>

                <button
                  onClick={() => onOpenRestock(product)}
                  className="px-3 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shrink-0"
                >
                  تزويد المخزون
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
