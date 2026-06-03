# Comity (application source)

This directory contains the application source code. See the [root README](../README.md) for full documentation.

## Quick reference

```bash
yarn install          # Install dependencies
yarn prisma generate  # Generate Prisma client
yarn dev              # Start dev server on :3000
```

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for session signing |

Your GitHub PAT is stored per-user in the database via `/settings`.

## Licence

Apache-2.0. See [LICENSE](../LICENSE).
