# Maestro multi-tap-no-op in landscape — follow-up

Investigation thread parked from the 2026-04-27 session. Pick this up
when restoring deferred Maestro assertions in `mobile/.maestro/screens/decks.yaml`
or before adding more in-app-tap navigation flows.

## The bug

In landscape orientation against the iPhone 17 simulator (iOS 26.1), Maestro
reports `Tap on "<Label>" ... COMPLETED` but the app receives no touch event for
**any label-based tap that is not the first interaction after a fresh launch**.
Symptom: the gear icon, "< Back", "OK" on the deeplink confirmation alert,
and follow-on label taps all silently no-op. The first label tap after
`launchApp + setOrientation: LANDSCAPE_LEFT` works.

Workarounds proven during investigation:

- `tapOn: { point: "X,Y" }` always works regardless of position in the flow.
- Each `runFlow: helpers/launch.yaml` re-arms one label tap.

The original PR 14 hypothesis (cells overflow on i17) was **wrong** — landscape
rendering is correct. The deferred assertions were misdiagnosed.

## Why this matters

Three deck flow assertions are currently deferred in `decks.yaml`:

1. `scrollUntilVisible "get-more-decks-header"` + screenshot
2. Locked-deck "Coming soon" alert (tap "Harry Potter", assert text, dismiss "OK")
3. Back-nav round-trip (tap "< Back", assert returned to CardSelection)

All three depend on label-based taps after the initial gear nav.

## What we tried (and didn't work)

- `setOrientation: LANDSCAPE_LEFT` between taps to re-sync — no effect.
- iOS `simctl openurl` deeplinks with `setOrientation: PORTRAIT` to dismiss
  the iOS 17+ "Open in 'app'?" confirmation — system alert ignored portrait
  rotation (app is landscape-locked); also tap on Cancel button reported
  COMPLETED but didn't dismiss (likely same coord-frame issue).

## Hypotheses worth testing

1. **Release-build path eliminates the dev warning bar overlay.** The dev
   warning bar partially overlaps Quick Play; removing it might also remove
   whatever triggers the desync. Build `expo run:ios --configuration Release`.
2. **XCUITest accessibility-tap path treats coordinates inconsistently after
   the first orientation rotation.** Try setting orientation in the simulator
   *before* launching the app (via `simctl --device <UDID> orientate`) instead
   of via Maestro's `setOrientation` after launch.
3. **Maestro version regression.** Pin/bump Maestro and re-test.
4. **Use `tapOn { id: <testID> }` instead of label-based selectors.** Maestro
   may resolve testID-tagged elements through a different path than text/label.

## Pragmatic interim option

Convert the second-and-onward taps in `decks.yaml` to point coords (a la
`816,38` for the gear). Brittles the test to the iPhone 17 landscape viewport,
which is the only profile we run today anyway. This was tested in-session and
works end-to-end up to the gear nav; would need extending to General toggle,
locked-deck tap, alert OK, and "< Back".

## When to do this

Not blocking shipping. Pre-CI: only meaningful if/when Maestro joins the CI
gate. Pick this up after solving the release-build path so the CI environment
matches the local one.
