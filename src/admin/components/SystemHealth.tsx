import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

export function SystemHealth() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Status</p>
              <p className="text-2xl font-semibold" style={{ color: '#32F08C' }}>
                Operational
              </p>
            </div>
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Database</p>
              <p className="text-2xl font-semibold" style={{ color: '#32F08C' }}>
                Healthy
              </p>
            </div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-2xl font-semibold" style={{ color: '#0A2540' }}>
                99.98%
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
                124ms
              </p>
            </div>
            <Activity className="h-5 w-5" style={{ color: '#445DFF' }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
