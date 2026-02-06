-- =====================================================
-- COMBINED MIGRATION: All changes from February 6, 2026
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. PUSH SUBSCRIPTIONS TABLE (for PWA notifications)
-- =====================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON push_subscriptions
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert subscriptions" ON push_subscriptions;
CREATE POLICY "Users can insert subscriptions" ON push_subscriptions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can delete own subscriptions" ON push_subscriptions
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Service can update subscriptions" ON push_subscriptions;
CREATE POLICY "Service can update subscriptions" ON push_subscriptions
    FOR UPDATE USING (true);

-- =====================================================
-- 2. NOTIFICATIONS TABLE WITH METADATA
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'SYSTEM',
    metal TEXT,
    price_change DECIMAL,
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- Add metadata column if notifications table already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Allow insert notifications" ON notifications;
CREATE POLICY "Allow insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 3. INVESTMENT TYPES FOR FINANCE SCHEMES
-- =====================================================

-- Add columns for chit funds, post office schemes, etc.
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

CREATE INDEX IF NOT EXISTS idx_finance_schemes_type ON finance_schemes(scheme_type);

-- Update status constraint to include MATURED
DO $$
BEGIN
    ALTER TABLE finance_schemes DROP CONSTRAINT IF EXISTS finance_schemes_status_check;
    ALTER TABLE finance_schemes ADD CONSTRAINT finance_schemes_status_check 
        CHECK (status IN ('ACTIVE', 'DELAYED', 'CLOSED', 'DEFAULTED', 'MATURED'));
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN finance_schemes.scheme_type IS 'Type: PRIVATE_FINANCE, CHIT_FUND, POST_OFFICE_FD, POST_OFFICE_RD, NSC, KVP, PPF, SCSS';
COMMENT ON COLUMN finance_schemes.chit_value IS 'Total chit value for Chit Funds (e.g., 500000 for 5L)';
COMMENT ON COLUMN finance_schemes.duration_months IS 'Duration in months (e.g., 20 for 20-month chit)';
COMMENT ON COLUMN finance_schemes.current_month IS 'Current running month for chit funds';
COMMENT ON COLUMN finance_schemes.won_at_month IS 'Month at which user won the chit bid';

-- =====================================================
-- DONE! All migrations applied successfully
-- =====================================================
