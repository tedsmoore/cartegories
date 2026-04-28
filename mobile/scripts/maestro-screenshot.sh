#!/bin/bash
set -euo pipefail

SCREEN="${1:-all}"
MOBILE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$PATH:$HOME/.maestro/bin"

if [ "$SCREEN" = "all" ]; then
  for flow in "$MOBILE_DIR/.maestro/screens/"*.yaml; do
    echo ">>> $(basename "$flow")"
    maestro test "$flow" || true
  done
else
  maestro test "$MOBILE_DIR/.maestro/screens/$SCREEN.yaml"
fi
