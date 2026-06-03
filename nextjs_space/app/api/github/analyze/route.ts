export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { fetchRepoInfo, fetchContributors, fetchPullRequests, fetchCommitHistory, fetchForkNetwork } from '@/lib/github-graphql';
import { calculateHHI, calculateCRI, calculateMergeAuthority, analyzePRs } from '@/lib/contributor-analysis';
import { calculateGovernanceDimensions } from '@/lib/dimensions-framework';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { owner, repo } = body ?? {};
    if (!owner || !repo) {
      return NextResponse.json({ error: 'Owner and repo required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { githubToken: true } });
    const token = user?.githubToken;
    if (!token) {
      return NextResponse.json({ error: 'GitHub token not configured. Please add your GitHub Personal Access Token in Settings.' }, { status: 400 });
    }

    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        repoOwner: owner,
        repoName: repo,
        repoFullName: `${owner}/${repo}`,
        status: 'running',
      },
    });

    try {
      const [repoInfo, contributors, prs, commits, forks] = await Promise.all([
        fetchRepoInfo(owner, repo, token),
        fetchContributors(owner, repo, token),
        fetchPullRequests(owner, repo, token),
        fetchCommitHistory(owner, repo, token),
        fetchForkNetwork(owner, repo, token),
      ]);

      const hhi = calculateHHI(contributors);
      const cri = calculateCRI(contributors);
      const mergeAuthority = calculateMergeAuthority(prs);
      const prAnalysis = analyzePRs(prs);
      const timeline = buildTimeline(commits);
      const { nodes: networkNodes, links: networkLinks } = buildContributorNetwork(prs, contributors);

      const analysisData: any = {
        hhi, cri, mergeAuthority, prAnalysis,
        contributors, timeline, forks,
        networkNodes, networkLinks, repoInfo,
      };
      const cga = calculateGovernanceDimensions(analysisData);
      analysisData.cga = cga;

      const summary = generateSummary(repoInfo, hhi, cri, cga, prAnalysis);

      const updated = await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'completed',
          hhiScore: hhi.score,
          hhiRisk: hhi.risk,
          cri: cri as any,
          cga: cga as any,
          mergeAuthority: mergeAuthority as any,
          contributors: contributors as any,
          governanceDocs: {
            hasCodeOfConduct: repoInfo?.hasCodeOfConduct ?? false,
            hasContributing: repoInfo?.hasContributing ?? false,
            hasIssueTemplates: repoInfo?.hasIssueTemplates ?? false,
            hasPullRequestTemplate: repoInfo?.hasPullRequestTemplate ?? false,
            license: repoInfo?.license ?? null,
          } as any,
          prAnalysis: prAnalysis as any,
          branchRules: {} as any,
          rawData: analysisData as any,
          summary,
        },
      });

      return NextResponse.json(updated);
    } catch (apiError: any) {
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: { status: 'failed', summary: apiError?.message ?? 'Analysis failed' },
      });
      return NextResponse.json({ error: apiError?.message ?? 'Analysis failed' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: error?.message ?? 'Internal error' }, { status: 500 });
  }
}

function buildTimeline(commits: any[]) {
  const safe = commits ?? [];
  const grouped: Record<string, { commits: number; additions: number; deletions: number }> = {};
  for (const c of safe) {
    const date = (c?.date ?? '').slice(0, 10);
    if (!date) continue;
    if (!grouped[date]) grouped[date] = { commits: 0, additions: 0, deletions: 0 };
    grouped[date].commits++;
    grouped[date].additions += c?.additions ?? 0;
    grouped[date].deletions += c?.deletions ?? 0;
  }
  return Object.entries(grouped)
    .map(([date, data]: [string, any]) => ({ date, ...data }))
    .sort((a: any, b: any) => a.date.localeCompare(b.date));
}

function buildContributorNetwork(prs: any[], contributors: any[]) {
  const nodes: Record<string, { id: string; name: string; val: number; group: string }> = {};
  const linkMap: Record<string, number> = {};

  for (const c of (contributors ?? [])) {
    const login = c?.login ?? '';
    if (login) nodes[login] = { id: login, name: login, val: c?.commits ?? 1, group: 'contributor' };
  }

  for (const pr of (prs ?? [])) {
    const author = pr?.author?.login;
    const reviewers = (pr?.reviews?.nodes ?? []).map((r: any) => r?.author?.login).filter(Boolean);
    if (author) {
      if (!nodes[author]) nodes[author] = { id: author, name: author, val: 1, group: 'contributor' };
      for (const reviewer of reviewers) {
        if (reviewer === author) continue;
        if (!nodes[reviewer]) nodes[reviewer] = { id: reviewer, name: reviewer, val: 1, group: 'reviewer' };
        const key = [author, reviewer].sort().join('::');
        linkMap[key] = (linkMap[key] ?? 0) + 1;
      }
    }
  }

  const links = Object.entries(linkMap).map(([key, value]: [string, number]) => {
    const [source, target] = key.split('::');
    return { source, target, value };
  });

  return { nodes: Object.values(nodes), links };
}

function generateSummary(repoInfo: any, hhi: any, cri: any, cga: any, prAnalysis: any): string {
  const parts: string[] = [];
  parts.push(`${repoInfo?.owner ?? ''}/${repoInfo?.name ?? ''} is a ${repoInfo?.primaryLanguage ?? 'multi-language'} project`);
  if (repoInfo?.license) parts.push(`licensed under ${repoInfo.license}`);
  parts.push(`with ${hhi?.totalContributors ?? 0} contributors.`);
  parts.push(`The HHI score is ${hhi?.score ?? 0} (${hhi?.risk ?? 'unknown'} concentration risk).`);
  parts.push(`Bus factor: ${cri?.busFactor ?? 0}.`);
  parts.push(`Governance score: Structure ${cga?.structure ?? 0}/100, Process ${cga?.process ?? 0}/100, Culture ${cga?.culture ?? 0}/100.`);
  if (prAnalysis?.medianReviewTime) parts.push(`Median PR review time: ${prAnalysis.medianReviewTime}h.`);
  return parts.join(' ');
}
