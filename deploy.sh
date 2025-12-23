#!/bin/bash

################################################################################
# Solana Hyper Bot - Cloud Deployment Script
# This script sets up and deploys the Solana hyper bot in ~30 seconds
################################################################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo "════════════════════════════════════════════════════════════════"
echo "  🚀 SOLANA HYPER BOT - Cloud Deployment"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    log_warning "Running as root. Consider running as a non-root user for security."
fi

# Detect OS
log_info "Detecting operating system..."
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    log_success "Detected Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    log_success "Detected macOS"
else
    log_error "Unsupported OS: $OSTYPE"
    exit 1
fi

# Check for required commands
log_info "Checking prerequisites..."
MISSING_DEPS=()

command -v curl >/dev/null 2>&1 || MISSING_DEPS+=("curl")
command -v git >/dev/null 2>&1 || MISSING_DEPS+=("git")

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    log_error "Missing required dependencies: ${MISSING_DEPS[*]}"
    log_info "Please install missing dependencies and try again."
    exit 1
fi

log_success "Prerequisites check passed"

# Install Node.js if not present
log_info "Checking Node.js installation..."
if ! command -v node >/dev/null 2>&1; then
    log_warning "Node.js not found. Installing..."
    if [ "$OS" == "linux" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    elif [ "$OS" == "macos" ]; then
        if command -v brew >/dev/null 2>&1; then
            brew install node
        else
            log_error "Homebrew not found. Please install Node.js manually from https://nodejs.org/"
            exit 1
        fi
    fi
    log_success "Node.js installed"
else
    NODE_VERSION=$(node -v)
    log_success "Node.js $NODE_VERSION already installed"
fi

# Install npm if not present
if ! command -v npm >/dev/null 2>&1; then
    log_error "npm not found. Please install npm and try again."
    exit 1
fi

# Install Solana CLI if not present
log_info "Checking Solana CLI installation..."
if ! command -v solana >/dev/null 2>&1; then
    log_warning "Solana CLI not found. Installing..."
    sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
    
    # Add to PATH for current session
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    
    if command -v solana >/dev/null 2>&1; then
        log_success "Solana CLI installed"
    else
        log_warning "Solana CLI installed but not in PATH. You may need to restart your shell."
    fi
else
    SOLANA_VERSION=$(solana --version | head -n1)
    log_success "Solana CLI already installed: $SOLANA_VERSION"
fi

# Create installation directory
INSTALL_DIR="${HOME}/.solana-hyper-bot"
log_info "Setting up installation directory: $INSTALL_DIR"

if [ -d "$INSTALL_DIR" ]; then
    log_warning "Installation directory already exists. Backing up..."
    mv "$INSTALL_DIR" "${INSTALL_DIR}.backup.$(date +%s)"
fi

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"
log_success "Installation directory created"

# Clone repository if we're running from curl (not already in repo)
if [ ! -f "$(dirname "$0")/README.md" ] || [ "$(dirname "$0")" == "/dev/fd" ]; then
    log_info "Cloning Solana Hyper Bot repository..."
    git clone https://github.com/5mil/solana-hyper-bot.git .
    log_success "Repository cloned"
else
    log_info "Running from local repository"
fi

# Install dependencies (if package.json exists)
if [ -f "package.json" ]; then
    log_info "Installing Node.js dependencies..."
    npm install
    log_success "Dependencies installed"
else
    log_info "No package.json found, skipping npm install"
fi

# Create default configuration file
CONFIG_FILE="$INSTALL_DIR/config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    log_info "Creating default configuration file..."
    cat > "$CONFIG_FILE" << 'EOF'
{
  "network": "mainnet-beta",
  "rpcUrl": "https://api.mainnet-beta.solana.com",
  "wsUrl": "wss://api.mainnet-beta.solana.com",
  "logLevel": "info",
  "wallet": {
    "path": "~/.config/solana/id.json"
  },
  "bot": {
    "enabled": true,
    "slippageTolerance": 0.01,
    "maxRetries": 3
  }
}
EOF
    log_success "Configuration file created at $CONFIG_FILE"
else
    log_info "Configuration file already exists"
fi

# Create environment file template
ENV_FILE="$INSTALL_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    log_info "Creating environment file template..."
    cat > "$ENV_FILE" << 'EOF'
# Solana Hyper Bot Environment Configuration
# Copy this file and update with your settings

# Network Configuration
SOLANA_NETWORK=mainnet-beta
RPC_URL=https://api.mainnet-beta.solana.com
WS_URL=wss://api.mainnet-beta.solana.com

# Wallet Configuration
# WALLET_PRIVATE_KEY=your_private_key_here

# Bot Configuration
BOT_ENABLED=true
LOG_LEVEL=info

# Optional: Custom RPC endpoints
# HELIUS_API_KEY=your_api_key_here
# QUICKNODE_ENDPOINT=your_endpoint_here
EOF
    log_success "Environment file template created at $ENV_FILE"
    log_warning "Please update $ENV_FILE with your configuration"
else
    log_info "Environment file already exists"
fi

# Set up Solana config
log_info "Configuring Solana CLI..."
if command -v solana >/dev/null 2>&1; then
    solana config set --url mainnet-beta >/dev/null 2>&1 || true
    log_success "Solana CLI configured for mainnet-beta"
fi

# Create start script
START_SCRIPT="$INSTALL_DIR/start.sh"
log_info "Creating start script..."
cat > "$START_SCRIPT" << 'EOF'
#!/bin/bash
# Solana Hyper Bot Start Script

cd "$(dirname "$0")"

if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -f "package.json" ] && [ -f "index.js" ]; then
    echo "Starting Solana Hyper Bot..."
    node index.js
