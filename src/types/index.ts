export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_alert: number;
  unit: string;
  image_url?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  discount: number;
  tax: number;
  net_amount: number;
  payment_method: 'cash' | 'card' | 'transfer';
  status: 'completed' | 'refunded' | 'pending';
  created_at: string;
  items?: InvoiceItem[];
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  product_name: string;
  type: 'sale' | 'restock' | 'adjustment';
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  note?: string;
  created_at: string;
}
