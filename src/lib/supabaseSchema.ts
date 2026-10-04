export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- SQL Schema for Store & Inventory Dashboard
-- Copy & Run this in Supabase SQL Editor
-- ==========================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 0,
  min_stock_alert INT NOT NULL DEFAULT 5,
  unit TEXT DEFAULT 'قطعة',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL DEFAULT 'عميل نقدي',
  customer_phone TEXT,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- 6. Enable Row Level Security (RLS) & Public Access Policies for Web App
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read & write policies for demo app usage
DROP POLICY IF EXISTS "Allow public full access categories" ON categories;
CREATE POLICY "Allow public full access categories" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access products" ON products;
CREATE POLICY "Allow public full access products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access invoices" ON invoices;
CREATE POLICY "Allow public full access invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access invoice_items" ON invoice_items;
CREATE POLICY "Allow public full access invoice_items" ON invoice_items FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;

-- Sample Seed Data
INSERT INTO categories (name, color) VALUES 
('إلكترونيات', '#3B82F6'),
('ملابس وموضة', '#EC4899'),
('أغذية ومشروبات', '#10B981'),
('مستلزمات منزلية', '#F59E0B')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (sku, name, category, price, cost, stock_quantity, min_stock_alert, unit) VALUES
('PRD-101', 'سماعات بلوتوث لاسلكية VIP', 'إلكترونيات', 250.00, 150.00, 18, 5, 'قطعة'),
('PRD-102', 'ساعة ذكية مقاومة للماء', 'إلكترونيات', 450.00, 300.00, 4, 10, 'قطعة'),
('PRD-103', 'قميص قطني قطن ممتازة', 'ملابس وموضة', 120.00, 70.00, 32, 8, 'قطعة'),
('PRD-104', 'قهوة عربية فاخرة 500 جرام', 'أغذية ومشروبات', 85.00, 50.00, 3, 12, 'علبة'),
('PRD-105', 'طقم أدوات مطبخ ستانلس', 'مستلزمات منزلية', 310.00, 200.00, 15, 4, 'طقم'),
('PRD-106', 'شاحن سريع 65 واط Type-C', 'إلكترونيات', 95.00, 55.00, 2, 8, 'قطعة')
ON CONFLICT (sku) DO NOTHING;
`;
