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
npm install                      # Install dependencies
npm run start                    # Start Expo dev server
npm run android                  # Run on Android
npm run ios                      # Run on iOS
npm run db:generate              # Generate Drizzle migrations
npm run db:push                  # Apply Drizzle migrations to local SQLite
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
- **Firebase** (`src/services/firebase.ts`) for remote deck/category data (partially wired)
- **AsyncStorage** for persisting user preferences (active deck selection)
- TypeScript with strict mode enabled

### Data Flow
- Deck/category metadata comes from Firebase (remote) -> GameContext manages active session state -> game results stored in local SQLite
- Backend PostgreSQL handles user accounts and will serve as the authoritative data store

## Conventions

- Python: 4-space indent, PEP 8, `snake_case` functions, `PascalCase` classes
- TypeScript: 2-space indent, `PascalCase` components/types, `useThing` hooks
- Commits: short, lowercase summaries (e.g., "backend scaffolding")
- No formatter/linter configured; keep diffs consistent with existing files
- No test framework yet; note manual testing in PRs
- Call out schema/migration changes explicitly in PRs
