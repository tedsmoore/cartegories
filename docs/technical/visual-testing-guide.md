# Visual Testing Guide

How to iterate on mobile UI layout with Claude Code.

## Quick Approach: Simulator Screenshots

Works now, no setup required. Claude can take screenshots of the iOS Simulator and view them to debug layout issues.

### Prerequisites
- iOS Simulator running (open Simulator.app or launch via Xcode)
- App loaded in the simulator (connect to Expo dev server)
- Simulator rotated to landscape (Cmd + Left/Right Arrow in Simulator)

### Workflow

1. **Start the Expo dev server** so Claude can trigger hot reloads:
   ```bash
   cd mobile && pnpm start
   ```
   Claude should run this via `run_in_background: true` so the server persists across conversation turns.

2. **Change initialRouteName** to jump directly to the screen being worked on:
   ```typescript
   // src/navigation/RootNavigator.tsx
   <Stack.Navigator initialRouteName="CardSelection">
   ```

3. **Take a screenshot and rotate it** (simulator captures in portrait pixel buffer):
   ```bash
   xcrun simctl io booted screenshot /tmp/screen.png && \
   cp /tmp/screen.png /tmp/screen-land.png && \
   sips -r 90 /tmp/screen-land.png >/dev/null 2>&1
   ```
   Then use the Read tool to view `/tmp/screen-land.png`.

4. **Add debug borders** to inspect layout:
   ```typescript
   borderWidth: 2,
   borderColor: 'red',
   ```

5. **Force test content** to check edge cases (long strings, empty states):
   ```typescript
   {'Things You Might Find in a Really Old Refrigerator'}
   ```

6. **Iterate**: edit → hot reload (press `r` in Expo terminal or save file) → screenshot → view → repeat.

7. **Clean up** before committing: remove debug borders, test strings, restore `initialRouteName`.

### Tips
- `sips -r 90` for landscape-left, `sips -r 270` for landscape-right
- Screenshots always use the device's native orientation regardless of simulator window rotation
- The Dynamic Island camera cutout is at the top of the portrait frame (right side in landscape) — account for it with safe area insets

## Better Approach: Maestro (Recommended Setup)

[Maestro](https://maestro.mobile.dev/) is a mobile UI testing framework that can navigate screens, tap buttons, type text, and assert layout — like Playwright for mobile.

### Install
```bash
brew install maestro
```

### Example Flow
Create `mobile/.maestro/card-selection.yaml`:
```yaml
appId: com.digifuzz.cartegories
---
- launchApp
- tapOn: "Quick Play"
- assertVisible: "Select a card..."
- tapOn: "New Card"
- assertVisible:
    id: "categoryText"
- takeScreenshot: card-selection-with-card
- tapOn: "New Card"  # draw second card
- takeScreenshot: card-selection-second-card
```

### Run
```bash
maestro test mobile/.maestro/card-selection.yaml
```

### Benefits
- Claude can run full interaction flows without manual taps
- Screenshots at each step for visual verification
- Assertions catch regressions automatically
- Runs on simulator — no physical device needed
- YAML-based — easy to write and maintain

### Integration with Claude Code
Claude can:
1. Write Maestro flows for the screen being worked on
2. Run them and inspect screenshot output
3. Iterate on layout without human-in-the-loop for every change
4. Use flows as regression tests going forward

### Selector conventions

Use `tapOn: { id: "<testID>" }` for every tap after the first. Label/text selectors (`tapOn: "Quick Play"`) work for the opening interaction in a flow, but silently no-op on follow-on taps in landscape. Maestro reports `COMPLETED` and the app gets nothing. The first tap from a fresh launch is the only label tap you can trust; everything after needs a testID.

For each Pressable or Touchable that Maestro needs to tap or assert, give it a `testID`. Conventions in this repo:

- Nav controls: `decks-gear`, `screen-header-back`
- List items: derive from a stable id, e.g. `deck-cell-${deck.id}` (slug-based)
- Section headers: `your-decks-header`, `get-more-decks-header`
- Scroll containers: `<screen>-scroll-view`

iOS native alerts are an exception: `tapOn: "OK"` on an `Alert.alert` button works no matter when it fires, because the alert sits outside the React Native a11y tree.

Add testIDs as you write the JSX, not after. Retrofitting means another build. While you're there, pair them with `accessibilityLabel` and `accessibilityRole="button"` so VoiceOver users get the same affordances Maestro does.
