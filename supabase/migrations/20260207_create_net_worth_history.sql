-- Drop table if exists to ensure clean slate (to fix any existing schema issues)
DROP TABLE IF EXISTS net_worth_history;

-- Create net_worth_history table for tracking wealth over time
CREATE TABLE net_worth_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    net_worth DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_assets DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_liabilities DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one entry per user per day
    UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE net_worth_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own net worth history" ON net_worth_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own net worth history" ON net_worth_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own net worth history" ON net_worth_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own net worth history" ON net_worth_history
    FOR DELETE USING (auth.uid() = user_id);

-- Index for efficient date range queries
CREATE INDEX IF NOT EXISTS idx_net_worth_history_user_date 
    ON net_worth_history(user_id, date DESC);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_net_worth_history_date 
    ON net_worth_history(date);
