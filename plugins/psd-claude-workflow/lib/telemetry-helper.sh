#!/bin/bash
# telemetry-helper.sh
#
# Shared telemetry integration for psd-claude-workflow plugin
# Submits usage data to psd-claude-meta-learning-system (if installed)
#
# Privacy: Only collects metadata (counts, durations), never code content
# Graceful: Works perfectly whether meta-learning plugin is installed or not

# Telemetry session state (exported for child processes/agents)
export TELEMETRY_SESSION_ID=""
export TELEMETRY_COMMAND=""
export TELEMETRY_START_TIME=""
export TELEMETRY_AGENTS_INVOKED=""
export TELEMETRY_METADATA=""

# Initialize telemetry session
# Usage: telemetry_init "/work" "347"
# Exports: TELEMETRY_SESSION_ID, TELEMETRY_ENABLED, etc. (no return value)
telemetry_init() {
  local command_name="$1"
  local command_args="$2"

  # Discover plugins directory (no hardcoded paths)
  local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local workflow_plugin_dir="$(dirname "$script_dir")"
  local plugins_dir="$(dirname "$workflow_plugin_dir")"
  local meta_plugin_dir="$plugins_dir/psd-claude-meta-learning-system"

  export TELEMETRY_META_DIR="$meta_plugin_dir/meta"
  export TELEMETRY_FILE="$TELEMETRY_META_DIR/telemetry.json"

  # Check if meta-learning plugin is installed and enabled
  if [ ! -d "$meta_plugin_dir" ]; then
    # Meta-learning plugin not installed - disable telemetry
    export TELEMETRY_ENABLED=false
    return
  fi

  # Check if telemetry is enabled in plugin config
  local plugin_config="$meta_plugin_dir/.claude-plugin/plugin.json"
  if [ -f "$plugin_config" ]; then
    # Check for telemetry_enabled flag (default to true if not specified)
    if grep -q '"telemetry_enabled".*:.*false' "$plugin_config" 2>/dev/null; then
      export TELEMETRY_ENABLED=false
      return
    fi
  fi

  # Telemetry is enabled
  export TELEMETRY_ENABLED=true

  # Generate unique session ID
  local timestamp=$(date +%Y-%m-%d-%H%M%S)
  local random_suffix=$(( RANDOM % 1000 ))
  export TELEMETRY_SESSION_ID="exec-${timestamp}-${random_suffix}"

  # Initialize session data
  export TELEMETRY_COMMAND="$command_name"
  export TELEMETRY_ARGUMENTS="$command_args"
  export TELEMETRY_START_TIME=$(date +%s)
  export TELEMETRY_AGENTS_INVOKED=""
  export TELEMETRY_METADATA="{}"

  # Ensure meta directory exists
  mkdir -p "$TELEMETRY_META_DIR" 2>/dev/null || true

  # Initialize telemetry.json if it doesn't exist
  if [ ! -f "$TELEMETRY_FILE" ]; then
    cat > "$TELEMETRY_FILE" <<'EOF'
{
  "version": "1.0.0",
  "started": "TIMESTAMP",
  "executions": []
}
EOF
    # Replace TIMESTAMP placeholder
    local today=$(date +%Y-%m-%d)
    sed -i.bak "s/TIMESTAMP/$today/" "$TELEMETRY_FILE" 2>/dev/null || \
      sed -i '' "s/TIMESTAMP/$today/" "$TELEMETRY_FILE" 2>/dev/null
    rm -f "${TELEMETRY_FILE}.bak" 2>/dev/null || true
  fi

  # Don't echo - exports are sufficient (avoids subshell problem)
  # Commands use $TELEMETRY_SESSION_ID directly
}

# Track agent invocation
# Usage: telemetry_track_agent "backend-specialist"
telemetry_track_agent() {
  local agent_name="$1"

  # Skip if telemetry disabled
  [ "$TELEMETRY_ENABLED" != "true" ] && return

  # Skip if no session (shouldn't happen, but defensive)
  [ -z "$TELEMETRY_SESSION_ID" ] && return

  # Add agent to list (comma-separated)
  if [ -z "$TELEMETRY_AGENTS_INVOKED" ]; then
    export TELEMETRY_AGENTS_INVOKED="$agent_name"
  else
    export TELEMETRY_AGENTS_INVOKED="$TELEMETRY_AGENTS_INVOKED,$agent_name"
  fi
}

# Set metadata field
# Usage: telemetry_set_metadata "files_changed" "8"
# Usage: telemetry_set_metadata "issue_number" "347"
telemetry_set_metadata() {
  local key="$1"
  local value="$2"

  # Skip if telemetry disabled
  [ "$TELEMETRY_ENABLED" != "true" ] && return

  # Skip if no session
  [ -z "$TELEMETRY_SESSION_ID" ] && return

  # Build metadata JSON (simple key-value pairs)
  # Note: This is a simplified approach. For complex JSON, we'd use jq
  if [ "$TELEMETRY_METADATA" = "{}" ]; then
    export TELEMETRY_METADATA="{\"$key\": \"$value\"}"
  else
    # Remove closing brace, add new field, add closing brace
    local without_brace="${TELEMETRY_METADATA%\}}"
    export TELEMETRY_METADATA="${without_brace}, \"$key\": \"$value\"}"
  fi
}

