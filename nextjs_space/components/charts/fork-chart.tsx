'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const COLORS = ['#7C3AED', '#60B5FF', '#FF9149', '#80D8C3', '#FF90BB', '#A19AD3', '#FF6363', '#72BF78'];

interface ForkChartProps {
  forks: { name: string; owner: string; stargazerCount: number }[];
}

export function ForkChart({ forks }: ForkChartProps) {
  const safe = (forks ?? []).slice(0, 15).map((f: any) => ({
    name: `${f?.owner ?? ''}/${f?.name ?? ''}`.slice(0, 20),
    stars: f?.stargazerCount ?? 0,
  }));

  if (safe.length === 0) return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No fork data</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={safe} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 80 }}>
        <XAxis type="number" tickLine={false} tick={{ fontSize: 10 }} />
        <YAxis type="category" dataKey="name" tickLine={false} tick={{ fontSize: 9 }} width={75} />
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Bar dataKey="stars" name="Stars" radius={[0, 4, 4, 0]}>
          {safe.map((_: any, i: number) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
