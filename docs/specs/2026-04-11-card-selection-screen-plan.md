# Card Selection Screen — iOS Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite CardSelectionScreen to match the iOS original — mountain scape background, animated blob character, speech bubble, vector buttons at bottom corners, white nav icons, and shake-to-go-back.

**Architecture:** Single screen rewrite of `CardSelectionScreen.tsx` plus extraction of the blob image map (currently duplicated in `DecksScreen.tsx`) into a shared constant. Add `expo-sensors` for shake detection. No new components needed — reuse existing `Button`.

**Tech Stack:** React Native `Animated`, `expo-sensors` (Accelerometer), `ImageBackground`, existing `Button` component.

**Spec:** `docs/specs/2026-04-11-card-selection-screen-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/constants/deckImages.ts` | Shared blob image map (extracted from DecksScreen) |
| Modify | `src/screens/CardSelectionScreen.tsx` | Full rewrite — mountain scape, blob, buttons, nav icons |
| Modify | `src/screens/DecksScreen.tsx:7-20` | Import from shared constant instead of inline map |
| Create | `src/__tests__/deckImages.test.ts` | Verify blob map covers all decks |
| Create | `src/hooks/useShake.ts` | Shake detection hook using Accelerometer |
| Create | `src/__tests__/useShake.test.ts` | Shake hook unit tests |

---

### Task 1: Extract Blob Image Map to Shared Constant

**Files:**
- Create: `src/constants/deckImages.ts`
- Create: `src/__tests__/deckImages.test.ts`
- Modify: `src/screens/DecksScreen.tsx:7-20`

- [ ] **Step 1: Write the test**

Create `mobile/src/__tests__/deckImages.test.ts`:

```typescript
import { DECK_IMAGES, getBlobImage } from '../constants/deckImages';

describe('deckImages', () => {
  it('returns the correct blob for a known deck name', () => {
    const image = getBlobImage('Food & Drink');
    expect(image).toBeDefined();
    expect(image).toBe(DECK_IMAGES['Food & Drink']);
  });

  it('returns general blob for unknown deck name', () => {
    const image = getBlobImage('Nonexistent Deck');
    expect(image).toBe(DECK_IMAGES['General']);
  });

  it('returns general blob for undefined', () => {
    const image = getBlobImage(undefined);
    expect(image).toBe(DECK_IMAGES['General']);
  });

  it('has entries for all known decks', () => {
    const expectedDecks = [
      'Food & Drink', 'General', 'Harry Potter',
      'History & Geography', 'Music', 'Sci-Fi & Fantasy',
      'Science & Nature', 'Sports & Leisure', 'TV & Movies',
      'Theater', 'Video Games', 'Wordplay',
    ];
    for (const deck of expectedDecks) {
      expect(DECK_IMAGES[deck]).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd mobile && pnpm test -- --testPathPattern=deckImages`
Expected: FAIL — module not found

- [ ] **Step 3: Create the shared constant**

Create `mobile/src/constants/deckImages.ts`:

```typescript
import { ImageSourcePropType } from 'react-native';

export const DECK_IMAGES: Record<string, ImageSourcePropType> = {
  'Food & Drink': require('../../assets/images/blobs-food-and-drink.png'),
  'General': require('../../assets/images/blobs-general.png'),
  'Harry Potter': require('../../assets/images/blobs-harry-potter.png'),
  'History & Geography': require('../../assets/images/blobs-history-and-geography.png'),
  'Music': require('../../assets/images/blobs-music.png'),
  'Sci-Fi & Fantasy': require('../../assets/images/blobs-sci-fi-and-fantasy.png'),
  'Science & Nature': require('../../assets/images/blobs-science-and-nature.png'),
  'Sports & Leisure': require('../../assets/images/blobs-sports-and-leisure.png'),
  'TV & Movies': require('../../assets/images/blobs-tv-and-movies.png'),
  'Theater': require('../../assets/images/blobs-theater.png'),
  'Video Games': require('../../assets/images/blobs-video-games.png'),
  'Wordplay': require('../../assets/images/blobs-wordplay.png'),
};

export const getBlobImage = (deckName: string | undefined): ImageSourcePropType => {
  if (deckName && DECK_IMAGES[deckName]) {
    return DECK_IMAGES[deckName];
  }
  return DECK_IMAGES['General'];
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd mobile && pnpm test -- --testPathPattern=deckImages`
Expected: PASS — all 4 tests

