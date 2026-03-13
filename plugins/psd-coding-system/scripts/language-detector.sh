#!/bin/bash
# language-detector.sh
#
# Detects programming languages in changed files for invoking appropriate language reviewers
#
# Usage: ./language-detector.sh [file-list-or-diff-source]
# Output: Space-separated list of detected languages
#
# Supported detections:
#   - typescript: .ts, .tsx, .js, .jsx files
#   - python: .py files
#   - swift: .swift files
#   - sql: .sql files, migration files
#
# Example:
#   ./language-detector.sh              # Uses git diff HEAD
#   ./language-detector.sh "file1.ts file2.py"
#   echo "file1.ts" | ./language-detector.sh -

set -e

# Get file list
if [ "$1" = "-" ]; then
  # Read from stdin
  FILES=$(cat)
elif [ -n "$1" ]; then
  # Use provided list
  FILES="$1"
else
  # Default: git diff
  FILES=$(git diff --name-only HEAD 2>/dev/null || echo "")
fi

# Initialize detection flags
HAS_TYPESCRIPT=false
HAS_PYTHON=false
HAS_SWIFT=false
HAS_SQL=false
HAS_MIGRATION=false

# Detect languages
while IFS= read -r file; do
  case "$file" in
    *.ts|*.tsx|*.js|*.jsx)
      HAS_TYPESCRIPT=true
      ;;
    *.py)
      HAS_PYTHON=true
      ;;
    *.swift)
      HAS_SWIFT=true
      ;;
    *.sql)
      HAS_SQL=true
      ;;
    *migration*|*Migration*)
      HAS_MIGRATION=true
      ;;
  esac
done <<< "$FILES"

# Build output
LANGUAGES=""

if [ "$HAS_TYPESCRIPT" = true ]; then
  LANGUAGES="$LANGUAGES typescript"
fi

if [ "$HAS_PYTHON" = true ]; then
  LANGUAGES="$LANGUAGES python"
fi

if [ "$HAS_SWIFT" = true ]; then
  LANGUAGES="$LANGUAGES swift"
fi

if [ "$HAS_SQL" = true ]; then
  LANGUAGES="$LANGUAGES sql"
fi

if [ "$HAS_MIGRATION" = true ]; then
  LANGUAGES="$LANGUAGES migration"
fi

# Trim leading space and output
echo "$LANGUAGES" | xargs

# Return appropriate exit code
if [ -z "$(echo "$LANGUAGES" | xargs)" ]; then
  exit 1  # No languages detected
else
  exit 0  # Languages detected
fi
