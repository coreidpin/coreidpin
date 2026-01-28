import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Globe, MapPin, Users, TrendingUp, Building, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { geographicService, CountryData, DemographicData, GeographicGrowth } from '../services/geographic.service';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function GeographicInsights() {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [demographics, setDemographics] = useState<DemographicData[]>([]);
  const [growth, setGrowth] = useState<GeographicGrowth[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [growthPeriod, setGrowthPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadData();
  }, [growthPeriod]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [countriesData, demographicsData, growthData, summaryData] = await Promise.all([
        geographicService.getUsersByCountry(),
        geographicService.getDemographicBreakdown(),
        geographicService.getGeographicGrowth(growthPeriod),
        geographicService.getGeographicSummary()
      ]);

      setCountries(countriesData);
      setDemographics(demographicsData);
      setGrowth(growthData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load geographic data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const topCountries = countries.slice(0, 10);
  const diversityScore = geographicService.calculateDiversityScore(countries);
  const insights = geographicService.getGeographicInsights(countries, growth);
  const groupedDemographics = geographicService.groupDemographicsByMetric(demographics);

  const growthPeriodOptions = [
    { value: '7d' as const, label: 'Last 7 Days' },
    { value: '30d' as const, label: 'Last 30 Days' },
    { value: '90d' as const, label: 'Last 90 Days' }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading geographic data...</div>
        </div>
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Geographic & Demographic Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 flex flex-col items-center justify-center text-gray-500">
              <Globe className="h-16 w-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Geographic Data Available</h3>
              <p className="text-sm">User location data will appear here once available</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Geographic & Demographic Insights</h1>
            <p className="text-gray-600 mt-1">User distribution and demographics analysis</p>
          </div>
        </div>

        {/* Growth Period Selector */}
        <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg shadow-sm">
          {growthPeriodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setGrowthPeriod(option.value)}
              className={`
                relative px-4 py-2 text-sm font-medium rounded-md 
                transition-all duration-300 ease-out
                ${
                  growthPeriod === option.value
                    ? 'text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95'
                }
              `}
              style={{
                background: growthPeriod === option.value
                  ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
                  : 'transparent'
              }}
            >
              {growthPeriod === option.value && (
                <span 
                  className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 blur-sm"
                  style={{ zIndex: -1 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <Globe className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Countries</p>
            </div>
            <p className="text-4xl font-bold mb-1">{summary?.total_countries || 0}</p>
            <p className="text-xs opacity-75">Geographic reach</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <MapPin className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Top Country</p>
            </div>
            <p className="text-2xl font-bold mb-1">{summary?.top_country || 'N/A'}</p>
            <p className="text-xs opacity-75">{summary?.top_country_users?.toLocaleString() || 0} users ({summary?.top_country_percentage || 0}%)</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <TrendingUp className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Diversity Score</p>
            </div>
            <p className="text-4xl font-bold mb-1">{diversityScore}</p>
            <p className="text-xs opacity-75">Geographic diversity (0-100)</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <Users className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Fastest Growth</p>
            </div>
            <p className="text-2xl font-bold mb-1">{growth[0]?.country || 'N/A'}</p>
            <p className="text-xs opacity-75">+{growth[0]?.growth_rate || 0}% growth</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Countries by Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topCountries} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis 
                  type="category" 
                  dataKey="country" 
                  stroke="#6b7280"
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="user_count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupedDemographics['User Type'] ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={groupedDemographics['User Type']}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.metric_value} (${entry.percentage}%)`}
                    outerRadius={100}
                    dataKey="user_count"
                  >
                    {groupedDemographics['User Type'].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No demographic data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth & Demographics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic Growth Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth by Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Country</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">New Users</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Growth Rate</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {growth.slice(0, 10).map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-sm font-medium text-gray-900">{item.country}</td>
                      <td className="p-3 text-sm text-right font-semibold text-blue-600">
                        +{item.new_users.toLocaleString()}
                      </td>
                      <td className="p-3 text-sm text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          item.growth_rate > 20 ? 'bg-green-100 text-green-800' :
                          item.growth_rate > 10 ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.growth_rate > 0 ? '+' : ''}{item.growth_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-sm text-right text-gray-600">
                        {item.total_users.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupedDemographics['Verification Status'] ? (
              <div className="space-y-3">
                {groupedDemographics['Verification Status'].map((item, index) => {
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.metric_value}</span>
                        <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.user_count.toLocaleString()} users</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-500">
                No verification data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Country Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topCountries.slice(0, 3).map((country, index) => (
          <Card key={index} className="border-l-4" style={{ borderLeftColor: COLORS[index] }}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{country.country}</h3>
                  <p className="text-sm text-gray-600">#{index + 1} by users</p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS[index] + '20' }}>
                  <Globe className="h-5 w-5" style={{ color: COLORS[index] }} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Users</span>
                  <span className="font-semibold text-gray-900">{country.user_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Market Share</span>
                  <span className="font-semibold" style={{ color: COLORS[index] }}>{country.percentage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Verified
                  </span>
                  <span className="font-medium text-green-600">{country.verified_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    Business
                  </span>
                  <span className="font-medium text-blue-600">{country.business_count.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights Section */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CheckCircle className="h-5 w-5" />
            Geographic Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="p-2 bg-blue-500 rounded-lg text-white mt-0.5">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <p className="text-sm text-gray-700 flex-1">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion Distribution */}
      {groupedDemographics['Profile Completion'] && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Profile Completion Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={groupedDemographics['Profile Completion']}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="metric_value" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="user_count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
