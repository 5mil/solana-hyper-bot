require('dotenv').config();
const { Connection, clusterApiUrl } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const Wallet = require('./wallet');
const PrincipiaEngine = require('./principia-engine');
const MarketData = require('./market-data');
const TradeExecutor = require('./trade-executor');

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
    },
    trading: {
      pairs: ['SOL-USDC'],
      dryRun: true,
      minTradeSize: 0.01,
      updateInterval: 10000
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

  // Initialize Market Data
  console.log('📊 Initializing Market Data Module...');
  const marketData = new MarketData({
    pairs: config.trading?.pairs || ['SOL-USDC'],
    updateInterval: config.trading?.updateInterval || 10000,
  });
  console.log('✅ Market Data module initialized');
  console.log(`   - Trading Pairs: ${config.trading?.pairs?.join(', ') || 'SOL-USDC'}\n`);

  // Initialize Trade Executor
  console.log('⚙️  Initializing Trade Executor...');
  const tradeExecutor = new TradeExecutor(connection, wallet, {
    dryRun: config.trading?.dryRun !== false,
    minTradeSize: config.trading?.minTradeSize || 0.01,
  });
  console.log('✅ Trade Executor initialized');
  console.log(`   - Mode: ${config.trading?.dryRun !== false ? '🔍 DRY RUN' : '🔥 LIVE TRADING'}`);
  console.log(`   - Min Trade Size: ${config.trading?.minTradeSize || 0.01} SOL\n`);
  
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

  // Main trading loop
  if (principiaEngine && marketData && tradeExecutor) {
    console.log('🤖 Starting automated trading loop...\n');
    
    let iterationCount = 0;
    const tradingPair = config.trading?.pairs?.[0] || 'SOL-USDC';
    
    const tradingLoop = setInterval(async () => {
      iterationCount++;
      
      try {
        // Get current balance for portfolio value
        let portfolioValue = 0;
        try {
          portfolioValue = await wallet.getBalance();
        } catch (error) {
          portfolioValue = 1.0; // Default for simulation
        }
        
        // Fetch market data
        const market = await marketData.getMarketData(tradingPair, portfolioValue);
        
        // Analyze market with Principia Engine
        const decision = principiaEngine.analyzeMarket(market);
        
        // Log analysis every iteration
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🔬 Principia Analysis #${iterationCount} - ${new Date().toLocaleTimeString()}`);
        console.log(`   Pair: ${market.pair}`);
        console.log(`   Price: $${market.price.toFixed(2)}`);
        console.log(`   Signal: ${market.signalStrength.toFixed(3)}`);
        console.log(`   Combined Force: ${decision.force?.toFixed(3)}`);
        console.log(`   Momentum: ${decision.momentum?.toFixed(3)}`);
        console.log(`   Action: ${decision.action.toUpperCase()}`);
        console.log(`   Position: ${decision.position || 'N/A'}`);
        console.log(`   Position Size: ${decision.positionSize?.toFixed(4) || 'N/A'}`);
        
        // Execute trades based on decision
        if (decision.action === 'buy' && decision.positionChange > 0) {
          const size = Math.abs(decision.positionChange);
          await tradeExecutor.executeBuy(tradingPair, size, portfolioValue);
        } else if (decision.action === 'sell' && decision.positionChange < 0) {
          const size = Math.abs(decision.positionChange);
          await tradeExecutor.executeSell(tradingPair, size, portfolioValue);
        } else {
          console.log(`\n⏸️  HOLDING POSITION`);
          console.log(`   Reason: ${decision.reason}`);
        }
        
        if (decision.riskManagement) {
          console.log(`\n   Risk Management:`);
          console.log(`     - Stop Loss: ${decision.riskManagement.stopLoss?.toFixed(4)}`);
          console.log(`     - Take Profit: ${decision.riskManagement.takeProfit?.toFixed(4)}`);
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // Show statistics every 10 iterations
        if (iterationCount % 10 === 0) {
          const stats = tradeExecutor.getStatistics();
          console.log('📊 Trading Statistics:');
          console.log(`   Total Trades: ${stats.totalTrades}`);
          console.log(`   Successful: ${stats.successfulTrades}`);
          console.log(`   Dry Run: ${stats.dryRunTrades}`);
          console.log(`   Success Rate: ${stats.successRate}%\n`);
          
          console.log('🔬 Engine State:');
          const state = principiaEngine.getState();
          console.log(`   Position: ${state.position}`);
          console.log(`   Position Size: ${state.positionSize.toFixed(4)}`);
          console.log(`   Momentum: ${state.momentum.toFixed(4)}\n`);
        }
      } catch (error) {
        console.error(`❌ Error in trading loop: ${error.message}`);
      }
    }, config.bot.checkInterval || 10000);
    
    // Cleanup on shutdown
    const cleanup = () => {
      console.log('\n\n👋 Shutting down trading bot...');
      clearInterval(tradingLoop);
      marketData.stopUpdates();
      console.log('✅ Cleanup complete');
      process.exit(0);
    };
    
    process.removeAllListeners('SIGINT');
    process.removeAllListeners('SIGTERM');
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } else {
    // Basic health check interval if trading is disabled
    console.log('⏸️  Trading loop not started (engine or modules disabled)\n');
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
