# Android + Maestro CI — scoping

Get Cartegories building on Android, then use Android-on-Linux as the primary CI gate. Written 2026-05-06 after iOS Maestro flows landed end-to-end (PR #17).

## Why now

React Native was the platform choice because cross-platform was the plan. Doing Android now keeps the platforms in lockstep and doubles as cheap CI. Every iOS-only screen is debt against the eventual Android launch.

## The tradeoff

Android CI on Linux is ~10× cheaper than iOS CI on macOS, and catches logic, layout, and navigation regressions. It does NOT catch iOS-driver-specific bugs (the multi-tap-no-op we just fixed was XCUITest, not UIAutomator). Periodic iOS run on a slower cadence covers the gap.

## Phases (sequenced; do not parallelize)

### Phase 1 — Android building locally — DONE 2026-05-10

Working setup on Ted's Mac (Apple Silicon, Java 17 already installed):

```
# already had: android-commandlinetools cask, ANDROID_HOME set, adb/sdkmanager on PATH
yes | sdkmanager --licenses
sdkmanager "emulator" "platforms;android-35" "system-images;android-35;google_apis;arm64-v8a"
echo "no" | avdmanager create avd -n Pixel_7_API_35 -k "system-images;android-35;google_apis;arm64-v8a" -d "pixel_7"
"$ANDROID_HOME/emulator/emulator" -avd Pixel_7_API_35 &
cd mobile && pnpm exec expo prebuild --platform android --no-install
pnpm exec expo run:android   # no --device flag; it auto-picks the running emulator
```

First-time build: ~5m on Apple Silicon (gradle 8.14.3 + NDK + dep download). Subsequent builds will be much faster (gradle daemon, cached deps).

Findings:
- No code changes needed — app launched first try, decks seeded, HomeScreen rendered.
- `expo run:android --device <adb-id>` does not work; expects AVD name. Easier to just omit and let it auto-select.
- `userInterfaceStyle: light` triggers a "install expo-system-ui" warning at prebuild; benign for Phase 1, file if dark mode comes up later.
- `expo-av` deprecation warning on launch — already deprecated for SDK 54, migrate to `expo-audio`/`expo-video` eventually.
- Cloud-auto-scroll animation works on Android (pre-existing app behavior, not regression).

### Phase 2 — Fix what breaks on Android — DONE 2026-05-10

Played the full loop on the Pixel 7 emulator: Home → CardSelection → draw card → CardSelection (with PLAY now active) → Game → toggle items → GameOver. Nothing broke, no code changes.

What I checked and it worked:
- NanumBrush + Witless fonts render. `expo-font` is fine on Android.
- Sound effects play. logcat: `AudioTrack: stop(18): called with 91008 frames delivered` — `expo-av` is wired.
- SQLite migrations ran, 15 decks seeded.
- Landscape lock honored.
- Switch taps bump the score and the row text turns green.
- Timer counts down and fires GameOver at :00.
- System back button (KEYCODE_BACK) walks the React Navigation stack as expected; no BackHandler code needed.
- `react-native-screens`, `react-navigation/native-stack`, blob/mountain image assets all fine.

The scoping doc anticipated breakage in `Alert.alert`, `expo-sensors` (shake), `react-native-purchases`, and `expo-store-review`. None of those are imported in `src/` yet, so there's nothing to test on Android until those features actually exist. Revisit when the iOS recreation gets to them.

Warnings to track but not block on:
- `expo-av` deprecation (SDK 54 wants `expo-audio` / `expo-video`)
- `userInterfaceStyle: light` at prebuild asks for `expo-system-ui`; cosmetic
- A pile of Kotlin deprecation warnings inside `expo-modules-core` and `expo`; upstream, not ours

Original Phase 2 surfaces (kept as a record of what was anticipated):
- `expo-font` (NanumBrush) — verify loads on Android
- `expo-av` (sound) — Android audio permissions in some configs
- `expo-sensors` (shake gesture) — accelerometer permission in manifest
- `react-native-purchases` (RevenueCat) — Play Store config; defer if monetization isn't shipping
- `expo-store-review` — works but launches Play Store flow
- System UI: `Alert.alert` renders as Material dialog, system back button, predictive back gesture (Android 14+)

### Phase 3 — Maestro on Android

Bundle-id is unified at `com.digifuzz.cartegories` for both platforms as of 2026-05-10 (renamed early — see digifuzz-apple-distribution doc). One `appId:` value per yaml works on both. Convert `decks.yaml` first (already green on iOS); expand to other screens later.

Specific flows likely to need platform-specific handling:

- Alert dismissal: iOS native `Alert.alert` looks different from Android Material dialog; the "OK" tap and "Coming soon" assertion may need duplicates
- System back button: Android-only path; decide whether to test it

### Phase 4 — CI workflow

Linux runner with `reactivecircus/android-emulator-runner` (the standard GitHub Action for Android emulators in CI).

Workflow shape:
- Trigger: PR + push to main
- Steps: checkout → Node setup → `pnpm install` → typecheck → jest → `expo prebuild --platform android` → boot emulator → `expo run:android` → run Maestro flows
- Surface Maestro screenshots and logs as artifacts on failure

Periodic iOS check (separate workflow):
- Nightly cron or pre-release tag
- macOS runner, full Maestro flow against iOS sim
- Lower cadence, lower cost

## Open decisions

- Bundle-id strategy for Maestro (env var vs. dual entry files)
- Whether Phase 1 starts before or after PR #17 merges (probably after, to avoid stacking branches)
- Self-hosted Mac for periodic iOS check (probably no — no spare hardware to dedicate)
- Which flows go in CI initially (start with `decks.yaml`; expand as more screens get Maestro coverage)

## Side benefits beyond CI

- Real Android playtest for Emily, James, and anyone not on iOS
- Play Store internal testing as a parallel distribution path to the deferred Digifuzz Apple flow
- Android-first launch becomes viable if iOS distribution stays gated on enrollment

## Next session

Phases 1 and 2 are done. Next is Phase 3 (Maestro on Android — decide bundle-id strategy, port `decks.yaml`). Phase 4 (Linux CI) follows.
