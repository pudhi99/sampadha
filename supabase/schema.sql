-- Sampadha Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Assets Table (Cash, Gold, Investments)
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CASH', 'GOLD', 'INVESTMENT')),
  current_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  purchase_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  notes TEXT,
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
CREATE POLICY "Allow all operations on assets" ON assets FOR ALL USING (true);
CREATE POLICY "Allow all operations on loans" ON loans FOR ALL USING (true);
CREATE POLICY "Allow all operations on loan_payments" ON loan_payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on finance_schemes" ON finance_schemes FOR ALL USING (true);
CREATE POLICY "Allow all operations on net_worth_history" ON net_worth_history FOR ALL USING (true);
