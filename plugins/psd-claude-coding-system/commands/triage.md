---
allowed-tools: Bash(*), View, Edit, Create, SlashCommand
description: Triage FreshService ticket and create GitHub issue
argument-hint: [ticket-id]
model: sonnet-4-5
extended-thinking: true
---

# FreshService Ticket Triage

You are a support engineer who triages bug reports from FreshService and creates well-structured GitHub issues. You extract all relevant information from FreshService tickets and automatically create comprehensive issues for development teams.

**Ticket ID:** $ARGUMENTS

## Workflow

### Phase 1: Configuration Validation

Check that FreshService credentials are configured:

```bash
# Check for environment configuration
if [ -f ~/.claude/freshservice.env ]; then
  echo "✓ Loading FreshService configuration..."
  source ~/.claude/freshservice.env
else
  echo "❌ FreshService configuration not found!"
  echo ""
  echo "Please create ~/.claude/freshservice.env with:"
  echo ""
  echo "FRESHSERVICE_API_KEY=your_api_key_here"
  echo "FRESHSERVICE_DOMAIN=your_domain"
  echo ""
  echo "Example:"
  echo "FRESHSERVICE_API_KEY=abcdef123456"
  echo "FRESHSERVICE_DOMAIN=peninsula-sd"
  echo ""
  exit 1
fi

# Validate required variables
if [ -z "$FRESHSERVICE_API_KEY" ] || [ -z "$FRESHSERVICE_DOMAIN" ]; then
  echo "❌ Missing required environment variables!"
  echo "Required: FRESHSERVICE_API_KEY, FRESHSERVICE_DOMAIN"
  exit 1
fi

echo "✓ Configuration validated"
```

### Phase 2: Fetch Ticket from FreshService

Use the script to retrieve ticket information:

```bash
# Get the plugin root directory
PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_PATH="$PLUGIN_ROOT/scripts/triage-ticket.sh"

# Validate and sanitize ticket ID (remove any non-numeric characters)
TICKET_ID="$ARGUMENTS"
TICKET_ID="${TICKET_ID//[^0-9]/}"  # Remove all non-numeric characters

if [ -z "$TICKET_ID" ] || ! [[ "$TICKET_ID" =~ ^[0-9]+$ ]]; then
  echo "❌ Invalid ticket ID"
  echo "Usage: /triage <ticket-id>"
  exit 1
fi

echo "=== Fetching FreshService Ticket #$TICKET_ID ==="
echo ""

# Run the triage script
bash "$SCRIPT_PATH" "$TICKET_ID"

# Capture exit code
TRIAGE_EXIT_CODE=$?

if [ $TRIAGE_EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ Failed to retrieve ticket from FreshService"
  echo "Please verify:"
  echo "  - Ticket ID $TICKET_ID exists"
  echo "  - API key is valid"
  echo "  - Domain is correct"
  exit 1
fi

echo ""
echo "✓ Ticket retrieved successfully"
```

### Phase 3: Extract and Format Information

The triage script (`scripts/triage-ticket.sh`) will have created a formatted issue description in `/tmp/freshservice-ticket-$TICKET_ID.txt`. Read and process it:

```bash
TICKET_FILE="/tmp/freshservice-ticket-$TICKET_ID.txt"

if [ ! -f "$TICKET_FILE" ]; then
  echo "❌ Ticket data file not found: $TICKET_FILE"
  exit 1
fi

echo "=== Ticket Information ==="
cat "$TICKET_FILE"
echo ""
```

### Phase 4: Create GitHub Issue

Now invoke the `/issue` command with the extracted information:

```bash
# Read the formatted ticket description
ISSUE_DESCRIPTION=$(cat "$TICKET_FILE")

# Clean up temporary file
rm -f "$TICKET_FILE"

echo "=== Creating GitHub Issue ==="
echo ""
```

**IMPORTANT**: Now use the SlashCommand tool to invoke `/psd-claude-coding-system:issue` with the ticket description:

Use the SlashCommand tool with:
- `command`: `/psd-claude-coding-system:issue`

Pass the issue description from the ticket data. The description should be formatted as a bug report based on the FreshService ticket information.

### Phase 5: Confirmation

After the issue is created, provide a summary:

```bash
echo ""
echo "✅ Triage completed successfully!"
echo ""
echo "Summary:"
echo "  - FreshService Ticket: #$TICKET_ID"
echo "  - GitHub Issue: [URL from /issue command output]"
echo ""
echo "Next steps:"
echo "  - Review the created issue"
echo "  - Use /work [issue-number] to begin implementation"
```

## Error Handling

Handle common error scenarios:

1. **Missing Configuration**: Guide user to create `~/.claude/freshservice.env`
2. **Invalid Ticket ID**: Validate numeric format
3. **API Failures**: Provide clear error messages with troubleshooting steps
4. **Network Issues**: Suggest checking connectivity and credentials

## Security Notes

- API key is stored in `~/.claude/freshservice.env` (user-level, not in repository)
- Script uses HTTPS for all API communications
- Input validation prevents injection attacks
- Credentials are never logged or displayed

## Example Usage

```bash
# Triage a FreshService ticket
/triage 12345

# This will:
# 1. Fetch ticket #12345 from FreshService
# 2. Extract all relevant information
# 3. Format as a bug report
# 4. Create a GitHub issue automatically
# 5. Return the new issue URL
```

## Troubleshooting

**Configuration Issues:**
```bash
# Check if config file exists
ls -la ~/.claude/freshservice.env

# View configuration (without exposing API key)
grep FRESHSERVICE_DOMAIN ~/.claude/freshservice.env
```

**API Issues:**
```bash
# Test API connectivity manually
curl -u YOUR_API_KEY:X -X GET 'https://YOUR_DOMAIN.freshservice.com/api/v2/tickets/TICKET_ID'
```

**Script Issues:**
```bash
# Check script exists and is executable
ls -la plugins/psd-claude-coding-system/scripts/triage-ticket.sh

# Run script directly for debugging
bash plugins/psd-claude-coding-system/scripts/triage-ticket.sh TICKET_ID
```
