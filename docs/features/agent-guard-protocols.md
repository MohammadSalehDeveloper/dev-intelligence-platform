# Agent guard protocols

- **Status:** done
- **Surfaces:** repo tooling (`AGENTS.md`, `.cursor/rules/`, `docs/`)
- **Architecture impact:** none

## Problem

Agents working in this repo could commit, reshape layers/packages/infra, or ship features without docs and tests.

## Behavior

- Agents never commit; they only propose a message and a `docs/commits/` explanation.
- Architecture, layers, infra, domain, persistence, and packages stay frozen until the agent asks, explains, and the user approves.
- Clean Architecture, Clean Code, Design Patterns, React, and Node.js/Fastify remain the default craft.
- New features, layers, models, infra, and technologies get docs under `docs/`.
- New functionality gets unit tests; adding a test runner still requires approval.

## Boundaries

Policy lives in `AGENTS.md`, `.cursor/rules/`, and `docs/agents/PROTOCOL.md`. Runtime apps and packages are unchanged.

## Tests

Not applicable (no runtime).

## How to try

Open a new agent chat and confirm `AGENTS.md` / `.cursor/rules/00-agent-protocol.mdc` are in context.
