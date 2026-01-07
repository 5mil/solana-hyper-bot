const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

class Wallet {
  constructor(connection) {
    this.connection = connection;
    this.keypair = null;
  }

  /**
   * Load wallet from a file (Solana CLI format)
   * @param {string} walletPath - Path to the wallet file
   */
  loadFromFile(walletPath) {
    try {
      const expandedPath = walletPath.startsWith('~') 
        ? path.join(os.homedir(), walletPath.slice(1))
        : walletPath;
      const absolutePath = path.resolve(expandedPath);
      
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Wallet file not found at ${absolutePath}`);
      }

      const walletData = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
      this.keypair = Keypair.fromSecretKey(new Uint8Array(walletData));
      console.log(`✅ Wallet loaded: ${this.getPublicKey()}`);
      return this.keypair;
    } catch (error) {
      throw new Error(`Failed to load wallet: ${error.message}`);
    }
  }

  /**
   * Generate a new wallet keypair
   */
  generateNew() {
    this.keypair = Keypair.generate();
    console.log(`✅ New wallet generated: ${this.getPublicKey()}`);
    return this.keypair;
  }

  /**
   * Save wallet to a file
   * @param {string} walletPath - Path to save the wallet file
   */
  saveToFile(walletPath) {
    if (!this.keypair) {
      throw new Error('No wallet loaded');
    }

    try {
      const expandedPath = walletPath.startsWith('~')
        ? path.join(os.homedir(), walletPath.slice(1))
        : walletPath;
      const absolutePath = path.resolve(expandedPath);
      const dir = path.dirname(absolutePath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        absolutePath,
        JSON.stringify(Array.from(this.keypair.secretKey)),
        { mode: 0o600 }
      );
      console.log(`✅ Wallet saved to: ${absolutePath}`);
    } catch (error) {
      throw new Error(`Failed to save wallet: ${error.message}`);
    }
  }

  /**
   * Get wallet public key
   * @returns {string} Public key as base58 string
   */
  getPublicKey() {
    if (!this.keypair) {
      throw new Error('No wallet loaded');
    }
    return this.keypair.publicKey.toBase58();
  }

  /**
   * Get SOL balance
   * @returns {Promise<number>} Balance in SOL
   */
  async getBalance() {
    if (!this.keypair) {
      throw new Error('No wallet loaded');
    }

    try {
      const balance = await this.connection.getBalance(this.keypair.publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Request airdrop (devnet/testnet only)
   * @param {number} amount - Amount of SOL to airdrop
   * @returns {Promise<string>} Transaction signature
   */
  async requestAirdrop(amount = 1) {
    if (!this.keypair) {
      throw new Error('No wallet loaded');
    }

    try {
      console.log(`Requesting airdrop of ${amount} SOL...`);
      const signature = await this.connection.requestAirdrop(
        this.keypair.publicKey,
        amount * LAMPORTS_PER_SOL
      );
      
      await this.connection.confirmTransaction(signature);
      console.log(`✅ Airdrop successful: ${signature}`);
      return signature;
    } catch (error) {
      throw new Error(`Failed to request airdrop: ${error.message}`);
    }
  }

  /**
   * Get the keypair object
   * @returns {Keypair} The wallet keypair
   */
  getKeypair() {
    if (!this.keypair) {
      throw new Error('No wallet loaded');
    }
    return this.keypair;
  }
}

module.exports = Wallet;
