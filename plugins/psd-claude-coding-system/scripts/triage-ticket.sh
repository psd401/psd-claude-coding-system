#!/bin/bash
# triage-ticket.sh
#
# FreshService Ticket Triage Script
# Fetches ticket information from FreshService API and formats it for GitHub issue creation
#
# Usage: ./triage-ticket.sh <ticket-id>
# Output: Creates /tmp/freshservice-ticket-<ticket-id>.txt with formatted issue description
#
# Environment variables required:
#   FRESHSERVICE_API_KEY - API key for authentication
#   FRESHSERVICE_DOMAIN - FreshService domain (e.g., "peninsula-sd")

set -euo pipefail

# Check arguments
if [ $# -ne 1 ]; then
  echo "Usage: $0 <ticket-id>" >&2
  exit 1
fi

TICKET_ID="$1"

# Validate ticket ID is numeric
if ! [[ "$TICKET_ID" =~ ^[0-9]+$ ]]; then
  echo "Error: Ticket ID must be numeric" >&2
  exit 1
fi

# Check required environment variables
if [ -z "${FRESHSERVICE_API_KEY:-}" ] || [ -z "${FRESHSERVICE_DOMAIN:-}" ]; then
  echo "Error: Missing required environment variables" >&2
  echo "Required: FRESHSERVICE_API_KEY, FRESHSERVICE_DOMAIN" >&2
  exit 1
fi

# API configuration
API_BASE_URL="https://${FRESHSERVICE_DOMAIN}.freshservice.com/api/v2"
TICKET_ENDPOINT="${API_BASE_URL}/tickets/${TICKET_ID}"
OUTPUT_FILE="/tmp/freshservice-ticket-${TICKET_ID}.txt"

# Temporary files for API responses
TICKET_JSON="/tmp/fs-ticket-${TICKET_ID}.json"
REQUESTER_JSON="/tmp/fs-requester-${TICKET_ID}.json"
CONVERSATIONS_JSON="/tmp/fs-conversations-${TICKET_ID}.json"

# Cleanup function
cleanup() {
  rm -f "$TICKET_JSON" "$REQUESTER_JSON" "$CONVERSATIONS_JSON"
}
trap cleanup EXIT

# Function to make API request with retry logic
api_request() {
  local url="$1"
  local output_file="$2"
  local max_retries=3
  local retry_delay=2
  local attempt=1

  while [ $attempt -le $max_retries ]; do
    if curl -f -s -u "${FRESHSERVICE_API_KEY}:X" \
         -H "Content-Type: application/json" \
         -X GET "$url" \
         -o "$output_file" \
         --max-time 30; then
      return 0
    fi

    if [ $attempt -lt $max_retries ]; then
      echo "Warning: API request failed (attempt $attempt/$max_retries), retrying in ${retry_delay}s..." >&2
      sleep $retry_delay
      retry_delay=$((retry_delay * 2))  # Exponential backoff
    fi
    attempt=$((attempt + 1))
  done

  echo "Error: API request failed after $max_retries attempts" >&2
  return 1
}

# Fetch ticket with embedded fields
echo "Fetching ticket #${TICKET_ID}..." >&2
if ! api_request "${TICKET_ENDPOINT}?include=requester,stats" "$TICKET_JSON"; then
  echo "Error: Failed to fetch ticket from FreshService" >&2
  exit 1
fi

# Fetch conversations (comments)
echo "Fetching ticket conversations..." >&2
if ! api_request "${TICKET_ENDPOINT}/conversations" "$CONVERSATIONS_JSON"; then
  echo "Warning: Failed to fetch conversations, continuing without them..." >&2
  echo '{"conversations":[]}' > "$CONVERSATIONS_JSON"
fi

# Check if jq is available for JSON parsing
if ! command -v jq &> /dev/null; then
  echo "Warning: jq not found, using basic parsing" >&2
  JQ_AVAILABLE=false
else
  JQ_AVAILABLE=true
fi

# Extract ticket fields
if [ "$JQ_AVAILABLE" = true ]; then
  SUBJECT=$(jq -r '.ticket.subject // "No subject"' "$TICKET_JSON")
  DESCRIPTION=$(jq -r '.ticket.description_text // .ticket.description // "No description"' "$TICKET_JSON")
  PRIORITY=$(jq -r '.ticket.priority // 0' "$TICKET_JSON")
  STATUS=$(jq -r '.ticket.status // 0' "$TICKET_JSON")
  CREATED_AT=$(jq -r '.ticket.created_at // "Unknown"' "$TICKET_JSON")
  REQUESTER_NAME=$(jq -r '.ticket.requester.name // "Unknown"' "$TICKET_JSON" 2>/dev/null || echo "Unknown")
  REQUESTER_EMAIL=$(jq -r '.ticket.requester.primary_email // "Unknown"' "$TICKET_JSON" 2>/dev/null || echo "Unknown")
  CATEGORY=$(jq -r '.ticket.category // "Uncategorized"' "$TICKET_JSON")
  URGENCY=$(jq -r '.ticket.urgency // 0' "$TICKET_JSON")

  # Extract custom fields if present
  CUSTOM_FIELDS=$(jq -r '.ticket.custom_fields // {}' "$TICKET_JSON")

  # Extract attachments if present
  ATTACHMENTS=$(jq -r '.ticket.attachments // []' "$TICKET_JSON")
  HAS_ATTACHMENTS=$(echo "$ATTACHMENTS" | jq '. | length > 0')

  # Extract conversations
  CONVERSATIONS=$(jq -r '.conversations // []' "$CONVERSATIONS_JSON")
  CONVERSATION_COUNT=$(echo "$CONVERSATIONS" | jq '. | length')
else
  # Fallback to basic grep/sed parsing
  SUBJECT=$(grep -o '"subject":"[^"]*"' "$TICKET_JSON" | head -1 | sed 's/"subject":"//;s/"$//' || echo "No subject")
  DESCRIPTION=$(grep -o '"description_text":"[^"]*"' "$TICKET_JSON" | head -1 | sed 's/"description_text":"//;s/"$//' || echo "No description")
  PRIORITY="Unknown"
  STATUS="Unknown"
  CREATED_AT="Unknown"
  REQUESTER_NAME="Unknown"
  REQUESTER_EMAIL="Unknown"
  CATEGORY="Unknown"
  URGENCY="Unknown"
  HAS_ATTACHMENTS="false"
  CONVERSATION_COUNT="0"
fi

# Map priority codes to human-readable strings
case "$PRIORITY" in
  1) PRIORITY_STR="Low" ;;
  2) PRIORITY_STR="Medium" ;;
  3) PRIORITY_STR="High" ;;
  4) PRIORITY_STR="Urgent" ;;
  *) PRIORITY_STR="Unknown" ;;
