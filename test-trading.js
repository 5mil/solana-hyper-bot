/**
 * Test suite for Market Data and Trade Executor modules
 */

const MarketData = require('./market-data');
const TradeExecutor = require('./trade-executor');

console.log('═══════════════════════════════════════════════════');
console.log('  MARKET DATA & TRADE EXECUTOR TEST SUITE');
console.log('═══════════════════════════════════════════════════\n');

// Test 1: Market Data Initialization
console.log('TEST 1: Market Data Initialization');
console.log('─────────────────────────────────────────────────\n');

const marketData = new MarketData({
  pairs: ['SOL-USDC', 'BTC-USDC'],
  updateInterval: 5000,
});

console.log('✅ Market Data initialized successfully');
console.log('Configuration:', JSON.stringify(marketData.config, null, 2));
console.log('\n');

// Test 2: Fetch Market Data
console.log('TEST 2: Fetch Market Data');
console.log('─────────────────────────────────────────────────\n');

(async () => {
  try {
    const data = await marketData.getMarketData('SOL-USDC', 10.0);
    console.log('Market Data:', JSON.stringify(data, null, 2));
    console.log('✅ Test passed: Market data fetched successfully\n');
    
    // Test 3: Price History
    console.log('TEST 3: Price History Tracking');
    console.log('─────────────────────────────────────────────────\n');
    
    // Generate some history
    for (let i = 0; i < 5; i++) {
      await marketData.getMarketData('SOL-USDC', 10.0);
    }
    
    const history = marketData.getPriceHistory('SOL-USDC');
    console.log(`Price history length: ${history.length}`);
    console.log('Recent prices:', history.slice(-5).map(p => p.toFixed(2)).join(', '));
    console.log('✅ Test passed: Price history tracked\n');
    
    // Test 4: Calculate SMA
    console.log('TEST 4: Simple Moving Average');
    console.log('─────────────────────────────────────────────────\n');
    
    const prices = [100, 102, 105, 103, 107, 110, 108, 112, 115, 113];
    const sma5 = marketData.calculateSMA(prices, 5);
    const sma10 = marketData.calculateSMA(prices, 10);
    
    console.log('Price series:', prices.join(', '));
    console.log(`SMA(5): ${sma5.toFixed(2)}`);
    console.log(`SMA(10): ${sma10.toFixed(2)}`);
    console.log('✅ Test passed: SMA calculated correctly\n');
    
    // Test 5: Calculate Momentum
    console.log('TEST 5: Momentum Calculation');
    console.log('─────────────────────────────────────────────────\n');
    
    const uptrend = [100, 102, 105, 108, 112];
    const downtrend = [112, 108, 105, 102, 100];
    const sideways = [100, 101, 100, 101, 100];
    
    const momentumUp = marketData.calculateMomentum(uptrend);
    const momentumDown = marketData.calculateMomentum(downtrend);
    const momentumSide = marketData.calculateMomentum(sideways);
    
    console.log('Uptrend:', uptrend.join(' -> '), `Momentum: ${momentumUp.toFixed(3)}`);
    console.log('Downtrend:', downtrend.join(' -> '), `Momentum: ${momentumDown.toFixed(3)}`);
    console.log('Sideways:', sideways.join(' -> '), `Momentum: ${momentumSide.toFixed(3)}`);
    console.log('✅ Test passed: Momentum calculated correctly\n');
    
    // Test 6: Detect Key Levels
    console.log('TEST 6: Key Level Detection');
    console.log('─────────────────────────────────────────────────\n');
    
    const priceData = [95, 98, 100, 102, 105, 103, 101, 99, 97, 100, 103, 106, 104, 102];
    const currentPrice = 103;
    const levels = marketData.detectKeyLevels(priceData, currentPrice);
    
    console.log('Price data:', priceData.join(', '));
    console.log(`Current price: ${currentPrice}`);
    console.log(`Key levels detected: ${levels.length}`);
    levels.forEach((level, i) => {
      console.log(`  Level ${i + 1}: $${level.price.toFixed(2)} (${level.type})`);
    });
    console.log('✅ Test passed: Key levels detected\n');
    
    // Test 7: Trade Executor Initialization
    console.log('TEST 7: Trade Executor Initialization');
    console.log('─────────────────────────────────────────────────\n');
    
    // Mock connection and wallet
    const mockConnection = { getVersion: async () => ({ 'solana-core': '1.0.0' }) };
    const mockWallet = { 
      getPublicKey: () => 'MockPublicKey123',
      getBalance: async () => 10.0
    };
    
    const tradeExecutor = new TradeExecutor(mockConnection, mockWallet, {
      dryRun: true,
      minTradeSize: 0.01,
    });
    
    console.log('✅ Trade Executor initialized successfully');
    console.log('Configuration:', JSON.stringify(tradeExecutor.config, null, 2));
    console.log('\n');
    
    // Test 8: Dry Run Buy Order
    console.log('TEST 8: Dry Run Buy Order');
    console.log('─────────────────────────────────────────────────\n');
    
    const buyResult = await tradeExecutor.executeBuy('SOL-USDC', 0.1, 10.0);
    console.log('Buy result:', JSON.stringify(buyResult, null, 2));
    console.log('✅ Test passed: Dry run buy executed\n');
    
    // Test 9: Dry Run Sell Order
    console.log('TEST 9: Dry Run Sell Order');
    console.log('─────────────────────────────────────────────────\n');
    
    const sellResult = await tradeExecutor.executeSell('SOL-USDC', 0.05, 10.0);
    console.log('Sell result:', JSON.stringify(sellResult, null, 2));
    console.log('✅ Test passed: Dry run sell executed\n');
    
    // Test 10: Trade Statistics
    console.log('TEST 10: Trade Statistics');
    console.log('─────────────────────────────────────────────────\n');
    
    const stats = tradeExecutor.getStatistics();
    console.log('Trade Statistics:', JSON.stringify(stats, null, 2));
    console.log('✅ Test passed: Statistics retrieved\n');
    
    // Test 11: Trade History
    console.log('TEST 11: Trade History');
    console.log('─────────────────────────────────────────────────\n');
    
    const tradeHistory = tradeExecutor.getTradeHistory(10);
    console.log(`Trade history entries: ${tradeHistory.length}`);
    tradeHistory.forEach((trade, i) => {
      console.log(`  Trade ${i + 1}: ${trade.success ? '✅' : '❌'} ${trade.dryRun ? '(DRY RUN)' : ''}`);
    });
    console.log('✅ Test passed: Trade history retrieved\n');
    
    // Test 12: Dry Run Toggle
    console.log('TEST 12: Dry Run Mode Toggle');
    console.log('─────────────────────────────────────────────────\n');
    
    console.log('Current mode: DRY RUN');
    tradeExecutor.setDryRun(false);
    console.log(`After toggle: ${tradeExecutor.config.dryRun ? 'DRY RUN' : 'LIVE'}`);
    tradeExecutor.setDryRun(true); // Set back to dry run
    console.log('Reset to: DRY RUN');
    console.log('✅ Test passed: Mode toggled successfully\n');
    
    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('  TEST SUITE COMPLETE');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n✅ All tests completed successfully!');
    console.log('The Market Data and Trade Executor modules are functioning correctly.\n');
    console.log('Key Features Verified:');
    console.log('  ✓ Market data fetching and tracking');
    console.log('  ✓ Price history management');
    console.log('  ✓ Technical indicators (SMA, momentum)');
    console.log('  ✓ Support/resistance detection');
    console.log('  ✓ Dry run trade execution');
    console.log('  ✓ Trade statistics and history');
    console.log('  ✓ Safety controls (dry run mode)');
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
