-- Migration: 001_user_api_keys
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- or paste it into the Supabase Table Editor migration interface.

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL,
  app_name    TEXT        NOT NULL,
  public_key  TEXT        UNIQUE NOT NULL,
  app_secret  TEXT        NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index for fast lookups by user
CREATE INDEX IF NOT EXISTS user_api_keys_user_id_idx ON public.user_api_keys (user_id);

-- 3. Enable Row Level Security
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (for Supabase Auth users)
--    Service role bypasses all RLS — admin always sees everything.

-- Users can SELECT their own keys
CREATE POLICY IF NOT EXISTS "users_select_own_keys"
  ON public.user_api_keys
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can INSERT only their own keys
CREATE POLICY IF NOT EXISTS "users_insert_own_keys"
  ON public.user_api_keys
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can UPDATE only their own keys
CREATE POLICY IF NOT EXISTS "users_update_own_keys"
  ON public.user_api_keys
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Users can DELETE only their own keys
CREATE POLICY IF NOT EXISTS "users_delete_own_keys"
  ON public.user_api_keys
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Done!
SELECT 'Migration 001_user_api_keys completed successfully.' AS result;
