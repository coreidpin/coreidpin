-- Create Webhooks Table
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- Array of event names e.g. ['pin.verified']
    secret TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    failure_rate FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_triggered_at TIMESTAMPTZ
);

-- RLS for Webhooks
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can manage own webhooks"
    ON public.webhooks
    USING (business_id IN (
        SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
    ))
    WITH CHECK (business_id IN (
        SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
    ));

-- Function to increment API usage
CREATE OR REPLACE FUNCTION public.increment_api_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.business_profiles
    SET current_month_usage = COALESCE(current_month_usage, 0) + 1
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
