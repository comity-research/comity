'use client';

import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface HHIGaugeProps {
  score: number;
  risk: string;
}

const RISK_COLORS: Record<string, string> = {
  low: '#80D8C3',
  moderate: '#FF9149',
  high: '#FF6363',
  unknown: '#A19AD3',
};

export function HHIGauge({ score, risk }: HHIGaugeProps) {
  const safeScore = score ?? 0;
  const safeRisk = risk ?? 'unknown';
  const maxHHI = 10000;
  const normalized = Math.min(safeScore / maxHHI, 1);
  const color = RISK_COLORS[safeRisk] ?? '#A19AD3';

  const data = [
    { value: normalized * 100 },
    { value: (1 - normalized) * 100 },
  ];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy="85%"
            innerRadius="60%"
            outerRadius="90%"
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
        <span className="font-mono text-2xl font-bold">{safeScore.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground capitalize">{safeRisk} risk</span>
      </div>
    </div>
  );
}
