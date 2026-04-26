# SettingsScreen Rework + ScreenHeader Extraction — Design Spec

**Date:** 2026-04-20
**Branch:** TBD (likely `tm-04-20-settings-rework` off `tm-04-19-clean-up-ui` or `main` after #14 merges)
**Scope:** Light-theme SettingsScreen visual rework, Timer subtitle bug fix, extract reusable `ScreenHeader` component (also applied to DecksScreen).

## Goal

Bring SettingsScreen to visual parity with the new DecksScreen (cyan header, white body), fix the hardcoded Timer subtitle, and lift the in-screen cyan header into a reusable component so future screens share the pattern.

## Scope

**In:**
- Visual rework of `SettingsScreen` — drop dark slate theme, adopt cyan header + white body matching DecksScreen.
- Fix the hardcoded `"Currently 60 seconds"` subtitle to read from `useGame().game.timeRemaining`.
- Extract `mobile/src/components/ScreenHeader.tsx` from the inline implementation in DecksScreen.
- Refactor DecksScreen to consume the new `ScreenHeader`.

**Out (deferred):**
- Adding new settings (e.g., reset progress, theme picker) — keep the existing 5 items.
- Restructuring items into sections (Audio / Game / About) — keep the flat list.
- TimerScreen rework / custom timer input UI.
- Animations, transitions.

## Layout

**Header:** `ScreenHeader` component — cyan (`#1EAFE2`) bar, full-width edge-to-edge under safe-area insets, 44pt content height. White "< Back" left, white title centered, ~22pt title to match section headers.

**Body:** White background, ScrollView. 5 rows in this order:

1. **Sound Effects** — title left, `Switch` right.
2. **Timer** — title + subtitle (`"Currently {game.timeRemaining} seconds"`), tap → `navigation.navigate('Timer')`.
3. **Rate Us** — title, tap → `StoreReview.requestReview()` with Alert fallback (preserved from current implementation).
4. **View Tutorial** — title, tap → `navigation.navigate('Tutorial')`.
5. **Rules** — title, tap → `navigation.navigate('Rules')`.

**Row style:** light card (white bg, subtle bottom border or thin shadow), padding ~16pt vertical / 16pt horizontal. Action rows have a small cyan ">" chevron on the right.

## ScreenHeader Component

`mobile/src/components/ScreenHeader.tsx`

**Props:**
```ts
type Props = {
  title: string;
  onBack: () => void;
};
```

**Behavior:**
- Cyan background, full-width via `useSafeAreaInsets` (top inset + 12pt horizontal).
- 44pt min height.
- Layout: `< Back` Pressable on left, title text centered, equal-width spacer on right for symmetry.
- Title: 22pt white bold.
- Back text: 17pt white semibold.
- Accessibility: back button labelled `"Back"`.

## Data Flow

`SettingsScreen` consumes:
- `useSoundContext()` — `soundEnabled, setSoundEnabled` (existing).
- `useGame()` — `game.timeRemaining` for the Timer subtitle.

No new context or state plumbing.

## Refactor: DecksScreen

Replace the inline cyan header View + back Pressable + title + spacer (and associated styles `headerBar`, `headerTitle`, `backButton`, `backText`) with a single `<ScreenHeader title="Decks" onBack={() => navigation.goBack()} />`. Remove the now-unused styles. Keep the rest of DecksScreen unchanged.

## Testing

- TypeScript clean (`npx tsc --noEmit`).
- Existing 60 Jest tests still green.
- Manual visual verification on simulator — both DecksScreen and SettingsScreen render with identical-looking cyan header, light body, correct items.
- No new Maestro flow this round (deferred along with the existing decks.yaml deferred assertions).

## Out of Scope

- Real IAP, RevenueCat, Buy All Decks
- TimerScreen custom input UI
- New settings entries
- Full theme system / shared color constants module
- Animations
