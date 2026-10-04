import { getSupabase, INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_INVOICES, getStoredSupabaseConfig } from '../lib/supabase';
import { Product, Category, Invoice, InvoiceItem, InventoryMovement } from '../types';

// Fallback memory state in case tables are creating or offline
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryCategories: Category[] = [...INITIAL_CATEGORIES];
let memoryInvoices: Invoice[] = [...INITIAL_INVOICES];
let memoryMovements: InventoryMovement[] = [
  {
    id: 'mov-1',
    product_id: '11111111-1111-1111-1111-111111111111',
    product_name: 'سماعة رأس لاسلكية نويز كانسلينج',
    type: 'sale',
    quantity_change: -2,
    previous_quantity: 16,
    new_quantity: 14,
    note: 'خصم فاتورة INV-2026-001',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'mov-2',
    product_id: '22222222-2222-2222-2222-222222222222',
    product_name: 'ساعة يد ذكية شاشة AMOLED',
    type: 'sale',
    quantity_change: -1,
    previous_quantity: 4,
    new_quantity: 3,
    note: 'خصم فاتورة INV-2026-002',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'mov-3',
    product_id: '44444444-4444-4444-4444-444444444444',
    product_name: 'بنطال جينز كلاسيك أسود',
    type: 'restock',
    quantity_change: 10,
    previous_quantity: 2,
    new_quantity: 12,
    note: 'استلام شحنة جديدة',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

// Helper to check if Supabase is properly configured and live
async function isSupabaseLive(): Promise<boolean> {
  const { isConfigured } = getStoredSupabaseConfig();
  if (!isConfigured) return false;
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('products').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// Fetch all Products
export async function fetchProducts(): Promise<Product[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      memoryProducts = data.map(p => ({
        id: p.id,
        sku: p.sku || `PRD-${Math.floor(Math.random() * 900) + 100}`,
        name: p.name,
        category: p.category || 'عام',
        price: Number(p.price) || 0,
        cost: Number(p.cost) || 0,
        stock_quantity: Number(p.stock_quantity) || 0,
        min_stock_alert: Number(p.min_stock_alert) || 5,
        unit: p.unit || 'قطعة',
        image_url: p.image_url,
        created_at: p.created_at,
      }));
      return memoryProducts;
    }
  } catch (e) {
    console.warn('Using memory products fallback', e);
  }
  return memoryProducts;
}

// Fetch Categories
export async function fetchCategories(): Promise<Category[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (!error && data && data.length > 0) {
      memoryCategories = data;
      return memoryCategories;
    }
  } catch (e) {
    console.warn('Using memory categories fallback', e);
  }
  return memoryCategories;
}

// Fetch Invoices
export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      memoryInvoices = data.map(inv => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        customer_name: inv.customer_name,
        customer_phone: inv.customer_phone,
        total_amount: Number(inv.total_amount),
        discount: Number(inv.discount),
        tax: Number(inv.tax),
        net_amount: Number(inv.net_amount),
        payment_method: inv.payment_method || 'cash',
        status: inv.status || 'completed',
        created_at: inv.created_at,
        items: inv.invoice_items?.map((item: any) => ({
          id: item.id,
          invoice_id: item.invoice_id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
        })) || [],
      }));
      return memoryInvoices;
    }
  } catch (e) {
    console.warn('Using memory invoices fallback', e);
  }
  return memoryInvoices;
}

// Save/Add New Product to Supabase
export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('products').insert([
      {
        id: newProduct.id,
        sku: newProduct.sku,
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        cost: newProduct.cost,
        stock_quantity: newProduct.stock_quantity,
        min_stock_alert: newProduct.min_stock_alert,
        unit: newProduct.unit,
        image_url: newProduct.image_url || null,
      }
    ]).select().single();

    if (!error && data) {
      newProduct.id = data.id;
    }
  } catch (e) {
    console.warn('Saved product to memory state', e);
  }

  memoryProducts.unshift(newProduct);
  return newProduct;
}

// Update Product in Supabase
export async function updateProduct(product: Product): Promise<Product> {
  try {
    const supabase = getSupabase();
    await supabase.from('products').update({
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock_quantity: product.stock_quantity,
      min_stock_alert: product.min_stock_alert,
      unit: product.unit,
      image_url: product.image_url || null,
    }).eq('id', product.id);
  } catch (e) {
    console.warn('Updated product in memory state', e);
  }

  const idx = memoryProducts.findIndex(p => p.id === product.id);
  if (idx !== -1) {
    memoryProducts[idx] = product;
  }
  return product;
}

// Delete Product
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    await supabase.from('products').delete().eq('id', id);
  } catch (e) {
    console.warn('Deleted product from memory', e);
  }

  memoryProducts = memoryProducts.filter(p => p.id !== id);
  return true;
}

// Add New Category
export async function createCategory(name: string, color: string): Promise<Category> {
  const newCategory: Category = {
    id: crypto.randomUUID(),
    name,
    color,
  };

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('categories').insert([{ name, color }]).select().single();
    if (!error && data) {
      newCategory.id = data.id;
    }
  } catch (e) {
    console.warn('Category saved in memory', e);
  }

  memoryCategories.push(newCategory);
  return newCategory;
}

