# Agent protocol

This file is the operating contract for every agent working in this repository.
Cursor rules in `.cursor/rules/` enforce the same gates. Long-form detail lives in `docs/agents/PROTOCOL.md`.

## Hard gates

1. **Do not commit.** Never run `git commit`, `git push`, `git amend`, or skip hooks. After work, propose a commit message only. The user commits.
2. **Do not change architecture without approval.** Do not alter layers, infrastructure, domain, persistence, workspace packages, apps, or folder topology until you have asked, explained impact, and received an explicit yes.
3. **Follow the stack and craft.** Clean Architecture, Clean Code, and Design Patterns. Presentation is React/Next.js (`apps/web`). API is Node.js/Fastify (`apps/api`). Persistence is Prisma/PostgreSQL (`packages/database`). Cache/session is Redis. Infra is `infra/docker`.
4. **Document every proposed commit.** Add `docs/commits/<YYYY-MM-DD>-<slug>.md` using `docs/templates/commit.md`.
5. **Document new work.** Features, layers, models, infra, and technologies get docs under `docs/` before you consider the task done.
6. **Test new work.** Unit tests for new functionality, features, stories, and infra. If a test runner is missing, ask before adding a package.

## Current layout (frozen)

```
apps/web          Presentation (Next.js App Router, React)
apps/api          HTTP/application (Fastify modules, plugins, lib)
packages/database Persistence (Prisma client)
infra/docker      Infrastructure (PostgreSQL, Redis)
docs/             Project knowledge and commit explanations
```

Do not invent `domain/`, `application/`, `infrastructure/`, new `packages/*`, or new `apps/*` to “make it cleaner” unless the user approved that change.

## Done checklist

- [ ] Change stays inside the existing layer and pattern.
- [ ] Architecture, packages, and infra were not changed — or approval is recorded.
- [ ] Docs added/updated (`docs/commits/` plus feature/architecture docs as needed).
- [ ] Unit tests added or an explicit blocker was asked.
- [ ] Commit message proposed; no git commit was made.
