#!/usr/bin/env bash

# Wrapper script for n8n native instance MCP server.
# Reads N8N_HOST and N8N_MCP_TOKEN from environment or .env file,
# then launches mcp-remote with the correct URL and auth header.
#
# This script is referenced by plugin.json — it keeps the MCP server
# config dynamic so the n8n URL is never hardcoded.

ENV_FILE="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Geoffrey/secrets/.env"

# Load from .env if vars not already set
if [[ -z "$N8N_HOST" || -z "$N8N_MCP_TOKEN" ]]; then
  if [[ -f "$ENV_FILE" ]]; then
    while IFS='=' read -r key value; do
      # Skip comments and empty lines
      [[ -z "$key" || "$key" == \#* ]] && continue
      # Strip quotes from value
      value="${value%\"}"
      value="${value#\"}"
      value="${value%\'}"
      value="${value#\'}"
      case "$key" in
        N8N_HOST)      [[ -z "$N8N_HOST" ]]      && export N8N_HOST="$value" ;;
        N8N_MCP_TOKEN) [[ -z "$N8N_MCP_TOKEN" ]] && export N8N_MCP_TOKEN="$value" ;;
      esac
    done < "$ENV_FILE"
  fi
fi

if [[ -z "$N8N_HOST" ]]; then
  echo '{"error": "N8N_HOST not set. Add to .env or shell profile."}' >&2
  exit 1
fi

if [[ -z "$N8N_MCP_TOKEN" ]]; then
  echo '{"error": "N8N_MCP_TOKEN not set. Enable Instance-level MCP in n8n Settings and get the bearer token."}' >&2
  exit 1
fi

# Build the URL — support both "host:port" and "http://host:port" formats
if [[ "$N8N_HOST" == http* ]]; then
  MCP_URL="${N8N_HOST}/mcp-server/http"
else
  MCP_URL="http://${N8N_HOST}/mcp-server/http"
fi

exec npx -y mcp-remote "$MCP_URL" --header "Authorization: Bearer $N8N_MCP_TOKEN"
