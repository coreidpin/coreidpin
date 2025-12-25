import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { engagementService, RetentionCohort } from '../../services/engagement.service';

export function RetentionCohortTable() {
  const [data, setData] = useState<RetentionCohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const cohortData = await engagementService.getRetentionCohorts();
      setData(cohortData);
    } catch (error) {
      console.error('Failed to load retention cohorts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCellColor = (value: number): string => {
    if (value >= 80) return 'bg-green-100 text-green-800';
    if (value >= 60) return 'bg-yellow-100 text-yellow-800';
    if (value >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Retention Cohorts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading retention data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Retention Cohorts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <AlertCircle className="h-12 w-12 mb-3" />
            <p>Not enough data to show retention cohorts</p>
            <p className="text-sm mt-1">Need at least 2 months of user activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Retention Cohorts</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Month-over-month user retention analysis</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
              <span className="text-gray-600">High (≥80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
              <span className="text-gray-600">Good (60-79%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-100 border border-orange-200"></div>
              <span className="text-gray-600">Fair (40-59%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
              <span className="text-gray-600">Low (&lt;40%)</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left p-3 font-semibold text-gray-700">Cohort</th>
                <th className="text-right p-3 font-semibold text-gray-700">Size</th>
                <th className="text-center p-3 font-semibold text-gray-700">Month 0</th>
                <th className="text-center p-3 font-semibold text-gray-700">Month 1</th>
                <th className="text-center p-3 font-semibold text-gray-700">Month 2</th>
                <th className="text-center p-3 font-semibold text-gray-700">Month 3</th>
              </tr>
            </thead>
            <tbody>
              {data.map((cohort, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 font-medium text-gray-900">
                    {formatMonth(cohort.cohort_month)}
                  </td>
                  <td className="p-3 text-right font-semibold text-gray-700">
                    {cohort.cohort_size.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-md font-medium ${getCellColor(cohort.month_0)}`}>
                      {cohort.month_0.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {cohort.month_1 > 0 ? (
                      <span className={`inline-block px-3 py-1 rounded-md font-medium ${getCellColor(cohort.month_1)}`}>
                        {cohort.month_1.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {cohort.month_2 > 0 ? (
                      <span className={`inline-block px-3 py-1 rounded-md font-medium ${getCellColor(cohort.month_2)}`}>
                        {cohort.month_2.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {cohort.month_3 > 0 ? (
                      <span className={`inline-block px-3 py-1 rounded-md font-medium ${getCellColor(cohort.month_3)}`}>
                        {cohort.month_3.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Insights Section */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500 rounded-lg mt-0.5">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Retention Insights</h4>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Each row represents a cohort of users who signed up in the same month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Percentages show what portion of the cohort returned in subsequent months</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Higher retention rates (green) indicate better user engagement and product-market fit</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
