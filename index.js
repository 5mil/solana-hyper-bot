require('dotenv').config();
const { Connection, clusterApiUrl } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const Wallet = require('./wallet');

// Load configuration
function loadConfig() {
  const configPath = path.join(__dirname, 'config.json');
  
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      console.warn('⚠️  Failed to load config.json, using defaults');
      return getDefaultConfig();
    }
  }
  
  return getDefaultConfig();
}

function getDefaultConfig() {
  return {
    network: process.env.SOLANA_NETWORK || 'mainnet-beta',
    rpcUrl: process.env.RPC_URL || null,
    logLevel: process.env.LOG_LEVEL || 'info',
    wallet: {
      path: process.env.WALLET_PATH || '~/.config/solana/id.json'
    },
    bot: {
      enabled: process.env.BOT_ENABLED !== 'false',
      slippageTolerance: 0.01,
      maxRetries: 3
    }
  };
}

async function main() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  🚀 SOLANA HYPER BOT');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Load configuration
  const config = loadConfig();
  console.log(`📋 Network: ${config.network}`);
  console.log(`📋 Log Level: ${config.logLevel}\n`);

  // Determine RPC URL
  let rpcUrl;
  if (config.rpcUrl) {
    rpcUrl = config.rpcUrl;
  } else {
    // Use default Solana RPC for the network
    rpcUrl = clusterApiUrl(config.network);
  }
  console.log(`🔗 RPC URL: ${rpcUrl}\n`);

  // Connect to Solana
  console.log('Connecting to Solana...');
  const connection = new Connection(rpcUrl, 'confirmed');
  
  try {
    const version = await connection.getVersion();
    console.log(`✅ Connected to Solana (version: ${version['solana-core']})\n`);
  } catch (error) {
    console.error(`❌ Failed to connect to Solana: ${error.message}`);
    process.exit(1);
  }

  // Initialize wallet
  console.log('Initializing wallet...');
  const wallet = new Wallet(connection);

  try {
    // Try to load existing wallet
    wallet.loadFromFile(config.wallet.path);
  } catch (error) {
    console.warn(`⚠️  ${error.message}`);
    console.log('Creating new wallet...');
    
    wallet.generateNew();
    
    // Save new wallet
    try {
      wallet.saveToFile(config.wallet.path);
    } catch (saveError) {
      console.warn(`⚠️  Could not save wallet: ${saveError.message}`);
    }
  }

  // Display wallet info
  console.log(`\n💰 Wallet Address: ${wallet.getPublicKey()}`);
  
  try {
    const balance = await wallet.getBalance();
    console.log(`💰 Balance: ${balance} SOL\n`);
  } catch (error) {
    console.warn(`⚠️  Could not fetch balance: ${error.message}\n`);
  }

  // Check if bot is enabled
  if (!config.bot.enabled) {
    console.log('⏸️  Bot is disabled in configuration');
    return;
  }

  console.log('════════════════════════════════════════════════════════════════');
  console.log('  ✅ Bot initialized successfully!');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  console.log('Bot is ready. Implement your trading strategy here.');
  console.log('Press Ctrl+C to exit.\n');

  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down bot...');
    process.exit(0);
  });

  // Main bot loop would go here
  // For now, just keep the process alive
  await new Promise(() => {});
}

// Run the bot
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
