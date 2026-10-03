'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { DashboardMetrics } from '@/lib/services/dashboard-service';

export function RegistrationChart({ data }: { data: DashboardMetrics }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = [
    { name: 'Accepted', value: data.accepted, fill: '#168F82' },
    { name: 'Waitlisted', value: data.waitlisted, fill: '#C58B2A' },
    { name: 'Conflicts', value: data.conflicts, fill: '#E76F51' },
    { name: 'Cancelled', value: data.cancellations, fill: '#64727A' },
  ];

  const total = data.totalRequests;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-xs text-muted">No registration data yet.</p>
        ) : !mounted ? (
          <div className="h-48 w-full bg-border/20 animate-pulse" />
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64727A', fontFamily: 'Manrope' }}
                  axisLine={{ stroke: '#D8DFDC' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64727A', fontFamily: 'IBM Plex Mono' }}
                  axisLine={{ stroke: '#D8DFDC' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#D8DFDC', opacity: 0.3 }}
                  contentStyle={{
                    background: '#FAF9F5',
                    border: '1px solid #D8DFDC',
                    fontSize: '12px',
                    fontFamily: 'IBM Plex Mono',
                  }}
                />
                <Bar dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}