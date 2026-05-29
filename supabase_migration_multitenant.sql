-- ==========================================
-- 1. Create Core Multi-Tenant Tables
-- ==========================================

-- Table: tenants (represents a client's business)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: user_profiles (links auth user to a tenant and stores PIN)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT,
  hashed_pin TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 2. Setup Default Tenant for Existing Data
-- ==========================================

-- Insert a default tenant to adopt any existing data
INSERT INTO public.tenants (id, name, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Organization', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 3. Add Columns to Existing user_profiles
-- ==========================================

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Sync existing emails from auth.users
UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.id = au.id;

-- ==========================================
-- 4. Add tenant_id to Existing Tables
-- ==========================================

-- Alter customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES public.tenants(id) ON DELETE CASCADE;
UPDATE public.customers SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.customers ALTER COLUMN tenant_id SET NOT NULL;

-- Alter loans
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES public.tenants(id) ON DELETE CASCADE;
UPDATE public.loans SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.loans ALTER COLUMN tenant_id SET NOT NULL;

-- Alter installments
ALTER TABLE public.installments ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES public.tenants(id) ON DELETE CASCADE;
UPDATE public.installments SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.installments ALTER COLUMN tenant_id SET NOT NULL;

-- Alter customer_notes
ALTER TABLE public.customer_notes ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES public.tenants(id) ON DELETE CASCADE;
UPDATE public.customer_notes SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.customer_notes ALTER COLUMN tenant_id SET NOT NULL;

-- Alter system_settings (replaces system_villages)
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES public.tenants(id) ON DELETE CASCADE;
UPDATE public.system_settings SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.system_settings ALTER COLUMN tenant_id SET NOT NULL;
-- Note: You may need to drop and recreate the primary key on system_settings if it was just "key" before.
-- Let's make the primary key composite: (tenant_id, key)
ALTER TABLE public.system_settings DROP CONSTRAINT IF EXISTS system_settings_pkey;
ALTER TABLE public.system_settings ADD PRIMARY KEY (tenant_id, key);

-- ==========================================
-- 4. Row Level Security (RLS) Helper Function
-- ==========================================

-- Create a helper function to easily get the current user's tenant_id
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==========================================
-- 5. Enable RLS and Create Policies
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Tenants Policy
CREATE POLICY "Users can view their own tenant" ON public.tenants
FOR SELECT USING (id = public.current_tenant_id());

-- User Profiles Policy
CREATE POLICY "Users can view their own profile" ON public.user_profiles
FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE USING (id = auth.uid());

-- Customer Policy
CREATE POLICY "Tenant isolation for customers" ON public.customers
FOR ALL USING (tenant_id = public.current_tenant_id());

-- Loans Policy
CREATE POLICY "Tenant isolation for loans" ON public.loans
FOR ALL USING (tenant_id = public.current_tenant_id());

-- Installments Policy
CREATE POLICY "Tenant isolation for installments" ON public.installments
FOR ALL USING (tenant_id = public.current_tenant_id());

-- Customer Notes Policy
CREATE POLICY "Tenant isolation for customer_notes" ON public.customer_notes
FOR ALL USING (tenant_id = public.current_tenant_id());

-- System Settings Policy
CREATE POLICY "Tenant isolation for system_settings" ON public.system_settings
FOR ALL USING (tenant_id = public.current_tenant_id());
