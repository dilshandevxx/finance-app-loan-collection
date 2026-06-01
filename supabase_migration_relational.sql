-- ==========================================
-- Migration: Restructure JSON address column to Relational Columns
-- ==========================================

-- 1. Add dedicated columns to public.customers table if they do not exist
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS village TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS nic_number TEXT;

-- 2. Create indexes for highly-optimized querying and grouping on village and nic_number
CREATE INDEX IF NOT EXISTS customers_village_idx ON public.customers (village);
CREATE INDEX IF NOT EXISTS customers_nic_number_idx ON public.customers (nic_number);

-- 3. Safely migrate existing serialized JSON data into the structured columns
-- This SQL query parses the JSON string inside 'address' using jsonb casting.
-- Non-JSON text rows (e.g. pure addresses) are safely preserved as street_address.
UPDATE public.customers
SET 
  street_address = CASE 
    WHEN address.trim() LIKE '{%' THEN 
      COALESCE(NULLIF(TRIM((address::jsonb)->>'address'), ''), NULL) 
    ELSE 
      address 
    END,
  village = CASE 
    WHEN address.trim() LIKE '{%' THEN 
      COALESCE(NULLIF(TRIM((address::jsonb)->>'state'), ''), NULL) 
    ELSE 
      NULL 
    END,
  company_name = CASE 
    WHEN address.trim() LIKE '{%' THEN 
      COALESCE(NULLIF(TRIM((address::jsonb)->>'companyName'), ''), NULL) 
    ELSE 
      NULL 
    END,
  nic_number = CASE 
    WHEN address.trim() LIKE '{%' THEN 
      COALESCE(NULLIF(TRIM((address::jsonb)->>'idNumber'), ''), NULL) 
    ELSE 
      NULL 
    END
WHERE address IS NOT NULL AND address.trim() <> '';

-- 4. Enable proper multi-tenant policies (inherited from Row Level Security)
-- RLS policies will automatically restrict access based on user_profiles.tenant_id.