- [ ] **Step 5: Update DecksScreen to use shared constant**

In `mobile/src/screens/DecksScreen.tsx`, replace lines 7-20:

```typescript
// Delete the inline DECK_IMAGES constant and replace with:
import { DECK_IMAGES } from '../constants/deckImages';
```

Remove the old `const DECK_IMAGES: Record<string, ImageSourcePropType> = { ... };` block entirely.

- [ ] **Step 6: Run full test suite**

Run: `cd mobile && pnpm test`
Expected: All existing tests pass

- [ ] **Step 7: Commit**

```bash
git add mobile/src/constants/deckImages.ts mobile/src/__tests__/deckImages.test.ts mobile/src/screens/DecksScreen.tsx
git commit -m "extract deck blob images to shared constant"
```

---

### Task 2: Create useShake Hook

**Files:**
- Create: `src/hooks/useShake.ts`
- Create: `src/__tests__/useShake.test.ts`

- [ ] **Step 1: Install expo-sensors**

Run: `cd mobile && pnpm add expo-sensors`

- [ ] **Step 2: Write the test**

Create `mobile/src/__tests__/useShake.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useShake } from '../hooks/useShake';
import { Accelerometer } from 'expo-sensors';

jest.mock('expo-sensors', () => ({
  Accelerometer: {
    addListener: jest.fn(),
    setUpdateInterval: jest.fn(),
    removeSubscription: jest.fn(),
  },
}));

describe('useShake', () => {
  let mockListener: ((data: { x: number; y: number; z: number }) => void) | null = null;

  beforeEach(() => {
    mockListener = null;
    (Accelerometer.addListener as jest.Mock).mockImplementation((cb) => {
      mockListener = cb;
      return { remove: jest.fn() };
    });
  });

  it('calls onShake when acceleration exceeds threshold', () => {
    const onShake = jest.fn();
    renderHook(() => useShake(onShake));

    expect(mockListener).not.toBeNull();

    // Simulate a strong shake
    act(() => {
      mockListener!({ x: 3.0, y: 0, z: 0 });
    });

    expect(onShake).toHaveBeenCalledTimes(1);
  });

  it('does not call onShake for normal movement', () => {
    const onShake = jest.fn();
    renderHook(() => useShake(onShake));

    act(() => {
      mockListener!({ x: 0.1, y: 0.2, z: 1.0 });
    });

    expect(onShake).not.toHaveBeenCalled();
  });

  it('debounces rapid shakes', () => {
    jest.useFakeTimers();
    const onShake = jest.fn();
    renderHook(() => useShake(onShake));

    act(() => {
      mockListener!({ x: 3.0, y: 0, z: 0 });
    });
    act(() => {
      mockListener!({ x: 3.0, y: 0, z: 0 });
    });

    expect(onShake).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd mobile && pnpm test -- --testPathPattern=useShake`
Expected: FAIL — module not found

- [ ] **Step 4: Implement the hook**

Create `mobile/src/hooks/useShake.ts`:

```typescript
import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

const SHAKE_THRESHOLD = 1.5;
const DEBOUNCE_MS = 1000;

export const useShake = (onShake: () => void) => {
  const lastShakeRef = useRef(0);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (magnitude > SHAKE_THRESHOLD && now - lastShakeRef.current > DEBOUNCE_MS) {
        lastShakeRef.current = now;
        onShakeRef.current();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd mobile && pnpm test -- --testPathPattern=useShake`
Expected: PASS — all 3 tests

- [ ] **Step 6: Commit**

