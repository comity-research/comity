'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#7C3AED', '#FF9149', '#60B5FF', '#FF6363', '#80D8C3', '#A19AD3', '#FF90BB', '#72BF78'];

interface ContributorPieProps {
  data: { login: string; share: number }[];
}

export function ContributorPie({ data }: ContributorPieProps) {
  const safe = (data ?? []).slice(0, 8).map((d: any, i: number) => ({
    name: d?.login ?? `Contributor ${i + 1}`,
    value: Math.round((d?.share ?? 0) * 1000) / 10,
  }));

  const otherShare = (data ?? []).slice(8).reduce((s: number, d: any) => s + (d?.share ?? 0), 0);
  if (otherShare > 0) safe.push({ name: 'Others', value: Math.round(otherShare * 1000) / 10 });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={safe}
          cx="50%"
          cy="55%"
          innerRadius="40%"
          outerRadius="70%"
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
        >
          {safe.map((_: any, i: number) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => `${value}%`} contentStyle={{ fontSize: 11 }} />
        <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
