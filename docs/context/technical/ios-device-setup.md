# iOS device setup — first-time dev build on iPhone

How to get Cartegories running on a physical iPhone with live JS reload from Metro. Written 2026-05-03 after walking through it live and hitting every snag in order.

Audience: future-Ted (or future-Claude) on a fresh Mac/iPhone pair, or onboarding a new tester device.

## Prereqs

- Mac with Xcode installed (full Xcode, not just Command Line Tools)
- Apple ID (free is fine for dev builds; paid Developer Program needed later for TestFlight)
- iPhone with USB cable

## One-time per Mac

### Sign Apple ID into Xcode

1. Launch Xcode → **Settings…** (⌘,) → **Accounts**
2. Click **+** → **Apple ID** → sign in
3. After sign-in, the account shows a "Personal Team" entry — that's the free dev signing identity
4. Close Settings (⌘W). Xcode itself can be quit; the cert lives in the macOS keychain.

## One-time per project (per Mac)

### Pick the team in the Xcode project

The Xcode project doesn't auto-pick a Team — you have to set it once.

1. `open mobile/ios/Cartegories.xcworkspace`
2. Left sidebar → click the blue **Cartegories** project icon at the top
3. In the editor's column under **TARGETS**, click **Cartegories**
4. Top tabs → **Signing & Capabilities**
5. **Team** dropdown → pick the Personal Team
6. Wait for the "Provisioning Profile" line to show no red error
7. Close (⌘W), don't quit

This writes `DEVELOPMENT_TEAM` into `project.pbxproj`. Note: prebuild with `--clean` wipes this and you have to re-do it.

## One-time per iPhone

### Enable Developer Mode

iOS 16+ requires Developer Mode to be explicitly enabled before any signed dev build can run. The toggle only appears after a Mac has tried (and failed) to push a dev build to the device — so it's a chicken-and-egg first time.

1. Run `pnpm exec expo run:ios --device "<phone-name>"` once. It will fail at launch — that's expected.
2. iPhone → **Settings → Privacy & Security** → scroll to bottom → **Developer Mode** appears
3. Toggle **Developer Mode** ON
4. iPhone restarts
5. After restart, unlock — accept the "Turn On Developer Mode?" prompt → enter passcode

### Trust the developer profile (after first install)

The first time a dev build is installed on the phone with a new signing identity, iOS won't launch it until the user trusts the cert.

1. iPhone → **Settings → General → VPN & Device Management** (or just "Device Management" if no VPN profiles installed)
2. Under "Developer App" section → tap "Apple Development: <your-apple-id>"
3. Tap **Trust** → confirm

## Routine: build and run

```
cd mobile && pnpm exec expo run:ios --device "<phone-name>"
```

What this does (~5 min first time, ~1–2 min on subsequent native-unchanged builds):

1. Runs `pod install` if `Podfile.lock` is stale
2. Compiles the native iOS app
3. Auto-signs against the team set in Xcode
4. Installs the `.app` on the phone over USB
5. Starts Metro on `localhost:8081`
6. Auto-launches the app, which connects to Metro for JS bundles

Phone needs to be **unlocked and awake** during step 6 or the launch fails (re-fire after unlocking, or just tap the icon manually).

After the first successful run, you can unplug the phone — Metro reaches the device over Wi-Fi as long as both are on the same network. JS edits hot-reload.

Native deps changes (anything in `package.json` that has a native module) require a fresh `expo run:ios --device` to recompile. JS-only edits do not.

## Common failures and fixes

### "No code signing certificates are available to use"

You haven't signed an Apple ID into Xcode. See the "Sign Apple ID into Xcode" step above.

### "Device is busy (Waiting to reconnect to <phone-name>)"

Phone is locked, or Developer Mode hasn't been enabled, or the cable connection just hiccuped. Unlock the phone, confirm Developer Mode is on, replug the cable, retry.

### "Cannot launch... device is locked"

Self-explanatory. Unlock the phone and tap the app icon, or re-fire `expo run:ios --device`.

### "Cannot find native module ExponentPedometer" (or similar)

A native module is in `package.json` and `node_modules` but wasn't compiled into the iOS build. This happens when `pnpm install` adds a native dep and the next `expo run:ios` doesn't actually re-run `pod install` (Expo's autolinking can miss it).

Fix:

```
cd mobile/ios && pod install && cd .. && pnpm exec expo run:ios --device "<phone-name>"
```

The explicit `pod install` from inside `ios/` forces Expo's autolinking script to scan `node_modules` fresh. Verify the new pods landed by grepping `Podfile.lock` for the module name.

### "Invalid code signature... profile not trusted"

You haven't trusted the developer profile on the phone yet. See "Trust the developer profile" above.

### Free cert expires every 7 days

If you get launch failures with cert errors a week after a successful build, re-fire `expo run:ios --device` to refresh signing. Resolution: enroll in Apple Developer Program — see `docs/context/projects/active/digifuzz-apple-distribution.md`.

## Project-rename caveats

Running `pnpm exec expo prebuild --clean` regenerates `mobile/ios/` from `app.json`. Side effects:

- `DEVELOPMENT_TEAM` in `project.pbxproj` gets wiped → re-pick the Team in Xcode after every `--clean` prebuild
- `Podfile.lock` regenerates → `pod install` runs fresh
- The DerivedData folder picks up the new project name (e.g. `Cartegories-<hash>`) — old folders under the previous name can be deleted to reclaim disk
- `mobile/scripts/install-dev-build.sh` hardcodes the project name in its glob; update if you rename

## Disk hygiene

`~/Library/Developer/Xcode/DerivedData/` accumulates ~5–10 GB per active iOS project. Safe to wipe periodically:

```
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

Cost: next build is full instead of incremental (~5 min instead of 1–2 min). Worth it when the disk is tight.
