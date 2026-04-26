# SettingsScreen Rework + ScreenHeader Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring SettingsScreen to visual parity with the new DecksScreen (cyan header, light theme), fix the hardcoded Timer subtitle, and lift the in-screen header into a shared `ScreenHeader` component used by both screens.

**Architecture:** Extract `ScreenHeader` as a presentational component receiving `title` and `onBack`. Refactor `DecksScreen` to consume it. Rewrite `SettingsScreen` body to a light theme with five flat rows that consume `useGame()` for the live timer value.

**Tech Stack:** React Native 0.81, React Navigation native-stack, react-native-safe-area-context, Jest, expo-store-review.

**Spec:** `docs/specs/2026-04-20-settings-screen-design.md`

---

## File Map

**Create:**
- `mobile/src/components/ScreenHeader.tsx` — reusable cyan header.

**Modify:**
- `mobile/src/screens/DecksScreen.tsx` — replace inline header with `ScreenHeader`, remove now-unused styles/imports.
- `mobile/src/screens/SettingsScreen.tsx` — full rewrite (light theme, `ScreenHeader`, Timer subtitle from `useGame()`).

---

## Task 1: Create `ScreenHeader` component

**Files:**
- Create: `mobile/src/components/ScreenHeader.tsx`

- [ ] **Step 1: Write the component**

Create `mobile/src/components/ScreenHeader.tsx`:

```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title: string;
  onBack: () => void;
};

const ACCENT = '#1EAFE2';

const ScreenHeader: React.FC<Props> = ({ title, onBack }) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        },
      ]}
    >
      <Pressable
        onPress={onBack}
        hitSlop={16}
        accessibilityLabel="Back"
        style={styles.side}
      >
        <Text style={styles.backText}>{'< Back'}</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.side} />
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  side: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    minWidth: 70,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
});

export default ScreenHeader;
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add mobile/src/components/ScreenHeader.tsx
git commit -m "feat: add ScreenHeader shared component"
```

---

## Task 2: Refactor DecksScreen to use ScreenHeader

**Files:**
- Modify: `mobile/src/screens/DecksScreen.tsx`

- [ ] **Step 1: Replace the inline header block**

In `mobile/src/screens/DecksScreen.tsx`:

Remove the import of `useSafeAreaInsets`:

```tsx
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
```

