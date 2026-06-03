'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GovernanceRadar } from '@/components/charts/governance-radar';
import { LatencyChart } from '@/components/charts/latency-chart';
import {
  GitCompare, X, Plus, BarChart3, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const COLORS = ['#7C3AED', '#FF9149', '#60B5FF', '#FF6363', '#80D8C3', '#A19AD3', '#F59E0B', '#10B981', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];

interface AnalysisSummary {
  id: string;
  repoFullName: string;
  status: string;
  hhiScore: number | null;
  hhiRisk: string | null;
  cga: any;
  summary: string | null;
  createdAt: string;
}

export function ComparisonClient() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const res = await fetch('/api/analyses?limit=100');
        if (res.ok) {
          const data = await res.json();
          setAnalyses((data ?? []).filter((a: any) => a?.status === 'completed'));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyses();
  }, []);

  const addProject = async (id: string) => {
    if (selected.find((s: any) => s?.id === id)) return;
    try {
      const res = await fetch(`/api/analyses/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelected((prev: any[]) => [...prev, data]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeProject = (id: string) => {
    setSelected((prev: any[]) => prev.filter((s: any) => s?.id !== id));
  };

  const radarData = selected.length > 0 ? ['Structure', 'Process', 'Culture'].map((dim: string) => {
    const entry: Record<string, any> = { dimension: dim };
    selected.forEach((s: any, i: number) => {
      const rd = s?.rawData as any;
      const key = dim.toLowerCase();
      entry[s?.repoFullName ?? `Project ${i}`] = rd?.cga?.[key] ?? 0;
    });
    return entry;
  }) : [];

  const hhiComparison = selected.map((s: any) => ({
    name: (s?.repoFullName ?? '').split('/').pop() ?? '',
    HHI: (s?.rawData as any)?.hhi?.score ?? s?.hhiScore ?? 0,
    busFactor: (s?.rawData as any)?.cri?.busFactor ?? 0,
  }));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight">Compare Projects</h1>
            <p className="text-muted-foreground mt-1">Overlay governance metrics across multiple repositories for side-by-side analysis.</p>
          </div>

          {/* Selected projects */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selected.map((s: any, i: number) => (
              <Badge key={s?.id ?? i} className="gap-1 pr-1" style={{ backgroundColor: COLORS[i % COLORS.length], color: 'white' }}>
                {s?.repoFullName ?? 'Unknown'}
                <button onClick={() => removeProject(s?.id ?? '')} className="ml-1 rounded-full hover:bg-white/20 p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Project selector */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Add Projects to Compare</CardTitle>
              <CardDescription>Select completed analyses to compare governance metrics side by side</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-12 bg-muted rounded animate-pulse" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {analyses.filter((a: AnalysisSummary) => !selected.find((s: any) => s?.id === a?.id)).map((a: AnalysisSummary) => (
                    <Button key={a?.id} variant="outline" size="sm" onClick={() => addProject(a?.id ?? '')} className="gap-1">
                      <Plus className="h-3 w-3" />
                      {a?.repoFullName ?? 'Unknown'}
                    </Button>
                  ))}
                  {analyses.length === 0 && <p className="text-sm text-muted-foreground">No completed analyses available</p>}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="rounded-lg border border-border/50 bg-accent/20 p-4 mb-6 space-y-2">
            <p className="text-sm text-muted-foreground">Cross-project comparison places multiple repositories on the same axes, enabling visual benchmarking of governance health. The radar chart overlays Structure, Process, and Culture scores, while the bar chart compares concentration risk (HHI) and bus factor side by side.</p>
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/70">[Seminal]</span> <span role="link" tabIndex={0} className="underline underline-offset-2 hover:text-foreground cursor-pointer" onClick={() => window.open('https://doi.org/10.1371/journal.pone.0187500', '_blank', 'noopener,noreferrer')}>Cosentino, V., Izquierdo, J. L. C. & Cabot, J. (2017). A systematic mapping study of software development with GitHub. IEEE Access, 5, 7173-7192.</span></p>
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/70">[Latest]</span> <span role="link" tabIndex={0} className="underline underline-offset-2 hover:text-foreground cursor-pointer" onClick={() => window.open('https://doi.org/10.1007/s10664-020-09855-2', '_blank', 'noopener,noreferrer')}>Coelho, J., Valente, M. T., Milen, L. & Silva, L. L. (2020). Is this GitHub project maintained? Measuring the level of maintenance activity of open-source projects. Information and Software Technology, 122, 106274.</span></p>
              </div>
            </div>
          </div>

          {selected.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-1">No projects selected</h3>
                <p className="text-sm text-muted-foreground">Add completed analyses above to compare governance metrics.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Governance Radar */}
              <Card>
                <CardHeader><CardTitle className="text-base">Governance Dimensions</CardTitle></CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      {selected.map((s: any, i: number) => (
                        <Radar
                          key={s?.id ?? i}
                          name={s?.repoFullName ?? `Project ${i}`}
                          dataKey={s?.repoFullName ?? `Project ${i}`}
                          stroke={COLORS[i % COLORS.length]}
                          fill={COLORS[i % COLORS.length]}
                          fillOpacity={0.15}
                        />
                      ))}
                      <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* HHI Comparison */}
              <Card>
                <CardHeader><CardTitle className="text-base">HHI & Bus Factor Comparison</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hhiComparison} margin={{ top: 10, right: 10, bottom: 25, left: 10 }}>
                      <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 10 }} />
                      <YAxis tickLine={false} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="HHI" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="busFactor" fill="#80D8C3" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Summary table */}
              <Card>
                <CardHeader><CardTitle className="text-base">Metrics Summary</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Repository</th>
                          <th className="text-right py-2 font-medium">HHI</th>
                          <th className="text-right py-2 font-medium">Bus Factor</th>
                          <th className="text-right py-2 font-medium">Structure</th>
                          <th className="text-right py-2 font-medium">Process</th>
                          <th className="text-right py-2 font-medium">Culture</th>
                          <th className="text-right py-2 font-medium">Median Review</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.map((s: any, i: number) => {
                          const rd = s?.rawData as any;
                          return (
                            <tr key={s?.id ?? i} className="border-b last:border-0">
                              <td className="py-2 font-mono text-xs">
                                <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                {s?.repoFullName ?? 'Unknown'}
                              </td>
                              <td className="text-right py-2 font-mono">{rd?.hhi?.score ?? s?.hhiScore ?? 'N/A'}</td>
                              <td className="text-right py-2 font-mono">{rd?.cri?.busFactor ?? 'N/A'}</td>
                              <td className="text-right py-2 font-mono">{rd?.cga?.structure ?? 'N/A'}</td>
                              <td className="text-right py-2 font-mono">{rd?.cga?.process ?? 'N/A'}</td>
                              <td className="text-right py-2 font-mono">{rd?.cga?.culture ?? 'N/A'}</td>
                              <td className="text-right py-2 font-mono">{rd?.prAnalysis?.medianReviewTime ?? 'N/A'}h</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
