/**
 * Market Data Module
 * 
 * Fetches real-time market data from Solana DEXs
 * Supports Jupiter aggregator for best price discovery
 */

const https = require('https');

class MarketData {
  constructor(config = {}) {
    this.config = {
      jupiterApi: config.jupiterApi || 'https://quote-api.jup.ag/v6',
      priceApi: config.priceApi || 'https://price.jup.ag/v4',
      updateInterval: config.updateInterval || 5000, // 5 seconds
      pairs: config.pairs || ['SOL-USDC'],
      keyLevelThreshold: config.keyLevelThreshold || 0.02, // 2% threshold for level detection
    };
    
    this.lastPrices = new Map();
    this.priceHistory = new Map();
    this.volumeData = new Map();
  }

  /**
   * Fetch price data from Jupiter Price API
   * @param {string} tokenMint - Token mint address
   * @returns {Promise<object>} - Price data
   */
  async fetchPrice(tokenMint) {
    return new Promise((resolve, reject) => {
      const url = `${this.config.priceApi}/price?ids=${tokenMint}`;
      
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.data);
          } catch (error) {
            reject(new Error(`Failed to parse price data: ${error.message}`));
          }
        });
      }).on('error', (error) => {
        reject(new Error(`Failed to fetch price: ${error.message}`));
      });
    });
  }

  /**
   * Fetch quote for a swap from Jupiter
   * @param {string} inputMint - Input token mint
   * @param {string} outputMint - Output token mint
   * @param {number} amount - Amount in base units
   * @returns {Promise<object>} - Quote data
   */
  async fetchQuote(inputMint, outputMint, amount) {
    return new Promise((resolve, reject) => {
      const url = `${this.config.jupiterApi}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`;
      
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
            reject(new Error(`Failed to parse quote data: ${error.message}`));
          }
        });
      }).on('error', (error) => {
        reject(new Error(`Failed to fetch quote: ${error.message}`));
      });
    });
  }

  /**
   * Calculate simple moving average of prices
   * @param {Array<number>} prices - Array of prices
   * @param {number} period - Period for average
   * @returns {number} - Simple moving average
   */
  calculateSMA(prices, period) {
    if (prices.length < period) {
      return prices.reduce((sum, p) => sum + p, 0) / prices.length;
    }
    
    const recentPrices = prices.slice(-period);
    return recentPrices.reduce((sum, p) => sum + p, 0) / period;
  }

  /**
   * Calculate price momentum
   * @param {Array<number>} prices - Array of prices
   * @returns {number} - Momentum (-1 to 1)
   */
  calculateMomentum(prices) {
    if (prices.length < 2) {
      return 0;
    }
    
    const oldPrice = prices[0];
    const currentPrice = prices[prices.length - 1];
    
    // Calculate percentage change
    const change = (currentPrice - oldPrice) / oldPrice;
    
    // Normalize to -1 to 1 range (assuming max 10% change)
    return Math.max(-1, Math.min(1, change / 0.1));
  }

  /**
   * Detect support and resistance levels
   * @param {Array<number>} prices - Array of prices
   * @param {number} currentPrice - Current price
   * @returns {Array<object>} - Support/resistance levels
   */
  detectKeyLevels(prices, currentPrice) {
    if (prices.length < 10) {
      return [];
    }
    
    const levels = [];
    const threshold = this.config.keyLevelThreshold;
    
    // Find local maxima and minima as key levels
    for (let i = 1; i < prices.length - 1; i++) {
      const prev = prices[i - 1];
      const curr = prices[i];
      const next = prices[i + 1];
      
      // Local maximum (resistance)
      if (curr > prev && curr > next) {
        const distance = Math.abs(curr - currentPrice) / currentPrice;
        if (distance < 0.1) { // Within 10% of current price
          levels.push({
            price: curr,
            volume: 1000, // TODO: Use actual volume data from market API
            type: 'resistance'
          });
        }
      }
      
      // Local minimum (support)
      if (curr < prev && curr < next) {
        const distance = Math.abs(curr - currentPrice) / currentPrice;
        if (distance < 0.1) { // Within 10% of current price
          levels.push({
            price: curr,
            volume: 1000, // TODO: Use actual volume data from market API
            type: 'support'
          });
        }
      }
    }
    
    return levels;
  }

  /**
   * Get market data for Principia engine
   * @param {string} pair - Trading pair (e.g., 'SOL-USDC')
   * @param {number} portfolioValue - Current portfolio value
   * @returns {Promise<object>} - Market data formatted for Principia engine
   */
  async getMarketData(pair, portfolioValue = 0) {
    try {
      // For demo purposes, we'll use simulated data
      // In production, this would fetch real data from Jupiter or other APIs
      
      // Parse pair
      const [base, quote] = pair.split('-');
      
      // Get or initialize price history for this pair
      if (!this.priceHistory.has(pair)) {
        this.priceHistory.set(pair, []);
      }
      
      const history = this.priceHistory.get(pair);
      
      // Simulate price (in production, fetch from API)
      const lastPrice = this.lastPrices.get(pair) || 100;
      const priceChange = (Math.random() - 0.5) * 2; // -1 to 1
      const currentPrice = lastPrice + priceChange;
      
      this.lastPrices.set(pair, currentPrice);
      history.push(currentPrice);
      
      // Keep last 100 prices
      if (history.length > 100) {
        history.shift();
      }
      
      // Calculate metrics
      const momentum = this.calculateMomentum(history);
      const sma20 = this.calculateSMA(history, 20);
      const keyLevels = this.detectKeyLevels(history, currentPrice);
      
      // Generate signal based on price vs SMA
      let signalStrength = 0;
      if (history.length >= 20) {
        const deviation = (currentPrice - sma20) / sma20;
        signalStrength = Math.max(-1, Math.min(1, deviation * 10));
      }
      
      return {
        pair,
        price: currentPrice,
        volume: 1000 + Math.random() * 500, // TODO: Fetch actual volume from market API
        signalStrength,
        momentum,
        sma20,
        keyLevels,
        portfolioValue,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`Error fetching market data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Start continuous market data updates
   * @param {Function} callback - Callback for each update
   */
  startUpdates(callback) {
    this.updateTimer = setInterval(async () => {
      for (const pair of this.config.pairs) {
        try {
          const data = await this.getMarketData(pair);
          callback(pair, data);
        } catch (error) {
          console.error(`Failed to update ${pair}: ${error.message}`);
        }
      }
    }, this.config.updateInterval);
  }

  /**
   * Stop market data updates
   */
  stopUpdates() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * Get current price for a pair
   * @param {string} pair - Trading pair
   * @returns {number} - Current price
   */
  getCurrentPrice(pair) {
    return this.lastPrices.get(pair) || 0;
  }

  /**
   * Get price history for a pair
   * @param {string} pair - Trading pair
   * @param {number} count - Number of historical prices to return
   * @returns {Array<number>} - Price history
   */
  getPriceHistory(pair, count = 100) {
    const history = this.priceHistory.get(pair) || [];
    return history.slice(-count);
  }
}

module.exports = MarketData;
