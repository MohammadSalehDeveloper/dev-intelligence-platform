# Architecture overview

This snapshot is the **frozen** layout. Agents must not change it without question, explanation, and approval. See `docs/agents/PROTOCOL.md`.

## Purpose

GitHub developer intelligence platform: a Next.js web app talks to a Fastify API. The API authenticates via GitHub OAuth, stores users in PostgreSQL (Prisma), and keeps sessions in Redis.

## Monorepo

pnpm workspaces (`apps/*`, `packages/*`, `services/*` allowed by `pnpm-workspace.yaml`; do not add new members without approval).

```
apps/web                 Presentation — Next.js 16, React 19, Tailwind
apps/api                 HTTP — Fastify 5, feature modules, plugins
packages/database        Persistence — Prisma client (`@dev-intelligence/database`)
infra/docker             PostgreSQL 16 (host 5533), Redis 7
docs/                    Architecture, features, commit explanations
```

## Layer rules

| Layer | May depend on | Must not depend on |
| --- | --- | --- |
| `apps/web` | HTTP API via `src/services` | Prisma, Fastify, Redis, `packages/database` |
| `apps/api` | `@dev-intelligence/database`, Redis, GitHub HTTP | Next.js, `apps/web` source |
| `packages/database` | Prisma / PostgreSQL | Fastify or React |
| `infra/docker` | Images and volumes only | Application source |

## API internals (current)

- `src/server.ts` — process entry, CORS, plugins, routes, `/health`
- `src/modules/<feature>/` — HTTP feature modules (today: `auth`)
- `src/plugins/` — Fastify plugins (cookies; Prisma plugin file exists)
- `src/lib/` — shared clients (Redis)

Prisma is used from the auth module via `@dev-intelligence/database`. Do not introduce repository/use-case folders unless approved.

## Web internals (current)

- `src/app/` — App Router pages and layout
- `src/components/`, `src/features/`, `src/hooks/`, `src/services/`, `src/store/`, `src/types/`

Keep pages thin; put feature UI in `features/` and HTTP in `services/`.

## Persistence

Canonical client package: `packages/database` (schema under `packages/database/prisma/`). There is also a root `prisma/` tree — treat dual schemas as existing debt. Do not “fix” or merge them without approval.

## Known non-goals for unsolicited refactors

- Splitting API into clean-architecture directories
- Adding `services/*` microservices
- New auth stacks, queues, or extra databases
- Merging or deleting Prisma schema copies
