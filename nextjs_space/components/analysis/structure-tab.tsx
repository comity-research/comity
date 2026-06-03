'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FadeIn } from '@/components/ui/animate';
import { CitationBlock } from './citation-block';
import { FileText, Shield, CheckCircle2, XCircle } from 'lucide-react';

export function StructureTab({ analysis }: { analysis: any }) {
  const cga = analysis?.cga ?? {};
  const details = cga?.details?.structure ?? {};
  const docs = analysis?.governanceDocs ?? {};
  const branchRules = analysis?.branchRules ?? {};
  const rules = (branchRules?.rules ?? [])[0] ?? {};

  const docItems = [
    { name: 'Code of Conduct', key: 'hasCodeOfConduct', present: docs?.hasCodeOfConduct },
    { name: 'Contributing Guide', key: 'hasContributing', present: docs?.hasContributing },
    { name: 'Issue Templates', key: 'hasIssueTemplates', present: docs?.hasIssueTemplates },
    { name: 'PR Template', key: 'hasPullRequestTemplate', present: docs?.hasPullRequestTemplate },
    { name: 'License', key: 'license', present: !!docs?.license },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <CitationBlock
          explanation="Structure captures the formal artefacts a project maintains to define rules of engagement: governance documentation, contribution guidelines, branch protection, and licensing. Projects scoring high on structure have explicit, discoverable norms that lower barriers for new contributors and reduce ambiguity in decision-making."
          citations={[
            { label: 'Seminal', text: 'Fogel, K. (2005). Producing Open Source Software: How to Run a Successful Free Software Project. O\'Reilly Media.' },
            { label: 'Latest', text: 'Trinkenreich, B., Wiese, I., Gerosa, M.A. & Steinmacher, I. (2024). Hidden figures: Roles and pathways of successful OSS contributors. Empirical Software Engineering, 29, 109.', doi: '10.1007/s10664-024-10467-7' },
          ]}
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2"><FileText className="h-5 w-5" />Structure Score</span>
              <span className="font-mono text-2xl">{cga?.structure ?? 0}<span className="text-sm text-muted-foreground">/100</span></span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Documentation</span><span className="font-mono">{details?.documentation ?? 0}/100</span></div>
              <Progress value={details?.documentation ?? 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Branch Protection</span><span className="font-mono">{details?.branchProtection ?? 0}/100</span></div>
              <Progress value={details?.branchProtection ?? 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader><CardTitle className="text-base">Governance Documents</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {docItems.map((doc) => (
                  <div key={doc.key} className="flex items-center justify-between p-2 rounded-lg bg-accent/30">
                    <span className="text-sm">{doc.name}</span>
                    {doc.present ? (
                      <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Found</Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Missing</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.15}>
          <Card>
            <CardHeader><CardTitle className="text-base">Branch Protection ({branchRules?.defaultBranch ?? 'main'})</CardTitle></CardHeader>
            <CardContent>
              {Object.keys(rules ?? {}).length === 0 ? (
                <p className="text-sm text-muted-foreground">No branch protection rules found. Branch protection reduces the risk of unreviewed code reaching production.</p>
              ) : (
                <div className="space-y-2">
                  {[
                    { label: 'Requires Approving Reviews', key: 'requiresApprovingReviews' },
                    { label: 'Required Approving Count', key: 'requiredApprovingReviewCount', isNumber: true },
                    { label: 'Requires Status Checks', key: 'requiresStatusChecks' },
                    { label: 'Requires Code Owner Reviews', key: 'requiresCodeOwnerReviews' },
                    { label: 'Admin Enforced', key: 'isAdminEnforced' },
                    { label: 'Requires Commit Signatures', key: 'requiresCommitSignatures' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-2 rounded-lg bg-accent/30">
                      <span className="text-sm">{item.label}</span>
                      {item.isNumber ? (
                        <span className="font-mono text-sm">{rules?.[item.key] ?? 0}</span>
                      ) : (
                        rules?.[item.key] ? (
                          <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Yes</Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" /> No</Badge>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
