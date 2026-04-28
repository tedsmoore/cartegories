#!/bin/bash
# Capture a simulator screenshot in landscape-correct orientation.
# Usage: ./screenshot.sh <output-path.png>
# simctl always returns the device-native (portrait) frame; the app renders
# landscape rotated within it. We rotate -90 so the saved file shows landscape
# upright without a post-process step.
set -euo pipefail

OUT="${1:?usage: screenshot.sh <output-path.png>}"
xcrun simctl io booted screenshot "$OUT" >/dev/null
sips -r -90 "$OUT" --out "$OUT" >/dev/null
echo "$OUT"
