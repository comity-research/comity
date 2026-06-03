import { ContributorData, HHIResult, CRIResult, MergeAuthorityResult } from './types';

export function calculateHHI(contributors: any[]): any {
  const safe = contributors ?? [];
  if (safe.length === 0) return { score: 0, risk: 'unknown', topContributors: [], totalContributors: 0 };
  const totalCommits = safe.reduce((sum: number, c: any) => sum + (c?.commits ?? c?.contributions ?? 0), 0);
  if (totalCommits === 0) return { score: 0, risk: 'unknown', topContributors: [], totalContributors: safe.length };
  const shares = safe.map((c: any) => ({
    login: c?.login ?? 'unknown',
    share: (c?.commits ?? c?.contributions ?? 0) / totalCommits,
  }));
  const hhi = shares.reduce((sum: number, s: { share: number }) => sum + s.share * s.share, 0) * 10000;
  let risk = 'low';
  if (hhi > 2500) risk = 'high';
  else if (hhi > 1500) risk = 'moderate';
  const topContributors = shares.sort((a: { share: number }, b: { share: number }) => b.share - a.share).slice(0, 10);
  return { score: Math.round(hhi), risk, topContributors, totalContributors: safe.length, topContributorRisk: 'low', busFactor: 1 };
}

export function calculateCRI(contributors: any[]): any {
  const safe = contributors ?? [];
  if (safe.length === 0) return { busFactor: 0, topContributorShare: 0, top3Share: 0, distribution: [], concentrationRatio: 0, diversityIndex: 0, topContributorRisk: 'low' };
  const totalCommits = safe.reduce((sum: number, c: any) => sum + (c?.commits ?? c?.contributions ?? 0), 0);
  if (totalCommits === 0) return { busFactor: 0, topContributorShare: 0, top3Share: 0, distribution: [], concentrationRatio: 0, diversityIndex: 0, topContributorRisk: 'low' };
  const sorted = [...safe].sort((a: any, b: any) => ((b?.commits ?? b?.contributions ?? 0) - (a?.commits ?? a?.contributions ?? 0)));
  const distribution = sorted.map((c: any) => ({
    login: c?.login ?? 'unknown',
    percentage: (((c?.commits ?? c?.contributions ?? 0) / totalCommits) * 100),
  }));
  let cumulative = 0;
  let busFactor = 0;
  for (const c of sorted) {
    cumulative += (c?.commits ?? c?.contributions ?? 0) / totalCommits;
    busFactor++;
    if (cumulative >= 0.5) break; // Bus factor threshold
  }
  const topShare = distribution?.[0]?.percentage ?? 0;
  const top3Share = distribution.slice(0, 3).reduce((s: number, d: { percentage: number }) => s + (d?.percentage ?? 0), 0);
  
  let risk = 'low';
  if (topShare > 50) risk = 'critical';
  else if (topShare > 30) risk = 'high';
  else if (topShare > 15) risk = 'medium';

  return { busFactor, topContributorShare: topShare, top3Share, distribution: distribution.slice(0, 20), concentrationRatio: top3Share, diversityIndex: 100, topContributorRisk: risk };
}

export function calculateMergeAuthority(prs: any[]): MergeAuthorityResult {
  const safe = prs ?? [];
  const merged = safe.filter((pr: any) => pr?.mergedBy?.login);
  const mergerCounts: Record<string, number> = {};
  for (const pr of merged) {
    const login = pr?.mergedBy?.login ?? 'unknown';
    mergerCounts[login] = (mergerCounts[login] ?? 0) + 1;
  }
  const total = merged.length || 1;
  const mergers = Object.entries(mergerCounts)
    .map(([login, count]: [string, number]) => ({ login, count, percentage: (count / total) * 100 }))
    .sort((a: any, b: any) => b.count - a.count);
  const topShareSquared = mergers.reduce((s: number, m: any) => s + Math.pow((m?.percentage ?? 0) / 100, 2), 0);
  return { mergers: mergers.slice(0, 10), totalMerged: merged.length, concentration: topShareSquared * 10000 };
}

export function analyzePRs(prs: any[]) {
  const safe = prs ?? [];
  const merged = safe.filter((pr: any) => pr?.state === 'MERGED' && pr?.mergedAt && pr?.createdAt);
  const latencies = merged.map((pr: any) => {
    const created = new Date(pr.createdAt).getTime();
    const mergedAt = new Date(pr.mergedAt).getTime();
    return Math.max(0, (mergedAt - created) / (1000 * 60 * 60));
  }).filter((h: number) => isFinite(h));
  const sorted = [...latencies].sort((a: number, b: number) => a - b);
  const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
  const avg = sorted.length > 0 ? sorted.reduce((s: number, v: number) => s + v, 0) / sorted.length : 0;
  const reviewCounts = safe.map((pr: any) => {
    const reviewers = new Set((pr?.reviews?.nodes ?? []).map((r: any) => r?.author?.login).filter(Boolean));
    return reviewers.size;
  });
  const avgReviewers = reviewCounts.length > 0
    ? reviewCounts.reduce((s: number, v: number) => s + v, 0) / reviewCounts.length : 0;
  return {
    totalPRs: safe.length,
    mergedPRs: merged.length,
    avgReviewTime: Math.round(avg * 10) / 10,
    medianReviewTime: Math.round(median * 10) / 10,
    reviewLatencies: latencies,
    reviewersPerPR: Math.round(avgReviewers * 10) / 10,
  };
}
