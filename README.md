# comity

> A GraphQL lens on comity between firms and open source communities of practice.

[![Licence: Apache 2.0](https://img.shields.io/badge/licence-Apache_2.0-blue.svg)](LICENSE)
[![Status: early](https://img.shields.io/badge/status-early-orange.svg)](#status)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

`comity` reads firm engagement signals from the GitHub GraphQL API and returns a structured view of how firms participate in open source communities of practice, and how those communities recognise that participation. Built at the Centre for Architecture Education (CCAE), University College Cork, as part of the candidate's doctoral research on firm engagement with open source software development communities of practice. The application originally ran at `comity.abacusai.app` on the Abacus.AI Apps platform and has been migrated to a self-hostable Next.js codebase.

## What it does

Given a GitHub repository or a list of repositories, `comity` returns:

- Who contributes, on whose time, through what review paths, and with what standing.
- A 3-D governance scoring framework: Structure, Process, Culture, each with measurable sub-dimensions.
- HHI (Herfindahl-Hirschman Index) for contributor concentration risk, paired with a CRI (Contributor Risk Index).
- PR review latency distributions and merge authority analysis.
- Force-directed contributor collaboration networks.
- Fork ecosystem activity and divergence patterns.
- Side-by-side comparison across multiple projects with no project limit.
- A preset corpus of 57+ open source projects spanning corporate-backed, foundation-led, and volunteer-driven governance models.
- Twin scholarly citations (Seminal beside Latest, APA 7 with verified DOIs) on every visualisation.

The output is shaped for two questions: how do firms participate in this community of practice, and how does the community recognise that participation?

## Who it is for

Researchers studying open source governance who want a reproducible extraction layer above the GitHub GraphQL endpoint. OSPO staff and engineering leaders who want to read the governance posture of projects their teams depend on, with the same lens a researcher would use.

## What "comity" means

Comity is the courteous recognition one community extends to another's standing. In international law it names the reciprocal recognition between jurisdictions; in everyday English it names the civility that holds between groups who acknowledge each other. The tool reads the patterns that recognition leaves in the GitHub record when firms and open source communities meet at the boundary of practice.

## Status

Early. The schema is shaped against the research questions of an in-progress doctoral thesis at the intersection of software engineering and information systems. Expect breaking changes through 0.x. A first tagged release lands alongside the methodology chapter.

## Prerequisites

- Node.js 18 or later, and Yarn 1.x.
- PostgreSQL 14 or later (a managed instance or local install both work).
- A GitHub Personal Access Token (classic) with `repo` and `read:org` scopes for analysing private repositories; `public_repo` is enough for public-only work.

## Quickstart

```bash
# Clone
git clone https://github.com/comity-research/comity.git
cd comity/nextjs_space

# Install
yarn install

# Configure environment
cp .env.example .env
# Edit .env, set DATABASE_URL to your PostgreSQL connection string,
# and generate NEXTAUTH_SECRET with: openssl rand -base64 32

# Database
yarn prisma generate
yarn prisma db push

# Seed the admin user
yarn prisma db seed

# Run
yarn dev
```

Open `http://localhost:3000`, sign in with the seeded admin account, then add your GitHub Personal Access Token at `/settings`.

## Architecture

```
+-------------------+      +--------------------+      +--------------------+
|     Frontend      |----->|     API routes     |----->|     PostgreSQL     |
|  (React, Next.js) |      |  (Next.js 14 app)  |      |   (via Prisma)     |
+-------------------+      +---------+----------+      +--------------------+
                                     |
                                     v
                          +----------+----------+
                          |   GitHub GraphQL    |
                          |        API          |
                          +---------------------+
```

### Key directories

| Path | Purpose |
|---|---|
| `nextjs_space/app/` | Pages and API routes (Next.js 14 App Router) |
| `nextjs_space/components/analysis/` | Analysis tab components with citation blocks |
| `nextjs_space/components/charts/` | Recharts and Plotly visualisations |
| `nextjs_space/lib/` | Core logic: GraphQL queries, HHI, CRI, governance scoring |
| `nextjs_space/prisma/` | Database schema and migrations |
| `nextjs_space/scripts/` | Seed scripts (safe-seed.ts) |
| `.github/` | Issue and PR templates |
| `ROADMAP.md` | Planned phases and feature backlog |

## Data model, at the level of the schema

Three top-level primitives frame the data model in `nextjs_space/prisma/schema.prisma`:

- `User`, `Account`, `Session`, `VerificationToken`. NextAuth schema for credentials-based authentication. Each `User` carries a per-account `githubToken` for GraphQL queries against GitHub.
- `Analysis`. A unit of work: one repository, at one time, with the resulting HHI score, CRI, CGA, merge-authority breakdown, contributor list, governance docs audit, PR analysis, and branch rules. The `summary` field carries the plain-language explanation.
- `PresetProject`, `Bookmark`. The preset corpus, plus user-curated bookmarks.

Two further models support the research workflow:

- `MethodologyPhase`, `DmpSection`, `BibliographyEntry`, `Recommendation`, `SurveyDraft`. Research scaffolding used during dissertation work.

Affiliation resolution is intentionally conservative. The tool reports the signals it can see (organisation membership, email domain where present, self-declared employer). It does not infer employment from name patterns.

## Pages

| Route | Purpose |
|---|---|
| `/` | Dashboard with recent analyses and summary statistics |
| `/analyze` | Run governance analysis on any GitHub repository (eight tabs) |
| `/comparison` | Compare governance metrics across multiple projects |
| `/projects` | Browse, search, and manage the preset corpus |
| `/settings` | Manage GitHub PAT and user preferences |
| `/admin` | User approval and management (admin only) |

## Analysis tabs

Each tab renders a visualisation, a plain-language explanation, and twin scholarly citations.

1. **Overview**. Radar chart of 3-D scores, contributor pie chart, headline metrics.
2. **Structure**. Governance documentation audit (CODE_OF_CONDUCT, CONTRIBUTING, templates, branch protection).
3. **Process**. PR merge rates, review latency, issue resolution.
4. **Culture**. Contributor diversity, HHI concentration, community signals.
5. **Timeline**. Commit cadence and activity trends.
6. **Forks**. Fork count, activity, and divergence.
7. **Latency**. PR review time distributions.
8. **Network graph**. Force-directed contributor collaboration.

## Auth flow

Credentials-based authentication with admin approval:

1. User signs up with email and password.
2. Account lands in `pending` state.
3. Admin approves or rejects via `/admin`.
4. Approved users access the full application.

## Reproducibility

Every GraphQL query the application issues against GitHub is logged with a timestamp and a query hash. Re-runs against the same repository and time window produce the same dataset. The provenance log is the audit trail for any figure derived from the tool.

## Citation

If you use `comity` in research, please cite:

> Tabbal, M. (2026). *comity: a GraphQL lens on firm engagement with open source communities of practice* [Computer software]. https://github.com/comity-research/comity

A `CITATION.cff` file at the repository root carries the canonical citation metadata, and the first tagged release will mint a Zenodo DOI to give every version a stable handle.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, the voice rules that apply to documentation and commits, and the development setup. The project follows the [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/), recorded in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the planned phases and feature backlog.

## Licence

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

## Provenance

The application source was originally developed on the Abacus.AI Apps platform, hosted at `comity.abacusai.app`. The codebase was exported on Wednesday 3 June 2026 and migrated to this repository for self-hosting and community contribution. The runtime script that bound the application to the Abacus platform has been removed in the open source release; restore it in `nextjs_space/app/layout.tsx` if you redeploy on Abacus.
