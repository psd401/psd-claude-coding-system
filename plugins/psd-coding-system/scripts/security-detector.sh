#!/usr/bin/env bash
# security-detector.sh
# Detects security-sensitive changes in GitHub issues/PRs
# Usage: security-detector.sh <issue/pr number> <issue|pr>
# Returns: 0 if security-sensitive, 1 if not, 2+ for errors

# Configuration: Sensitive file patterns
# These patterns trigger security review when matched in file paths
SENSITIVE_FILE_PATTERNS=(
    "auth"
    "login"
    "password"
    "token"
    "secret"
    "credential"
    "api[_-]?key"
    "oauth"
    "jwt"
    "encrypt"
    "decrypt"
    "hash"
    "permission"
    "role"
    "rbac"
    "session"
    "cookie"
    "cors"
    "csp"
    "database[_-]?config"
    "\.env"
    "config/security"
    "payment"
    "billing"
)

# Configuration: Security keywords (case-insensitive)
# These keywords in issue/PR descriptions trigger security review
SECURITY_KEYWORDS=(
    "authentication"
    "authorization"
    "security"
    "vulnerability"
    "exploit"
    "injection"
    "xss"
    "csrf"
    "sanitize"
    "validate input"
    "encrypt"
    "decrypt"
    "permissions"
    "access control"
    "rate limit"
    "secrets"
    "credentials"
    "payment"
    "billing"
)

# Safe GitHub CLI wrapper with error handling
safe_gh_call() {
    local cmd="$1"
    shift

    local output
    local exit_code

    output=$($cmd "$@" 2>&1)
    exit_code=$?

    if [[ $exit_code -ne 0 ]]; then
        if echo "$output" | grep -q "Could not resolve to"; then
            echo "[Warning] Issue/PR not found" >&2
            return 2
        elif echo "$output" | grep -q "rate limit"; then
            echo "[Error] GitHub API rate limit exceeded" >&2
            return 3
        else
            echo "[Warning] GitHub API error: $output" >&2
            return 1
        fi
    fi

    echo "$output"
    return 0
}

# Detect sensitive file patterns
# Args: issue_number, context_type (issue|pr)
# Returns: 0 if match found, 1 if no match, 2+ for API errors
detect_sensitive_files() {
    local issue_number="$1"
    local context_type="$2"

    # Build combined regex pattern
    local pattern=$(IFS='|'; echo "${SENSITIVE_FILE_PATTERNS[*]}")

    local files=""
    local gh_call_result
    if [[ "$context_type" == "pr" ]]; then
        # Get changed files from PR
        files=$(safe_gh_call gh pr view "$issue_number" --json files -q '.files[].path')
        gh_call_result=$?
        [[ $gh_call_result -ne 0 ]] && return $gh_call_result
    elif [[ "$context_type" == "issue" ]]; then
        # Extract file mentions from issue body (files in backticks)
        local body=$(safe_gh_call gh issue view "$issue_number" --json body -q '.body')
        gh_call_result=$?
        [[ $gh_call_result -ne 0 ]] && return $gh_call_result

        # Extract file mentions: `path/to/file.ext`
        files=$(echo "$body" | grep -oE '`[^`]*\.(ts|tsx|js|jsx|py|go|rs|java|rb|php|sql|sh|md)[^`]*`' | tr -d '`')
    fi

    # Check if any file path matches security patterns
    if echo "$files" | grep -qiE "$pattern"; then
        echo "🔒 Security-sensitive file paths detected" >&2
        return 0
    fi

    return 1
}

# Detect security keywords in description
# Args: issue_number, context_type (issue|pr)
# Returns: 0 if keywords found, 1 if not, 2+ for API errors
detect_sensitive_keywords() {
    local issue_number="$1"
    local context_type="$2"

    # Build combined regex pattern with word boundaries
    local pattern=$(IFS='|'; echo "${SECURITY_KEYWORDS[*]}")

    local body=""
    local gh_call_result
    if [[ "$context_type" == "pr" ]]; then
        body=$(safe_gh_call gh pr view "$issue_number" --json body,title -q '.title + " " + .body')
        gh_call_result=$?
    else
        body=$(safe_gh_call gh issue view "$issue_number" --json body,title -q '.title + " " + .body')
        gh_call_result=$?
    fi

    [[ $gh_call_result -ne 0 ]] && return $gh_call_result

    # Word boundaries to avoid false positives (e.g., "author" matching "auth")
    if echo "$body" | grep -qiE "\b($pattern)\b"; then
        echo "🔒 Security-related keywords detected" >&2
        return 0
    fi

    return 1
}

# Main detection function (orchestrates all checks)
# Args: issue_number, context_type (issue|pr)
# Returns: 0 if security-sensitive, 1 if safe, 2+ for errors
detect_security_sensitive_changes() {
    local issue_number="$1"
    local context_type="$2"

    # Validate inputs
    if [[ -z "$issue_number" || -z "$context_type" ]]; then
        echo "[Error] Usage: security-detector.sh <issue/pr number> <issue|pr>" >&2
        return 2
    fi

    if [[ "$context_type" != "issue" && "$context_type" != "pr" ]]; then
        echo "[Error] context_type must be 'issue' or 'pr'" >&2
        return 2
    fi

    # Run detection strategies (any match = security-sensitive)
    local file_result
    local keyword_result

    detect_sensitive_files "$issue_number" "$context_type"
    file_result=$?

    detect_sensitive_keywords "$issue_number" "$context_type"
    keyword_result=$?

    # Check for API errors (2+) from either detection function
    if [[ $file_result -ge 2 || $keyword_result -ge 2 ]]; then
        # Propagate the error code (prefer higher error code if both failed)
        if [[ $file_result -ge $keyword_result ]]; then
            return $file_result
        else
            return $keyword_result
        fi
    fi

    # Check if either strategy found security-sensitive content
    if [[ $file_result -eq 0 || $keyword_result -eq 0 ]]; then
        return 0
    fi

    # Neither found security content and no errors
    return 1
}

# Execute if called directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    detect_security_sensitive_changes "$@"
    exit $?
fi
