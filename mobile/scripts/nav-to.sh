#!/bin/bash
# Navigate the booted sim to a named screen via Maestro.
# Encodes the launch+orient sync (relaunch app, set landscape) — without this,
# subsequent label-based taps no-op because XCUITest and the app's reported
# orientation desync. Always start nav from a fresh launch.
# Usage: ./nav-to.sh <home|card-selection|decks|settings>
set -euo pipefail

SCREEN="${1:?usage: nav-to.sh <home|card-selection|decks|settings>}"
MOBILE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

case "$SCREEN" in
  home)
    TAPS="" ;;
  card-selection)
    TAPS='
- tapOn: "Quick Play"
- waitForAnimationToEnd' ;;
  decks)
    TAPS='
- tapOn: "Quick Play"
- waitForAnimationToEnd
- tapOn:
    label: "Decks"
- waitForAnimationToEnd' ;;
  settings)
    TAPS='
- tapOn:
    label: "Settings"
- waitForAnimationToEnd' ;;
  *)
    echo "unknown screen: $SCREEN" >&2
    exit 1 ;;
esac

TMP_FLOW=$(mktemp -t nav-to-XXXXXX).yaml
trap 'rm -f "$TMP_FLOW"' EXIT

cat > "$TMP_FLOW" <<EOF
appId: com.anonymous.cartegories-mobile
---
- runFlow: $MOBILE_DIR/.maestro/helpers/launch.yaml${TAPS}
EOF

export PATH="$PATH:$HOME/.maestro/bin"
maestro test "$TMP_FLOW"
