# DecksScreen Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the React Native DecksScreen to visual parity with iOS, drop the legacy options-in-Decks information architecture, fix the broken back-nav from CardSelection, and add Rate Us to SettingsScreen.

**Architecture:** DecksScreen becomes a deck-management-only screen with two 5-column blob grids ("Your Decks" + "Get More Decks"). Options (Timer, Rate Us) move to SettingsScreen. White background, React Navigation stack header for back-nav. IAP is stubbed with "Coming soon" alerts — out of scope.

**Tech Stack:** React Native 0.81 + Expo 54, React Navigation native-stack, Jest + babel-jest, Maestro for UI flows, expo-store-review for Rate Us.

**Spec:** `docs/specs/2026-04-19-decks-screen-design.md`

---

## File Map

**Create:**
- `mobile/src/utils/partitionDecks.ts` — pure partition function
- `mobile/src/__tests__/partitionDecks.test.ts` — unit tests
- `mobile/src/components/DeckCell.tsx` — reusable grid cell

**Modify:**
- `mobile/src/screens/DecksScreen.tsx` — full rewrite
- `mobile/src/screens/SettingsScreen.tsx` — add Rate Us row
- `mobile/.maestro/screens/decks.yaml` — replace minimal flow with full interaction flow
- `mobile/package.json` — add `expo-store-review`

---

## Task 1: Install expo-store-review

**Files:**
- Modify: `mobile/package.json`

- [ ] **Step 1: Install the package**

```bash
cd mobile && pnpm add expo-store-review
```

- [ ] **Step 2: Verify it's listed in dependencies**

Run: `grep expo-store-review mobile/package.json`
Expected: `"expo-store-review": "..."`

- [ ] **Step 3: Commit**

```bash
git add mobile/package.json mobile/pnpm-lock.yaml
git commit -m "chore: add expo-store-review for Rate Us"
```

---

## Task 2: Add `partitionDecks` utility (TDD)

**Files:**
- Create: `mobile/src/utils/partitionDecks.ts`
- Test: `mobile/src/__tests__/partitionDecks.test.ts`

- [ ] **Step 1: Write the failing test**

Create `mobile/src/__tests__/partitionDecks.test.ts`:

```ts
import { partitionDecks } from '../utils/partitionDecks';
import { Deck } from '../types';

const deck = (id: string, isFree: boolean): Deck => ({
  id,
  name: id,
  cards: [],
  isFree,
});

describe('partitionDecks', () => {
  it('separates free decks into owned and paid into locked', () => {
    const decks = [deck('a', true), deck('b', false), deck('c', true)];
    const { owned, locked } = partitionDecks(decks);
    expect(owned.map((d) => d.id)).toEqual(['a', 'c']);
    expect(locked.map((d) => d.id)).toEqual(['b']);
  });

  it('treats undefined isFree as locked (paid)', () => {
    const decks = [{ id: 'x', name: 'x', cards: [] } as Deck];
    const { owned, locked } = partitionDecks(decks);
    expect(owned).toEqual([]);
    expect(locked.map((d) => d.id)).toEqual(['x']);
  });

  it('handles empty input', () => {
    expect(partitionDecks([])).toEqual({ owned: [], locked: [] });
  });

  it('preserves source order within each section', () => {
    const decks = [deck('a', true), deck('b', false), deck('c', true), deck('d', false)];
    const { owned, locked } = partitionDecks(decks);
    expect(owned.map((d) => d.id)).toEqual(['a', 'c']);
    expect(locked.map((d) => d.id)).toEqual(['b', 'd']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd mobile && pnpm test partitionDecks`
Expected: FAIL with "Cannot find module '../utils/partitionDecks'"

- [ ] **Step 3: Write minimal implementation**

Create `mobile/src/utils/partitionDecks.ts`:

```ts
import { Deck } from '../types';

export function partitionDecks(decks: Deck[]): { owned: Deck[]; locked: Deck[] } {
  const owned: Deck[] = [];
  const locked: Deck[] = [];
  for (const d of decks) {
    if (d.isFree) {
      owned.push(d);
    } else {
      locked.push(d);
    }
  }
  return { owned, locked };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd mobile && pnpm test partitionDecks`
