'use client';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { DashboardMetrics } from '@/lib/services/dashboard-service';

const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });

export function RegistrationChart({ data }: { data: DashboardMetrics }) {
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
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
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
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}