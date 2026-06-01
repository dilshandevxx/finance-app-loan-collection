-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  address TEXT, -- Keeps serialized JSON fallback for compatibility
  street_address TEXT,
  village TEXT,
  company_name TEXT,
  nic_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create loans table
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  principal_amount NUMERIC NOT NULL,
  total_amount_due NUMERIC NOT NULL,
  remaining_balance NUMERIC NOT NULL,
  weekly_installment NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'PAID_OFF', 'DEFAULTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create installments table
CREATE TABLE installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_date TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID', 'MISSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create customer notes table
CREATE TABLE customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create system settings table (for agent PIN)
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default PIN
INSERT INTO system_settings (key, value) VALUES ('agent_pin', '1234') ON CONFLICT DO NOTHING;
