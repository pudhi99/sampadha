-- Goals / Financial Targets Table
-- Track savings goals, investment targets, and debt payoff milestones

CREATE TABLE IF NOT EXISTS goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('SAVINGS', 'INVESTMENT', 'DEBT_PAYOFF', 'EMERGENCY_FUND', 'CUSTOM')),
    target_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    current_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    target_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED')),
    priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    icon VARCHAR(50) DEFAULT 'target', -- Icon name for UI
    linked_asset_id UUID, -- Optional: link to an asset
    linked_scheme_id UUID, -- Optional: link to a finance scheme
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal contributions/progress tracking
CREATE TABLE IF NOT EXISTS goal_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    contribution_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);

-- Goal contributions policies
CREATE POLICY "Users can view own goal contributions" ON goal_contributions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_contributions.goal_id AND goals.user_id = auth.uid())
    );

CREATE POLICY "Users can insert own goal contributions" ON goal_contributions
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_contributions.goal_id AND goals.user_id = auth.uid())
    );

CREATE POLICY "Users can delete own goal contributions" ON goal_contributions
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_contributions.goal_id AND goals.user_id = auth.uid())
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal_id ON goal_contributions(goal_id);

-- Function to update goal current_amount when contribution is added
CREATE OR REPLACE FUNCTION update_goal_current_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE goals SET 
            current_amount = current_amount + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.goal_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE goals SET 
            current_amount = current_amount - OLD.amount,
            updated_at = NOW()
        WHERE id = OLD.goal_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-updating goal amount
DROP TRIGGER IF EXISTS trg_update_goal_amount ON goal_contributions;
CREATE TRIGGER trg_update_goal_amount
    AFTER INSERT OR DELETE ON goal_contributions
    FOR EACH ROW
    EXECUTE FUNCTION update_goal_current_amount();
