# Conventions

## Code Style

- Python: 4-space indent, PEP 8, `snake_case` functions, `PascalCase` classes
- TypeScript: 2-space indent, `PascalCase` components/types, `useThing` hooks
- No formatter/linter configured yet; keep diffs consistent with existing files

## Commits

- Short, lowercase summaries (e.g., "backend scaffolding")
- Call out schema/migration changes explicitly in PRs

## Testing

- **Jest** test suite in `mobile/src/__tests__/`; run `pnpm test` from `mobile/`
- Write tests proactively for pure logic and data transformations
- Always run tests before committing mobile changes

## Pre-Commit Verification

Before committing mobile changes, always verify:

1. `pnpm test` passes (from `mobile/`)
2. `npx expo export --platform ios` succeeds (catches Metro bundler errors)

These are behavioral expectations, not automated hooks (yet — pre-commit hook setup
is a planned follow-up project).
