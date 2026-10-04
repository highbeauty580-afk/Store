import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Receipt,
  History,
  Database,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
  Store,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Product, Category, Invoice, InventoryMovement } from './types';
import {
  fetchProducts,
  fetchCategories,
  fetchInvoices,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  createInvoice,
  adjustProductStock,
  getInventoryMovements,
  subscribeToStoreChanges
} from './services/storeService';
import { getStoredSupabaseConfig, testSupabaseConnection } from './lib/supabase';
import { DashboardOverview } from './components/DashboardOverview';
import { ProductsManagement } from './components/ProductsManagement';
import { InvoicesPOS } from './components/InvoicesPOS';
import { InventoryReports } from './components/InventoryReports';
import { SupabaseModal } from './components/SupabaseModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'invoices' | 'reports'>('overview');

  // Core Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Supabase State
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isConnectedToSupabase, setIsConnectedToSupabase] = useState(false);

  // Quick Restock Target
  const [restockTargetProduct, setRestockTargetProduct] = useState<Product | null>(null);

  // Load all data
  const loadData = async () => {
    setIsLoading(true);
    const [pList, cList, iList] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchInvoices(),
    ]);
    setProducts(pList);
    setCategories(cList);
    setInvoices(iList);
    setMovements(getInventoryMovements());
    setIsLoading(false);
  };

  const checkSupabaseStatus = async () => {
    const res = await testSupabaseConnection();
    setIsConnectedToSupabase(res.success && Boolean(res.tablesFound));
  };

  useEffect(() => {
    loadData();
    checkSupabaseStatus();

    // Realtime listener
    const unsubscribe = subscribeToStoreChanges(() => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handlers
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    await createProduct(productData);
    await loadData();
  };

  const handleUpdateProduct = async (product: Product) => {
    await updateProduct(product);
    await loadData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('هل أنت تأكد من حذف هذا المنتج من المخزون؟')) {
      await deleteProduct(id);
      await loadData();
    }
  };

  const handleAddCategory = async (name: string, color: string) => {
    await createCategory(name, color);
    await loadData();
  };

  const handleRestockProduct = async (productId: string, quantity: number, note: string) => {
    await adjustProductStock(productId, quantity, 'restock', note);
    await loadData();
  };

  const handleCreateInvoice = async (
    invoiceData: {
      customer_name: string;
      customer_phone?: string;
      discount: number;
      tax: number;
      payment_method: 'cash' | 'card' | 'transfer';
    },
    items: { product: Product; quantity: number }[]
  ) => {
    const res = await createInvoice(invoiceData, items);
    await loadData();
    return res;
  };

  const lowStockCount = products.filter(p => p.stock_quantity <= p.min_stock_alert).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-950/50">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight">مخزوني</span>
              <span className="text-xs text-slate-400 font-medium mr-2 hidden sm:inline">
                | لوحة المبيعات والمخزون
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links / Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              لوحة التحكم
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 relative ${
                activeTab === 'products'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              إدارة المخزون
              {lowStockCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'invoices'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              الفواتير والمبيعات
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              الحركة والتقارير
            </button>
          </nav>

          {/* Zone 3: Actions & Supabase Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Supabase Status Pill */}
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1.5 ${
                isConnectedToSupabase
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isConnectedToSupabase ? 'Supabase متصل' : 'ربط Supabase'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isConnectedToSupabase ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            </button>

            {/* Quick New Invoice CTA */}
            <button
              onClick={() => setActiveTab('invoices')}
              className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-950/40 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">فاتورة جديد</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-900 py-2 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'overview' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex flex-col items-center gap-1 relative ${activeTab === 'products' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <Package className="w-4 h-4" />
            <span>المخزون</span>
            {lowStockCount > 0 && (
              <span className="absolute -top-1 right-2 w-2 h-2 bg-amber-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'invoices' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <Receipt className="w-4 h-4" />
            <span>الفواتير</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'reports' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <History className="w-4 h-4" />
            <span>التقارير</span>
          </button>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-sm font-semibold text-slate-300">جاري تحميل وسحب البيانات أونلاين...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <DashboardOverview
                products={products}
                invoices={invoices}
                onOpenRestock={(product) => {
                  setActiveTab('products');
                }}
                onOpenNewInvoice={() => setActiveTab('invoices')}
                onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                isConnectedToSupabase={isConnectedToSupabase}
              />
            )}

            {activeTab === 'products' && (
              <ProductsManagement
                products={products}
                categories={categories}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onRestockProduct={handleRestockProduct}
                onAddCategory={handleAddCategory}
              />
            )}

            {activeTab === 'invoices' && (
              <InvoicesPOS
                products={products}
                invoices={invoices}
                onCreateInvoice={handleCreateInvoice}
              />
            )}

            {activeTab === 'reports' && (
              <InventoryReports
                products={products}
                invoices={invoices}
                movements={movements}
              />
            )}
          </>
        )}
      </main>

      {/* Supabase Connection Setup Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={() => {
          checkSupabaseStatus();
          loadData();
        }}
      />
    </div>
  );
}
