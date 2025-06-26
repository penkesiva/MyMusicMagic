-- Add phone and location fields to user_portfolios for Contact section
ALTER TABLE public.user_portfolios
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_location TEXT; 