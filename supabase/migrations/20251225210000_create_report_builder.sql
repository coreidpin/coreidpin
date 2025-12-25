-- ==========================================
-- Phase 2.3: Report Builder - Database Schema
-- ==========================================

-- Table: Report Templates
CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL, -- 'engagement', 'performance', 'geographic', 'custom'
  data_sources JSONB NOT NULL, -- Array of data sources/functions to query
  filters JSONB, -- Report filters configuration
  columns JSONB, -- Columns to include
  visualizations JSONB, -- Chart configurations
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Scheduled Reports
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  schedule_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  schedule_config JSONB NOT NULL, -- Cron-like configuration
  recipients JSONB NOT NULL, -- Array of email addresses
  export_format TEXT NOT NULL, -- 'pdf', 'csv', 'xlsx', 'json'
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Report History
CREATE TABLE IF NOT EXISTS public.report_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  scheduled_report_id UUID REFERENCES scheduled_reports(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_url TEXT, -- Storage URL for generated report
  file_size INTEGER, -- File size in bytes
  export_format TEXT NOT NULL,
  parameters JSONB, -- Parameters used for generation
  status TEXT DEFAULT 'pending', -- 'pending', 'generating', 'completed', 'failed'
  error_message TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Auto-delete old reports
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(report_type);
CREATE INDEX IF NOT EXISTS idx_report_templates_created_by ON report_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON scheduled_reports(next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_report_history_generated_at ON report_history(generated_at);
CREATE INDEX IF NOT EXISTS idx_report_history_template ON report_history(template_id);

-- Enable RLS
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view all report templates"
  ON public.report_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create report templates"
  ON public.report_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own report templates"
  ON public.report_templates FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete own report templates"
  ON public.report_templates FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Scheduled reports policies
CREATE POLICY "Users can view all scheduled reports"
  ON public.scheduled_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create scheduled reports"
  ON public.scheduled_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own scheduled reports"
  ON public.scheduled_reports FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete own scheduled reports"
  ON public.scheduled_reports FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Report history policies
CREATE POLICY "Users can view all report history"
  ON public.report_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage report history"
  ON public.report_history
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.report_templates TO authenticated;
GRANT ALL ON public.scheduled_reports TO authenticated;
GRANT SELECT ON public.report_history TO authenticated;
GRANT ALL ON public.report_history TO service_role;

-- Function: Get Report Templates
CREATE OR REPLACE FUNCTION get_report_templates(filter_type text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  report_type text,
  data_sources jsonb,
  filters jsonb,
  columns jsonb,
  visualizations jsonb,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rt.id,
    rt.name,
    rt.description,
    rt.report_type,
    rt.data_sources,
    rt.filters,
    rt.columns,
    rt.visualizations,
    rt.is_active,
    rt.created_at,
    rt.updated_at
  FROM report_templates rt
  WHERE (filter_type IS NULL OR rt.report_type = filter_type)
    AND rt.is_active = true
  ORDER BY rt.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Scheduled Reports
CREATE OR REPLACE FUNCTION get_scheduled_reports()
RETURNS TABLE (
  id uuid,
  template_id uuid,
  template_name text,
  name text,
  schedule_type text,
  schedule_config jsonb,
  recipients jsonb,
  export_format text,
  last_run_at timestamptz,
  next_run_at timestamptz,
  is_active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sr.id,
    sr.template_id,
    rt.name as template_name,
    sr.name,
    sr.schedule_type,
    sr.schedule_config,
    sr.recipients,
    sr.export_format,
    sr.last_run_at,
    sr.next_run_at,
    sr.is_active
  FROM scheduled_reports sr
  LEFT JOIN report_templates rt ON sr.template_id = rt.id
  ORDER BY sr.next_run_at ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Report History
CREATE OR REPLACE FUNCTION get_report_history(
  limit_count integer DEFAULT 50,
  template_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  template_id uuid,
  template_name text,
  name text,
  report_type text,
  export_format text,
  file_url text,
  file_size integer,
  status text,
  generated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rh.id,
    rh.template_id,
    rt.name as template_name,
    rh.name,
    rh.report_type,
    rh.export_format,
    rh.file_url,
    rh.file_size,
    rh.status,
    rh.generated_at
  FROM report_history rh
  LEFT JOIN report_templates rt ON rh.template_id = rt.id
  WHERE (template_filter IS NULL OR rh.template_id = template_filter)
    AND rh.status = 'completed'
  ORDER BY rh.generated_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create Report from Template
CREATE OR REPLACE FUNCTION create_report_from_template(
  p_template_id uuid,
  p_parameters jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  v_template report_templates;
  v_report_id uuid;
BEGIN
  -- Get template
  SELECT * INTO v_template
  FROM report_templates
  WHERE id = p_template_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;

  -- Create report history entry
  INSERT INTO report_history (
    template_id,
    name,
    report_type,
    generated_by,
    export_format,
    parameters,
    status
  ) VALUES (
    p_template_id,
    v_template.name || ' - ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI'),
    v_template.report_type,
    auth.uid(),
    'pdf', -- Default format
    p_parameters,
    'pending'
  ) RETURNING id INTO v_report_id;

  RETURN v_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_report_templates(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_scheduled_reports() TO authenticated;
GRANT EXECUTE ON FUNCTION get_report_history(integer, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION create_report_from_template(uuid, jsonb) TO authenticated;

-- Insert default report templates
INSERT INTO report_templates (name, description, report_type, data_sources, columns) VALUES
('User Engagement Summary', 'Overview of user engagement metrics including DAU/WAU/MAU', 'engagement', 
 '["get_active_users", "get_retention_cohorts", "get_feature_usage"]'::jsonb,
 '["date", "active_users", "retention_rate", "feature_usage"]'::jsonb),

('Performance Overview', 'System performance and API metrics', 'performance',
 '["get_api_performance_summary", "get_endpoint_performance", "get_database_performance"]'::jsonb,
 '["endpoint", "response_time", "error_rate", "requests"]'::jsonb),

('Geographic Distribution', 'User distribution by country and demographics', 'geographic',
 '["get_users_by_country", "get_demographic_breakdown", "get_geographic_growth"]'::jsonb,
 '["country", "user_count", "percentage", "growth_rate"]'::jsonb);

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Report Builder database schema created successfully!';
  RAISE NOTICE 'Created 3 tables and 4 functions';
  RAISE NOTICE 'Inserted 3 default report templates';
END $$;
