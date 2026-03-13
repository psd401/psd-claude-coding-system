#!/usr/bin/env bash
# post-edit-validate.sh — PostToolUse hook for Edit|Write
# Validates file syntax after edits. Non-blocking, exits cleanly for unknown types.
# Reads tool_input JSON from stdin to extract file_path.

set -euo pipefail

# Parse file path from stdin JSON
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

EXT="${FILE_PATH##*.}"

case "$EXT" in
  ts|tsx)
    # TypeScript syntax check — only if tsconfig.json exists somewhere up the tree
    DIR=$(dirname "$FILE_PATH")
    FOUND_TSCONFIG=false
    while [ "$DIR" != "/" ]; do
      if [ -f "$DIR/tsconfig.json" ]; then
        FOUND_TSCONFIG=true
        break
      fi
      DIR=$(dirname "$DIR")
    done
    if [ "$FOUND_TSCONFIG" = true ]; then
      cd "$DIR"
      npx tsc --noEmit --pretty false 2>&1 | head -20 || true
    fi
    ;;
  py)
    # Python syntax check
    python3 -m py_compile "$FILE_PATH" 2>&1 || true
    ;;
  json)
    # JSON syntax check
    jq . < "$FILE_PATH" > /dev/null 2>&1 || echo "post-edit-validate: Invalid JSON in $FILE_PATH"
    ;;
  *)
    # Unknown file type — exit cleanly
    ;;
esac

exit 0
