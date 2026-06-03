export interface ContributorData {
  login: string;
  name?: string;
  commits: number;
  additions: number;
  deletions: number;
  prs: number;
  reviews: number;
  issues: number;
  affiliation?: string;
  avatarUrl?: string;
}

export interface HHIResult {
  score: number;
  risk: string;
  topContributors: { login: string; share: number }[];
  totalContributors: number;
}

export interface CRIResult {
  busFactor: number;
  topContributorShare: number;
  top3Share: number;
  distribution: { login: string; percentage: number }[];
}

export interface CGAResult {
  structure: number;
  process: number;
  culture: number;
  overall: number;
  details: Record<string, any>;
}

export interface MergeAuthorityResult {
  mergers: { login: string; count: number; percentage: number }[];
  totalMerged: number;
  concentration: number;
}

export interface PRAnalysisResult {
  totalPRs: number;
  mergedPRs: number;
  avgReviewTime: number;
  medianReviewTime: number;
  reviewLatencies: number[];
  reviewersPerPR: number;
}

export interface ForkData {
  name: string;
  owner: string;
  stargazerCount: number;
  updatedAt: string;
  defaultBranchRef?: any;
}

export interface TimelineEntry {
  date: string;
  commits: number;
  additions: number;
  deletions: number;
  author?: string;
}

export interface NetworkNode {
  id: string;
  name: string;
  val: number;
  color?: string;
  group?: string;
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number;
}

export interface AnalysisData {
  hhi?: HHIResult;
  cri?: CRIResult;
  cga?: CGAResult;
  mergeAuthority?: MergeAuthorityResult;
  contributors?: ContributorData[];
  prAnalysis?: PRAnalysisResult;
  timeline?: TimelineEntry[];
  forks?: ForkData[];
  networkNodes?: NetworkNode[];
  networkLinks?: NetworkLink[];
  repoInfo?: Record<string, any>;
}
