/**
 * Principia-Based Trading Engine
 * 
 * This engine implements trading strategies based on Isaac Newton's 
 * "Philosophiæ Naturalis Principia Mathematica" (Mathematical Principles of Natural Philosophy)
 * 
 * Core Principles Applied:
 * 
 * 1. LAW OF INERTIA (First Law of Motion)
 *    "Every body perseveres in its state of rest, or of uniform motion in a right line, 
 *     unless it is compelled to change that state by forces impressed thereon."
 *    
 *    Trading Application: Maintain current position (buy/hold/sell) unless significant
 *    market forces (signals) compel a change. Prevents overtrading and whipsaw.
 * 
 * 2. LAW OF ACCELERATION (Second Law of Motion)
 *    "The alteration of motion is ever proportional to the motive force impressed; 
 *     and is made in the direction of the right line in which that force is impressed."
 *    (F = ma, or a = F/m)
 *    
 *    Trading Application: Trade size and speed are proportional to signal strength.
 *    Stronger signals result in larger position changes.
 * 
 * 3. LAW OF ACTION-REACTION (Third Law of Motion)
 *    "To every action there is always opposed an equal reaction: or the mutual actions 
 *     of two bodies upon each other are always equal, and directed to contrary parts."
 *    
 *    Trading Application: Every trade creates market impact and risk. 
 *    Implement equal and opposite risk management for every position taken.
 * 
 * 4. UNIVERSAL GRAVITATION
 *    "Every particle attracts every other particle with a force proportional to the 
 *     product of their masses and inversely proportional to the square of the distance."
 *    (F = G * (m1 * m2) / r²)
 *    
 *    Trading Application: Price movements are attracted to significant price levels
 *    (support/resistance) with force proportional to volume at those levels and
 *    inversely proportional to distance from current price.
 * 
 * 5. CONSERVATION OF MOMENTUM
 *    "The quantity of motion is the measure of the same, arising from the 
 *     velocity and quantity of matter conjointly."
 *    
 *    Trading Application: Market momentum is conserved unless external forces act.
 *    Track momentum indicators to identify trend persistence or reversal points.
 */

class PrincipiaEngine {
  constructor(config = {}) {
    // Configuration with defaults based on Principia principles
    this.config = {
      // First Law: Inertia threshold - minimum force to change state
      inertiaThreshold: config.inertiaThreshold || 0.15, // 15% signal strength required
      
      // Second Law: Mass (resistance to change) - higher = more conservative
      tradingMass: config.tradingMass || 1.0,
      
      // Third Law: Risk management ratio
      riskReactionRatio: config.riskReactionRatio || 1.0, // 1:1 risk:reward minimum
      
      // Universal Gravitation: Attraction constants
      gravitationalConstant: config.gravitationalConstant || 0.001,
      
      // Momentum tracking period
      momentumPeriod: config.momentumPeriod || 20, // periods to track
      
      // Maximum position size (as fraction of portfolio)
      maxPositionSize: config.maxPositionSize || 0.3, // 30%
    };
    
    // State tracking
    this.currentPosition = 'neutral'; // 'long', 'short', 'neutral'
    this.positionSize = 0; // Current position size
    this.momentum = 0; // Current momentum
    this.priceHistory = []; // Track price history for momentum
    this.signalHistory = []; // Track signal history
    this.lastAction = null; // Last action taken
  }

  /**
   * LAW I: Check if force (signal) is sufficient to overcome inertia
   * @param {number} signalStrength - Market signal strength (-1 to 1)
   * @returns {boolean} - Whether force overcomes inertia
   */
  overcomesInertia(signalStrength) {
    const force = Math.abs(signalStrength);
    return force >= this.config.inertiaThreshold;
  }

  /**
   * LAW II: Calculate acceleration (position change) from force
   * F = ma, therefore a = F/m
   * @param {number} force - Signal strength as force (-1 to 1)
   * @returns {number} - Acceleration (rate of position change)
   */
  calculateAcceleration(force) {
    return force / this.config.tradingMass;
  }

  /**
   * LAW III: Calculate reaction (risk management) for action
   * @param {number} positionSize - Proposed position size
   * @returns {object} - Risk management parameters
   */
  calculateReaction(positionSize) {
    return {
      stopLoss: positionSize * this.config.riskReactionRatio * 0.5, // 50% of position at risk
      takeProfit: positionSize * this.config.riskReactionRatio * 1.5, // 150% profit target
      hedgeSize: positionSize * this.config.riskReactionRatio * 0.2, // 20% hedge
    };
  }

