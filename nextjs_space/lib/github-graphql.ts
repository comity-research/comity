// GitHub GraphQL API utilities

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

async function graphqlQuery(query: string, variables: Record<string, any>, token: string) {
  const res = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error: ${res.status} - ${text}`);
  }
  const data = await res.json();
  if (data?.errors?.[0]) {
    throw new Error(`GraphQL error: ${data.errors[0].message}`);
  }
  return data?.data;
}

export async function fetchRepoInfo(owner: string, repo: string, token: string) {
  const query = `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        name
        owner { login }
        description
        stargazerCount
        forkCount
        primaryLanguage { name }
        licenseInfo { spdxId name }
        createdAt
        updatedAt
        defaultBranchRef { name }
        codeOfConduct { name }
        contributingGuidelines { body }
        issueTemplates { name }
        pullRequestTemplates { body }
      }
    }
  `;
  const data = await graphqlQuery(query, { owner, repo }, token);
  const r = data?.repository;
  if (!r) throw new Error('Repository not found');
  return {
    name: r.name,
    owner: r.owner?.login,
    description: r.description,
    stargazerCount: r.stargazerCount ?? 0,
    forkCount: r.forkCount ?? 0,
    primaryLanguage: r.primaryLanguage?.name ?? null,
    license: r.licenseInfo?.spdxId ?? r.licenseInfo?.name ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    defaultBranch: r.defaultBranchRef?.name ?? 'main',
    hasCodeOfConduct: !!r.codeOfConduct,
    hasContributing: !!r.contributingGuidelines?.body,
    hasIssueTemplates: (r.issueTemplates?.length ?? 0) > 0,
    hasPullRequestTemplate: (r.pullRequestTemplates?.length ?? 0) > 0,
  };
}

export async function fetchContributors(owner: string, repo: string, token: string) {
  // Use REST API for contributors as GraphQL doesn't have a direct endpoint
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`, {
    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' },
  });
  if (!res.ok) return [];
  const contributors = await res.json();
  return (contributors ?? []).map((c: any) => ({
    login: c?.login ?? 'unknown',
    commits: c?.contributions ?? 0,
    avatarUrl: c?.avatar_url ?? '',
    additions: 0,
    deletions: 0,
    prs: 0,
    reviews: 0,
    issues: 0,
  }));
}

export async function fetchPullRequests(owner: string, repo: string, token: string, count: number = 100) {
  const query = `
    query($owner: String!, $repo: String!, $count: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequests(last: $count, states: [MERGED, CLOSED, OPEN]) {
          nodes {
            number
            title
            state
            createdAt
            mergedAt
            closedAt
            author { login }
            mergedBy { login }
            reviews(first: 10) {
              nodes {
                author { login }
                submittedAt
                state
              }
            }
            commits { totalCount }
          }
        }
      }
    }
  `;
  const data = await graphqlQuery(query, { owner, repo, count }, token);
  return data?.repository?.pullRequests?.nodes ?? [];
}

export async function fetchCommitHistory(owner: string, repo: string, token: string) {
  const query = `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 100) {
                nodes {
                  committedDate
                  additions
                  deletions
                  author {
                    user { login }
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await graphqlQuery(query, { owner, repo }, token);
  const nodes = data?.repository?.defaultBranchRef?.target?.history?.nodes ?? [];
  return nodes.map((n: any) => ({
    date: n?.committedDate ?? '',
    additions: n?.additions ?? 0,
    deletions: n?.deletions ?? 0,
    author: n?.author?.user?.login ?? n?.author?.name ?? 'unknown',
  }));
}

export async function fetchForkNetwork(owner: string, repo: string, token: string) {
  const query = `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        forks(first: 50, orderBy: {field: STARGAZERS, direction: DESC}) {
          nodes {
            name
            owner { login }
            stargazerCount
            updatedAt
            defaultBranchRef {
              target {
                ... on Commit {
                  history { totalCount }
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await graphqlQuery(query, { owner, repo }, token);
  return (data?.repository?.forks?.nodes ?? []).map((f: any) => ({
    name: f?.name ?? '',
    owner: f?.owner?.login ?? '',
    stargazerCount: f?.stargazerCount ?? 0,
    updatedAt: f?.updatedAt ?? '',
    defaultBranchRef: f?.defaultBranchRef,
  }));
}

export async function fetchIssues(owner: string, repo: string, token: string) {
  const query = `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        issues(last: 100, states: [OPEN, CLOSED]) {
          nodes {
            number
            title
            state
            createdAt
            closedAt
            author { login }
            comments { totalCount }
            labels(first: 5) { nodes { name } }
          }
        }
      }
    }
  `;
  const data = await graphqlQuery(query, { owner, repo }, token);
  return data?.repository?.issues?.nodes ?? [];
}
