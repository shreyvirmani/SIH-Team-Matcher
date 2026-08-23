-- Migration 0003: Add phone_number to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number text;
