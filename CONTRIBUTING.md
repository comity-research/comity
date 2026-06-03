# Contributing to comity

Thanks for considering a contribution. `comity` is the software instrument for an in-progress doctoral thesis on firm engagement with open source communities of practice, so the project is small and the standards are tight. The notes below should make it easy to land a useful change.

## Filing an issue

Open an issue before you write code for anything beyond a typo fix or a small bug. The issue should name the problem, the expected behaviour, and the reproduction steps where relevant. For research-data questions (which signals the tool reads, how affiliation is resolved, how a query is shaped), please link the GitHub object or schema field you are asking about.

## Pull requests

One change per pull request. Keep the diff focused. The PR description should explain the motivation in two or three sentences and link the issue it closes.

Before opening a PR:

1. Run the test suite locally and confirm it passes.
2. Add or update tests for any behaviour you changed.
3. Update the schema documentation if you touched the data model.
4. Run the project linter and formatter.

A maintainer will review within a week. If the change touches the schema or the affiliation-resolution logic, expect a longer discussion.

## Code of conduct

The project follows the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) version 2.1. Be patient, be specific, assume good faith.

## Voice rules for prose

Documentation, commit messages, and PR descriptions in this repository follow the voice rules of the parent thesis. The short version:

- No em-dashes and no en-dashes.
- No "X, not Y" or "not X, but Y" contrasts.
- No "rather than" or "instead of" in descriptive writing.
- No hedging qualifiers (however, moreover, furthermore, indeed, importantly, notably).
- Plain words, specific examples, short sentences mixed with longer ones.

Run `grep -nP '\x{2014}|\x{2013}'` against any prose file you touch and fix every match.

## Licensing of contributions

By submitting a contribution you agree that your work is licensed under the Apache License, Version 2.0, the same licence as the project. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
