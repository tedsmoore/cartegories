# Cartegories Development Roadmap

## Context

Cartegories is a category card game for cars, being rewritten from a native iOS (Swift) app to React Native (Expo). The current state: 9 screens render and navigate, card drawing works with 2 mocked decks (6 total items), local SQLite stores game history, and the FastAPI backend has a User model. But the game isn't really *playable* yet — no real content, no scoring, no timer countdown, no purchases.

Ted will share the iOS repo so Claude can extract deck content, scoring logic, and game behavior directly. Firebase is being dropped in favor of consolidating on FastAPI/Postgres. RevenueCat will handle IAP.

**The goal:** a shippable offline-first card game with a simple paid-deck-unlock revenue model, built iteratively so each phase produces something testable.

---

## Architecture Decisions

**Drop Firebase.** Deck content moves to Postgres, served by FastAPI, cached in on-device SQLite. One backend, one auth system, one deployment.

**Offline-first via local SQLite + opportunistic sync.** The phone never needs the network to play. Decks are cached locally. Game results are saved locally and synced to the server when online. No conflict resolution needed — decks flow server→client (read-only), game results flow client→server (append-only).

**RevenueCat for IAP.** Handles receipt validation, restoration, and cross-platform. Webhook notifies the backend. Remove `expo-in-app-purchases`.

**Anonymous-first auth.** UUID generated on first launch, stored in SecureStore. No email/password. The User model already supports `anonymous_id`.

---

## Phased Roadmap

Each phase is scoped for a single Claude Code session and produces a testable result.

### Phase 0: Extract iOS Content (prerequisite)
Ted shares the iOS repo. Claude extracts:
- All deck/category/card data → `data/decks.json`
- Scoring algorithm (nailed/missed, timer bonus) → documented
- Timer countdown behavior → documented
- Any card images or assets needed

**Output:** A `data/` directory with structured JSON and a scoring spec. This unblocks all subsequent phases.

### Phase 1: Real Deck Content in Local SQLite
Replace mocked Firebase data with the full card catalog stored in SQLite.

- Add Drizzle schema: `decks` table (id, name, priority, image, isFree, productId) and `cards` table (id, prompt, deckId)
- Seed script that loads `data/decks.json` into SQLite on first launch
- Refactor `GameContext` to load from SQLite instead of `fetchCategories()`
- Remove `firebase.ts` and the Firebase dependency
- Update `DecksScreen` to show real deck count, lock icons for paid decks

**Test:** App launches with all decks and real cards. Deck selection works. Game draws from the full card pool. No network needed.

**Key files:** `mobile/src/db/schema.ts`, `mobile/src/state/GameContext.tsx`, `mobile/src/services/firebase.ts` (delete)

### Phase 2: Scoring + Timer (Complete Game Loop)
Make the game actually playable end-to-end, matching iOS behavior.

- Countdown timer in `PlayScreen` (setInterval, navigate to GameOver at 0)
- Scoring: +1 nailed, 0 missed, track nailedItems/missedItems arrays
- `GameOverScreen` shows nailed/missed breakdown and final score
- Update `saveGameResult` to include full scoring data
- Wire sound FX toggle (expo-av, play sounds on nailed/missed)

**Test:** Pick timer → start round → cards appear with countdown → tap nailed/missed → game ends → score screen → result saved to SQLite.

**Key files:** `mobile/src/screens/PlayScreen.tsx`, `mobile/src/state/GameContext.tsx`, `mobile/src/screens/GameOverScreen.tsx`

### Phase 3: Backend Deck Catalog API
The backend becomes the authoritative source for deck content, enabling OTA content updates.

- SQLModel models: `Deck`, `Card` (mirroring mobile schema)
- Alembic migration
- Seed script: load `data/decks.json` into Postgres
- Endpoints: `GET /api/decks` (with card counts), `GET /api/decks/{id}/cards`, `GET /api/catalog-version`
- Include router in `app.py`

**Test:** `curl localhost:8000/api/decks` returns the full catalog.

