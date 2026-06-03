'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/ui/animate';
import { CitationBlock } from './citation-block';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GitPullRequest, Clock, GitMerge } from 'lucide-react';

export function ProcessTab({ analysis }: { analysis: any }) {
  const cga = analysis?.cga ?? {};
  const details = cga?.details?.process ?? {};
  const mergeAuthority = analysis?.mergeAuthority ?? [];
  const prs = analysis?.prAnalysis ?? [];
  const rawPR = analysis?.rawData?.prAnalysis ?? {};

  const mergedPrs = (prs ?? []).filter((p: any) => p?.mergedAt != null);
  const mergeRate = prs.length > 0 ? Math.round((mergedPrs.length / prs.length) * 100) : (rawPR?.mergedPRs && rawPR?.totalPRs ? Math.round((rawPR.mergedPRs / rawPR.totalPRs) * 100) : 0);
  const avgReviewLatency = (() => {
    if (rawPR?.avgReviewTime) return Math.round(rawPR.avgReviewTime);
    const latencies = (prs ?? []).map((p: any) => p?.reviewLatencyHours).filter((h: any) => h != null && h >= 0) as number[];
    return latencies.length > 0 ? Math.round(latencies.reduce((s: number, v: number) => s + v, 0) / latencies.length) : null;
  })();

  return (
    <div className="space-y-6">
      <FadeIn>
        <CitationBlock
          explanation="Process scores measure how efficiently the project converts contributions into released code. Key signals include PR review latency (time from opening to first review), merge rate, and whether merge authority is distributed or concentrated. Fast, distributed review processes correlate with higher contributor retention and lower defect density."
          citations={[
            { label: 'Seminal', text: 'Rigby, P.C. & Bird, C. (2013). Convergent contemporary software peer review practices. Proc. 9th Joint Meeting on Foundations of Software Engineering (ESEC/FSE), pp. 202-212. ACM.', doi: '10.1145/2491411.2491444' },
            { label: 'Latest', text: 'Cassee, N., Prana, G.A., Rastogi, A. & Serebrenik, A. (2024). How are pull requests reviewed? An empirical study of review comments on GitHub. Empirical Software Engineering, 29, 6.', doi: '10.1007/s10664-023-10400-y' },
          ]}
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2"><GitPullRequest className="h-5 w-5" />Process Score</span>
              <span className="font-mono text-2xl">{cga?.process ?? 0}<span className="text-sm text-muted-foreground">/100</span></span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span>PR Review Latency</span><span className="font-mono">{details?.prLatency ?? 0}/100</span></div>
              <Progress value={details?.prLatency ?? 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Issue Response Time</span><span className="font-mono">{details?.issueResponse ?? 0}/100</span></div>
              <Progress value={details?.issueResponse ?? 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Merge Rate</span><span className="font-mono">{details?.mergeRate ?? 0}/100</span></div>
              <Progress value={details?.mergeRate ?? 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FadeIn delay={0.1}>
          <Card>
            <CardContent className="pt-6 text-center">
              <GitPullRequest className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Total PRs Analyzed</p>
              <p className="text-2xl font-bold font-mono">{rawPR?.totalPRs ?? prs?.length ?? 0}</p>
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn delay={0.15}>
          <Card>
            <CardContent className="pt-6 text-center">
              <GitMerge className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-xs text-muted-foreground">Merge Rate</p>
              <p className="text-2xl font-bold font-mono">{mergeRate}%</p>
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn delay={0.2}>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <p className="text-xs text-muted-foreground">Avg Review Latency</p>
              <p className="text-2xl font-bold font-mono">{avgReviewLatency != null ? `${avgReviewLatency}h` : 'N/A'}</p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {(mergeAuthority?.mergers?.length ?? mergeAuthority?.length ?? 0) > 0 && (
        <FadeIn delay={0.25}>
          <Card>
            <CardHeader><CardTitle className="text-base">Merge Authority Distribution</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Who merges code matters. Concentrated merge authority can be a bottleneck and a risk factor for project continuity.</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Merges</TableHead>
                    <TableHead>Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(mergeAuthority?.mergers ?? mergeAuthority ?? []).slice(0, 10).map((r: any, i: number) => (
                    <TableRow key={r?.login ?? i}>
                      <TableCell className="font-mono text-sm">{r?.login ?? 'unknown'}</TableCell>
                      <TableCell className="font-mono">{r?.count ?? r?.reviews ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={r?.percentage ?? 0} className="h-1.5 w-20" />
                          <span className="font-mono text-xs">{Math.round(r?.percentage ?? 0)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
