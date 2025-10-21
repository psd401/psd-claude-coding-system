#!/bin/bash
# telemetry-init.sh
#
# SessionStart hook - Initialize telemetry system
# Called automatically when Claude Code session starts
#
# Input: JSON via stdin with session_id, transcript_path, cwd, etc.
# Output: Silent success (exit 0) or error to stderr (exit 2)

# Read hook input JSON from stdin
HOOK_INPUT=$(cat)

# Find the plugin root directory (where this script lives)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
META_DIR="$PLUGIN_ROOT/meta"
TELEMETRY_FILE="$META_DIR/telemetry.json"

# Ensure meta directory exists
mkdir -p "$META_DIR" 2>/dev/null || {
  echo "Warning: Could not create meta directory" >&2
  exit 0  # Silent failure - don't block session start
}

# Initialize telemetry.json if it doesn't exist
if [ ! -f "$TELEMETRY_FILE" ]; then
  TODAY=$(date +%Y-%m-%d)

  cat > "$TELEMETRY_FILE" <<EOF
{
  "version": "1.1.0",
  "started": "$TODAY",
  "executions": []
}
EOF

  # Verify file was created
  if [ ! -f "$TELEMETRY_FILE" ]; then
    echo "Warning: Failed to initialize telemetry file" >&2
    exit 0  # Silent failure
  fi
fi

# Success - telemetry system ready
exit 0
