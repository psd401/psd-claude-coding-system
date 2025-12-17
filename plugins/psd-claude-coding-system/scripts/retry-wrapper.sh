#!/bin/bash
# retry-wrapper.sh
#
# Provides retry functionality with exponential backoff for network operations
# This helps prevent transient failures from marking commands as failed
#
# Usage: source retry-wrapper.sh
#        retry_with_backoff command arg1 arg2...

# Retry a command with exponential backoff
# Returns 0 on success, 1 on failure after max attempts
retry_with_backoff() {
  local max_attempts=3
  local delay=1
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    # Try the command
    if "$@"; then
      return 0
    fi

    # Command failed
    local exit_code=$?

    # Check if this is the last attempt
    if [ $attempt -eq $max_attempts ]; then
      echo "Command failed after $max_attempts attempts" >&2
      return $exit_code
    fi

    echo "Attempt $attempt failed (exit code: $exit_code). Retrying in ${delay}s..." >&2
    sleep $delay

    # Exponential backoff: double the delay
    delay=$((delay * 2))
    attempt=$((attempt + 1))
  done

  return 1
}

# Retry specifically for git operations
retry_git() {
  retry_with_backoff git "$@"
}

# Retry specifically for gh CLI operations
retry_gh() {
  retry_with_backoff gh "$@"
}

# Export functions for use in other scripts
export -f retry_with_backoff
export -f retry_git
export -f retry_gh