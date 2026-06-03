'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/ui/animate';
import { ContributorPieChart } from '@/components/charts/contributor-pie-chart';
import { CitationBlock } from './citation-block';
import { Users, Heart, Shield } from 'lucide-react';

export function CultureTab({ analysis }: { analysis: any }) {
  const cga = analysis?.cga ?? {};
  const details = cga?.details?.culture ?? {};
  const contributors = analysis?.contributors ?? analysis?.rawData?.contributors ?? [];
  const cri = analysis?.cri ?? analysis?.rawData?.cri ?? {};

  return (
    <div className="space-y-6">
      <FadeIn>
        <CitationBlock
          explanation="Culture captures the social norms that shape how people collaborate: whether there is an explicit Code of Conduct, how broadly contributions are distributed across participants, and how welcoming the project is to newcomers. A diverse contributor base and explicit community norms reduce single-point-of-failure risk and signal long-term sustainability."
          citations={[
            { label: 'Seminal', text: 'Raymond, E.S. (1999). The Cathedral and the Bazaar: Musings on Linux and Open Source by an Accidental Revolutionary. O\'Reilly Media.' },
            { label: 'Latest', text: 'Guizani, M., Chatterjee, P., Trinkenreich, B. & Steinmacher, I. (2024). Attracting and retaining OSS contributors with a healthy community climate. IEEE Software, 41(3), 49-56.', doi: '10.1109/MS.2024.3362657' },
          ]}
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2"><Heart className="h-5 w-5" />Culture Score</span>
              <span className="font-mono text-2xl">{cga?.culture ?? 0}<span className="text-sm text-muted-foreground">/100</span></span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Contributor Diversity</span><span className="font-mono">{details?.contributorDiversity ?? 0}/100</span></div>
              <Progress value={details?.contributorDiversity ?? 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Code of Conduct</span><span className="font-mono">{details?.codeOfConduct ?? 0}/100</span></div>
              <Progress value={details?.codeOfConduct ?? 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Contributor Count</span><span className="font-mono">{details?.contributorCount ?? 0}/100</span></div>
              <Progress value={details?.contributorCount ?? 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ContributorPieChart contributors={contributors} />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.15}>
          <Card>
            <CardHeader><CardTitle className="text-base">Contributor Risk Index</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg bg-accent/30">
                <span className="text-sm">Bus Factor</span>
                <span className="font-mono font-bold text-lg">{cri?.busFactor ?? 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-accent/30">
                <span className="text-sm">Top Contributor Risk</span>
                <Badge variant={cri?.topContributorRisk === 'critical' || cri?.topContributorRisk === 'high' ? 'destructive' : 'secondary'}>
                  {cri?.topContributorRisk ?? 'unknown'}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-accent/30">
                <span className="text-sm">CR4 Concentration</span>
                <span className="font-mono">{Math.round(cri?.concentrationRatio ?? 0)}%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-accent/30">
                <span className="text-sm">Total Contributors</span>
                <span className="font-mono">{(contributors ?? []).length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Bus factor = minimum contributors accounting for 50% of all commits. A bus factor of 1 means the project depends on a single person.</p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
