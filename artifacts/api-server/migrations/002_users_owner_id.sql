-- Migration: 002_users_owner_id
-- Adds two columns to the `users` table so every user registered via a
-- Public API Key can be traced back to the owning account and the exact key used.
--
-- Run this in your Supabase SQL Editor AFTER migration 001_user_api_keys.sql.

-- 1. Link to the account owner (user_id from user_api_keys)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS owner_id TEXT DEFAULT NULL;

-- 2. Track which API key was used at registration time
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS registered_via_key_id UUID
    REFERENCES public.user_api_keys(id) ON DELETE SET NULL
    DEFAULT NULL;

-- 3. Index for fast owner-based queries (e.g. "all users under owner X")
CREATE INDEX IF NOT EXISTS users_owner_id_idx ON public.users (owner_id);

-- Done!
SELECT 'Migration 002_users_owner_id completed successfully.' AS result;
