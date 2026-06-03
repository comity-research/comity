'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';

const COLORS = ['#7C3AED', '#60B5FF', '#FF9149', '#80D8C3', '#FF6363'];

interface LatencyChartProps {
  latencies: number[];
}

export function LatencyChart({ latencies }: LatencyChartProps) {
  const safe = latencies ?? [];
  if (safe.length === 0) return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No latency data</div>;

  // Create histogram buckets
  const buckets = [
    { range: '<1h', min: 0, max: 1 },
    { range: '1-6h', min: 1, max: 6 },
    { range: '6-24h', min: 6, max: 24 },
    { range: '1-3d', min: 24, max: 72 },
    { range: '3-7d', min: 72, max: 168 },
    { range: '>7d', min: 168, max: Infinity },
  ];

  const data = buckets.map((b: any) => ({
    range: b.range,
    count: safe.filter((l: number) => l >= b.min && l < b.max).length,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 25, left: 10 }}>
        <XAxis
          dataKey="range"
          tickLine={false}
          tick={{ fontSize: 10 }}
          label={{ value: 'Review Time', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <YAxis tickLine={false} tick={{ fontSize: 10 }} />
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Bar dataKey="count" name="PRs" radius={[4, 4, 0, 0]}>
          {data.map((_: any, i: number) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
