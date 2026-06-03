'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface TimelineChartProps {
  data: { date: string; commits: number; additions: number; deletions: number }[];
}

export function TimelineChart({ data }: TimelineChartProps) {
  const safe = (data ?? []).map((d: any) => ({
    date: (d?.date ?? '').slice(5) || '',
    commits: d?.commits ?? 0,
    additions: d?.additions ?? 0,
    deletions: d?.deletions ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={safe} margin={{ top: 10, right: 10, bottom: 25, left: 10 }}>
        <XAxis
          dataKey="date"
          tickLine={false}
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
          label={{ value: 'Date', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <YAxis tickLine={false} tick={{ fontSize: 10 }} />
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="commits" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.3} />
        <Area type="monotone" dataKey="additions" stroke="#80D8C3" fill="#80D8C3" fillOpacity={0.2} />
        <Area type="monotone" dataKey="deletions" stroke="#FF6363" fill="#FF6363" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