# Finalize and write telemetry
# Usage: telemetry_finalize "$session_id" "success" "$duration_seconds"
# Usage: telemetry_finalize "$session_id" "failure" "$duration_seconds"
telemetry_finalize() {
  local session_id="$1"
  local cmd_status="$2"   # "success" or "failure"
  local duration="$3"     # seconds

  # Skip if telemetry disabled
  [ "$TELEMETRY_ENABLED" != "true" ] && return

  # Skip if no session
  [ -z "$session_id" ] && return

  # Generate timestamp in ISO 8601 format
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  # Convert agents list to JSON array
  local agents_json="[]"
  if [ -n "$TELEMETRY_AGENTS_INVOKED" ]; then
    # Split comma-separated list into JSON array
    agents_json="[\"$(echo "$TELEMETRY_AGENTS_INVOKED" | sed 's/,/", "/g')\"]"
  fi

  # Determine success boolean
  local success_bool="true"
  [ "$cmd_status" = "failure" ] && success_bool="false"

  # Build execution JSON entry
  local execution_json=$(cat <<EOF
{
  "id": "$session_id",
  "command": "$TELEMETRY_COMMAND",
  "arguments": "$TELEMETRY_ARGUMENTS",
  "timestamp": "$timestamp",
  "duration_seconds": $duration,
  "success": $success_bool,
  "agents_invoked": $agents_json,
  "metadata": $TELEMETRY_METADATA
}
EOF
)

  # Append to telemetry.json
  # Strategy: Read file, parse JSON, append new execution, write back
  # Use temporary file to avoid corruption

  local temp_file="${TELEMETRY_FILE}.tmp.$$"

  # Check if jq is available (better JSON handling)
  if command -v jq >/dev/null 2>&1; then
    # Use jq for robust JSON manipulation
    jq --argjson new_exec "$execution_json" '.executions += [$new_exec]' "$TELEMETRY_FILE" > "$temp_file" 2>/dev/null

    if [ $? -eq 0 ] && [ -s "$temp_file" ]; then
      mv "$temp_file" "$TELEMETRY_FILE"
    else
      # jq failed, fall back to manual append
      _telemetry_manual_append "$execution_json" "$temp_file"
    fi
  else
    # jq not available, use manual JSON append
    _telemetry_manual_append "$execution_json" "$temp_file"
  fi

  # Clean up temp file
  rm -f "$temp_file" 2>/dev/null || true

  # Clear session state
  export TELEMETRY_SESSION_ID=""
  export TELEMETRY_COMMAND=""
  export TELEMETRY_ARGUMENTS=""
  export TELEMETRY_START_TIME=""
  export TELEMETRY_AGENTS_INVOKED=""
  export TELEMETRY_METADATA="{}"
}

# Internal: Manual JSON append (fallback when jq unavailable)
_telemetry_manual_append() {
  local execution_json="$1"
  local temp_file="$2"

  # Read existing file
  local content=$(cat "$TELEMETRY_FILE")

  # Find the last ] before the final }
  # Strategy: Remove last ]}  →  append new execution  →  add ]}

  # Check if executions array is empty
  if echo "$content" | grep -q '"executions": \[\]'; then
    # Empty array - replace [] with [new_exec]
    echo "$content" | sed "s/\"executions\": \[\]/\"executions\": [\n$(echo "$execution_json" | sed 's/^/    /')\n  ]/" > "$temp_file"
  else
    # Non-empty array - append with comma
    # Remove final closing braces
    echo "$content" | sed 's/  \]\n}//' | sed '$d' > "$temp_file"
    # Add comma and new execution
    echo "," >> "$temp_file"
    echo "$execution_json" | sed 's/^/    /' >> "$temp_file"
    # Re-add closing braces
    echo "  ]" >> "$temp_file"
    echo "}" >> "$temp_file"
  fi

  # Validate temp file is not empty and move
  if [ -s "$temp_file" ]; then
    mv "$temp_file" "$TELEMETRY_FILE"
  else
    # Append failed, keep original
    echo "Warning: Telemetry append failed, original file preserved" >&2
  fi
}

# Convenience function: Get file count from git
telemetry_get_files_changed() {
  git diff --name-only 2>/dev/null | wc -l | tr -d ' '
}

# Convenience function: Get staged file count
telemetry_get_files_staged() {
  git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' '
}

# Convenience function: Count test files added/modified
telemetry_count_test_files() {
  git diff --name-only 2>/dev/null | grep -E '\.(test|spec)\.(ts|js|tsx|jsx|py)$' | wc -l | tr -d ' '
}
