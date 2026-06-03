'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  BarChart3, GitFork, Users, Activity, Search, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

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

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span className="font-mono">{count.toLocaleString()}{suffix}</span>;
}

export function DashboardClient() {
  const { data: session } = useSession() || {};
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzeRepo, setAnalyzeRepo] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const fetchAnalyses = useCallback(async () => {
    try {
      const res = await fetch('/api/analyses?limit=20');
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data ?? []);
      }
    } catch (e) {
      console.error('Failed to fetch analyses:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const handleQuickAnalyze = async () => {
    if (!analyzeRepo?.trim()) return;
    const parts = analyzeRepo.trim().split('/');
    if (parts.length < 2) return;
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1]?.replace('.git', '');
    setAnalyzing(true);
    try {
      const res = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo }),
      });
      if (res.ok) {
        await fetchAnalyses();
        setAnalyzeRepo('');
      } else {
        const data = await res.json();
        alert(data?.error ?? 'Analysis failed');
      }
    } catch (e) {
      console.error('Analysis failed:', e);
    } finally {
      setAnalyzing(false);
    }
  };

  const completed = analyses.filter((a: AnalysisSummary) => a?.status === 'completed');
  const highRisk = completed.filter((a: AnalysisSummary) => a?.hhiRisk === 'high');
  const avgHHI = completed.length > 0
    ? Math.round(completed.reduce((s: number, a: AnalysisSummary) => s + (a?.hhiScore ?? 0), 0) / completed.length)
    : 0;

  const stats = [
    { label: 'Total Analyses', value: analyses.length, icon: BarChart3, color: 'text-primary' },
    { label: 'Completed', value: completed.length, icon: CheckCircle, color: 'text-green-500' },
    { label: 'High Risk', value: highRisk.length, icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Avg HHI', value: avgHHI, icon: TrendingUp, color: 'text-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor governance health across your analyzed repositories.</p>
          </div>

          {/* Quick Analyze */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={analyzeRepo}
                    onChange={(e) => setAnalyzeRepo(e.target.value)}
                    placeholder="owner/repo or GitHub URL"
                    className="pl-9"
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAnalyze()}
                  />
                </div>
                <Button onClick={handleQuickAnalyze} loading={analyzing} disabled={!analyzeRepo?.trim()}>
                  <Activity className="h-4 w-4" />
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <div className="text-2xl font-bold">
                        <AnimatedCounter value={stat.value} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Recent Analyses */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Recent Analyses</h2>
            <Button variant="ghost" size="sm" onClick={fetchAnalyses} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6"><div className="h-12 bg-muted rounded" /></CardContent>
                </Card>
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GitFork className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-1">No analyses yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start by analyzing a GitHub repository above, or browse preset projects.</p>
                <Link href="/projects">
                  <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Browse Projects
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {analyses.map((analysis: AnalysisSummary, i: number) => (
                <motion.div
                  key={analysis?.id ?? i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link href={`/analyze?id=${analysis?.id ?? ''}`}>
                    <Card variant="interactive" className="cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-semibold text-sm truncate">{analysis?.repoFullName ?? 'Unknown'}</span>
                              <Badge variant={analysis?.status === 'completed' ? 'default' : analysis?.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs">
                                {analysis?.status ?? 'unknown'}
                              </Badge>
                              {analysis?.hhiRisk && (
                                <Badge variant={analysis.hhiRisk === 'high' ? 'destructive' : analysis.hhiRisk === 'moderate' ? 'outline' : 'secondary'} className="text-xs">
                                  HHI: {analysis?.hhiScore?.toLocaleString() ?? 'N/A'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {analysis?.summary?.slice(0, 120) ?? 'No summary available'}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 ml-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
