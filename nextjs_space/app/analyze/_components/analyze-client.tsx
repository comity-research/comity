'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from '@/components/analysis/overview-tab';
import { StructureTab } from '@/components/analysis/structure-tab';
import { ProcessTab } from '@/components/analysis/process-tab';
import { CultureTab } from '@/components/analysis/culture-tab';
import { TimelineTab } from '@/components/analysis/timeline-tab';
import { ForkTab } from '@/components/analysis/fork-tab';
import { LatencyTab } from '@/components/analysis/latency-tab';
import { NetworkGraphTab } from '@/components/analysis/network-graph-tab';
import { downloadCSV, downloadJSON } from '@/lib/export-utils';
import {
  Search, Activity, Loader2, Download, RefreshCw, AlertCircle,
  LayoutDashboard, FileText, GitPullRequest, Heart, Calendar, GitFork, Clock, Network
} from 'lucide-react';
import { motion } from 'framer-motion';

export function AnalyzeClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repoInput, setRepoInput] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const analysisId = searchParams?.get('id') ?? null;
  const repoParam = searchParams?.get('repo') ?? null;

  const fetchAnalysis = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analyses/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
        setRepoInput(data?.repoFullName ?? '');
      } else {
        const err = await res.json();
        setError(err?.error ?? 'Failed to load analysis');
      }
    } catch (e) {
      setError('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }, []);

  const runAnalysis = useCallback(async (owner: string, repo: string) => {
    setAnalyzing(true);
    setError(null);
    try {
      // Pre-check token availability to avoid browser console error on 400
      const tokenCheck = await fetch('/api/github/token');
      const tokenData = tokenCheck.ok ? await tokenCheck.json().catch(() => ({})) : {};
      if (!tokenData?.hasToken) {
        setError('GitHub token not configured. Add your personal access token in Settings before running an analysis.');
        setAnalyzing(false);
        return;
      }
      const res = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
        router.replace(`/analyze?id=${data?.id}`);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err?.error ?? 'Analysis failed');
      }
    } catch (e) {
      setError('Analysis failed. Check your GitHub token in Settings.');
    } finally {
      setAnalyzing(false);
    }
  }, [router]);

  useEffect(() => {
    if (analysisId) {
      fetchAnalysis(analysisId);
    } else if (repoParam) {
      const parts = repoParam.split('/');
      if (parts.length >= 2) {
        setRepoInput(repoParam);
        runAnalysis(parts[0], parts[1]);
      }
    }
  }, [analysisId, repoParam, fetchAnalysis, runAnalysis]);

  const handleSubmit = () => {
    const input = repoInput?.trim() ?? '';
    if (!input) return;
    const cleaned = input.replace('https://github.com/', '').replace('.git', '');
    const parts = cleaned.split('/');
    if (parts.length >= 2) {
      runAnalysis(parts[0], parts[1]);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (!analysis) return;
    const name = analysis?.repoFullName?.replace('/', '_') ?? 'analysis';
    if (format === 'csv') {
      const flat = [{
        repo: analysis?.repoFullName,
        status: analysis?.status,
        hhiScore: analysis?.hhiScore,
        hhiRisk: analysis?.hhiRisk,
        structure: analysis?.cga?.structure,
        process: analysis?.cga?.process,
        culture: analysis?.cga?.culture,
        overall: analysis?.cga?.overall,
        busFactor: analysis?.cri?.busFactor,
        medianReviewTime: analysis?.rawData?.prAnalysis?.medianReviewTime,
      }];
      downloadCSV(flat, `${name}.csv`);
    } else {
      downloadJSON(analysis, `${name}.json`);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'structure', label: 'Structure', icon: FileText },
    { id: 'process', label: 'Process', icon: GitPullRequest },
    { id: 'culture', label: 'Culture', icon: Heart },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'forks', label: 'Forks', icon: GitFork },
    { id: 'latency', label: 'Latency', icon: Clock },
    { id: 'network', label: 'Network', icon: Network },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight">Analyze Repository</h1>
            <p className="text-muted-foreground mt-1">Run a governance analysis on any public GitHub repository.</p>
          </div>

          {/* Input */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={repoInput}
                    onChange={(e) => setRepoInput(e.target.value)}
                    placeholder="owner/repo or https://github.com/owner/repo"
                    className="pl-9"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
                <Button onClick={handleSubmit} disabled={analyzing || !repoInput?.trim()}>
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>
              {error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {loading && (
            <Card>
              <CardContent className="py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-muted-foreground">Loading analysis...</p>
              </CardContent>
            </Card>
          )}

          {analyzing && !analysis && (
            <Card>
              <CardContent className="py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                <p className="font-medium">Running governance analysis...</p>
                <p className="text-sm text-muted-foreground mt-1">Fetching contributors, PRs, commits, forks, and governance docs from GitHub.</p>
              </CardContent>
            </Card>
          )}

          {analysis && !loading && (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-mono font-bold text-xl">{analysis?.repoFullName ?? ''}</h2>
                    <Badge variant={analysis?.status === 'completed' ? 'default' : analysis?.status === 'failed' ? 'destructive' : 'secondary'}>
                      {analysis?.status ?? 'unknown'}
                    </Badge>
                    {analysis?.hhiRisk && (
                      <Badge variant={analysis.hhiRisk === 'high' ? 'destructive' : analysis.hhiRisk === 'moderate' ? 'outline' : 'secondary'}>
                        HHI: {analysis?.hhiScore ?? 0}
                      </Badge>
                    )}
                  </div>
                  {analysis?.summary && (
                    <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{analysis.summary}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="gap-1">
                    <Download className="h-3 w-3" /> CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('json')} className="gap-1">
                    <Download className="h-3 w-3" /> JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { const parts = (analysis?.repoFullName ?? '').split('/'); if (parts.length >= 2) runAnalysis(parts[0], parts[1]); }} className="gap-1">
                    <RefreshCw className="h-3 w-3" /> Re-run
                  </Button>
                </div>
              </div>

              {analysis?.status === 'failed' ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-1">Analysis Failed</h3>
                    <p className="text-sm text-muted-foreground">{analysis?.summary ?? 'The analysis encountered an error. Check your GitHub token and try again.'}</p>
                  </CardContent>
                </Card>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0 mb-6">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-3 py-1.5 text-sm"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {tab.label}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  <TabsContent value="overview"><OverviewTab analysis={analysis} /></TabsContent>
                  <TabsContent value="structure"><StructureTab analysis={analysis} /></TabsContent>
                  <TabsContent value="process"><ProcessTab analysis={analysis} /></TabsContent>
                  <TabsContent value="culture"><CultureTab analysis={analysis} /></TabsContent>
                  <TabsContent value="timeline"><TimelineTab analysis={analysis} /></TabsContent>
                  <TabsContent value="forks"><ForkTab analysis={analysis} /></TabsContent>
                  <TabsContent value="latency"><LatencyTab analysis={analysis} /></TabsContent>
                  <TabsContent value="network"><NetworkGraphTab analysis={analysis} /></TabsContent>
                </Tabs>
              )}
            </>
          )}

          {!analysis && !loading && !analyzing && !analysisId && !repoParam && (
            <Card>
              <CardContent className="py-16 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-1">Enter a repository to analyze</h3>
                <p className="text-sm text-muted-foreground">Type an owner/repo path or paste a GitHub URL above, then click Analyze.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}
