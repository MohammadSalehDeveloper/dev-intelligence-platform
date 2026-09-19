# Agent protocol

This is the long-form contract for agents in **dev-intelligence-platform**. Short form: root `AGENTS.md`. Enforcement: `.cursor/rules/*.mdc`.

## 1. Git — propose messages, never commit

Agents implement and document. The user owns version control.

**Never** run `git commit`, `git push`, `git commit --amend`, force push, history rewrite, or skip hooks (`--no-verify`).

When work is ready, output:

1. A concise 1–2 sentence **proposed commit message** (why, not a file list).
2. A `docs/commits/<YYYY-MM-DD>-<slug>.md` file that explains the change.
3. A short summary of files touched.

Do not `git add` unless the user asked you to stage. Do not commit even if a user rule elsewhere describes a commit workflow — this project protocol wins until the user explicitly says “commit this.”

## 2. Architecture freeze — ask first

Do not change architecture, layers, infrastructure, domain, persistence, or packages without a question, an explanation, and an explicit yes.

**You must stop and ask before:**

- Adding or removing workspace packages, apps, or `services/*`
- Adding Docker/compose services or new datastores
- Changing Prisma schema / domain models
- Introducing new layers (`domain/`, `application/`, `infrastructure/`, ports/adapters folders)
- Moving responsibilities across `apps/web`, `apps/api`, `packages/database`, `infra/`
- Replacing Fastify, Next.js, Prisma, Redis, or PostgreSQL
- Adding major libraries (state, UI kit, queue, auth provider, test runner)

**Explanation must cover:** why the current boundary is insufficient, what would change, migration cost, and what stays the same.

Until approved, extend the **existing** module/plugin/feature pattern.

If the user approves a structural change, record it under `docs/architecture/` (and a commit doc) before implementing.

## 3. Craft — Clean Architecture, Clean Code, Design Patterns

- **Clean Architecture:** dependencies point inward. UI does not know Prisma. API HTTP handlers do not belong in the web app. Persistence stays in `packages/database`.
- **Clean Code:** honest names, small functions, no swallowed errors, no commented-out code, no drive-by refactors.
- **Design Patterns:** use them when they match an existing problem (plugin, module/facade, adapter). Do not add a pattern folder “because clean.”
- **Stack:** React and Next.js in `apps/web`; Node.js and Fastify in `apps/api`; Zod where input is validated; TypeScript throughout.

Match local style (imports, ESM `.js` suffixes in the API, existing folder names). Do not reformat unrelated files.

## 4. Every proposed commit is explained in docs

For each unit of work you would have committed, add:

`docs/commits/<YYYY-MM-DD>-<slug>.md`

Use `docs/templates/commit.md`. The commit doc is mandatory even when the code change is small.

## 5. Document new features, layers, models, infra, and tech

| Kind | Write |
| --- | --- |
| User-facing or API feature | `docs/features/<name>.md` from `docs/templates/feature.md` |
| New or changed layer | `docs/architecture/` |
| Persistence / domain model | `docs/architecture/` (models or a focused page) |
| Infra (compose, Redis, Postgres, env) | `docs/infra/` or `docs/architecture/` |
| New technology (only after approval) | Why it was added, how to run it, where it lives |

Update `docs/README.md` when you add a new docs area.

## 6. Unit tests for new work

Add unit tests for new functionality, features, stories, and infra wrappers.

- Prefer `*.test.ts` / `*.test.tsx` beside the unit under test.
- Mock network, Prisma, Redis, and GitHub.
- There is no test runner in the repo yet. **Ask before adding Vitest/Jest** (package + scripts). Still add test files so they can run once tooling is approved.
- Do not claim done without tests unless the user waived them.

## Completion checklist

Copy this mentally before you stop:

1. Scope stayed inside frozen boundaries (or approval is documented).
2. Docs: commit explanation plus feature/architecture/infra as applicable.
3. Tests: present or tooling question asked.
4. Commit message proposed; no commit made.
