/**
 * Trade Executor Module
 * 
 * Executes trades on Solana DEXs
 * Integrates with Jupiter for best execution
 */

const { Transaction, VersionedTransaction } = require('@solana/web3.js');
const https = require('https');

// Constants
const LAMPORTS_PER_SOL = 1_000_000_000;
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Price impact estimation factor: slippageBps / 500
// This estimates price impact as approximately 5x slippage percentage
// e.g., 50bps (0.5%) slippage -> 0.1% price impact
const PRICE_IMPACT_FACTOR = 500;

class TradeExecutor {
  constructor(connection, wallet, config = {}) {
    this.connection = connection;
    this.wallet = wallet;
    this.config = {
      jupiterApi: config.jupiterApi || 'https://quote-api.jup.ag/v6',
      slippageBps: config.slippageBps || 50, // 0.5%
      maxRetries: config.maxRetries || 3,
      dryRun: config.dryRun !== false, // Default to dry run mode
      minTradeSize: config.minTradeSize || 0.01, // Minimum trade size in SOL
      network: config.network || 'mainnet-beta', // Network to determine if Jupiter API is available
    };
    
    this.tradeHistory = [];
    this.pendingTrades = new Map();
  }

  /**
   * Execute a swap transaction
   * @param {string} inputMint - Input token mint address
   * @param {string} outputMint - Output token mint address
   * @param {number} amount - Amount to swap in base units
   * @param {object} options - Additional options
   * @returns {Promise<object>} - Trade result
   */
  async executeSwap(inputMint, outputMint, amount, options = {}) {
    try {
      // Validate trade size
      if (amount < this.config.minTradeSize * LAMPORTS_PER_SOL) {
        return {
          success: false,
          reason: 'Trade size below minimum',
          minSize: this.config.minTradeSize,
        };
      }

      // Get quote from Jupiter
      console.log(`📊 Getting quote for ${amount / 1e9} tokens...`);
      const quote = await this.getQuote(inputMint, outputMint, amount);
      
      if (!quote) {
        return {
          success: false,
          reason: 'Failed to get quote from Jupiter',
        };
      }

      // Dry run mode - don't execute actual trade
      if (this.config.dryRun) {
        console.log('🔍 DRY RUN MODE - Trade not executed');
        console.log(`   Input: ${amount / LAMPORTS_PER_SOL} tokens`);
        console.log(`   Expected output: ${quote.outAmount / LAMPORTS_PER_SOL} tokens`);
        console.log(`   Price impact: ${quote.priceImpactPct}%`);
        
        const trade = {
          success: true,
          dryRun: true,
          inputMint,
          outputMint,
          inputAmount: amount,
          outputAmount: quote.outAmount,
          priceImpact: quote.priceImpactPct,
          timestamp: Date.now(),
        };
        
        this.tradeHistory.push(trade);
        return trade;
      }

      // Real execution (currently not implemented for safety)
      console.log('⚠️  Real trade execution not yet implemented');
      console.log('   Enable by integrating Jupiter swap API');
      
      return {
        success: false,
        reason: 'Real trade execution not implemented',
        quote,
      };
    } catch (error) {
      console.error(`❌ Trade execution failed: ${error.message}`);
      return {
        success: false,
        reason: error.message,
      };
    }
  }

