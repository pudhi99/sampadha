-- Run this script in the Supabase SQL Editor to fix schema issues

-- 1. Create Notifications Table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL, -- 'ALERT', 'INFO', 'WARNING'
    title TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add Missing Columns to Assets Table
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS is_liability BOOLEAN DEFAULT FALSE,
-- Renamed from 'purchased data' to standard snake_case
ADD COLUMN IF NOT EXISTS purchase_date DATE, 
ADD COLUMN IF NOT EXISTS purchase_link TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Enable Security Policies (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to mark their notifications as read
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Storage Policies for 'asset-images' bucket (Run this if you can't create via UI)
-- Note: It is often easier to create the bucket 'asset-images' in the dashboard Storage section.
