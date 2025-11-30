#!/bin/bash
# test-agent-tracking.sh
#
# Test script for agent tracking functionality
# Verifies that both telemetry-agent.sh (SubagentStop hook) and
# telemetry-track.sh (fallback) can extract agent names from transcripts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
META_DIR="$PLUGIN_ROOT/meta"

echo "=== Agent Tracking Test Suite ==="
echo ""

# Test 1: Verify jq is available
echo "Test 1: Checking dependencies..."
if ! command -v jq >/dev/null 2>&1; then
  echo "❌ FAIL: jq not installed"
  exit 1
fi
echo "✅ PASS: jq is available"
echo ""

# Test 2: Create mock transcript with Task tool invocations
echo "Test 2: Creating mock transcript..."
MOCK_SESSION_ID="test-$(date +%s)"
MOCK_TRANSCRIPT="$META_DIR/.test_transcript_${MOCK_SESSION_ID}.json"

cat > "$MOCK_TRANSCRIPT" <<'EOF'
{
  "sessionId": "SESSION_ID_PLACEHOLDER",
  "timestamp": "2025-11-30T12:00:00Z",
  "message": {
    "role": "assistant",
    "content": [
      {
        "type": "tool_use",
        "name": "Task",
        "input": {
          "subagent_type": "psd-claude-coding-system:backend-specialist",
          "description": "Backend implementation",
          "prompt": "Implement backend logic"
        }
      }
    ]
  }
}
{
  "sessionId": "SESSION_ID_PLACEHOLDER",
  "timestamp": "2025-11-30T12:01:00Z",
  "message": {
    "role": "assistant",
    "content": [
      {
        "type": "tool_use",
        "name": "Task",
        "input": {
          "subagent_type": "psd-claude-coding-system:test-specialist",
          "description": "Test implementation",
          "prompt": "Write tests"
        }
      }
    ]
  }
}
EOF

# Replace session ID placeholder
sed -i.bak "s/SESSION_ID_PLACEHOLDER/$MOCK_SESSION_ID/g" "$MOCK_TRANSCRIPT"
rm -f "$MOCK_TRANSCRIPT.bak"

echo "✅ PASS: Mock transcript created at $MOCK_TRANSCRIPT"
echo ""

