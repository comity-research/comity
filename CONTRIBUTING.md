# Contributing to comity

Thanks for considering a contribution. `comity` is the software instrument for an in-progress doctoral thesis at the Centre for Architecture Education, University College Cork, on firm engagement with open source communities of practice. The project is small and the standards are tight. The notes below should make it easy to land a useful change.

## Filing an issue

Open an issue before you write code for anything beyond a typo fix or a small bug. The issue names the problem, the expected behaviour, and the reproduction steps where relevant. For research-data questions (which signals the tool reads, how affiliation is resolved, how a query is shaped), please link the GitHub object or schema field you are asking about, and the line of the data model that frames it.

Two issue templates are provided in `.github/ISSUE_TEMPLATE/`:

- `bug_report.md` for defects and regressions.
- `feature_request.md` for new capabilities.

## Pull requests

One change per pull request. Keep the diff focused. The PR description explains the motivation in two or three sentences and links the issue it closes.

Before opening a PR:

1. Run the test suite locally and confirm it passes.
2. Add or update tests for any behaviour you changed.
3. Update the schema documentation if you touched the data model.
4. Run the project linter and formatter.
5. Run the voice self-check on any prose you edited (see below).

A maintainer reviews within a week. If the change touches the Prisma schema, the affiliation-resolution logic, the governance scoring framework, or the twin citation system, expect a longer discussion.

## Fork and branch workflow

1. Fork the repository on GitHub.
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/comity.git`.
3. Create a branch: `git checkout -b feature/your-feature-name` or `fix/short-description`.
4. Make changes and commit with clear messages (see commit conventions below).
5. Push to your fork: `git push origin feature/your-feature-name`.
6. Open a pull request against the `main` branch of `comity-research/comity`.

## Development setup

```bash
cd nextjs_space
yarn install
cp .env.example .env
# Edit .env: DATABASE_URL and NEXTAUTH_SECRET
yarn prisma generate
yarn prisma db push
yarn prisma db seed
yarn dev
```

The dev server runs at `http://localhost:3000`. Sign in with the seeded admin account, then add a GitHub PAT at `/settings` so the GraphQL queries have an identity to attach to.

For database changes, edit `nextjs_space/prisma/schema.prisma`, run `yarn prisma generate`, and either `yarn prisma db push` (development) or generate a migration with `yarn prisma migrate dev --name short_description` (when migrations are introduced).

## Commit messages

Use clear, descriptive commit messages. Conventional prefixes welcome but not enforced:

- `feat: add fork ecosystem visualization`
- `fix: correct HHI calculation for edge cases`
- `docs: update API documentation`
- `refactor: extract governance scoring logic`
- `chore: bump prisma to 6.7.1`

Every commit message ends with an `Assisted-By:` trailer when an AI assistant helped:

```
Assisted-By: Claude Opus 4.7 <noreply@anthropic.com>
```

Never use `Co-Authored-By:` for AI assistants. The model assists; it is not an author.

## Code style

- TypeScript with strict typing throughout the Next.js app. Avoid `any`; prefer narrow types and discriminated unions.
- Optional chaining (`?.`) and nullish coalescing (`??`) over manual null checks.
- Use the canonical UI components from `components/ui/` and follow `nextjs_space/STYLE_GUIDE.md` for layout, typography, colour, and spacing.
- Prisma queries: use `select` to limit returned fields when the consumer needs a subset; avoid `include` cascades that pull more than needed.

## Code of conduct

The project follows the [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Be patient, be specific, assume good faith. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for the full text and enforcement procedure.

## Voice rules for prose

Documentation, commit messages, PR descriptions, slide content, and any other prose surfaced from this repository follow the voice rules of the parent thesis. The short version:

- No em-dashes (U+2014) and no en-dashes (U+2013).
- No "X, not Y" or "not X, but Y" contrasts.
- No "rather than" or "instead of" in descriptive writing.
- No hedging qualifiers (however, moreover, furthermore, indeed, importantly, notably, it is worth noting).
- No aspirational abstractions (transformative, leverage, unlock, harness in the aspirational sense, foster, holistic, synergy, paradigm shift).
- No banned everyday clichés (delve, utilise / utilize, facilitate, straightforward, genuinely, honestly).
- Plain words, specific examples, short sentences mixed with longer ones.
- Default to academic English (Ireland): colour, analyse, organise, programme, licence.

Run these greps against any prose file you touch and fix every match before opening a PR:

```bash
grep -P "[\xe2\x80\x93\xe2\x80\x94]" <files>
grep -nE "not .*, but |, not |rather than|instead of|however|moreover|furthermore" <files>
grep -nE "transformative|leverage|empower|holistic|synergistic|harness|unlock|delve|utili[sz]e|facilitate|straightforward|genuinely|honestly" <files>
```

## Citation discipline

For research-class output, every cited source resolves to a real publication with a DOI or a stable URL. Never fabricate references, DOIs, or publication details. For visualisations and analysis blocks, the twin citation rule applies: a Seminal foundation work paired with a Current operationalisation, formatted in APA 7. The Current source engages the Seminal source on the specific claim the visualisation advances.

## Licensing of contributions

By submitting a contribution you agree that your work is licensed under the Apache License, Version 2.0, the same licence as the project. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
