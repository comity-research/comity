'use client';

import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';

interface RadarDataPoint {
  dimension: string;
  score: number;
}

export function GovernanceRadar({ data, label }: { data: RadarDataPoint[]; label?: string }) {
  const safeData = data ?? [];

  if (safeData.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={safeData} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Radar
          name={label ?? 'Score'}
          dataKey="score"
          stroke="#60B5FF"
          fill="#60B5FF"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
