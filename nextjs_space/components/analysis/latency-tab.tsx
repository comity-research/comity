'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/animate';
import { CitationBlock } from './citation-block';
import { Clock, GitPullRequest } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export function LatencyTab({ analysis }: { analysis: any }) {
  const rawPR = analysis?.rawData?.prAnalysis ?? {};
  const latencyArray = rawPR?.reviewLatencies ?? [];

  // Box plot stats from raw latencies
  const boxStats = useMemo(() => {
    const sorted = [...(latencyArray ?? [])].filter((v: number) => v >= 0).sort((a: number, b: number) => a - b);
    if (sorted.length === 0) return null;
    const q1 = sorted[Math.floor(sorted.length * 0.25)] ?? 0;
    const median = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
    const q3 = sorted[Math.floor(sorted.length * 0.75)] ?? 0;
    const min = sorted[0] ?? 0;
    const max = sorted[sorted.length - 1] ?? 0;
    return { min, q1, median, q3, max, count: sorted.length };
  }, [latencyArray]);

  // Distribution buckets for histogram
  const histogram = useMemo(() => {
    const data = (latencyArray ?? []).filter((v: number) => v >= 0);
    if (data.length === 0) return [];
    const buckets = [
      { range: '< 1h', min: 0, max: 1 },
      { range: '1-4h', min: 1, max: 4 },
      { range: '4-12h', min: 4, max: 12 },
      { range: '12-24h', min: 12, max: 24 },
      { range: '1-3d', min: 24, max: 72 },
      { range: '3-7d', min: 72, max: 168 },
      { range: '> 7d', min: 168, max: Infinity },
    ];
    return buckets.map((b) => ({
      range: b.range,
      count: data.filter((v: number) => v >= b.min && v < b.max).length,
    }));
  }, [latencyArray]);

  return (
    <div className="space-y-6">
      <FadeIn>
        <CitationBlock
          explanation="Review latency, the elapsed time between PR creation and first substantive review, is a proxy for how responsive the maintainer community is. Research shows that faster reviews attract more contributors, reduce context-switching costs, and produce fewer defects. The histogram below buckets PRs by their time-to-first-review, while the box plot summarises the distribution's shape."
          citations={[
            { label: 'Seminal', text: 'Baysal, O., Kononenko, O., Holmes, R. & Godfrey, M.W. (2016). Investigating technical and non-technical factors influencing modern code review. Empirical Software Engineering, 21(3), 932-959.', doi: '10.1007/s10664-015-9366-8' },
            { label: 'Latest', text: 'Wessel, M., Serebrenik, A., Wiese, I. & Steinmacher, I. (2023). Quality gatekeepers: Investigating the effects of code review bots on pull request activities. Empirical Software Engineering, 28, 98.', doi: '10.1007/s10664-023-10369-w' },
          ]}
        />
      </FadeIn>

      {boxStats && (
        <FadeIn delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Review Latency Distribution (n={boxStats.count})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4 text-center">
                <div><p className="text-xs text-muted-foreground">Min</p><p className="text-lg font-mono font-bold">{boxStats.min?.toFixed?.(1) ?? '0'}h</p></div>
                <div><p className="text-xs text-muted-foreground">Q1</p><p className="text-lg font-mono font-bold">{boxStats.q1?.toFixed?.(1) ?? '0'}h</p></div>
                <div className="bg-primary/10 rounded-lg p-2"><p className="text-xs text-muted-foreground">Median</p><p className="text-xl font-mono font-bold text-primary">{boxStats.median?.toFixed?.(1) ?? '0'}h</p></div>
                <div><p className="text-xs text-muted-foreground">Q3</p><p className="text-lg font-mono font-bold">{boxStats.q3?.toFixed?.(1) ?? '0'}h</p></div>
                <div><p className="text-xs text-muted-foreground">Max</p><p className="text-lg font-mono font-bold">{boxStats.max?.toFixed?.(1) ?? '0'}h</p></div>
              </div>
              <div className="mt-4 relative h-8 bg-accent/30 rounded-full overflow-hidden">
                {(() => {
                  const range = (boxStats.max ?? 1) - (boxStats.min ?? 0);
                  if (range <= 0) return null;
                  const pct = (v: number) => ((v - (boxStats.min ?? 0)) / range) * 100;
                  return (
                    <>
                      <div className="absolute top-0 h-full bg-primary/20 rounded" style={{ left: `${pct(boxStats.q1 ?? 0)}%`, width: `${pct(boxStats.q3 ?? 0) - pct(boxStats.q1 ?? 0)}%` }} />
                      <div className="absolute top-0 h-full w-0.5 bg-primary" style={{ left: `${pct(boxStats.median ?? 0)}%` }} />
                    </>
                  );
                })()}
              </div>
              <p className="text-xs text-muted-foreground mt-3">IQR shaded region shows where 50% of reviews fall. The vertical line marks the median.</p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitPullRequest className="h-4 w-4" />
              Review Latency Histogram
            </CardTitle>
          </CardHeader>
          <CardContent>
            {histogram.length === 0 || latencyArray.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No review latency data available. Latency is calculated for merged PRs with review activity.</p>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogram} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                    <XAxis dataKey="range" tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="count" fill="#FF9149" radius={[4, 4, 0, 0]} name="PRs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
