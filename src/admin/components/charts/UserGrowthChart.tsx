import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

const data = [
  { name: 'Jan', users: 4000, professionals: 2400 },
  { name: 'Feb', users: 5500, professionals: 3200 },
  { name: 'Mar', users: 7000, professionals: 4100 },
  { name: 'Apr', users: 9000, professionals: 5600 },
  { name: 'May', users: 11000, professionals: 7200 },
  { name: 'Jun', users: 12847, professionals: 8452 },
];

export function UserGrowthChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#445DFF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#445DFF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPros" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#32F08C" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#32F08C" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }}
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                name="Total Users"
                stroke="#445DFF" 
                fillOpacity={1} 
                fill="url(#colorUsers)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="professionals" 
                name="Professionals"
                stroke="#32F08C" 
                fillOpacity={1} 
                fill="url(#colorPros)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
