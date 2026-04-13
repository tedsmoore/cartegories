# Card Selection Screen — iOS Parity Design

## Summary

Rewrite `CardSelectionScreen.tsx` to match the original iOS `NewCardViewController` — mountain scape background, animated blob character, speech bubble, red vector buttons at bottom corners, white nav icons, and shake-to-go-back. Portrait-first layout adapted from the iOS landscape original.

## Background

Full-screen `mountain-scape@2x.png` via `ImageBackground`, `resizeMode="cover"`. Same pattern as `HomeScreen.tsx` uses with `scenery.png`. Content layered on top via `SafeAreaView`.

## Layout

```
┌─────────────────────────────┐
│ [🏠]                   [⚙️] │  white-home-icon / white-gear, SafeArea insets
│                             │
│    ┌─────────┐              │
│    │ speech  │              │
│    │ bubble  │              │
│    └────┬────┘              │
│      🟢                     │
│     blob        Category    │  blob bottom-left ~30%, text centered right
│     (30°)       Name Here   │
│                             │
│                             │
│  [New Card]        [PLAY!]  │  Button component, bottom corners
└─────────────────────────────┘
```

## Components & Behavior

### 1. Blob Character
- `position: absolute`, anchored `bottom: 12%`, `left: 5%`
- Height: `40%` of screen height via `useWindowDimensions` (scales with device)
- `transform: [{ rotate: '30deg' }]`
- Spring animation entrance from off-screen left on mount:
  - `Animated.spring` with `tension: 50`, `friction: 7` (approximating iOS damping 10, velocity 16)
  - Translates from `translateX: -screenWidth * 0.4` to final position
- Image: `blobs-{deckId}@2x.png` matching current card's deck, fallback to `blobs-general@2x.png`
- Tappable via `Pressable` — toggles speech bubble visibility

### 2. Speech Bubble
- Positioned relative to blob: above and offset right
- `speech-bubble@2x.png` as background via `Image`
- Text overlay: deck name in NanumBrush font, dark color
- Hidden by default (`opacity: 0`), fades in/out on blob tap via `Animated.timing` (300ms)
- Updates text when card changes

### 3. Category Text
- Centered in the right ~60% of screen to avoid blob overlap
- Placeholder: "Select a card..." (NanumBrush, ~36pt, dark text)
- Updates to `card.category` on draw
- Vertically centered in the available space

### 4. Buttons
- Use existing `Button` component (vector linear gradients, not the old `redbutton@2x.png`)
- **"New Card"**: `position: absolute`, `bottom: 4%`, `left: 5%`, `baseColor="#e94b24"`, `width={130}`, `breathing={!card}`
- **"PLAY!"**: `position: absolute`, `bottom: 4%`, `right: 5%`, `baseColor="#e94b24"`, `width={130}`, `breathing={!!card}`, disabled state at `opacity: 0.4` until card is drawn
- Press actions unchanged: `drawCard()` and `navigation.navigate('Play')`

### 5. Navigation Icons
- `white-home-icon@2x.png` — top-left corner, `Pressable`, navigates to Home (or `navigation.goBack()`)
- `white-gear@2x.png` — top-right corner, `Pressable`, navigates to Decks screen
- Sized ~28x28, with safe area insets respected

### 6. Shake to Go Back
- Use `expo-sensors` `Accelerometer` to detect shake gesture
- Threshold: magnitude > 1.5g on any axis within 500ms window
- On shake: show `Alert.alert("Go back?", "Return to: {previousCard.category}?", [Cancel, OK])`
- On confirm: revert `currentCard` to `previousCard`, update blob/text
- Requires tracking `previousCard` in local state (set before each `drawCard()`)

### 7. Sound
- Play click sound on card draw via existing `useSound` hook

## Blob Image Mapping

Map deck IDs to blob asset filenames. Available blobs:
- `blobs-general` (fallback)
- `blobs-food-and-drink`
- `blobs-harry-potter`
- `blobs-history-and-geography`
- `blobs-music`
- `blobs-sci-fi-and-fantasy`
- `blobs-science-and-nature`
- `blobs-sports-and-leisure`
- `blobs-theater`
- `blobs-tv-and-movies`
- `blobs-video-games`
- `blobs-wordplay`

Deck IDs need to be mapped to these filenames. Create a lookup object in the component or a shared util.

## What Changes from Current

**Delete:**
- Dark `#0f172a` background
- `cardArea` box with `#1e293b` background
- "Decks & Settings" text link
- Deck label and item count display

**Add:**
- Mountain scape `ImageBackground`
- Blob character with per-deck variants and spring animation
- Speech bubble (toggleable)
- White nav icon buttons (home, settings)
- Shake-to-go-back gesture
- `previousCard` tracking in local state

**Keep:**
- `Button` component (already vector-based)
- `drawCard()` / `startNewRound()` from GameContext
- Navigation to Play screen
- Sound on card draw

## Out of Scope

- Landscape orientation lock
- Ad integration
- Tutorial system
- Firebase analytics / rating prompts
- Animation library migration (Animated → Reanimated) — separate effort after parity
