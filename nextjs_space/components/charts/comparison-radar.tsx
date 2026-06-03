'use client';

import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#80D8C3', '#A19AD3'];

interface ComparisonData {
  dimension: string;
  [key: string]: string | number;
}

export function ComparisonRadar({ data, labels }: { data: ComparisonData[]; labels: string[] }) {
  const safeData = data ?? [];
  const safeLabels = labels ?? [];

  if (safeData.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No comparison data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={safeData} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
        {safeLabels.map((label: string, i: number) => (
          <Radar
            key={label}
            name={label}
            dataKey={label}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
