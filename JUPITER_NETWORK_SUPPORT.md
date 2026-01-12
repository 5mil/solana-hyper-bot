# Jupiter API Network Support

## Overview

The Solana Hyper Bot uses Jupiter API for fetching quotes and executing trades. However, **Jupiter API only supports mainnet-beta** and is not available on devnet or testnet networks.

## How It Works

The bot now automatically detects which network it's running on and adjusts its behavior accordingly:

### On Mainnet-Beta

- ✅ Uses actual Jupiter API endpoints
- ✅ Fetches real market quotes
- ✅ Gets live price data
- ✅ Supports real trade execution (when not in dry run mode)

### On Devnet/Testnet

- ✅ Automatically uses **simulated mock data**
- ✅ Generates realistic quotes with 1% simulated slippage
- ✅ Allows full testing of bot logic without Jupiter API
- ✅ All trading functionality works normally
- ⚠️ Trade execution is simulation-based (not actual blockchain trades)

## Configuration

The network is automatically detected from your `config.json`:

```json
{
  "network": "devnet",
  ...
}
```

Or from environment variables:

```bash
SOLANA_NETWORK=devnet
```

## Mock Data Behavior

When running on devnet or testnet, the bot:

1. **Detects network** at initialization
2. **Skips Jupiter API calls** (prevents "ENOTFOUND" errors)
3. **Returns mock quotes** with realistic parameters:
   - Output amount: 99% of input (simulating 1% slippage)
   - Price impact: 0.1%
   - All other quote fields populated

## Testing

Run the devnet-specific test suite:

```bash
npm run test:devnet
```

This verifies:
- ✓ Network detection works correctly
- ✓ Mock data is returned on devnet
- ✓ Trades execute successfully with mock data
- ✓ Statistics are tracked properly

## Examples

### Devnet Configuration

```json
{
  "network": "devnet",
  "rpcUrl": "https://api.devnet.solana.com",
  "trading": {
    "pairs": ["SOL-USDC"],
    "dryRun": true
  }
}
```

Result:
```
ℹ️  Jupiter API not available on devnet, using simulated quote
🔍 DRY RUN MODE - Trade not executed
   Input: 1 tokens
   Expected output: 0.99 tokens
   Price impact: 0.1%
✅ Buy executed successfully (DRY RUN)
```

### Mainnet Configuration

```json
{
  "network": "mainnet-beta",
  "rpcUrl": "https://api.mainnet-beta.solana.com",
  "trading": {
    "pairs": ["SOL-USDC"],
    "dryRun": true
  }
}
```

Result:
```
📊 Getting quote from Jupiter...
✅ Real quote received from Jupiter API
```

## Benefits

1. **Development-Friendly**: Test bot logic on devnet without API restrictions
2. **Error-Free**: No more "ENOTFOUND" errors when using devnet
3. **Consistent Behavior**: Bot works the same way across all networks
4. **Safe Testing**: Use devnet for development, mainnet for production

## Limitations

- Mock data on devnet doesn't reflect real market conditions
- Price impact and slippage are simulated, not real
- For realistic testing, use mainnet with dry run mode enabled

## Migration Guide

If you're upgrading from an older version:

1. **No configuration changes needed** - the bot automatically detects your network
2. **Existing devnet setups** will now work without errors
3. **Mainnet setups** continue to use real Jupiter API

## Technical Details

### Implementation

The network detection is implemented in:
- `trade-executor.js` - `getQuote()` method
- `market-data.js` - `fetchPrice()` and `fetchQuote()` methods
- `index.js` - passes network config to modules

### Mock Quote Structure

```javascript
{
  inputMint: "So11111111111111111111111111111111111111112",
  outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  inAmount: "1000000000",
  outAmount: 990000000,
  otherAmountThreshold: "985050000",
  swapMode: "ExactIn",
  slippageBps: 50,
  priceImpactPct: 0.1,
  contextSlot: 0,
  timeTaken: 0.1
}
```

## Support

For issues or questions about network support, please open an issue on GitHub.
