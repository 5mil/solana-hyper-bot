# Config Hot Reload Feature

## Overview

The Solana Hyper Bot now supports **hot reload** of configuration changes, allowing you to modify settings without restarting the bot. This feature addresses the common issue where config changes weren't picked up even after restarting.

## Key Features

### 1. Multiple Config Location Support

The bot checks for config files in the following locations (in priority order):
1. **Current working directory**: `./config.json`
2. **Script directory**: Where index.js is located
3. **Home installation**: `~/.solana-hyper-bot/config.json`

**Why this matters**: When you deploy using the `deploy.sh` script, it installs to `~/.solana-hyper-bot/`, but you might run the bot from different locations. The bot now finds the right config automatically.

### 2. Config Location Visibility

When the bot starts, it displays which config file it's using:
```
📂 Loading config from: /home/user/.solana-hyper-bot/config.json
```

**Action**: Make sure to edit the config file shown in this message!

### 3. Hot Reload During Runtime

The bot watches the config file for changes and automatically reloads when you save:

```bash
# Edit your config
nano ~/.solana-hyper-bot/config.json

# Change dryRun from true to false
# Save the file (Ctrl+X, Y, Enter)

# Bot output:
🔄 Config file changed, reloading configuration...
   ✅ Trading mode updated: 🔥 LIVE TRADING
✅ Configuration reloaded successfully
```

### 4. Restart Persistence

Config changes are now guaranteed to persist when you restart the bot:
- Changes are read fresh from disk on every startup
- No caching issues
- Clear feedback about which config is loaded

## What Can Be Changed at Runtime?

The following parameters can be changed without restarting:

### Trading Settings
- **dryRun**: Switch between dry run and live trading
- **minTradeSize**: Minimum trade size in SOL
- **pairs**: Trading pairs to monitor
- **updateInterval**: How often to check markets

### Principia Engine Parameters
- **inertiaThreshold**: Signal strength required to trade
- **tradingMass**: Resistance to change (higher = more conservative)
- **riskReactionRatio**: Risk:reward ratio
- **gravitationalConstant**: Attraction to support/resistance
- **momentumPeriod**: Periods to track for momentum
- **maxPositionSize**: Maximum position size as % of portfolio

## How to Use

### Basic Usage

1. **Start the bot**:
   ```bash
   npm start
   # or
   node index.js
   ```

2. **Note the config location** from the startup message:
   ```
   📂 Loading config from: /path/to/config.json
   ```

3. **Edit that config file**:
   ```bash
   nano /path/to/config.json
   ```

4. **Make your changes** (e.g., change `dryRun` to `false`)

5. **Save the file** - changes apply immediately!

### Example: Switching from Dry Run to Live Trading

**Before**:
```json
{
  "trading": {
    "dryRun": true,
    "minTradeSize": 0.01
  }
}
```

**After** (just edit and save):
```json
{
  "trading": {
    "dryRun": false,
    "minTradeSize": 0.05
  }
}
```

**Bot will show**:
```
🔄 Config file changed, reloading configuration...
   ✅ Trading mode updated: 🔥 LIVE TRADING
   ✅ Min trade size updated: 0.05 SOL
✅ Configuration reloaded successfully
```

## Troubleshooting

### Changes Not Detected?

1. **Check which config the bot is using**:
   - Look at the startup message: `📂 Loading config from: ...`
   - Make sure you're editing that exact file!

2. **File editor issues**:
   - Some editors create backup files or use atomic writes
   - Wait 1-2 seconds after saving
   - If using vim, use `:wq` instead of `:x`

3. **File permissions**:
   - Make sure the config file is readable: `chmod 644 config.json`
   - Make sure you have write permissions

4. **JSON syntax errors**:
   - The bot will log an error if JSON is invalid
   - Validate your JSON: `node -e "JSON.parse(require('fs').readFileSync('config.json'))"`

### Still Not Working?

1. **Verify file is being saved**:
   ```bash
   cat ~/.solana-hyper-bot/config.json | grep dryRun
   ```

2. **Check bot logs** for reload messages

3. **Restart the bot** - it will load fresh config on startup

## Testing

Run the config persistence test:
```bash
npm run test:config   # (if added to package.json)
# or
node test-config-persistence.js
```

This verifies:
- Config changes save to disk
- Config loads correctly on restart
- Bot finds the right config file
- Hot reload works during runtime

## Technical Details

### Implementation

- **File watcher**: Uses Node.js `fs.watch()` API
- **Debouncing**: 500ms debounce prevents multiple reloads from rapid edits
- **Safe reloading**: Each parameter is checked before updating
- **Error handling**: Invalid JSON or missing files won't crash the bot

### What Doesn't Hot Reload?

Some settings can't be changed without restart:
- **Network**: Solana network (mainnet/devnet/testnet)
- **RPC URL**: Connection endpoint
- **Wallet path**: Wallet file location

These require reconnecting to Solana, so restart the bot to change them.

## Best Practices

1. **Test in dry run first**: Always test parameter changes with `dryRun: true`
2. **Small adjustments**: Make incremental changes to tuning parameters
3. **Monitor the bot**: Watch the output after config changes
4. **Keep backups**: Save working configs before experimenting
5. **Use version control**: Git track your config.json for history

## Examples

### Adjusting Risk Parameters

```json
{
  "principia": {
    "inertiaThreshold": 0.20,      // More conservative (was 0.15)
    "maxPositionSize": 0.20,        // Smaller positions (was 0.30)
    "riskReactionRatio": 1.5        // Better risk:reward (was 1.0)
  }
}
```

Save and watch the bot update immediately!

### Changing Trading Pairs

```json
{
  "trading": {
    "pairs": ["SOL-USDC", "BTC-USDC"],  // Add more pairs
    "updateInterval": 5000              // Check more frequently
  }
}
```

The bot will start monitoring the new pairs right away.

## Summary

✅ **No more restarts needed** for config changes  
✅ **Always uses the right config file**  
✅ **Clear feedback** about what changed  
✅ **Safe and reliable** with error handling  
✅ **Changes persist** across restarts  

Happy trading! 🚀
