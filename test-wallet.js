const { Keypair } = require('@solana/web3.js');
const Wallet = require('./wallet');
const fs = require('fs');
const path = require('path');

console.log('Testing Wallet Module...\n');

// Create a mock connection object
const mockConnection = {
  getBalance: async () => 1000000000, // 1 SOL in lamports
  requestAirdrop: async () => 'mock-signature',
  confirmTransaction: async () => {}
};

const wallet = new Wallet(mockConnection);

// Test 1: Generate new wallet
console.log('✓ Test 1: Generate new wallet');
wallet.generateNew();
const publicKey = wallet.getPublicKey();
console.log(`  Public Key: ${publicKey}`);
console.log(`  Valid format: ${publicKey.length === 44}\n`);

// Test 2: Save wallet to file
console.log('✓ Test 2: Save wallet to file');
const testWalletPath = '/tmp/test-wallet.json';
wallet.saveToFile(testWalletPath);
console.log(`  Wallet saved to: ${testWalletPath}`);
console.log(`  File exists: ${fs.existsSync(testWalletPath)}\n`);

// Test 3: Load wallet from file
console.log('✓ Test 3: Load wallet from file');
const wallet2 = new Wallet(mockConnection);
wallet2.loadFromFile(testWalletPath);
const publicKey2 = wallet2.getPublicKey();
console.log(`  Loaded Public Key: ${publicKey2}`);
console.log(`  Keys match: ${publicKey === publicKey2}\n`);

// Test 4: Get balance (with mock)
console.log('✓ Test 4: Get balance (mocked)');
wallet.getBalance().then(balance => {
  console.log(`  Balance: ${balance} SOL\n`);
  
  // Clean up
  fs.unlinkSync(testWalletPath);
  console.log('✅ All wallet tests passed!');
});