  /**
   * UNIVERSAL GRAVITATION: Calculate attraction to key price levels
   * F = G * (m1 * m2) / r²
   * @param {number} currentPrice - Current market price
   * @param {Array} keyLevels - Array of {price, volume} objects
   * @returns {number} - Net gravitational force (-1 to 1)
   */
  calculateGravitationalForce(currentPrice, keyLevels) {
    let totalForce = 0;
    
    for (const level of keyLevels) {
      const distance = Math.abs(currentPrice - level.price);
      if (distance === 0) continue;
      
      // Force proportional to volume and inverse square of distance
      const force = this.config.gravitationalConstant * 
                   (level.volume / Math.pow(distance, 2));
      
      // Direction: positive if level is above, negative if below
      const direction = level.price > currentPrice ? 1 : -1;
      
      totalForce += force * direction;
    }
    
    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, totalForce));
  }

  /**
   * MOMENTUM: Update and calculate momentum
   * Momentum = mass × velocity
   * @param {number} currentPrice - Current price
   * @returns {number} - Current momentum
   */
  updateMomentum(currentPrice) {
    // Add to price history
    this.priceHistory.push(currentPrice);
    
    // Keep only recent history
    if (this.priceHistory.length > this.config.momentumPeriod) {
      this.priceHistory.shift();
    }
    
    // Calculate velocity (rate of price change)
    if (this.priceHistory.length < 2) {
      this.momentum = 0;
      return this.momentum;
    }
    
    const oldPrice = this.priceHistory[0];
    const velocity = (currentPrice - oldPrice) / oldPrice;
    
    // Momentum = mass × velocity
    this.momentum = this.config.tradingMass * velocity;
    
    return this.momentum;
  }

  /**
   * Main decision engine combining all Principia principles
   * @param {object} marketData - Current market data
   * @returns {object} - Trading decision
   */
  analyzeMarket(marketData) {
    const {
      price,
      volume,
      signalStrength, // -1 (strong sell) to 1 (strong buy)
      keyLevels = [], // Support/resistance levels
      portfolioValue = 0,
    } = marketData;

    // Update momentum
    const momentum = this.updateMomentum(price);
    
    // Calculate gravitational forces from key levels
    const gravitationalForce = this.calculateGravitationalForce(price, keyLevels);
    
    // Combine signal with momentum and gravitation
    const combinedForce = signalStrength * 0.6 + momentum * 0.2 + gravitationalForce * 0.2;
    
    // LAW I: Check if force overcomes inertia
    if (!this.overcomesInertia(combinedForce)) {
      return {
        action: 'hold',
        reason: 'Insufficient force to overcome inertia (Law I)',
        force: combinedForce,
        inertiaThreshold: this.config.inertiaThreshold,
        currentPosition: this.currentPosition,
        positionSize: this.positionSize,
      };
    }
    
    // LAW II: Calculate acceleration and position change
    const acceleration = this.calculateAcceleration(combinedForce);
    let newPositionSize = this.positionSize + acceleration;
    
    // Apply position limits
    const maxSize = portfolioValue * this.config.maxPositionSize;
    newPositionSize = Math.max(-maxSize, Math.min(maxSize, newPositionSize));
    
    // Determine action based on position change
    let action = 'hold';
    let newPosition = this.currentPosition;
    
    if (newPositionSize > this.positionSize + 0.01) {
      action = 'buy';
      newPosition = 'long';
    } else if (newPositionSize < this.positionSize - 0.01) {
      action = 'sell';
      newPosition = newPositionSize < 0 ? 'short' : (newPositionSize === 0 ? 'neutral' : 'long');
    }
    
    // LAW III: Calculate risk management (reaction)
    const riskManagement = this.calculateReaction(Math.abs(newPositionSize));
    
    // Calculate position change before updating state
    const positionChange = newPositionSize - this.positionSize;
    
    // Update state
    this.currentPosition = newPosition;
    this.positionSize = newPositionSize;
    this.lastAction = {
      action,
      timestamp: Date.now(),
      price,
    };
    
    return {
      action,
      position: newPosition,
      positionSize: newPositionSize,
      positionChange,
      force: combinedForce,
      acceleration,
      momentum,
      gravitationalForce,
      riskManagement,
      reason: `Force (${combinedForce.toFixed(3)}) overcame inertia. ` +
              `Acceleration: ${acceleration.toFixed(3)} (Law II)`,
      principia: {
        lawI: { overcameInertia: true, threshold: this.config.inertiaThreshold },
        lawII: { acceleration, force: combinedForce, mass: this.config.tradingMass },
        lawIII: riskManagement,
        gravitation: gravitationalForce,
        momentum,
      }
    };
  }

  /**
   * Get current engine state
   */
  getState() {
    return {
      position: this.currentPosition,
      positionSize: this.positionSize,
      momentum: this.momentum,
      lastAction: this.lastAction,
      config: this.config,
    };
  }

  /**
   * Reset engine state
   */
  reset() {
    this.currentPosition = 'neutral';
    this.positionSize = 0;
    this.momentum = 0;
    this.priceHistory = [];
    this.signalHistory = [];
    this.lastAction = null;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

module.exports = PrincipiaEngine;
