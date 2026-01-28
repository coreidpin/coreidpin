import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { revenueService } from '../services/revenue.service';
import type { 
  RevenueOverview,
  RevenueTrend,
  SubscriptionMetrics,
  PlanRevenue,
  PaymentMethod,
  CustomerLTV,
  TimePeriod
} from '../services/revenue.service';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];


export function RevenueMonetization() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<RevenueOverview | null>(null);
  const [trends, setTrends] = useState<RevenueTrend[]>([]);
  const [subscriptionMetrics, setSubscriptionMetrics] = useState<SubscriptionMetrics | null>(null);
  const [planRevenue, setPlanRevenue] = useState<PlanRevenue[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [customerLTV, setCustomerLTV] = useState<CustomerLTV | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');

  useEffect(() => {
    loadData();
  }, [timePeriod]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [
        overviewData,
        trendsData,
        subMetrics,
        planData,
        paymentData,
        ltvData
      ] = await Promise.all([
        revenueService.getRevenueOverview(timePeriod),
        revenueService.getRevenueTrends(timePeriod),
        revenueService.getSubscriptionMetrics(),
        revenueService.getRevenueByPlan(),
        revenueService.getPaymentMethods(),
        revenueService.getCustomerLTV()
      ]);

      setOverview(overviewData);
      setTrends(trendsData);
      setSubscriptionMetrics(subMetrics);
      setPlanRevenue(planData);
      setPaymentMethods(paymentData);
      setCustomerLTV(ltvData);
    } catch (error) {
      console.error('Failed to load revenue data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load revenue data');
    } finally {
      setIsLoading(false);
    }
  };

  const healthScore = overview && subscriptionMetrics
    ? revenueService.calculateHealthScore(overview, subscriptionMetrics)
    : 0;

  const insights = overview && subscriptionMetrics
    ? revenueService.getRevenueInsights(overview, subscriptionMetrics)
    : [];

  const periodOptions: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error Loading Revenue Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => loadData()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading revenue data...</div>
        </div>
      </div>
    );
  }

  if (!overview || !subscriptionMetrics) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Monetization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 flex flex-col items-center justify-center text-gray-500">
              <DollarSign className="h-16 w-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Revenue Data Available</h3>
              <p className="text-sm">Revenue metrics will appear once you have transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revenue & Monetization</h1>
            <p className="text-gray-600 mt-1">Track revenue, subscriptions, and payment analytics</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg shadow-sm">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimePeriod(option.value)}
              className={`
                relative px-4 py-2 text-sm font-medium rounded-md 
                transition-all duration-300 ease-out
                ${
                  timePeriod === option.value
                    ? 'text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95'
                }
              `}
              style={{
                background: timePeriod === option.value
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'transparent'
              }}
            >
              {timePeriod === option.value && (
                <span 
                  className="absolute inset-0 rounded-md bg-gradient-to-r from-green-400 to-emerald-400 opacity-20 blur-sm"
                  style={{ zIndex: -1 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <DollarSign className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Total Revenue</p>
            </div>
            <p className="text-4xl font-bold mb-1">
              {revenueService.formatCurrency(overview.total_revenue)}
            </p>
            <p className="text-xs opacity-75">{timePeriod} period</p>
          </div>
        </div>

        {/* MRR */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <TrendingUp className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">MRR</p>
            </div>
            <p className="text-4xl font-bold mb-1">
              {revenueService.formatCurrency(overview.mrr)}
            </p>
            <p className="text-xs opacity-75">Monthly Recurring Revenue</p>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <Users className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Active Subscribers</p>
            </div>
            <p className="text-4xl font-bold mb-1">
              {subscriptionMetrics.active_subscriptions.toLocaleString()}
            </p>
            <p className="text-xs opacity-75">
              +{subscriptionMetrics.new_this_month} this month
            </p>
          </div>
        </div>

        {/* Health Score */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <CheckCircle className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Revenue Health</p>
            </div>
            <p className="text-4xl font-bold mb-1">{healthScore}</p>
            <p className="text-xs opacity-75">
              {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Attention'}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="period_date" 
                  stroke="#6b7280"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => revenueService.formatCurrency(value)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No revenue trend data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {planRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planRevenue}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${revenueService.getPlanDisplayName(entry.plan_id)} (${entry.percentage}%)`}
                    outerRadius={100}
                    dataKey="mrr"
                  >
                    {planRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => revenueService.formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No plan data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethods.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentMethods}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="payment_method" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="payment_count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No payment method data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription & Payment Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscription Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Subscription Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {subscriptionMetrics.total_subscriptions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <span className="text-lg font-semibold text-green-600">
                  {subscriptionMetrics.active_subscriptions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trialing</span>
                <span className="text-lg font-semibold text-blue-600">
                  {subscriptionMetrics.trialing_subscriptions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Canceled</span>
                <span className="text-lg font-semibold text-red-600">
                  {subscriptionMetrics.canceled_subscriptions}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Churn Rate</span>
                  <span className={`text-lg font-bold ${
                    subscriptionMetrics.churn_rate > 5 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {subscriptionMetrics.churn_rate ? subscriptionMetrics.churn_rate.toFixed(1) : '0.0'}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className={`text-2xl font-bold ${
                  overview.success_rate >= 95 ? 'text-green-600' : 
                  overview.success_rate >= 90 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {overview.success_rate ? overview.success_rate.toFixed(1) : '0.0'}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Successful</span>
                <span className="text-lg font-semibold text-green-600">
                  {overview.successful_payments.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Failed</span>
                <span className="text-lg font-semibold text-red-600">
                  {overview.failed_payments.toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Transaction</span>
                  <span className="text-lg font-bold text-gray-900">
                    {revenueService.formatCurrency(overview.avg_transaction_value)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer LTV */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Customer Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customerLTV ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lifetime Value</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {revenueService.formatCurrency(customerLTV.avg_ltv)}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm text-gray-600">Avg Subscription</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {customerLTV.avg_subscription_length_days ? customerLTV.avg_subscription_length_days.toFixed(0) : '0'} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenue/Customer</span>
                  <span className="text-lg font-semibold text-green-600">
                    {revenueService.formatCurrency(customerLTV.avg_revenue_per_customer)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-500">
                <p className="text-sm">No LTV data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Details */}
      {planRevenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Plan</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Subscribers</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">MRR</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Total Revenue</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">% of MRR</th>
                  </tr>
                </thead>
                <tbody>
                  {planRevenue.map((plan, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium text-gray-900">
                            {revenueService.getPlanDisplayName(plan.plan_id)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right text-gray-900">
                        {plan.subscription_count.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-semibold text-green-600">
                        {revenueService.formatCurrency(plan.mrr)}
                      </td>
                      <td className="p-3 text-right text-gray-900">
                        {revenueService.formatCurrency(plan.total_revenue)}
                      </td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {plan.percentage ? plan.percentage.toFixed(1) : '0.0'}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Section */}
      {insights.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="h-5 w-5" />
              Revenue Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                  <div className="p-2 bg-green-500 rounded-lg text-white mt-0.5">
                    {insight.includes('⚠️') ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : insight.includes('📈') ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

// Default export for lazy loading
export default RevenueMonetization;
