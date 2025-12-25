import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Users, ChevronRight, TrendingDown } from 'lucide-react';
import { analyticsService, ConversionFunnelData } from '../../services/analytics.service';

const STAGE_COLORS = [
  { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200' },
  { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' },
  { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-200' },
  { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200' }
];

export function PINActivationFunnel() {
  const [data, setData] = useState<ConversionFunnelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const funnelData = await analyticsService.getPINActivationFunnel();
      setData(funnelData);
    } catch (error) {
      console.error('Failed to load PIN activation funnel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PIN Activation Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading funnel...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PIN Activation Funnel</CardTitle>
          <p className="text-sm text-gray-500 mt-1">User conversion through onboarding stages</p>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex flex-col items-center justify-center text-gray-500">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Funnel Data Available</h3>
              <p className="text-sm mb-4">Deploy analytics functions to start tracking PIN activations</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                <p className="text-sm font-semibold text-blue-900 mb-2">To see funnel data:</p>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Deploy analytics RPC functions to Supabase</li>
                  <li>2. Wait for users to complete onboarding</li>
                  <li>3. Return here to view conversion funnel</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallConversion = data.length > 0 
    ? ((data[data.length - 1].count / data[0].count) * 100).toFixed(1)
    : '0';

  const maxDropoff = data.reduce((max, stage) => 
    (stage.dropoff || 0) > max.dropoff ? { dropoff: stage.dropoff || 0, stage: stage.stage } : max,
    { dropoff: 0, stage: '' }
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>PIN Activation Funnel</CardTitle>
            <p className="text-sm text-gray-500 mt-1">User conversion through onboarding stages</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg shadow-md">
            <div className="text-xs font-medium uppercase tracking-wide opacity-90">Overall Conversion</div>
            <div className="text-3xl font-bold mt-1">{overallConversion}%</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Funnel Stages */}
          <div className="space-y-2">
            {data.map((stage, index) => {
              const colors = STAGE_COLORS[index];
              const isFirst = index === 0;
              const isLast = index === data.length - 1;
              const prevCount = index > 0 ? data[index - 1].count : stage.count;
              const dropoffCount = prevCount - stage.count;

              return (
                <div key={index} className="space-y-2">
                  {/* Stage Bar */}
                  <div className="relative">
                    {/* Background track */}
                    <div className="h-20 bg-gray-100 rounded-lg overflow-hidden">
                      {/* Conversion bar */}
                      <div 
                        className={`h-full ${colors.bg} transition-all duration-500 flex items-center px-6 relative`}
                        style={{ width: `${stage.percentage}%`, minWidth: '120px' }}
                      >
                        {/* Stage Info */}
                        <div className="flex items-center justify-between w-full text-white">
                          <div className="flex items-center gap-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg backdrop-blur-sm">
                              {isLast ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <Users className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-base">{stage.stage}</p>
                              <p className="text-xs opacity-90">{stage.count.toLocaleString()} users</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{stage.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connector Arrow */}
                    {!isLast && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                        <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
                      </div>
                    )}
                  </div>

                  {/* Dropoff Warning */}
                  {index > 0 && dropoffCount > 0 && (
                    <div className="flex items-center gap-2 ml-6 text-sm">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
                        <TrendingDown className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-amber-700 font-medium">
                          {dropoffCount.toLocaleString()} dropped ({(stage.dropoff || 0).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Insights Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Started */}
            <div className={`p-4 rounded-lg border ${STAGE_COLORS[0].light} ${STAGE_COLORS[0].border}`}>
              <div className="flex items-center gap-2 mb-2">
                <Users className={`h-4 w-4 ${STAGE_COLORS[0].text}`} />
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Started Journey</p>
              </div>
              <p className={`text-2xl font-bold ${STAGE_COLORS[0].text}`}>
                {data[0]?.count.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total signups</p>
            </div>

            {/* Completed */}
            <div className={`p-4 rounded-lg border ${STAGE_COLORS[3].light} ${STAGE_COLORS[3].border}`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className={`h-4 w-4 ${STAGE_COLORS[3].text}`} />
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Completed</p>
              </div>
              <p className={`text-2xl font-bold ${STAGE_COLORS[3].text}`}>
                {data[data.length - 1]?.count.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Activated PINs</p>
            </div>

            {/* Biggest Dropoff */}
            <div className="p-4 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Biggest Dropoff</p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {maxDropoff.dropoff.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">At "{maxDropoff.stage}"</p>
            </div>
          </div>

          {/* Key Insights */}
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500 rounded-lg mt-0.5">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">Key Insights</h4>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {data.length > 0 && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span><strong>{data[0]?.count.toLocaleString()}</strong> users started the onboarding process</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span><strong>{data[data.length - 1]?.count.toLocaleString()}</strong> users successfully completed activation ({overallConversion}% conversion rate)</span>
                      </li>
                      {maxDropoff.dropoff > 0 && (
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span>Highest drop-off occurs at <strong>"{maxDropoff.stage}"</strong> stage ({maxDropoff.dropoff.toFixed(1)}%)</span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>Focus on improving the {maxDropoff.stage.toLowerCase()} process to increase conversions</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
