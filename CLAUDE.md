# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cartegories is a category card game for the car. It has a Python FastAPI backend (`api/`) and a React Native Expo mobile frontend (`mobile/`).

## Common Commands

### Backend (run from project root)
```bash
uv sync                          # Install Python dependencies
uv run fastapi dev app.py        # Start FastAPI dev server with hot-reload
docker-compose up -d             # Start PostgreSQL (port 2345)
docker-compose down              # Stop PostgreSQL
alembic upgrade head             # Apply database migrations
alembic revision --autogenerate -m "description"  # Create new migration
```

### Mobile (run from mobile/)
```bash
pnpm install                     # Install dependencies
pnpm start                       # Start Expo dev server
pnpm android                     # Run on Android
pnpm ios                         # Run on iOS
pnpm test                        # Run Jest tests
pnpm db:generate                 # Generate Drizzle migrations
pnpm db:push                     # Apply Drizzle migrations to local SQLite
npx expo export --platform ios   # Verify Metro bundle compiles (catch import errors)
```

## Architecture

### Backend (`api/`)
- **FastAPI** app in `app.py`, models in `models/`, route handlers in `routers/`
- **SQLModel** for ORM (combines SQLAlchemy + Pydantic)
- **Alembic** migrations in `api/alembic/versions/`; config in root `alembic.ini`
- Database sessions via dependency injection (`Depends(get_session)` from `db.py`)
- PostgreSQL 16 via Docker Compose on port 2345 (user: `cartegories`, password: `password`, db: `cartegories`)
- Python 3.14+, managed with UV

### Mobile (`mobile/`)
- **Expo/React Native** app, entry point `App.tsx`
- **React Navigation** stack navigator in `src/navigation/RootNavigator.tsx`
- **GameContext** (`src/state/GameContext.tsx`) manages global game state: active decks, card drawing, scores, timer
- **Drizzle ORM** with local SQLite (`src/db/`) for game history persistence
- **SoundContext** (`src/state/SoundContext.tsx`) + **useSound** hook (`src/hooks/useSound.ts`) for sound FX via expo-av
- **AsyncStorage** for persisting user preferences (active deck selection, sound toggle)
- TypeScript with strict mode enabled

### Data Flow
- Deck/category data seeded from `data/decks.json` into local SQLite on first launch -> GameContext manages active session state -> game results stored in local SQLite
- Backend PostgreSQL handles user accounts and will serve as the authoritative data store

## Conventions

- Python: 4-space indent, PEP 8, `snake_case` functions, `PascalCase` classes
- TypeScript: 2-space indent, `PascalCase` components/types, `useThing` hooks
- Commits: short, lowercase summaries (e.g., "backend scaffolding")
- No formatter/linter configured; keep diffs consistent with existing files
- **Jest** test suite in `mobile/src/__tests__/`; run `pnpm test` from `mobile/`
- **Always verify `npx expo export --platform ios` succeeds** before committing mobile changes (catches Metro bundler errors like bad imports)
- Call out schema/migration changes explicitly in PRs
