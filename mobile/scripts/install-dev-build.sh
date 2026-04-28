#!/bin/bash
# Install the most-recent cartegoriesmobile dev build into the booted simulator.
# Glob lookup avoids hardcoding the DerivedData hash, which can change.
# Usage: ./install-dev-build.sh
set -euo pipefail

GLOB="$HOME/Library/Developer/Xcode/DerivedData/cartegoriesmobile-*/Build/Products/Debug-iphonesimulator/cartegoriesmobile.app"
APP=$(ls -dt $GLOB 2>/dev/null | head -1 || true)

if [ -z "$APP" ]; then
  echo "no built .app found under DerivedData — run 'pnpm exec expo run:ios' first" >&2
  exit 1
fi

echo "installing: $APP"
xcrun simctl install booted "$APP"
echo "done"