  /**
   * Get swap quote from Jupiter
   * @param {string} inputMint - Input token mint
   * @param {string} outputMint - Output token mint
   * @param {number} amount - Amount in base units
   * @returns {Promise<object>} - Quote data
   */
  async getQuote(inputMint, outputMint, amount) {
    // Jupiter API only supports mainnet-beta
    // For devnet/testnet, return mock quote data
    if (this.config.network !== 'mainnet-beta') {
      console.log(`ℹ️  Jupiter API not available on ${this.config.network}, using simulated quote`);
      
      // Return mock quote with realistic data
      // Simulate slippage based on configured slippageBps (default 0.5%)
      const slippageMultiplier = 1 - (this.config.slippageBps / 10000);
      const mockOutAmount = Math.floor(amount * slippageMultiplier);
      const priceImpactPct = this.config.slippageBps / PRICE_IMPACT_FACTOR;
      
      return {
        inputMint,
        outputMint,
        inAmount: amount.toString(),
        outAmount: mockOutAmount,
        otherAmountThreshold: Math.floor(mockOutAmount * 0.995).toString(),
        swapMode: 'ExactIn',
        slippageBps: this.config.slippageBps,
        priceImpactPct,
        contextSlot: 0,
        timeTaken: 0.1,
      };
    }
    
    return new Promise((resolve, reject) => {
      const url = `${this.config.jupiterApi}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${this.config.slippageBps}`;
      
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (error) {
            reject(new Error(`Failed to parse quote: ${error.message}`));
          }
        });
      }).on('error', (error) => {
        reject(new Error(`Failed to fetch quote: ${error.message}`));
      });
    });
  }

  /**
   * Execute a buy order
   * @param {string} pair - Trading pair (e.g., 'SOL-USDC')
   * @param {number} size - Position size (fraction of portfolio)
   * @param {number} portfolioValue - Current portfolio value
   * @returns {Promise<object>} - Trade result
   * 
   * Note: Currently hardcoded to SOL-USDC. TODO: Parse pair parameter and support multiple pairs.
   */
  async executeBuy(pair, size, portfolioValue) {
    console.log(`\n🟢 EXECUTING BUY`);
    console.log(`   Pair: ${pair}`);
    console.log(`   Size: ${(size * 100).toFixed(2)}% of portfolio`);
    console.log(`   Portfolio value: ${portfolioValue} SOL`);
    
    // Calculate amount to trade
    const amount = Math.floor(portfolioValue * size * LAMPORTS_PER_SOL);
    
    // Execute swap using configured token mints
    const result = await this.executeSwap(SOL_MINT, USDC_MINT, amount);
    
    if (result.success) {
      console.log(`✅ Buy executed successfully ${result.dryRun ? '(DRY RUN)' : ''}`);
    } else {
      console.log(`❌ Buy failed: ${result.reason}`);
    }
    
    return result;
  }

  /**
   * Execute a sell order
   * @param {string} pair - Trading pair
   * @param {number} size - Position size to close (fraction)
   * @param {number} portfolioValue - Current portfolio value
   * @returns {Promise<object>} - Trade result
   * 
   * Note: Currently hardcoded to SOL-USDC. TODO: Parse pair parameter and support multiple pairs.
   */
  async executeSell(pair, size, portfolioValue) {
    console.log(`\n🔴 EXECUTING SELL`);
    console.log(`   Pair: ${pair}`);
    console.log(`   Size: ${(size * 100).toFixed(2)}% of position`);
    console.log(`   Portfolio value: ${portfolioValue} SOL`);
    
    // Calculate amount to trade
    const amount = Math.floor(portfolioValue * size * LAMPORTS_PER_SOL);
    
    // Execute swap using configured token mints
    const result = await this.executeSwap(USDC_MINT, SOL_MINT, amount);
    
    if (result.success) {
      console.log(`✅ Sell executed successfully ${result.dryRun ? '(DRY RUN)' : ''}`);
    } else {
      console.log(`❌ Sell failed: ${result.reason}`);
    }
    
    return result;
  }

  /**
   * Get trade history
   * @param {number} count - Number of recent trades to return
   * @returns {Array<object>} - Trade history
   */
  getTradeHistory(count = 10) {
    return this.tradeHistory.slice(-count);
  }

  /**
   * Get trade statistics
   * @returns {object} - Trade statistics
   */
  getStatistics() {
    const total = this.tradeHistory.length;
    const successful = this.tradeHistory.filter(t => t.success).length;
    const dryRuns = this.tradeHistory.filter(t => t.dryRun).length;
    
    return {
      totalTrades: total,
      successfulTrades: successful,
      dryRunTrades: dryRuns,
      successRate: total > 0 ? (successful / total * 100).toFixed(2) : 0,
    };
  }

  /**
   * Enable or disable dry run mode
   * @param {boolean} enabled - Whether to enable dry run
   */
  setDryRun(enabled) {
    this.config.dryRun = enabled;
    console.log(`${enabled ? '🔍 DRY RUN MODE ENABLED' : '🔥 LIVE TRADING MODE ENABLED'}`);
  }

  /**
   * Clear trade history
   */
  clearHistory() {
    this.tradeHistory = [];
  }
}

module.exports = TradeExecutor;
