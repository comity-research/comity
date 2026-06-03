import { AnalysisData } from './types';

export function calculateGovernanceDimensions(data: AnalysisData) {
  const structure = calculateStructure(data);
  const process = calculateProcess(data);
  const culture = calculateCulture(data);
  const overall = Math.round((structure + process + culture) / 3);
  return {
    structure, process, culture, overall,
    details: {
      structure: getStructureDetails(data),
      process: getProcessDetails(data),
      culture: getCultureDetails(data),
    },
  };
}

function calculateStructure(data: AnalysisData): number {
  let score = 0;
  const ri = data?.repoInfo;
  if (ri?.hasCodeOfConduct) score += 20;
  if (ri?.hasContributing) score += 20;
  if (ri?.hasIssueTemplates) score += 15;
  if (ri?.hasPullRequestTemplate) score += 15;
  if (ri?.license) score += 15;
  const hhi = data?.hhi?.score ?? 10000;
  if (hhi < 1000) score += 15;
  else if (hhi < 2500) score += 10;
  else if (hhi < 5000) score += 5;
  return Math.min(100, score);
}

function calculateProcess(data: AnalysisData): number {
  let score = 0;
  const pr = data?.prAnalysis;
  if (pr) {
    if ((pr.reviewersPerPR ?? 0) >= 2) score += 25;
    else if ((pr.reviewersPerPR ?? 0) >= 1) score += 15;
    if ((pr.medianReviewTime ?? 999) < 48) score += 20;
    else if ((pr.medianReviewTime ?? 999) < 168) score += 10;
    if ((pr.mergedPRs ?? 0) > 0 && (pr.totalPRs ?? 0) > 0) {
      const mergeRate = pr.mergedPRs / pr.totalPRs;
      if (mergeRate > 0.7) score += 20;
      else if (mergeRate > 0.4) score += 10;
    }
  }
  const ma = data?.mergeAuthority;
  if (ma && (ma.concentration ?? 10000) < 2500) score += 20;
  else if (ma && (ma.concentration ?? 10000) < 5000) score += 10;
  const cri = data?.cri;
  if ((cri?.busFactor ?? 0) >= 3) score += 15;
  else if ((cri?.busFactor ?? 0) >= 2) score += 10;
  return Math.min(100, score);
}

function calculateCulture(data: AnalysisData): number {
  let score = 0;
  const contributors = data?.contributors ?? [];
  if (contributors.length >= 50) score += 25;
  else if (contributors.length >= 20) score += 20;
  else if (contributors.length >= 10) score += 15;
  else if (contributors.length >= 5) score += 10;
  if (data?.repoInfo?.hasCodeOfConduct) score += 20;
  if (data?.repoInfo?.hasContributing) score += 20;
  const pr = data?.prAnalysis;
  if ((pr?.reviewersPerPR ?? 0) >= 1.5) score += 20;
  else if ((pr?.reviewersPerPR ?? 0) >= 1) score += 10;
  const forks = data?.forks ?? [];
  if (forks.length >= 20) score += 15;
  else if (forks.length >= 5) score += 10;
  return Math.min(100, score);
}

function getStructureDetails(data: AnalysisData) {
  return {
    codeOfConduct: !!data?.repoInfo?.hasCodeOfConduct,
    contributingGuide: !!data?.repoInfo?.hasContributing,
    issueTemplates: !!data?.repoInfo?.hasIssueTemplates,
    prTemplate: !!data?.repoInfo?.hasPullRequestTemplate,
    license: data?.repoInfo?.license ?? 'None',
    hhiRisk: data?.hhi?.risk ?? 'unknown',
  };
}

function getProcessDetails(data: AnalysisData) {
  return {
    avgReviewTime: data?.prAnalysis?.avgReviewTime ?? 0,
    medianReviewTime: data?.prAnalysis?.medianReviewTime ?? 0,
    reviewersPerPR: data?.prAnalysis?.reviewersPerPR ?? 0,
    mergeConcentration: data?.mergeAuthority?.concentration ?? 0,
    busFactor: data?.cri?.busFactor ?? 0,
  };
}

function getCultureDetails(data: AnalysisData) {
  return {
    communitySize: (data?.contributors ?? []).length,
    forkCount: (data?.forks ?? []).length,
    hasCodeOfConduct: !!data?.repoInfo?.hasCodeOfConduct,
    hasContributing: !!data?.repoInfo?.hasContributing,
  };
}
