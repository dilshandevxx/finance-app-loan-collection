-- Run this to make sure new records automatically get the logged-in user's tenant_id
ALTER TABLE public.customers ALTER COLUMN tenant_id SET DEFAULT public.current_tenant_id();
ALTER TABLE public.loans ALTER COLUMN tenant_id SET DEFAULT public.current_tenant_id();
ALTER TABLE public.installments ALTER COLUMN tenant_id SET DEFAULT public.current_tenant_id();
ALTER TABLE public.customer_notes ALTER COLUMN tenant_id SET DEFAULT public.current_tenant_id();
ALTER TABLE public.system_settings ALTER COLUMN tenant_id SET DEFAULT public.current_tenant_id();
