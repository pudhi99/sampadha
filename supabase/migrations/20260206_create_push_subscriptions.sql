-- Push Subscriptions table for PWA notifications
-- Stores Web Push API subscription endpoints

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

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own subscriptions
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
