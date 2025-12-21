import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
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
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Status</p>
              <p className="text-2xl font-semibold" style={{ color: health.apiStatus === 'Operational' ? '#32F08C' : '#FF4444' }}>
                {health.apiStatus}
              </p>
            </div>
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${health.apiStatus === 'Operational' ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${health.apiStatus === 'Operational' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Database</p>
              <p className="text-2xl font-semibold" style={{ color: health.dbStatus === 'Healthy' ? '#32F08C' : '#FF4444' }}>
                {health.dbStatus}
              </p>
            </div>
            <div className={`h-3 w-3 rounded-full ${health.dbStatus === 'Healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-2xl font-semibold" style={{ color: '#0A2540' }}>
                {health.uptime}%
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response</p>
              <p className="text-2xl font-semibold" style={{ color: '#0A2540' }}>
                {health.latency}ms
              </p>
            </div>
            <Activity className="h-5 w-5" style={{ color: '#445DFF' }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