```bash
git add mobile/src/hooks/useShake.ts mobile/src/__tests__/useShake.test.ts mobile/package.json mobile/pnpm-lock.yaml
git commit -m "add useShake hook with expo-sensors accelerometer"
```

---

### Task 3: Rewrite CardSelectionScreen

**Files:**
- Modify: `src/screens/CardSelectionScreen.tsx` (full rewrite)

- [ ] **Step 1: Rewrite the screen**

Replace entire contents of `mobile/src/screens/CardSelectionScreen.tsx`:

```typescript
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  Animated,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';
import { Card } from '../types';
import { getBlobImage } from '../constants/deckImages';
import { useShake } from '../hooks/useShake';
import Button from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'CardSelection'>;

const CardSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { drawCard, game, decks } = useGame();
  const { width, height } = useWindowDimensions();
  const [card, setCard] = useState<Card | null>(game.currentCard);
  const [previousCard, setPreviousCard] = useState<Card | null>(null);
  const [speechVisible, setSpeechVisible] = useState(false);

  // Blob slide-in animation
  const blobTranslateX = useRef(new Animated.Value(-width * 0.4)).current;
  const speechOpacity = useRef(new Animated.Value(0)).current;

  // Run blob entrance on mount
  const hasAnimated = useRef(false);
  if (!hasAnimated.current) {
    hasAnimated.current = true;
    setTimeout(() => {
      Animated.spring(blobTranslateX, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, 100);
  }

  const getDeckName = (deckId: string): string => {
    const deck = decks.find((d) => d.id === deckId);
    return deck?.name ?? 'General';
  };

  const onDrawCard = () => {
    if (card) {
      setPreviousCard(card);
    }
    const next = drawCard();
    setCard(next);
  };

  const onPlay = () => {
    if (card) {
      navigation.navigate('Play');
    }
  };

  const toggleSpeechBubble = () => {
    const toValue = speechVisible ? 0 : 1;
    setSpeechVisible(!speechVisible);
    Animated.timing(speechOpacity, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const onShake = useCallback(() => {
    if (!previousCard) return;
    Alert.alert(
      'Go back?',
      `Return to: ${previousCard.category}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            setCard(previousCard);
            setPreviousCard(null);
          },
        },
      ],
    );
  }, [previousCard]);

  useShake(onShake);

  const deckName = card ? getDeckName(card.deckId) : undefined;
  const blobSource = getBlobImage(deckName);
  const blobHeight = height * 0.4;

  return (
    <ImageBackground
      source={require('../../assets/images/mountain-scape.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Nav icons */}
        <View style={styles.navRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Image
              source={require('../../assets/images/white-home-icon.png')}
              style={styles.navIcon}
            />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Decks')} hitSlop={12}>
            <Image
              source={require('../../assets/images/white-gear.png')}
              style={styles.navIcon}
            />
          </Pressable>
        </View>

        {/* Category text */}
        <View style={styles.categoryArea}>
          <Text style={styles.categoryText}>
            {card ? card.category : 'Select a card...'}
          </Text>
        </View>

        {/* Blob character */}
        <Animated.View
          style={[
            styles.blobContainer,
            {
              height: blobHeight,
              transform: [{ translateX: blobTranslateX }, { rotate: '30deg' }],
            },
          ]}
        >
          <Pressable onPress={toggleSpeechBubble}>
            <Image
              source={blobSource}
              style={{ height: blobHeight, width: blobHeight * 0.75 }}
              resizeMode="contain"
            />
          </Pressable>
        </Animated.View>

        {/* Speech bubble */}
        <Animated.View
          style={[
            styles.speechContainer,
            { opacity: speechOpacity },
          ]}
        >
          <Image
            source={require('../../assets/images/speech-bubble.png')}
            style={styles.speechImage}
            resizeMode="contain"
          />
          <Text style={styles.speechText}>
            {deckName ?? 'General'}
          </Text>
        </Animated.View>

        {/* Buttons */}
        <View style={styles.buttonLeft}>
          <Button
            title="New Card"
            baseColor="#e94b24"
            onPress={onDrawCard}
            width={130}
            breathing={!card}
          />
        </View>

        <View style={[styles.buttonRight, !card && { opacity: 0.4 }]}>
          <Button
            title="PLAY!"
            baseColor="#e94b24"
            onPress={onPlay}
            width={130}
            breathing={!!card}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  navIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  categoryArea: {
    position: 'absolute',
    top: '35%',
    right: '5%',
    width: '55%',
    alignItems: 'center',
  },
  categoryText: {
    fontFamily: 'NanumBrush',
    fontSize: 36,
    color: '#1e293b',
    textAlign: 'center',
  },
  blobContainer: {
    position: 'absolute',
    bottom: '12%',
    left: '5%',
  },
  speechContainer: {
    position: 'absolute',
    top: '15%',
    left: '8%',
    width: 160,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  speechText: {
    fontFamily: 'NanumBrush',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    paddingBottom: 8,
  },
  buttonLeft: {
    position: 'absolute',
    bottom: '4%',
    left: '5%',
  },
  buttonRight: {
    position: 'absolute',
    bottom: '4%',
    right: '5%',
  },
});

export default CardSelectionScreen;
```

- [ ] **Step 2: Verify Metro bundler compiles**

Run: `cd mobile && npx expo export --platform ios`
Expected: Bundle compiles with no errors

- [ ] **Step 3: Run full test suite**

Run: `cd mobile && pnpm test`
Expected: All tests pass (existing tests should be unaffected since CardSelectionScreen had no tests)

- [ ] **Step 4: Commit**

```bash
git add mobile/src/screens/CardSelectionScreen.tsx
git commit -m "rewrite card selection screen to match iOS original"
```

---

### Task 4: Visual Testing & Polish

This task requires running the app on a device or simulator to verify the layout.

- [ ] **Step 1: Start the dev server**

Run: `cd mobile && pnpm start`

- [ ] **Step 2: Test initial state (no card drawn)**

Verify on device/simulator:
- Mountain scape background fills screen
- White home icon top-left, gear icon top-right
- "Select a card..." text centered in right portion of screen
- Blob character slides in from left with spring animation, rotated 30°
- "New Card" button bottom-left, breathing
- "PLAY!" button bottom-right, grayed out (opacity 0.4), not breathing
- Speech bubble hidden

- [ ] **Step 3: Test card draw**

Tap "New Card":
- Category text updates to drawn card's category name
- Blob image changes to match the card's deck
- "New Card" stops breathing
- "PLAY!" becomes full opacity and starts breathing

- [ ] **Step 4: Test speech bubble**

Tap the blob character:
- Speech bubble fades in (300ms) above blob
- Shows the deck name
- Tap blob again — bubble fades out

- [ ] **Step 5: Test navigation**

- Tap home icon → returns to Home screen
- Navigate back to CardSelection, tap gear icon → goes to Decks screen

- [ ] **Step 6: Test shake-to-go-back**

- Draw two cards (so previousCard exists)
- Shake device
- Alert appears: "Go back? Return to: {previous category}?"
- Tap OK → reverts to previous card
- Tap Cancel → stays on current card

- [ ] **Step 7: Test PLAY! button**

- Draw a card, tap PLAY! → navigates to Play screen
- Verify game plays normally with the selected card

- [ ] **Step 8: Fix any layout issues**

Adjust positioning percentages if blob overlaps text, buttons are too close to edges, etc. Common tweaks:
- `blobContainer.bottom` / `blobContainer.left` for blob position
- `categoryArea.top` / `categoryArea.right` / `categoryArea.width` for text placement
- `speechContainer.top` / `speechContainer.left` for bubble alignment relative to blob

- [ ] **Step 9: Commit fixes**

```bash
git add mobile/src/screens/CardSelectionScreen.tsx
git commit -m "polish card selection screen layout"
```

- [ ] **Step 10: Final Metro bundle check**

Run: `cd mobile && npx expo export --platform ios`
Expected: Clean compile