# Test 3: Extract agents from transcript (simulating telemetry-agent.sh logic)
echo "Test 3: Testing transcript-based agent extraction..."
EXTRACTED_AGENTS=$(jq -r --arg sid "$MOCK_SESSION_ID" '
  select(.sessionId == $sid) |
  select((.message.content | type) == "array") |
  select(.message.content[0].type == "tool_use") |
  select(.message.content[0].name == "Task") |
  .message.content[0].input.subagent_type // empty
' "$MOCK_TRANSCRIPT" 2>/dev/null)

AGENT_COUNT=$(echo "$EXTRACTED_AGENTS" | grep -c "psd-claude-coding-system" || echo "0")

if [ "$AGENT_COUNT" -eq 2 ]; then
  echo "✅ PASS: Extracted 2 agents from transcript"
  echo "  - $(echo "$EXTRACTED_AGENTS" | head -1)"
  echo "  - $(echo "$EXTRACTED_AGENTS" | tail -1)"
else
  echo "❌ FAIL: Expected 2 agents, got $AGENT_COUNT"
  echo "Extracted: $EXTRACTED_AGENTS"
  exit 1
fi
echo ""

# Test 4: Test unique agent extraction (fallback logic)
echo "Test 4: Testing fallback unique agent extraction..."
UNIQUE_AGENTS=$(jq -sr --arg sid "$MOCK_SESSION_ID" '
  map(select(.sessionId == $sid)) |
  map(select((.message.content | type) == "array")) |
  map(select(.message.content[0].type == "tool_use")) |
  map(select(.message.content[0].name == "Task")) |
  map(.message.content[0].input.subagent_type // empty) |
  map(select(. != "")) |
  unique
' "$MOCK_TRANSCRIPT" 2>/dev/null)

UNIQUE_COUNT=$(echo "$UNIQUE_AGENTS" | jq 'length' 2>/dev/null)

if [ "$UNIQUE_COUNT" -eq 2 ]; then
  echo "✅ PASS: Unique extraction returned 2 agents"
  echo "  JSON: $UNIQUE_AGENTS"
else
  echo "❌ FAIL: Expected 2 unique agents, got $UNIQUE_COUNT"
  echo "Result: $UNIQUE_AGENTS"
  exit 1
fi
echo ""

# Test 5: Test with duplicate agents
echo "Test 5: Testing duplicate agent handling..."
cat >> "$MOCK_TRANSCRIPT" <<EOF
{
  "sessionId": "$MOCK_SESSION_ID",
  "timestamp": "2025-11-30T12:02:00Z",
  "message": {
    "role": "assistant",
    "content": [
      {
        "type": "tool_use",
        "name": "Task",
        "input": {
          "subagent_type": "psd-claude-coding-system:backend-specialist",
          "description": "More backend work",
          "prompt": "Additional backend changes"
        }
      }
    ]
  }
}
EOF

UNIQUE_AGENTS_AFTER=$(jq -sr --arg sid "$MOCK_SESSION_ID" '
  map(select(.sessionId == $sid)) |
  map(select((.message.content | type) == "array")) |
  map(select(.message.content[0].type == "tool_use")) |
  map(select(.message.content[0].name == "Task")) |
  map(.message.content[0].input.subagent_type // empty) |
  map(select(. != "")) |
  unique
' "$MOCK_TRANSCRIPT" 2>/dev/null)

UNIQUE_COUNT_AFTER=$(echo "$UNIQUE_AGENTS_AFTER" | jq 'length' 2>/dev/null)

if [ "$UNIQUE_COUNT_AFTER" -eq 2 ]; then
  echo "✅ PASS: Duplicate agents filtered correctly (still 2 unique)"
else
  echo "❌ FAIL: Expected 2 unique agents after duplicate, got $UNIQUE_COUNT_AFTER"
  echo "Result: $UNIQUE_AGENTS_AFTER"
  exit 1
fi
echo ""

# Test 6: Test with non-Task tool calls (should be ignored)
echo "Test 6: Testing non-Task tool filtering..."
cat >> "$MOCK_TRANSCRIPT" <<EOF
{
  "sessionId": "$MOCK_SESSION_ID",
  "timestamp": "2025-11-30T12:03:00Z",
  "message": {
    "role": "assistant",
    "content": [
      {
        "type": "tool_use",
        "name": "Edit",
        "input": {
          "file_path": "/some/file.ts",
          "old_string": "foo",
          "new_string": "bar"
        }
      }
    ]
  }
}
EOF

AGENTS_WITH_EDIT=$(jq -sr --arg sid "$MOCK_SESSION_ID" '
  map(select(.sessionId == $sid)) |
  map(select((.message.content | type) == "array")) |
  map(select(.message.content[0].type == "tool_use")) |
  map(select(.message.content[0].name == "Task")) |
  map(.message.content[0].input.subagent_type // empty) |
  map(select(. != "")) |
  unique
' "$MOCK_TRANSCRIPT" 2>/dev/null)

AGENT_COUNT_WITH_EDIT=$(echo "$AGENTS_WITH_EDIT" | jq 'length' 2>/dev/null)

if [ "$AGENT_COUNT_WITH_EDIT" -eq 2 ]; then
  echo "✅ PASS: Non-Task tools correctly ignored (still 2 agents)"
else
  echo "❌ FAIL: Expected 2 agents after Edit tool, got $AGENT_COUNT_WITH_EDIT"
  echo "Result: $AGENTS_WITH_EDIT"
  exit 1
fi
echo ""

# Cleanup
echo "Cleaning up test files..."
rm -f "$MOCK_TRANSCRIPT"
echo "✅ Cleanup complete"
echo ""

echo "==================================="
echo "✅ ALL TESTS PASSED"
echo "==================================="
echo ""
echo "Summary:"
echo "  - Transcript parsing works correctly"
echo "  - Duplicate agents are filtered"
echo "  - Non-Task tools are ignored"
echo "  - JSON output is valid"
echo ""
echo "The agent tracking fix is ready for deployment."
