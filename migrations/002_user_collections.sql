-- Migration: add named favorites collections to user_data
-- Run once against the PostgreSQL database (local emulator and production).

ALTER TABLE public.user_data
ADD COLUMN IF NOT EXISTS collections jsonb
NOT NULL DEFAULT '{"active":"main","items":{}}';