Expected: PASS, all 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/utils/partitionDecks.ts mobile/src/__tests__/partitionDecks.test.ts
git commit -m "feat: add partitionDecks utility for owned/locked deck split"
```

---

## Task 3: Build `DeckCell` component

**Files:**
- Create: `mobile/src/components/DeckCell.tsx`

- [ ] **Step 1: Implement DeckCell**

Create `mobile/src/components/DeckCell.tsx`:

```tsx
import React from 'react';
import { Pressable, View, Image, Text, StyleSheet } from 'react-native';
import { Deck } from '../types';
import { getBlobImage } from '../constants/deckImages';

type Props = {
  deck: Deck;
  active?: boolean;
  locked?: boolean;
  onPress: () => void;
};

const ACCENT = '#1EAFE2';

const DeckCell: React.FC<Props> = ({ deck, active, locked, onPress }) => {
  return (
    <Pressable
      style={[styles.cell, active && styles.cellActive]}
      onPress={onPress}
      accessibilityLabel={deck.name}
      accessibilityState={{ selected: !!active, disabled: false }}
    >
      <Image source={getBlobImage(deck.name)} style={styles.image} resizeMode="contain" />
      <Text style={styles.label} numberOfLines={2}>
        {locked ? '\uD83D\uDD12 ' : ''}
        {deck.name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    margin: 6,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  cellActive: {
    borderColor: ACCENT,
  },
  image: {
    width: '80%',
    aspectRatio: 1,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
});

export default DeckCell;
```

- [ ] **Step 2: Commit (no test — pure visual chrome, validated via DecksScreen flow)**

```bash
git add mobile/src/components/DeckCell.tsx
git commit -m "feat: add DeckCell component for deck grid"
```

---

## Task 4: Rewrite DecksScreen

**Files:**
- Modify: `mobile/src/screens/DecksScreen.tsx` (full rewrite)
- Modify: `mobile/src/navigation/RootNavigator.tsx:57` (add explicit header options)

- [ ] **Step 1: Replace DecksScreen body**

Replace the entire contents of `mobile/src/screens/DecksScreen.tsx` with:

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';
import { partitionDecks } from '../utils/partitionDecks';
import DeckCell from '../components/DeckCell';
import { Deck } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Decks'>;

const ACCENT = '#1EAFE2';
const NUM_COLS = 5;

const DecksScreen: React.FC<Props> = () => {
  const { decks, game, setActiveDecks, loading } = useGame();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const { owned, locked } = partitionDecks(decks);

  const toggleActive = (deck: Deck) => {
    const isActive = game.activeDecks.includes(deck.id);
    const next = isActive
      ? game.activeDecks.filter((d) => d !== deck.id)
      : [...game.activeDecks, deck.id];
    setActiveDecks(next);
  };

  const showLockedAlert = (deck: Deck) => {
    Alert.alert('Coming soon', `"${deck.name}" launches with the next update.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeader}>Your Decks</Text>
      <FlatList
        data={owned}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLS}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <DeckCell
            deck={item}
            active={game.activeDecks.includes(item.id)}
            onPress={() => toggleActive(item)}
          />
        )}
      />

      <Text style={styles.sectionHeader}>Get More Decks</Text>
      <FlatList
        data={locked}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLS}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <DeckCell deck={item} locked onPress={() => showLockedAlert(item)} />
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: ACCENT,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 6,
  },
});

export default DecksScreen;
```

- [ ] **Step 2: Update RootNavigator header options for Decks**

In `mobile/src/navigation/RootNavigator.tsx`, replace line 57:

```tsx
<Stack.Screen name="Decks" component={DecksScreen} options={{ title: 'Decks' }} />
```

with:

```tsx
<Stack.Screen
  name="Decks"
  component={DecksScreen}
  options={{
    title: 'Decks',
    headerShown: true,
    headerBackTitle: 'Back',
    headerTintColor: '#1EAFE2',
  }}
