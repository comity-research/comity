'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate';
import { CitationBlock } from './citation-block';
import { GitFork, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ForkTab({ analysis }: { analysis: any }) {
  const forks = analysis?.rawData?.forks ?? [];
  const repoInfo = analysis?.rawData?.repoInfo ?? {};
  const forkCount = repoInfo?.forkCount ?? forks?.length ?? 0;

  return (
    <div className="space-y-6">
      <FadeIn>
        <CitationBlock
          explanation="Forking is central to how open source evolves. A healthy fork ecosystem signals that others see value in the codebase and are actively building on it. The data below shows the top forks ranked by stars, their commit activity, and recency of updates. Stale or abandoned forks may indicate a community that consumes but does not contribute back."
          citations={[
            { label: 'Seminal', text: 'Nyman, L. & Lindman, J. (2013). Code forking, governance, and sustainability in open source software. Technology Innovation Management Review, 3(1), 7-12.', doi: '10.22215/timreview/644' },
            { label: 'Latest', text: 'Zhou, S., Vasilescu, B. & K\u00e4stner, C. (2023). What predicts software developers\' productivity? IEEE Transactions on Software Engineering, 49(4), 3218-3231.', doi: '10.1109/TSE.2023.3241062' },
          ]}
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <GitFork className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Total Forks</p>
              <p className="text-2xl font-bold font-mono">{forkCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <GitFork className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-xs text-muted-foreground">Fetched (Top by Stars)</p>
              <p className="text-2xl font-bold font-mono">{forks?.length ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <p className="text-xs text-muted-foreground">Avg Stars per Fork</p>
              <p className="text-2xl font-bold font-mono">
                {forks.length > 0 ? Math.round(forks.reduce((s: number, f: any) => s + (f?.stargazerCount ?? 0), 0) / forks.length) : 0}
              </p>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {(forks?.length ?? 0) > 0 && (
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fork Ecosystem (Top {forks.length} by Stars)</CardTitle>
            </CardHeader>
            <CardContent>
              <Stagger className="space-y-2">
                {forks.map((fork: any, i: number) => {
                  const commitCount = fork?.defaultBranchRef?.target?.history?.totalCount ?? 0;
                  return (
                    <StaggerItem key={`${fork?.owner ?? ''}/${fork?.name ?? ''}-${i}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-all">
                        <div className="flex items-center gap-3">
                          <GitFork className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium font-mono">{fork?.owner ?? ''}/{fork?.name ?? ''}</p>
                            <p className="text-xs text-muted-foreground">
                              Updated {fork?.updatedAt ? new Date(fork.updatedAt).toLocaleDateString() : 'unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1 font-mono">
                            <Star className="h-3 w-3" />{fork?.stargazerCount ?? 0}
                          </Badge>
                          {commitCount > 0 && <Badge variant="outline" className="font-mono text-xs">{commitCount} commits</Badge>}
                          <Button size="sm" variant="ghost" asChild>
                            <a href={`https://github.com/${fork?.owner ?? ''}/${fork?.name ?? ''}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
