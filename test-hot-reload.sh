#!/bin/bash
# Manual test for config hot reload
# This script demonstrates the config hot reload feature

echo "═══════════════════════════════════════════════════"
echo "  CONFIG HOT RELOAD DEMONSTRATION"
echo "═══════════════════════════════════════════════════"
echo ""
echo "This test will:"
echo "1. Show the current config"
echo "2. Modify the config while bot is running"
echo "3. Verify changes are picked up immediately"
echo ""
echo "Press Ctrl+C to exit the test"
echo ""
echo "─────────────────────────────────────────────────"
echo ""

# Get config path
CONFIG_FILE="$(dirname "$0")/config.json"

echo "Current config location: $CONFIG_FILE"
echo ""
echo "Current dryRun setting:"
grep -A 3 '"trading"' "$CONFIG_FILE" | grep dryRun
echo ""

echo "─────────────────────────────────────────────────"
echo "STEP 1: Start the bot (it will show which config it loads)"
echo "─────────────────────────────────────────────────"
echo ""
echo "Starting bot in 3 seconds..."
sleep 3

# Start the bot in background (set to fail fast since we don't have network)
timeout 30 node index.js 2>&1 &
BOT_PID=$!

echo "Bot started (PID: $BOT_PID)"
echo "Waiting for bot to initialize..."
sleep 3

echo ""
echo "─────────────────────────────────────────────────"
echo "STEP 2: The bot is now watching for config changes"
echo "─────────────────────────────────────────────────"
echo ""
echo "Try editing $CONFIG_FILE"
echo "Change 'dryRun' from true to false (or vice versa)"
echo ""
echo "The bot will automatically detect the change and reload!"
echo ""
echo "Press Ctrl+C when done testing"
echo ""

# Wait for user or timeout
wait $BOT_PID 2>/dev/null

echo ""
echo "─────────────────────────────────────────────────"
echo "Test complete!"
echo "─────────────────────────────────────────────────"
