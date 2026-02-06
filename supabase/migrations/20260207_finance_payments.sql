-- Add payment tracking for finance schemes
-- 1. Add payment_due_day to finance_schemes
ALTER TABLE finance_schemes 
ADD COLUMN IF NOT EXISTS payment_due_day INTEGER CHECK (payment_due_day BETWEEN 1 AND 31);

COMMENT ON COLUMN finance_schemes.payment_due_day IS 'Day of the month (1-31) when payment is due';

-- 2. Create finance_payments table for history
CREATE TABLE IF NOT EXISTS finance_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    scheme_id UUID REFERENCES finance_schemes(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    month_number INTEGER, -- For chit funds tracking which month this payment isn for
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_finance_payments_scheme_id ON finance_payments(scheme_id);
CREATE INDEX IF NOT EXISTS idx_finance_payments_user_id ON finance_payments(user_id);

-- RLS Policies
ALTER TABLE finance_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own finance payments" ON finance_payments;
CREATE POLICY "Users can view own finance payments" ON finance_payments
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own finance payments" ON finance_payments;
CREATE POLICY "Users can insert own finance payments" ON finance_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own finance payments" ON finance_payments;
CREATE POLICY "Users can update own finance payments" ON finance_payments
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own finance payments" ON finance_payments;
CREATE POLICY "Users can delete own finance payments" ON finance_payments
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
