-- Migration: Add support for multiple investment scheme types
-- Run this after the finance_schemes table exists

-- Add new columns for different scheme types
ALTER TABLE finance_schemes 
ADD COLUMN IF NOT EXISTS scheme_type TEXT DEFAULT 'PRIVATE_FINANCE',
ADD COLUMN IF NOT EXISTS monthly_amount DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS yearly_deposit DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS chit_value DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS duration_months INTEGER,
ADD COLUMN IF NOT EXISTS commission_percent DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS won_at_month INTEGER,
ADD COLUMN IF NOT EXISTS current_month INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS tenure TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS branch TEXT,
ADD COLUMN IF NOT EXISTS maturity_date DATE;

-- Create index for scheme_type filtering
CREATE INDEX IF NOT EXISTS idx_finance_schemes_type ON finance_schemes(scheme_type);

-- Add MATURED status if constraint exists
DO $$
BEGIN
    -- Try to add the new status value
    ALTER TABLE finance_schemes DROP CONSTRAINT IF EXISTS finance_schemes_status_check;
    ALTER TABLE finance_schemes ADD CONSTRAINT finance_schemes_status_check 
        CHECK (status IN ('ACTIVE', 'DELAYED', 'CLOSED', 'DEFAULTED', 'MATURED'));
EXCEPTION
    WHEN others THEN
        -- Constraint doesn't exist or can't be modified, continue
        NULL;
END $$;

-- Comment for documentation
COMMENT ON COLUMN finance_schemes.scheme_type IS 'Type of investment: PRIVATE_FINANCE, CHIT_FUND, POST_OFFICE_FD, POST_OFFICE_RD, NSC, KVP, PPF, SCSS';
COMMENT ON COLUMN finance_schemes.monthly_amount IS 'Monthly installment for RD or Chit Fund';
COMMENT ON COLUMN finance_schemes.chit_value IS 'Total chit value for Chit Funds';
COMMENT ON COLUMN finance_schemes.duration_months IS 'Duration in months for Chit Funds';
COMMENT ON COLUMN finance_schemes.commission_percent IS 'Commission percentage for Chit Funds';
COMMENT ON COLUMN finance_schemes.won_at_month IS 'Month at which user won the chit bid';
COMMENT ON COLUMN finance_schemes.tenure IS 'FD tenure: 1, 2, 3, or 5 years';
COMMENT ON COLUMN finance_schemes.account_number IS 'Post office account/certificate number';
COMMENT ON COLUMN finance_schemes.branch IS 'Post office branch name';