**Key files:** `api/models/deck.py` (new), `api/routers/decks.py` (new), `api/app.py`

### Phase 4: Offline-First Sync Layer
Connect mobile to backend with graceful offline behavior.

- `mobile/src/services/sync.ts`: `syncDecks()` (pull catalog if stale), `syncGames()` (push pending results)
- Add `syncStatus` column to local `games` table
- Backend endpoint: `POST /api/games` (batch game results with anonymous_id)
- `useSync` hook: runs on app foreground via AppState listener, checks NetInfo
- First-launch: loading screen while initial catalog downloads

**Test:** Works fully offline with cached data. Toggle airplane mode — pending games sync when back online.

**Key files:** `mobile/src/services/sync.ts` (new), `mobile/src/db/schema.ts`, `api/routers/games.py` (new)

### Phase 5: Anonymous Auth + User Identity
Stable device identity linking game history and purchases.

- Generate UUID on first launch → `expo-secure-store`
- `POST /api/users` on first sync (endpoint already exists)
- Store returned `user_id` locally, attach to API calls
- Simple API key or HMAC request signing (not full JWT)

**Test:** Backend `users` table populated with one row per device. Game results linked to user_id.

**Key files:** `mobile/src/services/auth.ts` (new), `api/routers/users.py`

### Phase 6: In-App Purchases (RevenueCat)
Paid deck unlocks as the revenue model. General deck free, all others paid, plus a "Buy All" bundle.

- Remove `expo-in-app-purchases`, standardize on `react-native-purchases`
- Initialize RevenueCat with anonymous user ID, check entitlements on launch
- Store unlocked deck IDs in local SQLite (`user_purchases` table) for offline access
- `StoreScreen`: real prices, purchase buttons, "Owned" badges
- `DecksScreen`: lock icon + "Buy in Store" for unpurchased decks
- RevenueCat webhook → `POST /api/webhooks/revenuecat` to record purchases server-side

**Test:** In sandbox, store shows real prices. Purchasing unlocks a deck. Persists across restarts.

**Key files:** `mobile/src/services/iap.ts` (rewrite), `mobile/src/screens/StoreScreen.tsx`, `api/routers/purchases.py` (new)

### Phase 7: Stats + Game History Screen
- `StatsScreen`: total games, high score, avg score, favorite deck, streak
- Query local SQLite, sync to backend for device portability
- `GET /api/users/{id}/stats` endpoint

### Phase 8: Polish + Ship
- Sound effects + haptics (expo-av, expo-haptics)
- App icon, splash screen, store screenshots
- EAS Build config for production iOS/Android
- Remove debug console.logs, error handling audit
- Performance profiling on deck loading / card drawing

---

## Data Ownership Summary

| Data | Device (SQLite) | Backend (Postgres) |
|---|---|---|
| Deck catalog | Cached, pulled on launch | Authoritative source |
| Game results | Written immediately | Synced when online |
| User identity | anonymous_id in SecureStore | users table |
| Purchases | unlocked deck IDs cached | RevenueCat webhook records |
| Preferences (timer, sound, active decks) | AsyncStorage | Not synced (device-local) |

---

## Developer Experience Notes

- **Each phase has a clear "done" signal** that Ted can verify before moving on
- **Phase 0 is the only manual step** — Ted shares the iOS repo, Claude extracts the data
- **Phases 1-2 are the highest priority** — they make the game actually playable
- **Phases 3-5 can be done in any order** but the listed order minimizes rework
- **Phase 6 requires a custom dev client** (not Expo Go) for IAP testing
- **When starting each phase**, reference this plan and the relevant key files in the prompt

## Verification

After each phase, the verification is built into the "Test" line. The overall end-to-end test after all phases:
1. Fresh install → app downloads deck catalog → shows all decks
2. Play a full game offline (airplane mode) → score saved locally
3. Come back online → game syncs to backend
4. Purchase a deck in sandbox → unlocked immediately, persists after restart
5. `curl` the backend API to confirm user, games, and purchase data are all present
