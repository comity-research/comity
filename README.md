# comity

> A GraphQL lens on comity between firms and open source communities of practice.

[![Licence: Apache 2.0](https://img.shields.io/badge/licence-Apache_2.0-blue.svg)](LICENSE)
[![Status: early](https://img.shields.io/badge/status-early-orange.svg)](#status)

## What it does

`comity` reads firm engagement signals from the GitHub GraphQL API. Given a repository or a list of repositories, it returns a structured view of who contributes, on whose time, through what review paths, and with what standing. The output is shaped for two questions:

- How do firms participate in this community of practice?
- How does the community recognise that participation?

## Who it is for

Researchers studying open source governance who want a reproducible extraction layer above the GitHub GraphQL endpoint. OSPO staff and engineering leaders who want to read the governance posture of projects their teams depend on, with the same lens a researcher would use.

## What "comity" means

Comity is the courteous recognition one community extends to another's standing. In international law it names the reciprocal recognition between jurisdictions; in everyday English it names the civility that holds between groups who acknowledge each other. The tool reads the patterns that recognition leaves in the GitHub record when firms and open source communities meet at the boundary of practice.

## Status

Early. The schema is shaped against the research questions of an in-progress doctoral thesis at the intersection of software engineering and information systems. Expect breaking changes through 0.x. A first tagged release will land alongside the methodology chapter.

## Install

```bash
git clone https://github.com/comity-research/comity.git
cd comity
# install steps for your stack land with the first tagged release
```

## Quick start

You will need a GitHub Personal Access Token with at least `public_repo` scope. Set it as an environment variable.

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

A worked example for a single repository will be added to `examples/` with the first tagged release.

## Data model

The schema lives in `schema/`. Three top-level types frame the model:

- `Contributor`. A person or bot account, with affiliations resolved from organisation membership, email domain, and self-declared employer where present.
- `Engagement`. A unit of participation: a commit, a pull request, a review, a discussion comment, an issue triage action.
- `Standing`. The recognition signal: maintainer status, code-owner status, review approval weight, merge authority.

Affiliation resolution is intentionally conservative. The tool reports the signals it can see; it does not infer employment from name patterns.

## Reproducibility

Every query the tool issues is logged with a timestamp and a hash. Re-runs against the same repository and time window produce the same dataset. The provenance log is the audit trail for any figure derived from the tool.

## Citation

If you use `comity` in research, please cite:

> Tabbal, M. (2026). *comity: a GraphQL lens on firm engagement with open source communities of practice* [Computer software]. https://github.com/comity-research/comity

A `CITATION.cff` file will land with the first tagged release.

## Contributing

Issues and pull requests are welcome. For substantial changes, please open an issue first to discuss the design. The project follows the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

## Licence

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