/>
```

- [ ] **Step 3: Start dev server (background, only if not already running)**

```bash
cd mobile && pnpm start
```
Run with `run_in_background: true`. Skip if a dev server is already running.

- [ ] **Step 4: Boot the app in simulator and navigate to Decks via gear icon**

In Simulator: launch the app → tap "Quick Play" → tap the gear icon on CardSelectionScreen.

- [ ] **Step 5: Capture screenshot and verify visuals**

```bash
xcrun simctl io booted screenshot /tmp/decks.png && \
cp /tmp/decks.png /tmp/decks-land.png && \
sips -r 90 /tmp/decks-land.png >/dev/null 2>&1
```
Use Read tool on `/tmp/decks-land.png`. Verify:
- White background
- "Your Decks" cyan section header
- 5-column blob grid below it
- "Get More Decks" cyan section header
- Locked decks shown with lock emoji prefix
- Header bar visible with "Decks" title and back chevron

- [ ] **Step 6: Verify back-nav works**

Tap the back chevron in the header. Verify return to CardSelectionScreen ("Select a card..." text visible). Capture screenshot if needed.

If back chevron is missing or non-functional, the most likely fix is to ensure react-native-screens is enabling the native header — confirm `headerShown: true` is set (Step 2). If still broken, add `gestureEnabled: true` to the Decks screen options.

- [ ] **Step 7: Verify locked-deck tap shows alert**

Tap a deck in the "Get More Decks" section. Verify "Coming soon" alert appears with the deck name. Dismiss alert.

- [ ] **Step 8: Verify active-deck toggle**

Tap a deck in the "Your Decks" section. Verify the cyan border appears. Tap again — border disappears.

- [ ] **Step 9: Commit**

```bash
git add mobile/src/screens/DecksScreen.tsx mobile/src/navigation/RootNavigator.tsx
git commit -m "feat: rewrite DecksScreen as iOS-parity two-section grid"
```

---

## Task 5: Add Rate Us row to SettingsScreen

**Files:**
- Modify: `mobile/src/screens/SettingsScreen.tsx`

- [ ] **Step 1: Add the Rate Us import and row**

In `mobile/src/screens/SettingsScreen.tsx`:

Add to imports at the top:

```tsx
import * as StoreReview from 'expo-store-review';
```

Replace lines 34-39 (the Tutorial and Rules link buttons) with:

```tsx
      <Pressable
        style={styles.linkButton}
        onPress={async () => {
          if (await StoreReview.isAvailableAsync()) {
            StoreReview.requestReview();
          } else {
            Alert.alert('Rate Us', 'Store review is not available on this device.');
          }
        }}
      >
        <Text style={styles.linkText}>Rate Us</Text>
      </Pressable>

      <Pressable style={styles.linkButton} onPress={() => navigation.navigate('Tutorial')}>
        <Text style={styles.linkText}>View tutorial</Text>
      </Pressable>
      <Pressable style={styles.linkButton} onPress={() => navigation.navigate('Rules')}>
        <Text style={styles.linkText}>Rules</Text>
      </Pressable>
```

Also add `Alert` to the existing react-native import (line 2 currently is `import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';`):

```tsx
import { View, Text, StyleSheet, Switch, Pressable, Alert } from 'react-native';
```

- [ ] **Step 2: Boot the app and navigate to Settings**

The existing route is `cartegories://settings` per the linking config. In simulator, deep-link to it:

```bash
xcrun simctl openurl booted "cartegories://settings"
```

- [ ] **Step 3: Capture screenshot, verify Rate Us row appears**

```bash
xcrun simctl io booted screenshot /tmp/settings.png && \
cp /tmp/settings.png /tmp/settings-land.png && \
sips -r 90 /tmp/settings-land.png >/dev/null 2>&1
```

Read `/tmp/settings-land.png`. Verify "Rate Us" row is present alongside Sound Effects, Timer, View Tutorial, Rules.

- [ ] **Step 4: Tap Rate Us, verify behavior**

In simulator, tap "Rate Us". On iOS Simulator, `StoreReview.isAvailableAsync()` typically returns false (no App Store) — the fallback Alert should appear with the "not available" message. Acceptable.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/screens/SettingsScreen.tsx
git commit -m "feat: add Rate Us row to SettingsScreen"
```

---

## Task 6: Update Maestro flow for DecksScreen

**Files:**
- Modify: `mobile/.maestro/screens/decks.yaml`

- [ ] **Step 1: Replace Maestro flow**

Replace the entire contents of `mobile/.maestro/screens/decks.yaml` with:

```yaml
appId: com.anonymous.cartegories-mobile
---
- runFlow: ../helpers/launch.yaml
- openLink: "cartegories://card-selection"
- waitForAnimationToEnd