Becomes:

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
```

Remove `Pressable` from the react-native import (no longer used in this file):

```tsx
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
```

Becomes:

```tsx
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
```

Add the import for ScreenHeader:

```tsx
import ScreenHeader from '../components/ScreenHeader';
```

Remove the `const insets = useSafeAreaInsets();` line in the component body.

Replace the inline header block:

```tsx
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top,
            paddingLeft: insets.left + 12,
            paddingRight: insets.right + 12,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={16}
          accessibilityLabel="Back"
          style={styles.backButton}
        >
          <Text style={styles.backText}>{'< Back'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Decks</Text>
        <View style={styles.backButton} />
      </View>
```

with:

```tsx
      <ScreenHeader title="Decks" onBack={() => navigation.goBack()} />
```

- [ ] **Step 2: Remove now-unused styles**

Delete the `headerBar`, `headerTitle`, `backButton`, and `backText` style entries from the StyleSheet.

The remaining styles should be: `container`, `body`, `content`, `centered`, `grid`, `cellWrap`, `sectionHeader`.

- [ ] **Step 3: Verify TypeScript**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean (no errors about unused vars or missing imports).

- [ ] **Step 4: Verify visually**

Reload Metro: `curl -s -X POST http://localhost:8081/reload >/dev/null`

Then deep-link to Decks on the booted i17 simulator (FC229513-1EF5-4850-845B-1F3F3D845F95):

```bash
xcrun simctl openurl FC229513-1EF5-4850-845B-1F3F3D845F95 "cartegories://decks"
sleep 3
xcrun simctl io FC229513-1EF5-4850-845B-1F3F3D845F95 screenshot /tmp/decks-after-extract.png
```

Read `/tmp/decks-after-extract.png` with the Read tool. Verify the cyan header still spans full width, "< Back" white on left, "Decks" white centered. Layout should be visually unchanged from before the refactor.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/screens/DecksScreen.tsx
git commit -m "refactor(decks): use shared ScreenHeader component"
```

---

## Task 3: Rewrite SettingsScreen

**Files:**
- Modify: `mobile/src/screens/SettingsScreen.tsx` (full rewrite)

- [ ] **Step 1: Replace SettingsScreen contents**

Replace the entire contents of `mobile/src/screens/SettingsScreen.tsx` with:

```tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as StoreReview from 'expo-store-review';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useSoundContext } from '../state/SoundContext';
import { useGame } from '../state/GameContext';
import ScreenHeader from '../components/ScreenHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const ACCENT = '#1EAFE2';

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { soundEnabled, setSoundEnabled } = useSoundContext();
  const { game } = useGame();

  const onRateUs = async () => {
    if (await StoreReview.isAvailableAsync()) {
      StoreReview.requestReview();
    } else {
      Alert.alert('Rate Us', 'Store review is not available on this device.');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <SafeAreaView style={styles.body} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Sound Effects</Text>
            </View>
            <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
          </View>

          <Pressable style={styles.row} onPress={() => navigation.navigate('Timer')}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Timer</Text>
              <Text style={styles.rowSubtitle}>
                Currently {game.timeRemaining} seconds
              </Text>
            </View>
            <Text style={styles.chevron}>{'›'}</Text>
          </Pressable>

          <Pressable style={styles.row} onPress={onRateUs}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Rate Us</Text>
            </View>
            <Text style={styles.chevron}>{'›'}</Text>
          </Pressable>

          <Pressable style={styles.row} onPress={() => navigation.navigate('Tutorial')}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>View Tutorial</Text>
            </View>
            <Text style={styles.chevron}>{'›'}</Text>
          </Pressable>

          <Pressable style={styles.row} onPress={() => navigation.navigate('Rules')}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Rules</Text>
            </View>
            <Text style={styles.chevron}>{'›'}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCENT,
  },
  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  row: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 17,
    color: '#0f172a',
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: ACCENT,
    fontWeight: '600',
  },
});

export default SettingsScreen;
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd mobile && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Verify visually**

Reload Metro: `curl -s -X POST http://localhost:8081/reload >/dev/null`

Then on the booted i17 simulator:

```bash
xcrun simctl openurl FC229513-1EF5-4850-845B-1F3F3D845F95 "cartegories://settings"
sleep 3
xcrun simctl io FC229513-1EF5-4850-845B-1F3F3D845F95 screenshot /tmp/settings-after.png
```

Read `/tmp/settings-after.png`. Verify:
- Cyan header bar with "Settings" title and "< Back" button (matches DecksScreen).
- White body with five rows in order: Sound Effects, Timer, Rate Us, View Tutorial, Rules.
- Each row has cyan ">" chevron on the right (except Sound Effects which has the Switch).
- Timer row subtitle reads "Currently 60 seconds" (or whatever the current default timer value is).
- No dark slate anywhere.

- [ ] **Step 4: Commit**

```bash
git add mobile/src/screens/SettingsScreen.tsx
git commit -m "feat(settings): light theme rewrite + ScreenHeader + live timer subtitle"
```

---

## Task 4: Run full verification

**Files:** none

- [ ] **Step 1: Type check**

```bash
cd mobile && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 2: Run unit tests**

```bash
cd mobile && pnpm test
```
Expected: 60/60 tests pass (no test changes in this work; just verify nothing regressed).

- [ ] **Step 3: Update parity status doc**

In `docs/context/projects/active/screen-parity-status.md`:

Move the SettingsScreen row from "Partial" to "Complete":

```markdown
| SettingsScreen | SettingsViewController | Light-theme rewrite. Cyan ScreenHeader, five flat rows (Sound, Timer, Rate Us, Tutorial, Rules). Timer subtitle reads live from GameContext. |
```

Remove the SettingsScreen entry from the Partial table.

Remove the "SettingsScreen Timer subtitle is hardcoded" entry from Known Issues (now fixed).

- [ ] **Step 4: Commit doc update**

```bash
git add docs/context/projects/active/screen-parity-status.md
git commit -m "docs: mark SettingsScreen complete in parity status"
```
