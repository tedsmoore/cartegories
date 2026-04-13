# Conventions

## Code Style

- Python: 4-space indent, PEP 8, `snake_case` functions, `PascalCase` classes
- TypeScript: 2-space indent, `PascalCase` components/types, `useThing` hooks
- No formatter/linter configured yet; keep diffs consistent with existing files

## Commits

- Short, lowercase summaries (e.g., "backend scaffolding")
- Think in features, not individual file changes. Squash related work into one
  commit per logical feature before pushing (e.g., "personality and docs
  infrastructure for claude", not 16 separate commits).
- Call out schema/migration changes explicitly in PRs

## Testing

- **Jest** test suite in `mobile/src/__tests__/`; run `pnpm test` from `mobile/`
- Write tests proactively for pure logic and data transformations
- Always run tests before committing mobile changes

## Pre-Commit Verification

Before committing mobile changes, always verify:

1. `pnpm test` passes (from `mobile/`)
2. `npx expo export --platform ios` succeeds (catches Metro bundler errors)

## Metro Cache

`pnpm start --clear` after rebases or dependency changes — Metro caches aggressively
and will serve stale bundles otherwise.

## Native Rebuilds

After changing `app.json` (schemes, plugins, native config):
1. `expo prebuild --platform ios` — regenerates native project
2. `npx expo run:ios --device "i17"` — rebuilds and installs on simulator

JS-only changes don't need a rebuild — Metro hot-reloads them.

## Maestro UI Testing

Flows live in `mobile/.maestro/screens/`. Run with:
```bash
maestro test .maestro/screens/<screen>.yaml
```

Screenshots land in the working directory in portrait pixel orientation even for
landscape apps. Rotate with `sips -r 270 screenshot.png` before viewing.

Deep links (`cartegories://<screen>`) trigger a system confirmation dialog on first
use per install. Handle with `tapOn: point: "60%,50%"` in Maestro flows.
