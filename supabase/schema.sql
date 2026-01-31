-- Sampadha Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Assets Table (Cash, Gold, Investments)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('CASH', 'GOLD', 'INVESTMENT')) NOT NULL,
    current_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    purchase_value DECIMAL(15, 2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    image_url TEXT,
    category TEXT CHECK (category IN ('PROPERTY', 'VEHICLE', 'LAND', 'ELECTRONICS', 'OTHER')),
    is_liability BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans Table (Given & Taken)
CREATE TABLE IF NOT EXISTS loans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('GIVEN', 'TAKEN')),
  party_name TEXT NOT NULL,
  principal DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  interest_type TEXT NOT NULL DEFAULT 'SIMPLE' CHECK (interest_type IN ('SIMPLE', 'COMPOUND', 'FLAT')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DELAYED', 'CLOSED', 'DEFAULTED')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Payments Table
CREATE TABLE IF NOT EXISTS loan_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'MIXED' CHECK (payment_type IN ('PRINCIPAL', 'INTEREST', 'MIXED')),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance Schemes Table (Private Finance / Investments for returns)
CREATE TABLE IF NOT EXISTS finance_schemes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  principal DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  payment_cycle TEXT NOT NULL DEFAULT 'MONTHLY' CHECK (payment_cycle IN ('MONTHLY', 'QUARTERLY', 'YEARLY', 'LUMPSUM')),
  risk_level TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DELAYED', 'CLOSED', 'DEFAULTED')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Net Worth History Table (for tracking trends)
CREATE TABLE IF NOT EXISTS net_worth_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  net_worth DECIMAL(15, 2) NOT NULL,
  total_assets DECIMAL(15, 2) NOT NULL,
  total_liabilities DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_loans_type ON loans(type);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_finance_schemes_status ON finance_schemes(status);
CREATE INDEX IF NOT EXISTS idx_net_worth_history_date ON net_worth_history(date);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_loans_updated_at ON loans;
CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_finance_schemes_updated_at ON finance_schemes;
CREATE TRIGGER update_finance_schemes_updated_at
  BEFORE UPDATE ON finance_schemes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - for future multi-user support
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_history ENABLE ROW LEVEL SECURITY;

-- Policies for public access (single user mode for now)
-- You can modify these later for authenticated users

DROP POLICY IF EXISTS "Allow all operations on assets" ON assets;
CREATE POLICY "Allow all operations on assets" ON assets FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on loans" ON loans;
CREATE POLICY "Allow all operations on loans" ON loans FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on loan_payments" ON loan_payments;
CREATE POLICY "Allow all operations on loan_payments" ON loan_payments FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on finance_schemes" ON finance_schemes;
CREATE POLICY "Allow all operations on finance_schemes" ON finance_schemes FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on net_worth_history" ON net_worth_history;
CREATE POLICY "Allow all operations on net_worth_history" ON net_worth_history FOR ALL USING (true);

-- Metals Price History Table (for tracking gold, silver, copper prices)
CREATE TABLE IF NOT EXISTS metals_price_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metal TEXT NOT NULL CHECK (metal IN ('GOLD', 'SILVER', 'COPPER')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  price_per_gram DECIMAL(10, 2) NOT NULL,
  price_per_10g DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metal, date)
);

-- Notifications Table (for daily price alerts and other notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('PRICE_ALERT', 'REMINDER', 'INFO', 'WARNING')) NOT NULL,
  metal TEXT CHECK (metal IN ('GOLD', 'SILVER', 'COPPER')),
  price_change DECIMAL(10, 2),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for price history
CREATE INDEX IF NOT EXISTS idx_metals_price_history_metal ON metals_price_history(metal);
CREATE INDEX IF NOT EXISTS idx_metals_price_history_date ON metals_price_history(date);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable RLS for new tables
ALTER TABLE metals_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for new tables
DROP POLICY IF EXISTS "Allow all operations on metals_price_history" ON metals_price_history;
CREATE POLICY "Allow all operations on metals_price_history" ON metals_price_history FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on notifications" ON notifications;
CREATE POLICY "Allow all operations on notifications" ON notifications FOR ALL USING (true);

