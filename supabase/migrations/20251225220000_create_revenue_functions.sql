-- ==========================================
-- Phase 2.5: Revenue & Monetization Tracking
-- ==========================================

-- Note: Adjust table/column names based on your actual payment schema

-- Table: Subscriptions (if not exists)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL, -- 'free', 'basic', 'pro', 'enterprise'
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'trialing'
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT NOT NULL, -- 'monthly', 'yearly'
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Payments/Transactions
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL, -- 'succeeded', 'failed', 'pending', 'refunded'
  payment_method TEXT, -- 'card', 'bank_transfer', 'paypal', etc
  provider TEXT, -- 'stripe', 'paystack', 'flutterwave'
  provider_transaction_id TEXT,
  failure_reason TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_start_date ON subscriptions(start_date);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin policies
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Grant permissions
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.payments TO authenticated;

-- Function 1: Get Revenue Overview
CREATE OR REPLACE FUNCTION get_revenue_overview(time_period text DEFAULT '30d')
RETURNS TABLE (
  total_revenue numeric,
  mrr numeric,
  arr numeric,
  total_payments bigint,
  successful_payments bigint,
  failed_payments bigint,
  success_rate numeric,
  avg_transaction_value numeric
) AS $$
DECLARE
  days_back integer;
BEGIN
  days_back := CASE time_period
    WHEN '7d' THEN 7
    WHEN '30d' THEN 30
    WHEN '90d' THEN 90
    WHEN '1y' THEN 365
    ELSE 30
  END;

  RETURN QUERY
  WITH payment_stats AS (
    SELECT 
      SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as total,
      COUNT(*) as total_count,
      COUNT(*) FILTER (WHERE status = 'succeeded') as success_count,
      COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
      AVG(CASE WHEN status = 'succeeded' THEN amount ELSE NULL END) as avg_amount
    FROM payments
    WHERE created_at >= NOW() - (days_back || ' days')::interval
  ),
  subscription_stats AS (
    SELECT 
      SUM(CASE 
        WHEN billing_cycle = 'monthly' THEN amount 
        WHEN billing_cycle = 'yearly' THEN amount / 12
        ELSE 0 
      END) as monthly_recurring
    FROM subscriptions
    WHERE status = 'active'
  )
  SELECT 
    COALESCE(ps.total, 0) as total_revenue,
    COALESCE(ss.monthly_recurring, 0) as mrr,
    COALESCE(ss.monthly_recurring * 12, 0) as arr,
    COALESCE(ps.total_count, 0) as total_payments,
    COALESCE(ps.success_count, 0) as successful_payments,
    COALESCE(ps.failed_count, 0) as failed_payments,
    CASE 
      WHEN ps.total_count > 0 
      THEN ROUND((ps.success_count::numeric / ps.total_count::numeric) * 100, 2)
      ELSE 0
    END as success_rate,
    COALESCE(ps.avg_amount, 0) as avg_transaction_value
  FROM payment_stats ps
  CROSS JOIN subscription_stats ss;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Get Revenue Trends
CREATE OR REPLACE FUNCTION get_revenue_trends(time_period text DEFAULT '30d')
RETURNS TABLE (
  period_date date,
  revenue numeric,
  payment_count bigint,
  avg_transaction numeric
) AS $$
DECLARE
  days_back integer;
BEGIN
  days_back := CASE time_period
    WHEN '7d' THEN 7
    WHEN '30d' THEN 30
    WHEN '90d' THEN 90
    WHEN '1y' THEN 365
    ELSE 30
  END;

  RETURN QUERY
  SELECT 
    DATE(created_at) as period_date,
    SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as revenue,
    COUNT(*) FILTER (WHERE status = 'succeeded') as payment_count,
    AVG(CASE WHEN status = 'succeeded' THEN amount ELSE NULL END) as avg_transaction
  FROM payments
  WHERE created_at >= NOW() - (days_back || ' days')::interval
  GROUP BY DATE(created_at)
  ORDER BY period_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Get Subscription Metrics
