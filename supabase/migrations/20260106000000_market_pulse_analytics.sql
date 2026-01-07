-- Comprehensive Analytics Migration for GidiPIN Market Pulse
-- Ensures all tables for PIN analytics, demand scoring, and geographic pings exist

-- 1. PIN Analytics (Tracks PIN interactions with location data)
CREATE TABLE IF NOT EXISTS pin_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pin_id UUID REFERENCES professional_pins(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'view', 'copy', 'share', 'verify'
    viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    viewer_ip TEXT,
    viewer_region TEXT,
    viewer_country TEXT,
    viewer_city TEXT,
    viewer_industry TEXT, -- e.g. 'Fintech', 'SaaS'
    viewer_company_tier TEXT, -- e.g. 'Tier 1', 'Tier 2'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pin_analytics_pin_id ON pin_analytics(pin_id);
CREATE INDEX IF NOT EXISTS idx_pin_analytics_event_type ON pin_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_pin_analytics_created_at ON pin_analytics(created_at DESC);

-- 2. Demand Metrics (Stores calculated reputation scores)
CREATE TABLE IF NOT EXISTS pin_demand_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    demand_score DECIMAL(3, 1) DEFAULT 0.0, -- 0.0 to 10.0
    percentile_rank INTEGER DEFAULT 0, -- 0 to 100
    profile_views_30d INTEGER DEFAULT 0,
    profile_views_growth DECIMAL(10, 2) DEFAULT 0.0,
    profile_saves INTEGER DEFAULT 0,
    contact_requests_30d INTEGER DEFAULT 0,
    matching_jobs_count INTEGER DEFAULT 0,
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pin_demand_metrics_user_id ON pin_demand_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_pin_demand_metrics_score ON pin_demand_metrics(demand_score DESC);

-- 3. Profile Analytics Events (Granular events for demand scoring)
CREATE TABLE IF NOT EXISTS profile_analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Identity being viewed
    event_type TEXT NOT NULL, -- 'view', 'save', 'contact_request'
    viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_analytics_user_id ON profile_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_event_type ON profile_analytics_events(event_type);

-- Enable RLS
ALTER TABLE pin_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_demand_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_analytics_events ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- pin_analytics: Owners can see their own PIN analytics
CREATE POLICY "Owners can view own PIN analytics" ON pin_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM professional_pins
            WHERE professional_pins.id = pin_analytics.pin_id
            AND professional_pins.user_id = auth.uid()
        )
    );

-- pin_demand_metrics: Owners can see their own demand metrics
CREATE POLICY "Owners can view own demand metrics" ON pin_demand_metrics
    FOR SELECT USING (auth.uid() = user_id);

-- profile_analytics_events: Owners can see their own profile events
CREATE POLICY "Owners can view own profile events" ON profile_analytics_events
    FOR SELECT USING (auth.uid() = user_id);

-- 5. Helper function for activity tracking pings
CREATE OR REPLACE FUNCTION get_recent_geographic_pings(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
    id UUID,
    region TEXT,
    industry TEXT,
    tier TEXT,
    event_timestamp TIMESTAMP WITH TIME ZONE,
    type TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pa.id,
        COALESCE(pa.viewer_city || ', ' || pa.viewer_country, pa.viewer_region, 'Unknown Location') as region,
        COALESCE(pa.viewer_industry, 'General') as industry,
        COALESCE(pa.viewer_company_tier, 'Tier 3') as tier,
        pa.created_at as event_timestamp,
        CASE 
            WHEN pa.event_type = 'verify' THEN 'Full Verification'
            ELSE 'Quick Ping'
        END as type
    FROM pin_analytics pa
    JOIN professional_pins pp ON pa.pin_id = pp.id
    WHERE pp.user_id = p_user_id
    ORDER BY pa.created_at DESC
    LIMIT p_limit;
END;
$$;

-- 6. Helper function for industry trends
CREATE OR REPLACE FUNCTION get_industry_trends(p_user_id UUID)
RETURNS TABLE (
    industry TEXT,
    count BIGINT,
    growth DECIMAL(10, 2)
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    WITH recent_stats AS (
        SELECT 
            pa.viewer_industry as ind,
            COUNT(*) as ind_count
        FROM pin_analytics pa
        JOIN professional_pins pp ON pa.pin_id = pp.id
        WHERE pp.user_id = p_user_id
        AND pa.viewer_industry IS NOT NULL
        AND pa.created_at > NOW() - INTERVAL '30 days'
        GROUP BY pa.viewer_industry
    ),
    past_stats AS (
        SELECT 
            pa.viewer_industry as ind,
            COUNT(*) as ind_count
        FROM pin_analytics pa
        JOIN professional_pins pp ON pa.pin_id = pp.id
        WHERE pp.user_id = p_user_id
        AND pa.viewer_industry IS NOT NULL
        AND pa.created_at BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
        GROUP BY pa.viewer_industry
    )
    SELECT 
        rs.ind as industry,
        rs.ind_count as count,
        COALESCE(
            CASE 
                WHEN ps.ind_count > 0 THEN ((rs.ind_count::decimal - ps.ind_count) / ps.ind_count) * 100
                ELSE 100
            END,
            100
        ) as growth
    FROM recent_stats rs
    LEFT JOIN past_stats ps ON rs.ind = ps.ind
    ORDER BY rs.ind_count DESC
    LIMIT 5;
END;
$$;
