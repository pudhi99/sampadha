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

-- Storage Policies for 'asset-images' bucket
-- 1. Enable RLS... (skipped)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. FORCE BUCKET TO BE PUBLIC (Fixes 400 Bad Request on getPublicUrl)
UPDATE storage.buckets SET public = true WHERE id = 'asset-images';

-- 3. Create Policy to allow uploads (INSERT)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'asset-images');

-- 3. Create Policy to allow viewing (SELECT)
DROP POLICY IF EXISTS "Allow public viewing" ON storage.objects;
CREATE POLICY "Allow public viewing"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'asset-images');

-- 4. Create Policy to allow updates/deletes (users can manage own files)
DROP POLICY IF EXISTS "Allow users to update own files" ON storage.objects;
CREATE POLICY "Allow users to update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'asset-images' AND owner = auth.uid());

DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'asset-images' AND owner = auth.uid());


-- 5. FIX: Update Assets Type Check Constraint
-- The error "violates check constraint assets_type_check" implies the DB limits allowed types.
-- We must update it to include 'PHYSICAL'.

ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_type_check;

ALTER TABLE public.assets 
ADD CONSTRAINT assets_type_check 
CHECK (type IN ('CASH', 'GOLD', 'INVESTMENT', 'PHYSICAL'));

