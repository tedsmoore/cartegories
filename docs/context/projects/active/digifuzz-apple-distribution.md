# Digifuzz Apple distribution path

Plan for getting Cartegories distributable through Digifuzz, LLC — Ted's existing entity. Tracks the steps from "free dev signing on Ted's iPhone" to "TestFlight to friends/family" to "Apple App Store."

## Why Digifuzz

Cartegories is a Ted side project, not a David Energy / A+E one. Digifuzz is the right legal wrapper:

- App Store listing reads "Digifuzz, LLC" instead of a personal name
- Revenue flows through the LLC (cleaner books, liability separation)
- Digifuzz had a paid Apple Developer Program enrollment in the past; the team identity is still recognized by Apple, just not currently active

## Current state

- Code signs against Ted's Personal Team (free, 7-day cert) tied to his personal Apple ID
- Bundle ID is `com.anonymous.cartegories-mobile` (placeholder from Expo scaffold) — works but not namespaced under Digifuzz
- Dev build installs on Ted's iPhone via cable; no TestFlight, no internal-testing distribution
- Free cert expires every 7 days → builds need a re-sign weekly via `pnpm exec expo run:ios --device`

## Backlog (in order)

### 1. Re-enroll Digifuzz in Apple Developer Program — $99/yr

What it unlocks:
- 1-year signing certs instead of 7-day (no more weekly re-sign)
- TestFlight access (next item)
- App Store submission under "Digifuzz, LLC"

Apple Developer enrollment takes a couple of days for an LLC because Apple verifies the D-U-N-S number and entity status. Ted's previous enrollment may speed this up if Apple still has the records.

Prereq: Digifuzz D-U-N-S number on hand (free from Dun & Bradstreet, ~1–2 day turnaround if expired).

### 2. Rename bundle ID — bundle with re-enrollment

Change `com.anonymous.cartegories-mobile` → `com.digifuzz.cartegories` (or `com.digifuzz.cartegories.app` if `.cartegories` is taken).

Reason to pair with re-enrollment: the bundle ID gets registered against the Digifuzz team during re-enrollment. Doing both at once = one rebuild, one re-install, one PR.

Touches:
- `mobile/app.json` → `ios.bundleIdentifier` and `android.package`
- `pnpm exec expo prebuild --clean` regenerates native folders with new identifiers
- Ted's installed dev build re-signs with the new ID (effectively a fresh install on his phone)
- `mobile/.maestro/screens/*.yaml` reference `appId: com.anonymous.cartegories-mobile` — update all 9 flows

### 3. Set up TestFlight — after re-enrollment

What it unlocks: OTA installs for non-Ted humans (Emily, James, etc.) without a cable. Each tester downloads TestFlight from the App Store, accepts an invite link, and gets every internal build pushed automatically.

Setup:
- Configure `eas.json` (doesn't exist yet) for an `internal` profile that signs against Digifuzz
- Run `eas build --profile internal --platform ios` to push to TestFlight
- Add testers in App Store Connect → TestFlight → Internal Testing

Bonus: TestFlight builds also use 1-year certs, so once it's working, weekly re-signing on tethered builds becomes optional too.

### 4. App Store submission — much later

Out of scope for this doc but the path eventually exits here. Notes worth writing down when the time comes:
- App Store screenshots, privacy nutrition label, age rating
- StoreKit + RevenueCat if monetizing (currently stubbed in `mobile/src/services/`)
- App Review takes 1–3 days; rejections common on first submission

## Open questions

- Does Digifuzz still have a valid D-U-N-S, or do we need to renew?
- Does Ted want the App Store name to be "Cartegories" or "Car-tegories" (matching the original iOS app)?
- Bundle ID granularity: is `com.digifuzz.cartegories` clean enough, or namespace under `com.digifuzz.games.cartegories` for future siblings?
