import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

const data = [
  { name: 'Mon', signups: 45, verifications: 38, endorsements: 12 },
  { name: 'Tue', signups: 52, verifications: 45, endorsements: 15 },
  { name: 'Wed', signups: 48, verifications: 42, endorsements: 18 },
  { name: 'Thu', signups: 61, verifications: 55, endorsements: 22 },
  { name: 'Fri', signups: 55, verifications: 48, endorsements: 25 },
  { name: 'Sat', signups: 38, verifications: 30, endorsements: 10 },
  { name: 'Sun', signups: 42, verifications: 35, endorsements: 8 },
];

export function ActivityChart() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
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
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="signups" name="Signups" fill="#445DFF" radius={[4, 4, 0, 0]} barSize={8} />
              <Bar dataKey="verifications" name="Verifications" fill="#32F08C" radius={[4, 4, 0, 0]} barSize={8} />
              <Bar dataKey="endorsements" name="Endorsements" fill="#0A2540" radius={[4, 4, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
