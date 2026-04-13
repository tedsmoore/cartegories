# Architecture

## Overview

Cartegories has a Python FastAPI backend (`api/`) and a React Native Expo mobile frontend (`mobile/`).

## Backend (`api/`)

- **FastAPI** app in `app.py`, models in `models/`, route handlers in `routers/`
- **SQLModel** for ORM (combines SQLAlchemy + Pydantic)
- **Alembic** migrations in `api/alembic/versions/`; config in root `alembic.ini`
- Database sessions via dependency injection (`Depends(get_session)` from `db.py`)
- PostgreSQL 16 via Docker Compose on port 2345 (user: `cartegories`, password: `password`, db: `cartegories`)
- Python 3.14+, managed with UV

## Mobile (`mobile/`)

- **Expo/React Native** app, entry point `App.tsx`
- **React Navigation** stack navigator in `src/navigation/RootNavigator.tsx`
- **GameContext** (`src/state/GameContext.tsx`) manages global game state: active decks, card drawing, scores, timer
- **Drizzle ORM** with local SQLite (`src/db/`) for game history persistence
- **SoundContext** (`src/state/SoundContext.tsx`) + **useSound** hook (`src/hooks/useSound.ts`) for sound FX via expo-av
- **AsyncStorage** for persisting user preferences (active deck selection, sound toggle)
- TypeScript with strict mode enabled

## Data Flow

- Deck/category data seeded from `data/decks.json` into local SQLite on first launch
- GameContext manages active session state
- Game results stored in local SQLite
- Backend PostgreSQL handles user accounts and will serve as the authoritative data store

## Offline-First Design

The phone never needs the network to play. Decks are cached locally. Game results
are saved locally and synced to the server when online. No conflict resolution
needed — decks flow server→client (read-only), game results flow client→server
(append-only).
