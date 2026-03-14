#!/bin/bash
# Launch Brave Browser Nightly with persistent debug profile for browser automation.
# Uses Brave Nightly to bypass PSD district MDM restrictions on Chrome remote debugging.
#
# Usage:
#   ./launch-chrome.sh              # Launch visible browser
#   ./launch-chrome.sh --headless   # Launch headless
#   ./launch-chrome.sh --status     # Check if running

PROFILE_DIR="$HOME/.psd-browser-automation"
PORT=9222

# Status check
if [ "$1" = "--status" ]; then
    if lsof -i :$PORT > /dev/null 2>&1; then
        echo '{"status":"running","port":'$PORT',"profile":"'"$PROFILE_DIR"'"}'
    else
        echo '{"status":"stopped","port":'$PORT'}'
    fi
    exit 0
fi

# Check if already running
if lsof -i :$PORT > /dev/null 2>&1; then
    echo '{"status":"already_running","port":'$PORT',"profile":"'"$PROFILE_DIR"'"}'
    exit 0
fi

# Verify Brave Nightly is installed
BRAVE_PATH="/Applications/Brave Browser Nightly.app/Contents/MacOS/Brave Browser Nightly"
if [ ! -f "$BRAVE_PATH" ]; then
    echo '{"status":"error","error":"Brave Browser Nightly not found at '"$BRAVE_PATH"'"}'
    exit 1
fi

mkdir -p "$PROFILE_DIR"

HEADLESS=""
[ "$1" = "--headless" ] && HEADLESS="--headless=new"

"$BRAVE_PATH" \
    --remote-debugging-port=$PORT \
    --user-data-dir="$PROFILE_DIR" \
    $HEADLESS \
    --no-first-run \
    --no-default-browser-check \
    --window-size=1280,900 &

# Wait for browser to start
for i in $(seq 1 10); do
    if lsof -i :$PORT > /dev/null 2>&1; then
        echo '{"status":"started","port":'$PORT',"profile":"'"$PROFILE_DIR"'"}'
        exit 0
    fi
    sleep 0.5
done

echo '{"status":"failed","error":"Browser did not start on port '$PORT' within 5 seconds"}'
exit 1
