# Repository Guidelines

## Project Structure & Module Organization
- `api/` holds the FastAPI backend (`app.py`) plus Piccolo configuration and migrations in `api/piccolo_migrations/`.
- `mobile/` is the Expo React Native app with source in `mobile/src/`, assets in `mobile/assets/`, and database schema in `mobile/src/db/`.
- `scripts/` contains one-off utilities like `verify_setup.py` and `iniitialize_games.py`.
- Root files include `pyproject.toml`, `uv.lock`, and `docker-compose.yml` for Python tooling and local services.

## Build, Test, and Development Commands
- `uv sync` installs backend dependencies from `pyproject.toml`.
- `uv run fastapi dev app.py` starts the FastAPI dev server from `api/app.py`.
- `docker-compose up -d` runs the Postgres service defined in `docker-compose.yml` (port `5431`).
- `npm install` in `mobile/` installs frontend dependencies.
- `npm run start` / `npm run android` / `npm run ios` / `npm run web` in `mobile/` runs the Expo app for each target.
- `npm run db:generate` and `npm run db:push` in `mobile/` manage Drizzle schema changes.

## Coding Style & Naming Conventions
- Python follows standard 4-space indentation and PEP 8 naming (`snake_case` functions, `PascalCase` classes).
- TypeScript uses 2-space indentation; React components are `PascalCase` and hooks are `useThing`.
- Keep module names descriptive and aligned to folder purpose (e.g., `mobile/src/screens/` for UI screens).
- No formatter or linter is configured yet; keep diffs minimal and consistent with existing files.

## Testing Guidelines
- No test framework is configured in this repo yet.
- If adding tests, place backend tests under `api/` (e.g., `test_*.py`) and frontend tests under `mobile/` (e.g., `*.test.tsx`).
- Include a brief note in PRs about manual testing performed (device/simulator, key flows).

## Commit & Pull Request Guidelines
- Recent commits use short, lowercase summaries (e.g., "backend scaffolding"). Follow that style unless a stricter convention is introduced.
- PRs should include: a concise description of changes, links to relevant issues, and screenshots for UI changes in `mobile/`.
- Call out schema or migration changes explicitly and include any required setup steps.

## Configuration & Data
- Local Postgres data is stored under `./.db/` with dumps in `./.db-dumps/` (see `docker-compose.yml`).
- Avoid committing secrets; prefer environment variables or local-only config files.