esac

# Map urgency codes
case "$URGENCY" in
  1) URGENCY_STR="Low" ;;
  2) URGENCY_STR="Medium" ;;
  3) URGENCY_STR="High" ;;
  *) URGENCY_STR="Unknown" ;;
esac

# Map status codes
case "$STATUS" in
  2) STATUS_STR="Open" ;;
  3) STATUS_STR="Pending" ;;
  4) STATUS_STR="Resolved" ;;
  5) STATUS_STR="Closed" ;;
  *) STATUS_STR="Unknown" ;;
esac

# Format the issue description
cat > "$OUTPUT_FILE" <<EOF
Bug report from FreshService Ticket #${TICKET_ID}

## Summary
${SUBJECT}

## Description
${DESCRIPTION}

## Ticket Information
- **FreshService Ticket**: #${TICKET_ID}
- **Status**: ${STATUS_STR}
- **Priority**: ${PRIORITY_STR}
- **Urgency**: ${URGENCY_STR}
- **Category**: ${CATEGORY}
- **Created**: ${CREATED_AT}

## Reporter Information
- **Name**: ${REQUESTER_NAME}
- **Email**: ${REQUESTER_EMAIL}

## Steps to Reproduce
(Please extract from description or conversations if available)

## Expected Behavior
(To be determined from ticket context)

## Actual Behavior
(Described in ticket)

## Additional Context
EOF

# Add attachments section if present
if [ "$HAS_ATTACHMENTS" = "true" ] && [ "$JQ_AVAILABLE" = true ]; then
  echo "" >> "$OUTPUT_FILE"
  echo "### Attachments" >> "$OUTPUT_FILE"
  echo "$ATTACHMENTS" | jq -r '.[] | "- \(.name) (\(.size) bytes)"' >> "$OUTPUT_FILE"
fi

# Add conversation history if present
if [ "$CONVERSATION_COUNT" -gt 0 ] && [ "$JQ_AVAILABLE" = true ]; then
  echo "" >> "$OUTPUT_FILE"
  echo "### Conversation History" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  echo "$CONVERSATIONS" | jq -r '.[] | "**\(.user_id // "User")** (\(.created_at)):\n\(.body_text // .body)\n"' >> "$OUTPUT_FILE"
fi

# Add custom fields if present and not empty
if [ "$JQ_AVAILABLE" = true ]; then
  CUSTOM_FIELDS_COUNT=$(echo "$CUSTOM_FIELDS" | jq '. | length')
  if [ "$CUSTOM_FIELDS_COUNT" -gt 0 ]; then
    echo "" >> "$OUTPUT_FILE"
    echo "### Custom Fields" >> "$OUTPUT_FILE"
    echo '```json' >> "$OUTPUT_FILE"
    echo "$CUSTOM_FIELDS" | jq '.' >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
  fi
fi

# Add link to original ticket
echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "*Imported from FreshService: https://${FRESHSERVICE_DOMAIN}.freshservice.com/a/tickets/${TICKET_ID}*" >> "$OUTPUT_FILE"

echo "✓ Ticket data formatted and saved to $OUTPUT_FILE" >&2
exit 0
