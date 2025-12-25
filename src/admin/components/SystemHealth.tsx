import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { dashboardService, SystemHealthData } from '../services/dashboard.service';

export function SystemHealth() {
  const [health, setHealth] = useState<SystemHealthData>({
    apiStatus: 'Operational',
    dbStatus: 'Healthy',
    latency: 0,
    uptime: 99.98
  });

  useEffect(() => {
    async function checkHealth() {
      const data = await dashboardService.getSystemHealth();
      setHealth(data);
    }
    
    // Check initially
    checkHealth();

    // Poll every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Real-time system status</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-2">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600">API Status</p>
              <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${health.apiStatus === 'Operational' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${health.apiStatus === 'Operational' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
            </div>
            <p className="text-xl font-bold" style={{ color: health.apiStatus === 'Operational' ? '#10b981' : '#ef4444' }}>
              {health.apiStatus}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600">Database</p>
              <div className={`h-2 w-2 rounded-full ${health.dbStatus === 'Healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <p className="text-xl font-bold" style={{ color: health.dbStatus === 'Healthy' ? '#10b981' : '#ef4444' }}>
              {health.dbStatus}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600">Uptime</p>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl font-bold text-gray-900">
              {health.uptime}%
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600">Avg Response</p>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-gray-900">
              {health.latency}ms
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
