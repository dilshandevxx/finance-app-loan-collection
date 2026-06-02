-- ==========================================
-- 1. Function to handle new user registration
-- ==========================================

-- This function intercepts new users created in auth.users
-- and automatically provisions a tenant and user_profile for them.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_tenant_id UUID;
  user_company_name TEXT;
  user_full_name TEXT;
BEGIN
  -- Extract from metadata (defaulting if not provided)
  user_company_name := COALESCE(new.raw_user_meta_data->>'company_name', 'My Loan Company');
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', 'Agent');

  -- Create new tenant (isolated company namespace)
  INSERT INTO public.tenants (name, status)
  VALUES (user_company_name, 'ACTIVE')
  RETURNING id INTO new_tenant_id;

  -- Create user profile linked to the new tenant
  INSERT INTO public.user_profiles (id, tenant_id, email, full_name)
  VALUES (new.id, new_tenant_id, new.email, user_full_name);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. Attach Trigger to auth.users
-- ==========================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
