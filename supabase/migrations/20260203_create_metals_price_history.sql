-- Create metals_price_history table for storing daily metal prices
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS metals_price_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    metal VARCHAR(20) NOT NULL, -- 'GOLD', 'SILVER'
    
    -- Prices in INR
    price_24k_per_gram DECIMAL(12, 2),  -- Main price (24K for gold, regular for silver)
    price_22k_per_gram DECIMAL(12, 2),  -- 22K gold price
    price_18k_per_gram DECIMAL(12, 2),  -- 18K gold price
    
    -- Spot (international) prices for reference
    spot_price_per_gram DECIMAL(12, 2),
    spot_price_per_ounce DECIMAL(12, 2),
    
    -- Metadata
    indian_premium VARCHAR(20),         -- Premium percentage applied
    currency VARCHAR(5) DEFAULT 'INR',
    source VARCHAR(50),                 -- Data source (e.g., 'metalpriceapi')
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint for one record per metal per day
    UNIQUE(date, metal)
);

-- Create index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_metals_price_history_date ON metals_price_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_metals_price_history_metal ON metals_price_history(metal);
CREATE INDEX IF NOT EXISTS idx_metals_price_history_date_metal ON metals_price_history(date, metal);

-- Enable Row Level Security
ALTER TABLE metals_price_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read price history
CREATE POLICY "Allow read access to price history" 
    ON metals_price_history 
    FOR SELECT 
    USING (true);

-- Create policy to allow service role to insert/update prices (for cron job)
CREATE POLICY "Allow service role to manage prices" 
    ON metals_price_history 
    FOR ALL 
    USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_metals_price_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_metals_price_history_updated_at ON metals_price_history;
CREATE TRIGGER trigger_update_metals_price_history_updated_at
    BEFORE UPDATE ON metals_price_history
    FOR EACH ROW
    EXECUTE FUNCTION update_metals_price_history_updated_at();

-- Optional: Insert sample historical data for testing
-- INSERT INTO metals_price_history (date, metal, price_24k_per_gram, price_22k_per_gram, price_18k_per_gram, spot_price_per_gram, indian_premium, source)
-- VALUES 
--     ('2026-02-02', 'GOLD', 15317, 14040, 11488, 13266, '15.5%', 'metalpriceapi'),
--     ('2026-02-01', 'GOLD', 15250, 13979, 11438, 13208, '15.5%', 'metalpriceapi'),
--     ('2026-02-02', 'SILVER', 300, NULL, NULL, 169, '77.0%', 'metalpriceapi'),
--     ('2026-02-01', 'SILVER', 350, NULL, NULL, 198, '77.0%', 'metalpriceapi');
