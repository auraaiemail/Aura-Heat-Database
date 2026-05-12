-- ═══════════════════════════════════════════════════════════════
-- AURA HEAT ENERGY — New Tables
-- SAFE TO RUN: Only CREATES new tables. Does NOT touch or delete:
--   ✅ transactions (May 1-11 stock data stays intact)
--   ✅ customers_data (943 customers stay intact)
--   ✅ user_roles (staff logins stay intact)
-- Run this once in Supabase SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════

-- 1. CUSTOMERS (full CRM)
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text default 'customer',
  contacts jsonb default '[]',
  companies jsonb default '[]',
  door_no text, street text, area text,
  city text, state text, pincode text,
  business_type text,
  application_type text,
  products_bought jsonb default '[]',
  assigned_staff uuid,
  assigned_staff_name text,
  notes text,
  next_followup text,
  next_follow_up text,
  last_contacted date,
  outstanding numeric default 0,
  credit_limit numeric default 0,
  priority text default 'ACTIVE',
  bill_type_preference text default 'with_gst',
  phone text,
  email text,
  orders int default 0,
  value numeric default 0,
  days_since int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table customers enable row level security;
drop policy if exists "all_access_customers" on customers;
create policy "all_access_customers" on customers
  for all using (true) with check (true);

-- 2. PRODUCTS (master with prices)
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  description text,
  family text,
  opening_qty int default 0,
  current_qty int default 0,
  buying_price numeric default 0,
  selling_price numeric default 0,
  min_qty int default 30,
  unit text default 'Nos',
  is_active boolean default true,
  last_sold_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table products enable row level security;
drop policy if exists "all_access_products" on products;
create policy "all_access_products" on products
  for all using (true) with check (true);

-- 3. PAYMENT RECEIPTS
create table if not exists payment_receipts (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  customer_name text,
  amount numeric not null,
  payment_mode text default 'bank_transfer',
  reference_no text,
  notes text,
  created_by_name text,
  created_at timestamptz default now()
);
alter table payment_receipts enable row level security;
drop policy if exists "all_access_payments" on payment_receipts;
create policy "all_access_payments" on payment_receipts
  for all using (true) with check (true);

-- 4. PURCHASE ENQUIRIES
create table if not exists purchase_enquiries (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  supplier_name text,
  status text default 'enquiry',
  items jsonb default '[]',
  notes text,
  created_by_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table purchase_enquiries enable row level security;
drop policy if exists "all_access_enq" on purchase_enquiries;
create policy "all_access_enq" on purchase_enquiries
  for all using (true) with check (true);

-- 5. FOLLOW-UP LOG
create table if not exists followup_log (
  id uuid default gen_random_uuid() primary key,
  customer_name text,
  staff_name text,
  type text,
  outcome text,
  next_action text,
  next_followup_date date,
  created_at timestamptz default now()
);
alter table followup_log enable row level security;
drop policy if exists "all_access_followup" on followup_log;
create policy "all_access_followup" on followup_log
  for all using (true) with check (true);

-- 6. STAFF ACTIVITY LOG
create table if not exists staff_activity (
  id uuid default gen_random_uuid() primary key,
  staff_id uuid,
  staff_name text,
  activity_type text,
  description text,
  ref_id text,
  created_at timestamptz default now()
);
alter table staff_activity enable row level security;
drop policy if exists "all_access_activity" on staff_activity;
create policy "all_access_activity" on staff_activity
  for all using (true) with check (true);

-- ── Indexes for speed ──────────────────────────────────────────
create index if not exists idx_customers_type on customers(type);
create index if not exists idx_customers_priority on customers(priority);
create index if not exists idx_customers_state on customers(state);
create index if not exists idx_products_family on products(family);
create index if not exists idx_followup_date on followup_log(next_followup_date);
create index if not exists idx_activity_staff on staff_activity(staff_id);
create index if not exists idx_activity_date on staff_activity(created_at);
create index if not exists idx_payments_date on payment_receipts(date);

-- ── Verify ────────────────────────────────────────────────────
select 
  'customers' as table_name, count(*) as rows from customers
union all select 'products', count(*) from products
union all select 'payment_receipts', count(*) from payment_receipts
union all select 'purchase_enquiries', count(*) from purchase_enquiries
union all select 'followup_log', count(*) from followup_log
union all select 'staff_activity', count(*) from staff_activity
union all select 'transactions (existing - untouched)', count(*) from transactions;
