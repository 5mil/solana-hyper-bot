require('dotenv').config();
const { Connection, clusterApiUrl } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const Wallet = require('./wallet');
const PrincipiaEngine = require('./principia-engine');

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
      maxRetries: 3,
      checkInterval: 10000
    },
    principia: {
      enabled: true,
      inertiaThreshold: 0.15,
      tradingMass: 1.0,
      riskReactionRatio: 1.0,
      gravitationalConstant: 0.001,
      momentumPeriod: 20,
      maxPositionSize: 0.3
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
    try {
      rpcUrl = clusterApiUrl(config.network);
    } catch (error) {
      console.error(`❌ Invalid network name: ${config.network}`);
      console.error('Valid networks: mainnet-beta, testnet, devnet');
      process.exit(1);
    }
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
  
  // Initialize Principia Engine
  let principiaEngine = null;
  if (config.principia && config.principia.enabled) {
    console.log('🔬 Initializing Principia Mathematica Trading Engine...');
    principiaEngine = new PrincipiaEngine(config.principia);
    console.log('✅ Principia Engine initialized');
    console.log(`   - Inertia Threshold: ${config.principia.inertiaThreshold}`);
    console.log(`   - Trading Mass: ${config.principia.tradingMass}`);
    console.log(`   - Risk:Reward Ratio: ${config.principia.riskReactionRatio}`);
    console.log(`   - Momentum Period: ${config.principia.momentumPeriod} periods`);
    console.log(`   - Max Position Size: ${(config.principia.maxPositionSize * 100).toFixed(0)}%\n`);
  } else {
    console.log('⚠️  Principia Engine is disabled in configuration\n');
  }
  
  console.log('Bot is ready. Press Ctrl+C to exit.\n');
  console.log('📚 For details on Principia Mathematica implementation,');
  console.log('   see PRINCIPIA_MATHEMATICA_TRADING_FRAMEWORK.md\n');

  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down bot...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n👋 Shutting down bot...');
    process.exit(0);
  });

  // Main bot loop would go here
  // For now, use setInterval to keep process alive and allow for future periodic tasks
  if (principiaEngine) {
    // Demonstration: Simulate market analysis with Principia Engine
    let simulationCounter = 0;
    const demoInterval = setInterval(async () => {
      simulationCounter++;
      
      // Get current balance for portfolio value
      let portfolioValue = 0;
      try {
        portfolioValue = await wallet.getBalance();
      } catch (error) {
        portfolioValue = 1.0; // Default for simulation
      }
      
      // Simulate market data (in a real implementation, fetch from market APIs)
      const simulatedPrice = 100 + Math.sin(simulationCounter * 0.1) * 10 + (Math.random() - 0.5) * 2;
      const simulatedSignal = Math.sin(simulationCounter * 0.15) * 0.8 + (Math.random() - 0.5) * 0.2;
      
      const marketData = {
        price: simulatedPrice,
        volume: 1000 + Math.random() * 500,
        signalStrength: simulatedSignal,
        keyLevels: [
          { price: 95, volume: 5000 },   // Support
          { price: 105, volume: 4000 },  // Resistance
        ],
        portfolioValue: portfolioValue || 1.0,
      };
      
      // Analyze market with Principia Engine
      const decision = principiaEngine.analyzeMarket(marketData);
      
      // Log decision every 5 iterations
      if (simulationCounter % 5 === 0) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🔬 Principia Analysis #${simulationCounter}`);
        console.log(`   Price: $${simulatedPrice.toFixed(2)}`);
        console.log(`   Signal: ${simulatedSignal.toFixed(3)}`);
        console.log(`   Combined Force: ${decision.force?.toFixed(3)}`);
        console.log(`   Momentum: ${decision.momentum?.toFixed(3)}`);
        console.log(`   Action: ${decision.action.toUpperCase()}`);
        console.log(`   Position: ${decision.position}`);
        console.log(`   Reason: ${decision.reason}`);
        if (decision.riskManagement) {
          console.log(`   Risk Management:`);
          console.log(`     - Stop Loss: ${decision.riskManagement.stopLoss?.toFixed(4)}`);
          console.log(`     - Take Profit: ${decision.riskManagement.takeProfit?.toFixed(4)}`);
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
      
      // Stop demo after 30 iterations
      if (simulationCounter >= 30) {
        console.log('📊 Demonstration complete. Engine state:');
        console.log(JSON.stringify(principiaEngine.getState(), null, 2));
        clearInterval(demoInterval);
      }
    }, config.bot.checkInterval || 10000);
  } else {
    // Basic health check interval if Principia engine is disabled
    setInterval(() => {
      // Placeholder for periodic tasks (e.g., health checks, monitoring)
    }, 60000); // Check every minute
  }
}

// Run the bot
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