# Tap gear icon on CardSelectionScreen — top-right area
- tapOn:
    accessibilityText: "Decks"

- waitForAnimationToEnd
- assertVisible: "Your Decks"
- assertVisible: "Get More Decks"
- takeScreenshot: decks-loaded

# Toggle a free deck active (use General — always present, free)
- tapOn:
    accessibilityText: "General"
- takeScreenshot: decks-general-active

# Toggle it off
- tapOn:
    accessibilityText: "General"
- takeScreenshot: decks-general-inactive

# Tap a locked deck (Harry Potter is paid in seed data)
- tapOn:
    accessibilityText: "Harry Potter"
- assertVisible: "Coming soon"
- tapOn: "OK"

# Back-nav to CardSelection
- tapOn:
    accessibilityText: "Back"
- waitForAnimationToEnd
- assertVisible: "Select a card..."
- takeScreenshot: decks-back-to-card-selection
```

- [ ] **Step 2: Verify seed data alignment**

Check that "General" is free and "Harry Potter" is paid in the seed data:

```bash
grep -E "(General|Harry Potter)" mobile/src/db/seed.ts || \
grep -E "(General|Harry Potter)" mobile/src/db/*.ts
```

If those exact deck names aren't free/paid as written, swap them in the YAML for ones that are. Confirm via `grep -E "isFree" mobile/src/db/`.

- [ ] **Step 3: Run the Maestro flow**

```bash
maestro test mobile/.maestro/screens/decks.yaml
```

Expected: All steps pass. Screenshots saved to `~/.maestro/tests/<run-id>/`.

- [ ] **Step 4: If any assertion fails, diagnose and fix**

Common issues:
- `accessibilityText: "Back"` may not match — check the actual back button label (might be `"Decks"` reversed or just a chevron). Adjust the selector to use `id` or screen-relative coordinates as fallback.
- `accessibilityText: "Decks"` for the gear icon: this comes from `CardSelectionScreen.tsx:123` `accessibilityLabel="Decks"`. Should work.
- Locked deck name: re-check seed data.

Iterate until the flow is green.

- [ ] **Step 5: Commit**

```bash
git add mobile/.maestro/screens/decks.yaml
git commit -m "test: add full DecksScreen interaction Maestro flow"
```

---

## Task 7: Run full test suite & final verification

**Files:** none

- [ ] **Step 1: Run unit tests**

```bash
cd mobile && pnpm test
```

Expected: All tests pass, including new `partitionDecks` tests.

- [ ] **Step 2: TypeScript check**

```bash
cd mobile && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Final screenshot of finished DecksScreen**

In simulator, navigate Home → Quick Play → gear → Decks. Capture and review final visual:

```bash
xcrun simctl io booted screenshot /tmp/decks-final.png && \
cp /tmp/decks-final.png /tmp/decks-final-land.png && \
sips -r 90 /tmp/decks-final-land.png >/dev/null 2>&1
```

Read `/tmp/decks-final-land.png`. Confirm matches the spec.

- [ ] **Step 4: Update screen-parity-status.md**

In `docs/context/projects/active/screen-parity-status.md`, move DecksScreen from Partial to Complete:

```markdown
| DecksScreen | DeckCollectionViewController | Two-section blob grid (Your Decks + Get More Decks). IAP stubbed with "Coming soon" alerts. Options moved to SettingsScreen. |
```

Remove the corresponding row from the Partial table.

In Known Issues, remove the "DecksScreen back-nav broken" line.

- [ ] **Step 5: Commit doc update**

```bash
git add docs/context/projects/active/screen-parity-status.md
git commit -m "docs: mark DecksScreen as complete in parity status"
```

---

## Out of Scope (Confirmed)

- Real IAP / RevenueCat integration
- Buy All Decks hero cell
- Purchase confirmation modals
- Restore purchases UI
- Full SettingsScreen rework (timer state sync to GameContext, header redesign, etc.)
- NEW / FREE deck banners
- Animations / custom transitions