CREATE OR REPLACE FUNCTION get_subscription_metrics()
RETURNS TABLE (
  total_subscriptions bigint,
  active_subscriptions bigint,
  canceled_subscriptions bigint,
  trialing_subscriptions bigint,
  churn_rate numeric,
  new_this_month bigint,
  canceled_this_month bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH subscription_counts AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'active') as active,
      COUNT(*) FILTER (WHERE status = 'canceled') as canceled,
      COUNT(*) FILTER (WHERE status = 'trialing') as trialing,
      COUNT(*) FILTER (WHERE start_date >= DATE_TRUNC('month', NOW())) as new_month,
      COUNT(*) FILTER (WHERE canceled_at >= DATE_TRUNC('month', NOW())) as canceled_month,
      COUNT(*) FILTER (WHERE start_date >= DATE_TRUNC('month', NOW() - INTERVAL '1 month') 
                       AND start_date < DATE_TRUNC('month', NOW())) as prev_month_active
    FROM subscriptions
  )
  SELECT 
    sc.total,
    sc.active,
    sc.canceled,
    sc.trialing,
    CASE 
      WHEN sc.prev_month_active > 0 
      THEN ROUND((sc.canceled_month::numeric / sc.prev_month_active::numeric) * 100, 2)
      ELSE 0
    END as churn_rate,
    sc.new_month,
    sc.canceled_month
  FROM subscription_counts sc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Get Revenue by Plan
CREATE OR REPLACE FUNCTION get_revenue_by_plan()
RETURNS TABLE (
  plan_id text,
  subscription_count bigint,
  total_revenue numeric,
  mrr numeric,
  percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH plan_revenue AS (
    SELECT 
      s.plan_id,
      COUNT(*) as sub_count,
      SUM(p.amount) FILTER (WHERE p.status = 'succeeded') as total_rev,
      SUM(CASE 
        WHEN s.billing_cycle = 'monthly' THEN s.amount
        WHEN s.billing_cycle = 'yearly' THEN s.amount / 12
        ELSE 0
      END) as monthly_rev
    FROM subscriptions s
    LEFT JOIN payments p ON p.subscription_id = s.id
    WHERE s.status = 'active'
    GROUP BY s.plan_id
  ),
  total_mrr AS (
    SELECT SUM(monthly_rev) as total FROM plan_revenue
  )
  SELECT 
    pr.plan_id,
    pr.sub_count as subscription_count,
    COALESCE(pr.total_rev, 0) as total_revenue,
    COALESCE(pr.monthly_rev, 0) as mrr,
    CASE 
      WHEN tm.total > 0 
      THEN ROUND((pr.monthly_rev / tm.total) * 100, 2)
      ELSE 0
    END as percentage
  FROM plan_revenue pr
  CROSS JOIN total_mrr tm
  ORDER BY pr.monthly_rev DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 5: Get Payment Method Distribution
CREATE OR REPLACE FUNCTION get_payment_methods()
RETURNS TABLE (
  payment_method text,
  payment_count bigint,
  total_amount numeric,
  success_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.payment_method, 'Unknown') as payment_method,
    COUNT(*) as payment_count,
    SUM(CASE WHEN p.status = 'succeeded' THEN p.amount ELSE 0 END) as total_amount,
    ROUND((COUNT(*) FILTER (WHERE p.status = 'succeeded')::numeric / COUNT(*)::numeric) * 100, 2) as success_rate
  FROM payments p
  WHERE p.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY p.payment_method
  ORDER BY payment_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 6: Get Customer Lifetime Value
CREATE OR REPLACE FUNCTION get_customer_ltv()
RETURNS TABLE (
  avg_ltv numeric,
  avg_subscription_length_days numeric,
  avg_revenue_per_customer numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH customer_stats AS (
    SELECT 
      s.user_id,
      SUM(p.amount) FILTER (WHERE p.status = 'succeeded') as total_spent,
      AVG(EXTRACT(DAY FROM (COALESCE(s.end_date, NOW()) - s.start_date))) as sub_length
    FROM subscriptions s
    LEFT JOIN payments p ON p.subscription_id = s.id
    GROUP BY s.user_id
  )
  SELECT 
    ROUND(AVG(cs.total_spent), 2) as avg_ltv,
    ROUND(AVG(cs.sub_length), 1) as avg_subscription_length_days,
    ROUND(AVG(cs.total_spent), 2) as avg_revenue_per_customer
  FROM customer_stats cs
  WHERE cs.total_spent > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_revenue_overview(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_trends(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_by_plan() TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_methods() TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_ltv() TO authenticated;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Revenue & Monetization schema created successfully!';
  RAISE NOTICE 'Created 2 tables and 6 functions';
END $$;