elif [ -f "bot.js" ]; then
    echo "Starting Solana Hyper Bot..."
    node bot.js
else
    echo "No bot entry point found. Please implement your bot logic."
    echo "Create an index.js or bot.js file to get started."
fi
EOF

chmod +x "$START_SCRIPT"
log_success "Start script created at $START_SCRIPT"

# Create systemd service (Linux only)
if [ "$OS" == "linux" ] && command -v systemctl >/dev/null 2>&1; then
    log_info "Creating systemd service..."
    SERVICE_FILE="/tmp/solana-hyper-bot.service"
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Solana Hyper Bot
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$START_SCRIPT
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    if [ "$EUID" -eq 0 ]; then
        mv "$SERVICE_FILE" /etc/systemd/system/solana-hyper-bot.service
        systemctl daemon-reload
        log_success "Systemd service created. Enable with: systemctl enable solana-hyper-bot"
    else
        log_info "Systemd service file created at $SERVICE_FILE"
        log_info "To install, run: sudo mv $SERVICE_FILE /etc/systemd/system/ && sudo systemctl daemon-reload"
    fi
fi

# Summary
echo ""
echo "════════════════════════════════════════════════════════════════"
log_success "🎉 Solana Hyper Bot deployment complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📁 Installation directory: $INSTALL_DIR"
echo "⚙️  Configuration file: $CONFIG_FILE"
echo "🔧 Environment file: $ENV_FILE"
echo "▶️  Start script: $START_SCRIPT"
echo ""
echo "Next steps:"
echo "  1. Update your configuration in $ENV_FILE"
echo "  2. Set up your Solana wallet (if not already done)"
echo "  3. Start the bot: $START_SCRIPT"
echo ""
if [ "$OS" == "linux" ]; then
    echo "  Optional: Install as a service"
    echo "    sudo mv /tmp/solana-hyper-bot.service /etc/systemd/system/"
    echo "    sudo systemctl enable solana-hyper-bot"
    echo "    sudo systemctl start solana-hyper-bot"
    echo ""
fi
echo "════════════════════════════════════════════════════════════════"
