# cartegories_mobile

Expo + TypeScript rebuild of the Cartegories iOS app.

## Getting started

```bash
cp .env.example .env     # adjust if you swap Firebase projects
npm install
npm run ios              # or npm run android / npm start
```

## Notes

- Firebase config is pulled from `EXPO_PUBLIC_*` env vars (matches the existing iOS plist) and stubbed so the app runs offline while we wire the real data + auth.
- In-app purchases are wired through `expo-in-app-purchases` but currently only fetch products + fire purchase calls; unlock logic still TODO.
- Screens are scaffolded to mirror the iOS controllers: Home, Decks, Play, Store, Settings, Timer, Tutorial, Rules, Game Over.
- Game state is managed via a simple context in `src/state/GameContext.tsx` with placeholder categories until Firebase is connected.
