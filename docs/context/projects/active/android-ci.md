# Android + Maestro CI — scoping

Get Cartegories building on Android, then use Android-on-Linux as the primary CI gate. Written 2026-05-06 after iOS Maestro flows landed end-to-end (PR #17).

## Why now

React Native was the platform choice because cross-platform was the plan. Doing Android now keeps the platforms in lockstep and doubles as cheap CI. Every iOS-only screen is debt against the eventual Android launch.

## The tradeoff

Android CI on Linux is ~10× cheaper than iOS CI on macOS, and catches logic, layout, and navigation regressions. It does NOT catch iOS-driver-specific bugs (the multi-tap-no-op we just fixed was XCUITest, not UIAutomator). Periodic iOS run on a slower cadence covers the gap.

## Phases (sequenced; do not parallelize)

### Phase 1 — Android building locally

- Install Android Studio + SDK + an emulator image (Pixel 7, current API)
- Set `ANDROID_HOME`, add `platform-tools` to PATH
- `pnpm exec expo prebuild` regenerates `mobile/android/` from `app.json`
- `pnpm exec expo run:android` builds + installs on the emulator
- Smoke test: launch, draw a card, play, see categories

Likely friction: Java/Gradle version mismatch with current Expo SDK, missing `ANDROID_HOME`, prebuild overwriting native edits (same chicken-and-egg as iOS — see `docs/context/technical/ios-device-setup.md` for the pattern).

### Phase 2 — Fix what breaks on Android

Surfaces likely to need attention:

- `expo-font` (NanumBrush) — verify loads on Android
- `expo-av` (sound) — Android audio permissions in some configs
- `expo-sensors` (shake gesture) — accelerometer permission in manifest
- `react-native-purchases` (RevenueCat) — Play Store config; defer if monetization isn't shipping
- `expo-store-review` — works but launches Play Store flow
- System UI: `Alert.alert` renders as Material dialog, system back button, predictive back gesture (Android 14+)

Approach: get the app launching and playable first. File Play Store integration and IAP separately. Do not block CI on monetization.

### Phase 3 — Maestro on Android

Bundle-id wrinkle: iOS is `com.anonymous.cartegories-mobile`, Android is `com.anonymous.cartegoriesmobile` (no dash; per `app.json`). Two options:

1. Parameterize `appId` via `MAESTRO_APP_ID` env var
2. Two thin entry-point YAMLs (`decks-ios.yaml`, `decks-android.yaml`) that `runFlow:` into a shared body

Pick when we get there. Convert `decks.yaml` first (already green on iOS); expand to other screens later.

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

Phase 1 only. Do not try to do all four in one session. Phase 4 is gated on 1-3 working locally.
