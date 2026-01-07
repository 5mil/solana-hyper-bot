# solana-hyper-bot

A high-performance Solana trading bot for automated trading strategies.

## 🚀 Quick Deploy

### FULL CLOUD DEPLOY (30 seconds)
```bash
curl -sSL https://raw.githubusercontent.com/5mil/solana-hyper-bot/main/deploy.sh | bash
```

### OR MANUAL (copy all):
```bash
git clone https://github.com/5mil/solana-hyper-bot.git .
chmod +x deploy.sh && ./deploy.sh
```

## 📋 What the deployment script does

The `deploy.sh` script automatically:
- ✅ Detects your operating system (Linux/macOS)
- ✅ Checks and installs prerequisites (Node.js, npm)
- ✅ Installs Solana CLI tools
- ✅ Clones the repository (if not already done)
- ✅ Creates default configuration files
- ✅ Sets up environment templates
- ✅ Creates start scripts
- ✅ Optionally sets up systemd service (Linux)

## ⚙️ Configuration

After deployment, update your configuration:

1. Edit `~/.solana-hyper-bot/.env` with your settings
2. Configure your Solana wallet (automatically created if not present)
3. Adjust trading parameters in `~/.solana-hyper-bot/config.json`

See [WALLET.md](WALLET.md) for detailed wallet configuration and usage.

## 🎯 Features

- 🔐 **Secure Wallet Management**: Automatic wallet creation and secure key storage
- 📊 **Balance Tracking**: Real-time SOL balance monitoring
- 🌐 **Multi-Network Support**: Works with devnet, testnet, and mainnet-beta
- ⚙️ **Flexible Configuration**: Environment variables and JSON config support
- 🔄 **Auto-Recovery**: Graceful error handling and automatic wallet initialization

## 🎯 Starting the Bot

Run directly with Node.js:
```bash
cd ~/.solana-hyper-bot
npm install
npm start
```

Or use the start script:
```bash
~/.solana-hyper-bot/start.sh
```

Or as a service (Linux):
```bash
sudo systemctl enable solana-hyper-bot
sudo systemctl start solana-hyper-bot
```

On first run, the bot will:
- Connect to the configured Solana network
- Load or create a wallet automatically
- Display your wallet address and balance
- Start monitoring for trading opportunities

## 📁 Installation Location

Default installation directory: `~/.solana-hyper-bot`

## 🔧 Requirements

- Linux or macOS
- curl and git
- Node.js 20+ (auto-installed if missing)
- Solana CLI (auto-installed if missing)

## 📝 License

MIT