'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FadeIn } from '@/components/ui/animate';
import { GovernanceRadar } from '@/components/charts/governance-radar';
import { CitationBlock } from './citation-block';
import { BarChart3, Shield, Users, GitMerge, AlertTriangle, TrendingUp } from 'lucide-react';

export function OverviewTab({ analysis }: { analysis: any }) {
  const cga = analysis?.cga ?? {};
  const cri = analysis?.cri ?? {};
  const repoInfo = analysis?.rawData?.repoInfo ?? {};

  return (
    <div className="space-y-6">
      <FadeIn>
        <CitationBlock
          explanation="This overview applies the Herfindahl-Hirschman Index (HHI), originally an antitrust measure for market concentration, to contributor commits. A high HHI signals single-vendor dominance and elevated bus-factor risk. The 3-D governance framework scores Structure (documentation, branch rules), Process (PR latency, merge practices), and Culture (contributor diversity, community norms)."
          citations={[
            { label: 'Seminal', text: 'Cosentino, V., Izquierdo, J.L.C. & Cabot, J. (2017). A systematic mapping study of software development with GitHub. IEEE Access, 5, 7173-7192.', doi: '10.1109/ACCESS.2017.2682323' },
            { label: 'Latest', text: 'Eghbal, N. (2020). Working in Public: The Making and Maintenance of Open Source Software. Stripe Press.' },
          ]}
        />
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FadeIn>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">HHI Score</p>
                  <p className="text-3xl font-bold font-mono">{analysis?.hhiScore ?? 0}</p>
                </div>
              </div>
              <Badge variant={analysis?.hhiRisk === 'high' ? 'destructive' : analysis?.hhiRisk === 'moderate' ? 'secondary' : 'default'}>
                {analysis?.hhiRisk ?? 'unknown'} concentration risk
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                HHI &lt; 1500 = Low, 1500-2500 = Moderate, &gt; 2500 = High
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bus Factor</p>
                  <p className="text-3xl font-bold font-mono">{cri?.busFactor ?? 0}</p>
                </div>
              </div>
              <Badge variant={cri?.topContributorRisk === 'critical' || cri?.topContributorRisk === 'high' ? 'destructive' : 'secondary'}>
                Top contributor risk: {cri?.topContributorRisk ?? 'unknown'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                CR4: {cri?.concentrationRatio ?? 0}% of all commits from top contributors
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Overall Score</p>
                  <p className="text-3xl font-bold font-mono">{cga?.overall ?? 0}<span className="text-base text-muted-foreground">/100</span></p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span>Structure</span><span className="font-mono">{cga?.structure ?? 0}</span></div>
                <Progress value={cga?.structure ?? 0} className="h-1.5" />
                <div className="flex justify-between text-xs"><span>Process</span><span className="font-mono">{cga?.process ?? 0}</span></div>
                <Progress value={cga?.process ?? 0} className="h-1.5" />
                <div className="flex justify-between text-xs"><span>Culture</span><span className="font-mono">{cga?.culture ?? 0}</span></div>
                <Progress value={cga?.culture ?? 0} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.15}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Governance Dimensions (3-D)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <GovernanceRadar data={[
                { dimension: 'Structure', score: cga?.structure ?? 0 },
                { dimension: 'Process', score: cga?.process ?? 0 },
                { dimension: 'Culture', score: cga?.culture ?? 0 },
              ]} />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {repoInfo?.name && (
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Repository Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><p className="text-xs text-muted-foreground">Stars</p><p className="font-mono font-medium">{repoInfo?.stargazerCount ?? 0}</p></div>
                <div><p className="text-xs text-muted-foreground">Forks</p><p className="font-mono font-medium">{repoInfo?.forkCount ?? 0}</p></div>
                <div><p className="text-xs text-muted-foreground">Language</p><p className="font-medium">{repoInfo?.primaryLanguage ?? 'N/A'}</p></div>
                <div><p className="text-xs text-muted-foreground">License</p><p className="font-medium">{repoInfo?.license ?? 'N/A'}</p></div>
                <div><p className="text-xs text-muted-foreground">Default Branch</p><p className="font-mono font-medium">{repoInfo?.defaultBranch ?? 'main'}</p></div>
                <div><p className="text-xs text-muted-foreground">Code of Conduct</p><p className="font-medium">{repoInfo?.hasCodeOfConduct ? 'Present' : 'Missing'}</p></div>
                <div><p className="text-xs text-muted-foreground">Contributing Guide</p><p className="font-medium">{repoInfo?.hasContributing ? 'Present' : 'Missing'}</p></div>
                <div><p className="text-xs text-muted-foreground">Issue Templates</p><p className="font-medium">{repoInfo?.hasIssueTemplates ? 'Present' : 'Missing'}</p></div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
