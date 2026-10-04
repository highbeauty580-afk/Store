import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Category, Invoice, InvoiceItem } from '../types';

// Default Supabase Config Storage Keys
const SUPABASE_URL_KEY = 'makhzooni_supabase_url';
const SUPABASE_KEY_KEY = 'makhzooni_supabase_key';

// Fallback Demo Public Supabase URL & Key if env or local storage isn't set yet
const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompanydefault.supabase.co';
const DEFAULT_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MjUxMjAwMCwiZXhwIjoyMDE4MDg4MDAwfQ.placeholder';

export function getStoredSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem(SUPABASE_URL_KEY);
  const localKey = localStorage.getItem(SUPABASE_KEY_KEY);

  const url = localUrl || envUrl || '';
  const key = localKey || envKey || '';

  const isConfigured = Boolean(url && key && url.includes('supabase.co') && !key.includes('placeholder'));

  return {
    url: url || DEFAULT_URL,
    key: key || DEFAULT_KEY,
    isConfigured,
  };
}

export function saveStoredSupabaseConfig(url: string, key: string) {
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_KEY_KEY, key.trim());
  // Re-create client
  initSupabaseClient();
}

let supabaseInstance: SupabaseClient | null = null;

export function initSupabaseClient(): SupabaseClient {
  const { url, key } = getStoredSupabaseConfig();
  supabaseInstance = createClient(url, key, {
    auth: { persistSession: true },
    global: {
      fetch: (input, init) => window.fetch(input, init),
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
  return supabaseInstance;
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    return initSupabaseClient();
  }
  return supabaseInstance;
}

// Check database connectivity
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; tablesFound?: boolean }> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        // Table does not exist
        return {
          success: true,
          message: 'تم الاتصال بـ Supabase بنجاح! يلزم تشغيل ملف SQL لإنشاء الجداول.',
          tablesFound: false,
        };
      }
      return {
        success: false,
        message: `خطأ في الاتصال: ${error.message}`,
        tablesFound: false,
      };
    }

    return {
      success: true,
      message: 'الاتصال ممتاز بقاعدة بيانات Supabase ومزامنة البيانات جارية.',
      tablesFound: true,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'تعذر الاتصال بخادم Supabase.',
      tablesFound: false,
    };
  }
}

// Initial Sample Seed Data for Instant Display if DB tables are empty
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    sku: 'PRD-101',
    name: 'سماعة رأس لاسلكية نويز كانسلينج',
    category: 'إلكترونيات',
    price: 350.00,
    cost: 210.00,
    stock_quantity: 14,
    min_stock_alert: 5,
    unit: 'قطعة',
    created_at: new Date().toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    sku: 'PRD-102',
    name: 'ساعة يد ذكية شاشة AMOLED',
    category: 'إلكترونيات',
    price: 520.00,
    cost: 340.00,
    stock_quantity: 3, // Low stock!
    min_stock_alert: 8,
    unit: 'قطعة',
    created_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    sku: 'PRD-103',
    name: 'قميص رجالي قطن فاخر',
    category: 'ملابس وموضة',
    price: 140.00,
    cost: 80.00,
    stock_quantity: 28,
    min_stock_alert: 10,
    unit: 'قطعة',
    created_at: new Date().toISOString(),
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    sku: 'PRD-104',
    name: 'بنطال جينز كلاسيك أسود',
    category: 'ملابس وموضة',
    price: 180.00,
    cost: 110.00,
    stock_quantity: 2, // Low stock!
    min_stock_alert: 6,
    unit: 'قطعة',
    created_at: new Date().toISOString(),
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    sku: 'PRD-105',
    name: 'قهوة مختصة كولومبية 1 كجم',
    category: 'أغذية ومشروبات',
    price: 110.00,
    cost: 65.00,
    stock_quantity: 19,
    min_stock_alert: 5,
    unit: 'كيس',
    created_at: new Date().toISOString(),
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    sku: 'PRD-106',
    name: 'طقم ملاعق وأدوات طعام استيل',
    category: 'مستلزمات منزلية',
    price: 240.00,
    cost: 150.00,
    stock_quantity: 0, // Out of stock!
    min_stock_alert: 4,
    unit: 'طقم',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'إلكترونيات', color: '#3B82F6' },
  { id: 'cat-2', name: 'ملابس وموضة', color: '#EC4899' },
  { id: 'cat-3', name: 'أغذية ومشروبات', color: '#10B981' },
  { id: 'cat-4', name: 'مستلزمات منزلية', color: '#F59E0B' },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoice_number: 'INV-2026-001',
    customer_name: 'شركة الأفق للتجارة',
    customer_phone: '0501234567',
    total_amount: 1040.00,
    discount: 40.00,
    tax: 150.00,
    net_amount: 1150.00,
    payment_method: 'card',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      { product_id: '11111111-1111-1111-1111-111111111111', product_name: 'سماعة رأس لاسلكية نويز كانسلينج', quantity: 2, unit_price: 350.00, total_price: 700.00 },
      { product_id: '33333333-3333-3333-3333-333333333333', product_name: 'قميص رجالي قطن فاخر', quantity: 2, unit_price: 170.00, total_price: 340.00 },
    ],
  },
  {
    id: 'inv-002',
    invoice_number: 'INV-2026-002',
    customer_name: 'عميل نقدي - أحمد علي',
    customer_phone: '0559876543',
    total_amount: 520.00,
    discount: 0,
    tax: 78.00,
    net_amount: 598.00,
    payment_method: 'cash',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    items: [
      { product_id: '22222222-2222-2222-2222-222222222222', product_name: 'ساعة يد ذكية شاشة AMOLED', quantity: 1, unit_price: 520.00, total_price: 520.00 },
    ],
  },
  {
    id: 'inv-003',
    invoice_number: 'INV-2026-003',
    customer_name: 'مؤسسة الرواد',
    customer_phone: '0543332211',
    total_amount: 330.00,
    discount: 30.00,
    tax: 45.00,
    net_amount: 345.00,
    payment_method: 'transfer',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    items: [
      { product_id: '55555555-5555-5555-5555-555555555555', product_name: 'قهوة مختصة كولومبية 1 كجم', quantity: 3, unit_price: 110.00, total_price: 330.00 },
    ],
  },
];
