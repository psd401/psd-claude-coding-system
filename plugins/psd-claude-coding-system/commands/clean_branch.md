---
description: Clean up merged branches and close associated issues
model: claude-sonnet-4-5
extended-thinking: true
---

```bash
# Initialize telemetry (optional integration)
WORKFLOW_PLUGIN_DIR="$HOME/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-workflow"
TELEMETRY_HELPER="$WORKFLOW_PLUGIN_DIR/lib/telemetry-helper.sh"
```

Ok, great, thank you! I merged in the changes to dev, so please
  get the latest dev code, remove the feature branch locally and
  remotely and then close the corresponding issue with a comment on
  the work that was done.

```bash

# After cleanup is complete, finalize telemetry
if [ -n "$TELEMETRY_SESSION_ID" ]; then
  TELEMETRY_END_TIME=$(date +%s)
  TELEMETRY_DURATION=$((TELEMETRY_END_TIME - TELEMETRY_START_TIME))
fi
echo "✅ Branch cleanup completed!"
```
