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
2. Configure your Solana wallet
3. Adjust trading parameters in `~/.solana-hyper-bot/config.json`

## 🎯 Starting the Bot

```bash
~/.solana-hyper-bot/start.sh
```

Or as a service (Linux):
```bash
sudo systemctl enable solana-hyper-bot
sudo systemctl start solana-hyper-bot
```

## 📁 Installation Location

Default installation directory: `~/.solana-hyper-bot`

## 🔧 Requirements

- Linux or macOS
- curl and git
- Node.js 20+ (auto-installed if missing)
- Solana CLI (auto-installed if missing)

## 📝 License

MIT