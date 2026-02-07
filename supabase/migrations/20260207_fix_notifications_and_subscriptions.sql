-- Fix push_subscriptions RLS policy to allow inserts
-- The policy was too restrictive, needs to allow any authenticated OR anonymous user

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Allow public insert for push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can insert push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON push_subscriptions;

-- Create open policies for push subscriptions (endpoint is unique identifier)
CREATE POLICY "Allow insert push subscriptions" ON push_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select push subscriptions" ON push_subscriptions
    FOR SELECT USING (true);

CREATE POLICY "Allow delete push subscriptions" ON push_subscriptions
    FOR DELETE USING (true);

-- Add missing columns to notifications table if they don't exist
DO $$ 
BEGIN
    -- Check and add 'metal' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'metal') THEN
        ALTER TABLE notifications ADD COLUMN metal TEXT;
    END IF;
    
    -- Check and add 'price' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'price') THEN
        ALTER TABLE notifications ADD COLUMN price DECIMAL(12,2);
    END IF;
    
    -- Check and add 'change_percent' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'change_percent') THEN
        ALTER TABLE notifications ADD COLUMN change_percent DECIMAL(5,2);
    END IF;
END $$;

-- Add missing columns to loans table if they don't exist
DO $$ 
BEGIN
    -- Check and add 'next_due_date' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loans' AND column_name = 'next_due_date') THEN
        ALTER TABLE loans ADD COLUMN next_due_date DATE;
    END IF;
    
    -- Check and add 'payment_day' column for recurring payment day of month
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loans' AND column_name = 'payment_day') THEN
        ALTER TABLE loans ADD COLUMN payment_day INTEGER CHECK (payment_day BETWEEN 1 AND 31);
    END IF;
END $$;

COMMENT ON COLUMN notifications.metal IS 'Metal type for price alerts (gold/silver)';
COMMENT ON COLUMN loans.next_due_date IS 'Next EMI/payment due date';
COMMENT ON COLUMN loans.payment_day IS 'Day of month when payment is due (1-31)';
