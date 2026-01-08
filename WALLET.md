# Wallet Feature Documentation

## Overview

The Solana Hyper Bot includes a fully-featured wallet module that handles key management, balance checking, and transaction operations on the Solana blockchain.

## Features

- ✅ Load existing Solana wallets (CLI format)
- ✅ Generate new wallets
- ✅ Secure key storage with file permissions
- ✅ Balance checking
- ✅ Airdrop requests (devnet/testnet)
- ✅ Public key access
- ✅ Support for multiple networks (devnet, testnet, mainnet-beta)

## Quick Start

### 1. Installation

The wallet module is automatically installed with the bot dependencies:

```bash
npm install
```

### 2. Configuration

Configure your wallet in `config.json`:

```json
{
  "network": "devnet",
  "wallet": {
    "path": "~/.config/solana/id.json"
  }
}
```

Or use environment variables in `.env`:

```bash
SOLANA_NETWORK=devnet
WALLET_PATH=~/.config/solana/id.json
```

### 3. Usage

The bot will automatically:
1. Try to load an existing wallet from the configured path
2. If no wallet exists, generate a new one and save it
3. Display the wallet address and balance

## Wallet Module API

### Creating a Wallet Instance

```javascript
const { Connection } = require('@solana/web3.js');
const Wallet = require('./wallet');

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const wallet = new Wallet(connection);
```

### Loading an Existing Wallet

```javascript
wallet.loadFromFile('~/.config/solana/id.json');
```

### Generating a New Wallet

```javascript
wallet.generateNew();
wallet.saveToFile('~/.config/solana/id.json');
```

### Getting Wallet Information

```javascript
// Get public key
const publicKey = wallet.getPublicKey();
console.log(`Wallet Address: ${publicKey}`);

// Get balance
const balance = await wallet.getBalance();
console.log(`Balance: ${balance} SOL`);

// Get keypair for signing transactions
const keypair = wallet.getKeypair();
```

### Requesting Airdrop (Devnet/Testnet Only)

```javascript
// Request 1 SOL airdrop
const signature = await wallet.requestAirdrop(1);
console.log(`Airdrop signature: ${signature}`);
```

## Security Best Practices

1. **Never commit wallet files**: The `.gitignore` already excludes `*.key`, `*.pem`, and `id.json` files
2. **File permissions**: Wallet files are automatically saved with `0o600` (read/write for owner only)
3. **Environment variables**: Store sensitive paths in `.env` files (already in `.gitignore`)
4. **Network selection**: Use devnet/testnet for development, mainnet-beta only for production
5. **Private key handling**: Never share or expose your wallet private keys

## Network Configuration

### Devnet (Development)
```json
{
  "network": "devnet",
  "rpcUrl": "https://api.devnet.solana.com"
}
```

### Testnet (Testing)
```json
{
  "network": "testnet",
  "rpcUrl": "https://api.testnet.solana.com"
}
```

### Mainnet Beta (Production)
```json
{
  "network": "mainnet-beta",
  "rpcUrl": "https://api.mainnet-beta.solana.com"
}
```

## Error Handling

The wallet module includes comprehensive error handling:

- **File not found**: Automatically generates a new wallet
- **Invalid wallet format**: Throws descriptive error
- **Network errors**: Gracefully handles connection issues
- **Permission errors**: Reports file access problems

## Examples

### Complete Bot Integration Example

See `index.js` for a full example of wallet integration in the bot.

### Testing the Wallet

Run the test script:

```bash
node test-wallet.js
```

This will verify:
- Wallet generation
- File save/load operations
- Public key retrieval
- Balance checking (with mock connection)

## Troubleshooting

### Wallet file not found
If you see `Wallet file not found`, the bot will automatically generate a new wallet. To use an existing wallet:
1. Place your wallet file at the configured path
2. Or update `config.json` or `.env` with the correct path

### Connection errors
If you see connection errors:
1. Check your network configuration in `config.json`
2. Verify RPC endpoint is accessible
3. Consider using a custom RPC endpoint (Helius, QuickNode, etc.)

### Permission denied
If wallet save fails:
1. Check directory exists: `mkdir -p ~/.config/solana`
2. Verify write permissions: `ls -la ~/.config/solana`

## Advanced Usage

### Using Custom RPC Endpoints

For better performance and reliability, use custom RPC providers:

```json
{
  "rpcUrl": "https://rpc.helius.xyz/?api-key=YOUR_API_KEY"
}
```

### Multiple Wallets

You can manage multiple wallets by creating separate instances:

```javascript
const mainWallet = new Wallet(connection);
mainWallet.loadFromFile('~/.config/solana/main.json');

const tradingWallet = new Wallet(connection);
tradingWallet.loadFromFile('~/.config/solana/trading.json');
```

## Support

For issues or questions about the wallet feature:
1. Check this documentation
2. Review the code in `wallet.js` and `index.js`
3. Open an issue on GitHub
