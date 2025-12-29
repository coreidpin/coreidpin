-- Create table for phone verification OTPs
CREATE TABLE IF NOT EXISTS public.phone_verification_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  attempts INT DEFAULT 0
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_phone_otp_user_id ON public.phone_verification_otps(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_otp_phone ON public.phone_verification_otps(phone_number);
CREATE INDEX IF NOT EXISTS idx_phone_otp_created ON public.phone_verification_otps(created_at DESC);

-- Enable RLS
ALTER TABLE public.phone_verification_otps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own OTPs
CREATE POLICY "Users can view own OTPs"
  ON public.phone_verification_otps FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all OTPs
CREATE POLICY "Service role can manage OTPs"
  ON public.phone_verification_otps
  USING (true)
  WITH CHECK (true);

-- Grant access
GRANT ALL ON public.phone_verification_otps TO service_role;
GRANT SELECT ON public.phone_verification_otps TO authenticated;

-- Add comment
COMMENT ON TABLE public.phone_verification_otps IS 'Stores OTP codes for phone number verification';
