-- Fix notifications table: Make user_id nullable for system-wide notifications
ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;

-- Also ensure push_subscriptions allows inserts
-- Re-enable RLS with open policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Allow insert push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Allow select push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Allow delete push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON push_subscriptions;

-- Create permissive policies
CREATE POLICY "Allow all push subscriptions operations" ON push_subscriptions
    FOR ALL USING (true) WITH CHECK (true);
