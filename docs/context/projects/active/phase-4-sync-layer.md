# Phase 4: Offline-First Sync Layer

## Context

Phases 0-3 are complete. The mobile app has a fully playable game loop with local
SQLite persistence, and the backend serves the deck catalog API. But the two don't
talk to each other — game results stay on-device and deck content can't be updated
OTA. Phase 4 connects them with an offline-first sync layer: decks pull from server
when stale, game results push when online.

## Key Design Decisions

### anonymous_id starts now, not Phase 5

Generate `anonymous_id` client-side via `crypto.randomUUID()` stored in AsyncStorage
immediately. No SecureStore yet (Phase 5 formalizes that). This keeps the
POST /api/games contract clean — the ID is already flowing when Phase 5 picks up.

### No first-launch loading screen

The app already seeds from bundled `data/decks.json`. Catalog sync runs in the
background after launch and silently updates local data if a newer server version
exists. No blocking download needed.

### Idempotent game sync via client_id

Each game gets a `client_id` = `{anonymous_id}:{local_game_id}`. The backend uses a
unique constraint on this field and skips duplicates. This makes retries safe — the
client can re-POST the same batch without creating duplicate records.

### sync_status state machine

Local games table gets a `sync_status` column with three states:
- `pending` (default) — newly saved, not yet uploaded
- `syncing` — currently being uploaded (prevents double-send)
- `synced` — confirmed by server

Recovery: on launch, any `syncing` rows revert to `pending` (handles app-killed-mid-sync).

### No Game→User FK yet

The Game model stores `anonymous_id` as a plain indexed string, not a foreign key to
Users. Phase 5 will formalize the relationship when user registration is built.

---

## Backend Changes

### Game Model (`api/models/game.py` — new)

| Field | Type | Notes |
|---|---|---|
| id | int, PK auto | |
| client_id | str, unique, indexed | Idempotency key |
| anonymous_id | str, indexed | Loose link to User |
| score | int | |
| drawn_cards_count | int | |
| active_decks | str | JSON array |
| nailed_items | str | JSON array |
| missed_items | str | JSON array |
| played_at | datetime | Client timestamp |
| created_at | datetime | Server timestamp |

Schemas: `GameCreate`, `GameBatchRequest` (anonymous_id + games[]), `GameBatchResponse` (accepted + duplicates).

### Endpoint (`api/routers/games.py` — new)

```
POST /api/games
{
  "anonymous_id": "uuid",
  "games": [
    { "client_id": "uuid:42", "score": 7, "drawn_cards_count": 3,
      "active_decks": ["general"], "nailed_items": ["cat"], "missed_items": ["fish"],
      "played_at": "2026-04-13T10:30:00Z" }
  ]
}
→ { "accepted": 1, "duplicates": 0 }
```

Iterates batch, checks `client_id` uniqueness, inserts new rows, skips dupes.
Single commit (all-or-nothing).

### Migration

`alembic revision --autogenerate -m "add games table"`

### Tests (`api/tests/test_games.py` — new)

- Batch insert (3 games, all accepted)
- Idempotent duplicate (same client_id twice, second skipped)
- Empty batch (accepted: 0)
- Missing required fields (422)
- Mixed new + duplicate (verify counts)

---

## Mobile Changes

### Schema: add sync_status (`src/db/schema.ts`)

Add `syncStatus: text('sync_status').notNull().default('pending')` to games table.
Generate Drizzle migration.

### API Client (`src/services/api.ts` — new)

Thin fetch wrapper: `apiGet<T>(path)`, `apiPost<T>(path, body)`.
Base URL switches on `__DEV__`.

### Sync Service (`src/services/sync.ts` — new)

**syncDecks():**
1. GET `/api/catalog-version` → compare against AsyncStorage `catalogVersion`
2. If stale: fetch all decks + cards, replace local data in transaction
3. Update stored version only after full success

**syncGames():**
1. Recovery sweep: `syncing` → `pending`
2. Query pending games
3. Mark `syncing` → POST `/api/games` → mark `synced` (or revert on failure)

### useSync Hook (`src/hooks/useSync.ts` — new)

- Triggers on AppState `active` (foreground) + mount
- Checks NetInfo connectivity before attempting
- `isSyncing` ref guard prevents concurrent runs
- Calls syncDecks() then syncGames()

### App.tsx integration

`SyncGate` component wraps `<RootNavigator />`, calls `useSync()`.

### New dependency

`@react-native-community/netinfo`

---

## Edge Cases

| Case | Handling |
|---|---|
| App killed mid-sync | Recovery sweep: `syncing` → `pending` on launch |
| Duplicate submission | `client_id` unique constraint, dupes skipped |
| Partial catalog download | Version not updated, full retry next time |
| Rapid foreground events | `isSyncing` ref guard |
| Pure offline | Bundled JSON seed, no network ever needed to play |
| Game saved during sync | Gets `pending`, picked up next cycle |

## Execution

Backend and mobile are independent — can be developed in parallel.

**Backend:** model → migration → endpoint → tests
**Mobile:** schema → api client → sync service → hook → App.tsx wiring → tests

## Verification

1. `pytest api/tests/` — all tests pass
2. `ruff check` + `ty check` — clean
3. Curl POST games to backend, verify stored + idempotent
4. Mobile: play offline → `sync_status: 'pending'`
5. Mobile: come online → game syncs → `sync_status: 'synced'`
6. Mobile: kill mid-sync → relaunch → recovery → retry succeeds
