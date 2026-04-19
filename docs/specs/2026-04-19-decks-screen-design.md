# DecksScreen Rewrite — Design Spec

**Date:** 2026-04-19
**Branch:** `tm-04-19-clean-up-ui`
**Scope:** UI parity + back-nav fix. IAP deferred.

## Goal

Bring DecksScreen from its current scaffold state (dark FlatList) to iOS visual parity, fix the broken back-nav from CardSelection, and migrate options out of DecksScreen into SettingsScreen for cleaner separation of concerns.

This is a UI cleanup effort, not an IAP rebuild. Real purchase flow, RevenueCat integration, restore purchases, and the "Buy All Decks" hero are out of scope.

## Parity Philosophy

The original iOS DecksScreen crammed deck management, timer settings, sound toggle, IAP, and Rate Us into one collection view across three sections. That was Ted's first software project — visually charming but architecturally naive. We preserve the visual identity (blob cells, banners, blue active border, white background) and drop the structural cruft. See CLAUDE.md → Design Philosophy.

## Architecture

**DecksScreen = decks only.** Two sections, both 5-column blob grids:

- **Your Decks** — owned (free + future-purchased). Tap to toggle active.
- **Get More Decks** — locked paid decks. Tap → "Coming soon" alert (stub IAP).

**SettingsScreen** absorbs former DecksScreen options:

- Existing: Sound effects toggle (already there).
- Add: Timer link (navigates to existing `TimerScreen`).
- Add: Rate Us row using `expo-store-review`.

Full SettingsScreen rework is its own future brainstorm.

## Layout

- **Background:** white (`#FFFFFF`, matches iOS storyboard).
- **Header:** React Navigation stack header, `title: "Decks"`, default back button. Already configured in `RootNavigator.tsx`; verify it actually shows in landscape during implementation.
- **Body:** `ScrollView` containing two `FlatList numColumns={5}` blocks with `scrollEnabled={false}`.
- **Section headers:** cyan (`#1EAFE2`, the established accent color) text labels above each grid — "Your Decks" and "Get More Decks".

## Cell Design

Each deck cell:

- ~`screenWidth/5` minus margins, square-ish.
- Blob image (aspect-fit), centered.
- Label below in app font.
- 8pt rounded corners, subtle drop shadow.
- **Active state:** 2px `#1EAFE2` border. Tap toggles active.
- **Banners:** skipped this round. FREE banner only applies if a paid deck has a temporary free promo (no decks currently do); NEW banner needs a schema field. Both assets stay in `mobile/assets/images/` for future use.
- **Locked cell** (Get More Decks): same cell, no border. Tap → `Alert.alert('Coming soon', 'Deck purchases launching with the next update.')`.

All assets already in `mobile/assets/images/`.

## Data Flow

`useGame()` already provides `decks`, `game.activeDecks`, `setActiveDecks`.

Pure partition function (unit-testable):

```ts
function partitionDecks(decks: Deck[]): { owned: Deck[]; locked: Deck[] } {
  return {
    owned: decks.filter(d => d.isFree),
    locked: decks.filter(d => !d.isFree),
  };
}
```

When IAP lands, swap to `d.isFree || purchasedIds.includes(d.id)`.

Toggle active state: existing logic carries over. `setActiveDecks(next)` adds or removes the deck id.

Loading: keep `ActivityIndicator` for the existing `loading` state.

## Settings Additions

In the same PR, modify `SettingsScreen.tsx`:

- Add a "Timer" row that calls `navigation.navigate('Timer')`.
- Add a "Rate Us" row that calls `StoreReview.requestReview()` from `expo-store-review`.
- Install `expo-store-review` if not already in `mobile/package.json`.

## Back-Nav Bug Investigation

The reported bug: back button doesn't return to CardSelection when DecksScreen is reached via the gear icon.

`CardSelectionScreen.tsx:123` calls `navigation.navigate('Decks')` (a stack push), and `RootNavigator.tsx:57` declares `options={{ title: 'Decks' }}` which should auto-show a header with back button.

**Plan:** before fixing, take a simulator screenshot of the current DecksScreen reached via gear. Observe what's actually broken — header invisible in landscape? swipe-back gesture missing? Then fix the actual cause. The new visible-header redesign will likely fix this incidentally.

## Testing

**Unit:** test `partitionDecks` (pure function) with the existing test runner.

**Maestro:** `mobile/.maestro/decks-screen.yaml` — first parity Maestro flow, becomes the template for future screens:

1. Launch app, tap Quick Play, tap gear icon.
2. Assert "Your Decks" header visible.
3. Tap a free deck cell, screenshot, assert active state via accessibility label.
4. Scroll to "Get More Decks", tap a locked cell, assert "Coming soon" alert text.
5. Dismiss alert, tap back button, assert return to CardSelection (visible "Select a card..." text).

**Manual:** simulator screenshots at each layout milestone using the workflow in `docs/technical/visual-testing-guide.md`.

## Out of Scope

- Real IAP / RevenueCat integration
- Buy All Decks hero cell
- Purchase confirmation modal
- Restore purchases UI
- Full SettingsScreen rework
- NEW / FREE deck banners (deferred — NEW needs schema field, FREE has no current consumers)
- Animations / custom transitions
