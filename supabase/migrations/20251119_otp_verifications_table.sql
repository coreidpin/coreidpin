-- Create OTP verifications table for Termii SMS integration
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  reg_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone ON public.otp_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_token ON public.otp_verifications(reg_token);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires ON public.otp_verifications(expires_at);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access only
CREATE POLICY "Service role can manage OTP verifications" ON public.otp_verifications
  FOR ALL USING (auth.role() = 'service_role');

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_otp_verifications_updated_at 
  BEFORE UPDATE ON public.otp_verifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();