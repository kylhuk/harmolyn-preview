# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Harmolyn is an end-user chat client for the **xorein** P2P network — Discord-like UX with explicit, verifiable security modes. The UI is Harmolyn; the local network engine is xorein (runs on the same machine). Harmolyn communicates with xorein via a **local-only transport** (Unix domain socket / Windows named pipe) — there is no remote bind and no central server.

## Commands

```bash
npm run dev              # Vite dev server on 0.0.0.0:8080
npm run build            # TypeScript typecheck + Vite production build
npm run lint             # ESLint scan
npm run build:protocol   # Compile protocol sources/tests with tsconfig.protocol.json
npm run test:protocol    # Build protocol code, then run Node test runner on compiled .test.js files
npm run test:browser     # Playwright smoke tests
```

There is no generic `npm test` or standalone typecheck script. Vitest picks up `src/**/*.{test,spec}.{ts,tsx}` (see `src/test/setup.ts`).

`dist/` and `.generated/` are generated; do not edit them by hand.

## Architecture

The stack is layered:

```
UI Layer         src/components/        React components
Application      src/hooks/, data.ts    React Query, local state, polling (1s)
Protocol         src/protocol/          XoreinClient, capability negotiation, security modes
Runtime API      src/lib/xoreinControl.ts  REST client to local xorein socket
```

**Entry point:** `index.html → src/main.tsx → src/App.tsx`. Root-level `App.tsx` and `index.tsx` exist but are not the Vite entrypoint.

### Protocol layer (`src/protocol/`)

- `client.ts` — `XoreinClient` with pluggable `XoreinTransport` interface
- `capabilities.ts` — feature negotiation between client and runtime
- `manifest.ts` — manifest validation with SHA256 digests
- `deeplink.ts` — invite/join URL parsing
- `backoff.ts` — reconnection backoff
- `protocolId.ts` — protocol version parsing

Protocol TypeScript is **strict** (`tsconfig.protocol.json`). App TypeScript is intentionally **non-strict** (`tsconfig.app.json`) to allow rapid UI iteration.

### Feature flags (`src/config/featureFlags.ts`)

130+ toggles covering auth, messaging, voice, monetization, and moderation. Runtime overrides via `localStorage` key `harmolyn:feature-overrides`. Use the `useFeature` hook to read flags in components. This is the single source of truth for staged rollouts and A/B tests.

### Security modes

Every conversation surface carries one of four explicit modes (surfaced as a badge in the UI):
- **Seal** — 1:1 E2EE (X3DH + Double Ratchet)
- **Tree** — small-group E2EE (MLS)
- **Crowd / Channel** — large-scale E2EE with epoch rotation
- **Clear** — readable by infrastructure (explicitly labeled, never the default for private spaces)

## Conventions

- `@/*` resolves to `./src/*`
- Never inject secrets into the client bundle (see `vite.config.ts`); all external APIs go through the local xorein runtime
- The repo has both `package-lock.json` and `bun.lockb`; npm scripts are the authoritative workflow
- Protocol tests compile to `.generated/protocol-tests/` and run via Node (not Vitest)
