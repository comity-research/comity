'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/animate';
import { CitationBlock } from './citation-block';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';

export function TimelineTab({ analysis }: { analysis: any }) {
  const [agg, setAgg] = useState<string>('monthly');
  const rawTimeline = analysis?.rawData?.timeline ?? [];
  const commits = analysis?.rawData?.commitTimeline?.commits ?? rawTimeline;

  const aggregated = useMemo(() => {
    if ((commits ?? []).length === 0) return [];
    const buckets: Record<string, { count: number; additions: number; deletions: number; authors: Set<string> }> = {};
    (commits ?? []).forEach((c: any) => {
      const d = new Date(c?.date ?? 0);
      let key = '';
      if (agg === 'weekly') {
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        key = startOfWeek.toISOString().slice(0, 10);
      } else if (agg === 'monthly') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
      }
      if (!buckets[key]) buckets[key] = { count: 0, additions: 0, deletions: 0, authors: new Set() };
      buckets[key].count++;
      buckets[key].additions += c?.additions ?? 0;
      buckets[key].deletions += c?.deletions ?? 0;
      buckets[key].authors.add(c?.author ?? 'unknown');
    });
    return Object.entries(buckets)
      .map(([period, data]: [string, any]) => ({
        period,
        commits: data?.count ?? 0,
        additions: data?.additions ?? 0,
        deletions: data?.deletions ?? 0,
        authors: data?.authors?.size ?? 0,
      }))
      .sort((a: any, b: any) => (a?.period ?? '').localeCompare(b?.period ?? ''));
  }, [commits, agg]);

  return (
    <div className="space-y-6">
      <FadeIn>
        <CitationBlock
          explanation="Commit cadence reveals the rhythms of a project: steady cadence signals sustained investment, while bursts followed by silence can indicate event-driven or deadline-driven development. Tracking active authors over time shows whether the contributor base is growing, stable, or shrinking, a leading indicator of project health."
          citations={[
            { label: 'Seminal', text: 'Mockus, A., Fielding, R.T. & Herbsleb, J.D. (2002). Two case studies of open source software development: Apache and Mozilla. ACM Transactions on Software Engineering and Methodology, 11(3), 309-346.', doi: '10.1145/567793.567795' },
            { label: 'Latest', text: 'Zhu, Q., Claes, M. & Mans, R. (2024). Understanding the evolution of open source communities: A systematic literature review. Information and Software Technology, 165, 107341.', doi: '10.1016/j.infsof.2023.107341' },
          ]}
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total data points: <span className="font-mono font-medium">{(commits ?? []).length}</span></p>
          </div>
          <Select value={agg} onValueChange={setAgg}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Commit Cadence ({agg})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aggregated.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No commit timeline data available</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aggregated} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                    <XAxis dataKey="period" tickLine={false} tick={{ fontSize: 10 }} angle={-45} textAnchor="end" interval="preserveStartEnd" height={50} />
                    <YAxis tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="commits" fill="#60B5FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Authors ({agg})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aggregated.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={aggregated} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                    <XAxis dataKey="period" tickLine={false} tick={{ fontSize: 10 }} angle={-45} textAnchor="end" interval="preserveStartEnd" height={50} />
                    <YAxis tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Area dataKey="authors" fill="#80D8C3" stroke="#80D8C3" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
