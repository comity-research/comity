'use client';

import { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3', '#A19AD3', '#72BF78', '#FF6363'];

export function ContributorPieChart({ contributors }: { contributors: any[] }) {
  const data = useMemo(() => {
    const safe = contributors ?? [];
    const total = safe.reduce((s: number, c: any) => s + (c?.contributions ?? 0), 0);
    if (total === 0) return [];
    const top = safe.slice(0, 7).map((c: any) => ({
      name: c?.login ?? 'unknown',
      value: c?.contributions ?? 0,
    }));
    const rest = safe.slice(7).reduce((s: number, c: any) => s + (c?.contributions ?? 0), 0);
    if (rest > 0) top.push({ name: 'Others', value: rest });
    return top;
  }, [contributors]);

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No contributor data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="value"
          paddingAngle={2}
        >
          {data.map((_: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