// Create Invoice & Automatically Update Stock in Supabase
export async function createInvoice(
  invoiceData: {
    customer_name: string;
    customer_phone?: string;
    discount: number;
    tax: number;
    payment_method: 'cash' | 'card' | 'transfer';
  },
  items: { product: Product; quantity: number }[]
): Promise<{ invoice: Invoice; lowStockAlerts: Product[] }> {
  const rawTotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const taxAmount = (rawTotal - invoiceData.discount) * (invoiceData.tax / 100);
  const netAmount = Math.max(0, rawTotal - invoiceData.discount + taxAmount);

  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const invoiceId = crypto.randomUUID();

  const formattedItems: InvoiceItem[] = items.map(item => ({
    id: crypto.randomUUID(),
    invoice_id: invoiceId,
    product_id: item.product.id,
    product_name: item.product.name,
    quantity: item.quantity,
    unit_price: item.product.price,
    total_price: item.product.price * item.quantity,
  }));

  const newInvoice: Invoice = {
    id: invoiceId,
    invoice_number: invoiceNumber,
    customer_name: invoiceData.customer_name || 'عميل نقدي',
    customer_phone: invoiceData.customer_phone,
    total_amount: rawTotal,
    discount: invoiceData.discount,
    tax: taxAmount,
    net_amount: netAmount,
    payment_method: invoiceData.payment_method,
    status: 'completed',
    created_at: new Date().toISOString(),
    items: formattedItems,
  };

  const lowStockAlerts: Product[] = [];

  // Deduct inventory stock for each product
  for (const item of items) {
    const targetProduct = memoryProducts.find(p => p.id === item.product.id);
    if (targetProduct) {
      const oldQty = targetProduct.stock_quantity;
      const newQty = Math.max(0, oldQty - item.quantity);
      targetProduct.stock_quantity = newQty;

      // Track movement log
      memoryMovements.unshift({
        id: crypto.randomUUID(),
        product_id: targetProduct.id,
        product_name: targetProduct.name,
        type: 'sale',
        quantity_change: -item.quantity,
        previous_quantity: oldQty,
        new_quantity: newQty,
        note: `خصم فاتورة مبيعات ${invoiceNumber}`,
        created_at: new Date().toISOString(),
      });

      if (newQty <= targetProduct.min_stock_alert) {
        lowStockAlerts.push(targetProduct);
      }

      // Sync product stock to Supabase
      try {
        const supabase = getSupabase();
        await supabase.from('products').update({ stock_quantity: newQty }).eq('id', targetProduct.id);
      } catch (e) {
        console.warn('Updated stock locally', e);
      }
    }
  }

  // Insert Invoice to Supabase
  try {
    const supabase = getSupabase();
    const { data: invData, error: invErr } = await supabase.from('invoices').insert([
      {
        id: newInvoice.id,
        invoice_number: newInvoice.invoice_number,
        customer_name: newInvoice.customer_name,
        customer_phone: newInvoice.customer_phone || null,
        total_amount: newInvoice.total_amount,
        discount: newInvoice.discount,
        tax: newInvoice.tax,
        net_amount: newInvoice.net_amount,
        payment_method: newInvoice.payment_method,
        status: newInvoice.status,
      }
    ]).select().single();

    if (!invErr && invData) {
      // Insert items
      const itemsToInsert = formattedItems.map(item => ({
        id: item.id,
        invoice_id: invData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));
      await supabase.from('invoice_items').insert(itemsToInsert);
    }
  } catch (e) {
    console.warn('Saved invoice in memory', e);
  }

  memoryInvoices.unshift(newInvoice);
  return { invoice: newInvoice, lowStockAlerts };
}

// Adjust Stock Quantity Manually (restock or adjustment)
export async function adjustProductStock(
  productId: string,
  quantityChange: number,
  type: 'restock' | 'adjustment',
  note?: string
): Promise<Product | null> {
  const product = memoryProducts.find(p => p.id === productId);
  if (!product) return null;

  const oldQty = product.stock_quantity;
  const newQty = Math.max(0, oldQty + quantityChange);
  product.stock_quantity = newQty;

  memoryMovements.unshift({
    id: crypto.randomUUID(),
    product_id: product.id,
    product_name: product.name,
    type,
    quantity_change: quantityChange,
    previous_quantity: oldQty,
    new_quantity: newQty,
    note: note || (type === 'restock' ? 'تزويد مخزون' : 'تعديل جردي'),
    created_at: new Date().toISOString(),
  });

  try {
    const supabase = getSupabase();
    await supabase.from('products').update({ stock_quantity: newQty }).eq('id', productId);
  } catch (e) {
    console.warn('Stock adjusted in memory', e);
  }

  return product;
}

export function getInventoryMovements(): InventoryMovement[] {
  return memoryMovements;
}

// Real-time Subscriptions using Supabase Channels
export function subscribeToStoreChanges(onDataChange: () => void): () => void {
  try {
    const supabase = getSupabase();
    const channel = supabase
      .channel('store-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        onDataChange();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        onDataChange();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        onDataChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    console.warn('Realtime subscription not active', e);
    return () => {};
  }
}
