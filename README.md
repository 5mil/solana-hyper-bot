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
- 🔬 **Principia Mathematica Engine**: Trading bot powered by Newton's laws of motion and universal gravitation
- 📈 **Market Data Integration**: Real-time price tracking and technical analysis
- 🤖 **Automated Trading**: Execute trades based on Principia engine signals
- 🛡️ **Risk Management**: Built-in stop-loss, take-profit, and position sizing
- 🔍 **Dry Run Mode**: Test strategies without risking real funds

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
- Initialize the Principia Mathematica trading engine
- Start the market data feed
- Begin analyzing market conditions using Newton's laws
- Make trading decisions based on physics principles (in dry run mode by default)

## 🔬 Principia Mathematica Trading Engine

This bot implements a unique trading strategy based on Isaac Newton's **"Philosophiæ Naturalis Principia Mathematica"** (1687), applying fundamental physics principles to market dynamics:

### Newton's Laws Applied to Trading

1. **Law of Inertia (First Law)**: The bot maintains its current position unless a sufficiently strong market signal compels a change. This prevents overtrading and whipsaw.

2. **Law of Acceleration (Second Law)**: Trade sizes are proportional to signal strength (F=ma). Stronger signals result in larger positions; weaker signals in smaller adjustments.

3. **Law of Action-Reaction (Third Law)**: For every trade (action), the bot implements equal and opposite risk management (reaction) including stop losses, profit targets, and hedging.

4. **Universal Gravitation**: Price movements are attracted to significant support/resistance levels with force proportional to volume and inversely proportional to distance squared.

5. **Conservation of Momentum**: The bot tracks market momentum to identify trend persistence and potential reversal points.

### 📚 Documentation

See [PRINCIPIA_MATHEMATICA_TRADING_FRAMEWORK.md](PRINCIPIA_MATHEMATICA_TRADING_FRAMEWORK.md) for:
- Complete theoretical framework
- Mathematical formulations
- Configuration parameters
- Practical examples
- Full citations from Newton's original text

**Generate PDF Documentation:**
```bash
npm run generate-pdf
# Opens the HTML file which can be printed to PDF from any browser
```

### ⚙️ Principia Engine Configuration

Edit `config.json` to tune the engine parameters:

```json
{
  "principia": {
    "enabled": true,
    "inertiaThreshold": 0.15,       // Minimum signal to trigger action (Law I)
    "tradingMass": 1.0,             // Resistance to change (Law II)
    "riskReactionRatio": 1.0,       // Risk:reward ratio (Law III)
    "gravitationalConstant": 0.001, // Support/resistance attraction strength
    "momentumPeriod": 20,           // Periods for momentum calculation
    "maxPositionSize": 0.3          // Max 30% of portfolio per position
  },
  "trading": {
    "pairs": ["SOL-USDC"],          // Trading pairs to monitor
    "dryRun": true,                 // Enable dry run mode (recommended)
    "minTradeSize": 0.01,           // Minimum trade size in SOL
    "updateInterval": 10000         // Market update interval in ms
  }
}
```

### 🔍 Dry Run Mode

By default, the bot runs in **dry run mode** for safety. In this mode:
- ✅ All trading logic executes normally
- ✅ Market analysis and signals are real
- ✅ You can see what trades would be executed
- ❌ No actual trades are submitted to the blockchain
- ❌ No funds are at risk

To enable live trading:
1. Set `"dryRun": false` in `config.json`
2. Ensure you have sufficient SOL in your wallet
3. Start with small position sizes to test
4. Monitor the bot closely during initial runs

**⚠️ WARNING**: Live trading involves real financial risk. Only trade with funds you can afford to lose.

## 📁 Installation Location

Default installation directory: `~/.solana-hyper-bot`

## 🔧 Requirements

- Linux or macOS
- curl and git
- Node.js 20+ (auto-installed if missing)
- Solana CLI (auto-installed if missing)

## 📝 License

MIT

## 🧪 Testing

Run the test suites:

```bash
# Test Principia engine
npm test

# Test trading modules
node test-trading.js
```

## 📊 Market Data & Trading

The bot includes:

- **Market Data Module**: Tracks real-time prices, calculates technical indicators (SMA, momentum), and detects support/resistance levels
- **Trade Executor**: Executes trades based on Principia engine signals with built-in safety controls
- **Risk Management**: Automatic stop-loss and take-profit calculations per Newton's Third Law

### Technical Indicators

- **Simple Moving Average (SMA)**: Trend identification
- **Momentum**: Rate of price change over time
- **Support/Resistance**: Key price levels detected from historical data
- **Signal Strength**: Combined force metric from multiple indicators

## 🔒 Safety Features

- Default dry run mode prevents accidental trades
- Minimum trade size limits
- Maximum position size constraints (30% of portfolio by default)
- Inertia threshold prevents overtrading
- Risk management ratios for every trade

## 📞 Support

For issues or questions, please open an issue on GitHub.