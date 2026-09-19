# Agent guard files and protocols

- **Date:** 2026-09-20
- **Proposed message:** Add agent protocols so contributors cannot commit, reshape architecture, or skip docs and tests without an explicit process.
- **Architecture impact:** none (documentation and Cursor rules only)

## Why

Agents need a project-level contract before feature work: the user owns git; architecture stays frozen unless explained and approved; Clean Architecture / Clean Code / the React–Node stack stay in force; every change is documented and unit-tested.

## What changed

- Root `AGENTS.md` operating contract
- `.cursor/rules/*.mdc` always-on and path-scoped rules
- `docs/agents/PROTOCOL.md` long-form protocol
- `docs/architecture/OVERVIEW.md` frozen layout snapshot
- Commit/feature templates and this commit explanation

## Docs

This file plus `docs/README.md`, protocol, and architecture overview.

## Tests

None. These are agent/policy files, not runtime behavior. No test runner is in the repo yet.
