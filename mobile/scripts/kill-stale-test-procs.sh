#!/bin/bash
# Kill stale Maestro / XCUITest / simctl processes that block fresh test runs.
# Safe to run anytime — only matches the known-stale patterns.
# Usage: ./kill-stale-test-procs.sh [--dry-run]
set -euo pipefail

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

PATTERNS=(
  "maestro.cli.AppKt"
  "xcodebuild test-without-building"
  "simctl listapps"
)

found=0
for pat in "${PATTERNS[@]}"; do
  pids=$(pgrep -f "$pat" || true)
  for pid in $pids; do
    found=1
    info=$(ps -o pid,etime,%cpu,command -p "$pid" 2>/dev/null | tail -n +2 || true)
    [ -z "$info" ] && continue
    if [ "$DRY_RUN" = 1 ]; then
      echo "would kill: $info"
    else
      echo "killing:    $info"
      kill -TERM "$pid" 2>/dev/null || true
      sleep 1
      kill -0 "$pid" 2>/dev/null && kill -KILL "$pid" 2>/dev/null || true
    fi
  done
done

[ "$found" = 0 ] && echo "no stale test processes found"
