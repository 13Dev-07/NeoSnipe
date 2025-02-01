import { PricePoint, SACRED_RATIOS } from '../../../shared/constants';
import {
  Pattern,
  CrossValidation,
  PriceSwing,
  HarmonicRatios,
  PatternMetrics,
  CacheEntry,
  PatternTypes
} from './types';
import { validatePatternMetrics } from './validation';
import { calculateVolumeProfile, calculateTrendStrength } from './utils';

// Using imported Pattern interface from types.ts

export class PatternRecognition {
  private static readonly PHI = SACRED_RATIOS.PHI;
  private static readonly PATTERNS = PatternTypes;

  // Performance metrics for pattern analysis
  private static metrics = {
    totalAnalysisTime: 0,
    patternCounts: {
      fibonacci: 0,
      harmonic: 0,
      cross: 0
    },
    lastOptimization: Date.now()
  };

  // Cache for recent calculations
  private static cache = new Map<string, {
    patterns: Pattern[],
    timestamp: number
  }>();

  // Cache management methods
  private static generateCacheKey(priceHistory: PricePoint[]): string {
    const recentPrices = priceHistory.slice(-100);
    return recentPrices.map(p => `${p.price}:${p.volume}`).join('|');
  }

  private static optimizeCache(): void {
    const now = Date.now();
    this.metrics.lastOptimization = now;
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > 300000) { // 5 minutes
        this.cache.delete(key);
      }
    }
  }

  static async analyzePrice(priceHistory: PricePoint[]): Promise<Pattern[]> {
    try {
      const startTime = performance.now();
      
      // Input validation
      if (!Array.isArray(priceHistory)) {
        throw new Error('Invalid price history format');
      }
      if (priceHistory.length < 2) {
        return [];
      }

      // Check cache
      const cacheKey = this.generateCacheKey(priceHistory);
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult && Date.now() - cachedResult.timestamp < 5000) {
        return cachedResult.patterns;
      }

      const patterns: Pattern[] = [];

      // Parallel pattern detection
      const [crossPattern, fibPatterns, harmonicPatterns] = await Promise.all([
        Promise.resolve().then(() => this.detectCrossPattern(priceHistory)),
        Promise.resolve().then(() => this.detectFibonacciPatterns(priceHistory)),
        Promise.resolve().then(() => this.detectHarmonicPatterns(priceHistory))
      ]);

      // Update metrics and combine results
      if (crossPattern) {
        this.metrics.patternCounts.cross++;
        patterns.push(crossPattern);
      }
      this.metrics.patternCounts.fibonacci += fibPatterns.length;
      patterns.push(...fibPatterns);
      this.metrics.patternCounts.harmonic += harmonicPatterns.length;
      patterns.push(...harmonicPatterns);

      // Update performance metrics
      this.metrics.totalAnalysisTime += performance.now() - startTime;

      // Cache results
      this.cache.set(cacheKey, {
        patterns,
        timestamp: Date.now()
      });

      // Periodic cache cleanup
      if (Date.now() - this.metrics.lastOptimization > 300000) {
        this.optimizeCache();
      }

      return patterns;
    } catch (error) {
      console.error('Error in pattern analysis:', error);
      throw new Error(`Pattern analysis failed: ${error.message}`);
    }
  }

  private static detectCrossPattern(priceHistory: PricePoint[]): Pattern | null {
    if (priceHistory.length < 50) {
      return null;
    }

    // Input validation
    if (!validatePriceHistory(priceHistory)) {
      return null;
    }

    // Calculate moving averages with the improved method
    const shortPeriod = 20; // Standard 20-day MA
    const longPeriod = 50;  // Standard 50-day MA
    
    const shortMA = this.calculateMA(priceHistory, shortPeriod);
    const longMA = this.calculateMA(priceHistory, longPeriod);
    
    // Find the most recent cross with enhanced detection
    const crossValidation = this.findLastCross(shortMA, longMA);
    
    if (!crossValidation) {
      return null;
    }

    const { index, type, confidence, strength } = crossValidation;

    // Enhanced validation checks
    if (confidence < 70 || strength < 50) {
      return null;
    }

    // Validate trend direction
    const trendLength = 5;
    const prePeriod = Math.max(0, index - trendLength);
    const postPeriod = Math.min(shortMA.length, index + trendLength);
    
    const preShortMA = shortMA.slice(prePeriod, index);
    const preLongMA = longMA.slice(prePeriod, index);
    const postShortMA = shortMA.slice(index, postPeriod);
    const postLongMA = longMA.slice(index, postPeriod);

    // Verify trend consistency
    const isValidTrend = type === 'golden' 
      ? preShortMA.every((v, i) => v <= preLongMA[i]) && postShortMA.every((v, i) => v >= postLongMA[i])
      : preShortMA.every((v, i) => v >= preLongMA[i]) && postShortMA.every((v, i) => v <= postLongMA[i]);

    // Calculate pattern strength based on price momentum and volume
    const momentum = (priceHistory[crossValidation.index].price - priceHistory[crossValidation.index - 1].price) /
                    priceHistory[crossValidation.index - 1].price;
    const strength = Math.abs(momentum) * 100;

    // Calculate confidence based on volume and clear separation of MAs
    const maSeparation = Math.abs(shortMA[cross.index] - longMA[cross.index]) /
                        ((shortMA[cross.index] + longMA[cross.index]) / 2);
    const confidence = Math.min(Math.max(maSeparation * 100, 0), 100);

    return {
      type: `${cross.type}_cross`,
      startIndex: Math.max(0, cross.index - 5),
      endIndex: cross.index,
      confidence,
      strength,
      description: `${cross.type === 'golden' ? 'Bullish' : 'Bearish'} cross pattern detected with ${confidence.toFixed(2)}% confidence`
    };
    const shortMA = this.calculateMA(priceHistory, 50);
    const longMA = this.calculateMA(priceHistory, 200);

    if (shortMA.length < 2 || longMA.length < 2) return null;

    const lastCross = this.findLastCross(shortMA, longMA);
    if (!lastCross) return null;

    const { index, type } = lastCross;
    return {
      type: type === 'golden' ? this.PATTERNS.GOLDEN_CROSS : this.PATTERNS.DEATH_CROSS,
      startIndex: Math.max(0, index - 10),
      endIndex: Math.min(priceHistory.length - 1, index + 10),
      confidence: 0.85,
      strength: type === 'golden' ? 1 : -1,
      description: type === 'golden' ? 'Potential upward trend' : 'Potential downward trend',
    };
  }

  private static detectFibonacciPatterns(priceHistory: PricePoint[]): Pattern[] {
    if (priceHistory.length < 10) {
      return [];
    }

    const patterns: Pattern[] = [];
    const swings = this.findPriceSwings(priceHistory);
    
    if (swings.length < 3) {
      return patterns;
    }

    // Extended Fibonacci ratios including key levels
    const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618];
    
    // Look for patterns in the last three swing points
    for (let i = swings.length - 3; i < swings.length - 1; i++) {
      const swingHigh = Math.max(swings[i].price, swings[i + 1].price);
      const swingLow = Math.min(swings[i].price, swings[i + 1].price);
      const priceRange = swingHigh - swingLow;
      
      // Calculate potential Fibonacci levels
      const levels = fibLevels.map(ratio => swingLow + (priceRange * ratio));
      
      // Find the nearest Fibonacci level to the current price
      const currentPrice = priceHistory[priceHistory.length - 1].price;
      const { level: nearestLevel, distance } = this.findNearestFibLevel(currentPrice, levels);
      
      // Calculate pattern confidence based on proximity to Fibonacci level
      const confidence = Math.max(0, 100 * (1 - (distance / priceRange)));
      
      // Calculate pattern strength based on volume and price momentum
      const volumeChange = priceHistory[priceHistory.length - 1].volume / 
                          priceHistory[priceHistory.length - 10].volume;
      const priceChange = (currentPrice - swings[i].price) / swings[i].price;
      const momentum = Math.abs(priceChange) * volumeChange;
      const strength = Math.min(100, momentum * 100);

      // Enhanced pattern validation
      if (confidence > 60 && strength > 40) {
        const trend = priceChange > 0 ? 'bullish' : 'bearish';
        const levelDescription = this.getFibLevelDescription(nearestLevel);
        
        patterns.push({
          type: this.PATTERNS.FIBONACCI_RETRACEMENT,
          startIndex: swings[i].index,
          endIndex: swings[i + 1].index,
          confidence,
          strength,
          description: `${trend.charAt(0).toUpperCase() + trend.slice(1)} ${levelDescription} retracement at ${(nearestLevel * 100).toFixed(1)}% level with ${confidence.toFixed(2)}% confidence and ${strength.toFixed(2)}% strength`
        });
      }
    }

    return patterns;
  }

  private static getFibLevelDescription(level: number): string {
    if (level <= 0.236) return "shallow";
    if (level <= 0.382) return "minor";
    if (level <= 0.5) return "moderate";
    if (level <= 0.618) return "significant";
    if (level <= 0.786) return "deep";
    if (level <= 1) return "complete";
    if (level <= 1.618) return "extended";
    return "super-extended";
  }

  private static detectHarmonicPatterns(priceHistory: PricePoint[]): Pattern[] {
    if (priceHistory.length < 10) {
      return [];
    }

    const patterns: Pattern[] = [];
    const swings = this.findPriceSwings(priceHistory);
    
    if (swings.length < 5) { // Need at least 5 points for harmonic patterns (XABCD)
      return patterns;
    }

    // Common harmonic ratios
    const harmonicRatios = {
      GARTLEY: {
        XA: 1,
        AB: 0.618,
        BC: 0.386,
        CD: 1.272,
        AD: 0.786
      },
      BUTTERFLY: {
        XA: 1,
        AB: 0.786,
        BC: 0.382,
        CD: 1.618,
        AD: 0.886
      },
      BAT: {
        XA: 1,
        AB: 0.382,
        BC: 0.886,
        CD: 2.618,
        AD: 0.886
      },
      CRAB: {
        XA: 1,
        AB: 0.382,
        BC: 0.886,
        CD: 3.618,
        AD: 0.886
      }
    };

    // Look for patterns in the last five swing points
    for (let i = swings.length - 5; i < swings.length - 3; i++) {
      const points = {
        X: swings[i],
        A: swings[i + 1],
        B: swings[i + 2],
        C: swings[i + 3],
        D: swings[i + 4]
      };

      const ratios = {
        XA: Math.abs(points.A.price - points.X.price),
        AB: Math.abs(points.B.price - points.A.price),
        BC: Math.abs(points.C.price - points.B.price),
        CD: Math.abs(points.D.price - points.C.price),
        AD: Math.abs(points.D.price - points.A.price)
      };

      // Normalize ratios
      const normalizedRatios = {
        XA: 1,
        AB: ratios.AB / ratios.XA,
        BC: ratios.BC / ratios.AB,
        CD: ratios.CD / ratios.BC,
        AD: ratios.AD / ratios.XA
      };

      // Check each harmonic pattern
      for (const [patternName, idealRatios] of Object.entries(harmonicRatios)) {
        const confidence = this.calculateHarmonicConfidence(normalizedRatios, idealRatios);
        const strength = this.calculateHarmonicStrength(points, priceHistory);

        if (confidence > 75 && strength > 50) {
          const bullish = points.D.price < points.A.price;
          patterns.push({
            type: this.PATTERNS.HARMONIC_PATTERN,
            startIndex: points.X.index,
            endIndex: points.D.index,
            confidence,
            strength,
            description: `${bullish ? 'Bullish' : 'Bearish'} ${patternName} pattern with ${confidence.toFixed(1)}% confidence and ${strength.toFixed(1)}% strength`
          });
        }
      }
    }

    return patterns;
  }

  private static calculateHarmonicConfidence(actual: any, ideal: any): number {
    const ratios = ['XA', 'AB', 'BC', 'CD', 'AD'];
    const deviations = ratios.map(ratio => Math.abs(actual[ratio] - ideal[ratio]) / ideal[ratio]);
    const averageDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
    return Math.max(0, 100 * (1 - averageDeviation));
  }

  private static calculateHarmonicStrength(points: any, priceHistory: PricePoint[]): number {
    const volumeChange = priceHistory[priceHistory.length - 1].volume / 
                        priceHistory[priceHistory.length - 10].volume;
    const priceChange = Math.abs(points.D.price - points.X.price) / points.X.price;
    const momentum = priceChange * volumeChange;
    return Math.min(100, momentum * 100);
    if (priceHistory.length < 20) {
      return [];
    }

    const patterns: Pattern[] = [];
    const swings = this.findPriceSwings(priceHistory);

    // Need at least 5 points (XABCD) to form a harmonic pattern
    if (swings.length < 5) {
      return patterns;
    }

    // Calculate ratios for the last 4 swing moves
    for (let i = 0; i <= swings.length - 5; i++) {
      const points = swings.slice(i, i + 5);
      const ratios = this.calculateSwingRatios(points);
      
      const harmonicPattern = this.identifyHarmonicPattern(ratios);
      
      if (harmonicPattern) {
        // Calculate pattern strength based on volume trend
        const volumeStrength = points.reduce((strength, point, idx) => {
          if (idx === 0) return strength;
          const volumeChange = priceHistory[point.index].volume / 
                             priceHistory[points[idx - 1].index].volume;
          return strength * (harmonicPattern.bullish ? volumeChange : 1/volumeChange);
        }, 1.0);

        const strength = Math.min(100, Math.abs(volumeStrength * 50));

        patterns.push({
          type: `harmonic_${harmonicPattern.name.toLowerCase()}`,
          startIndex: points[0].index,
          endIndex: points[4].index,
          confidence: harmonicPattern.confidence * 100,
          strength,
          description: `${harmonicPattern.name} ${harmonicPattern.bullish ? 'bullish' : 'bearish'} pattern detected with ${(harmonicPattern.confidence * 100).toFixed(2)}% confidence`
        });
      }
    }

    // Sort by confidence and return top patterns
    return patterns.sort((a, b) => b.confidence - a.confidence);
    const patterns: Pattern[] = [];
    const swings = this.findPriceSwings(priceHistory);

    if (swings.length < 4) return patterns;

    // Check for harmonic patterns (Gartley, Butterfly, Bat)
    for (let i = 0; i < swings.length - 3; i++) {
      const ratios = this.calculateSwingRatios(swings.slice(i, i + 4));
      const pattern = this.identifyHarmonicPattern(ratios);
      
      if (pattern) {
        patterns.push({
          type: this.PATTERNS.HARMONIC_PATTERN,
          startIndex: swings[i].index,
          endIndex: swings[i + 3].index,
          confidence: pattern.confidence,
          strength: pattern.bullish ? 1 : -1,
          description: `${pattern.name} pattern detected`,
        });
      }
    }

    return patterns;
  }

  private static calculateMA(prices: PricePoint[], period: number): number[] {
    const ma: number[] = new Array(prices.length).fill(0);
    
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += prices[i].price;
    }
    ma[period - 1] = sum / period;

    for (let i = period; i < prices.length; i++) {
      sum = sum - prices[i - period].price + prices[i].price;
      ma[i] = sum / period;
    }

    // Add volume weighting
    for (let i = period - 1; i < prices.length; i++) {
      let volumeWeight = 0, volumeSum = 0;
      for (let j = 0; j < period; j++) {
        volumeWeight += prices[i - j].price * prices[i - j].volume;
        volumeSum += prices[i - j].volume;
      }
      const vwma = volumeWeight / volumeSum;
      ma[i] = (ma[i] + vwma) / 2;
    }
    return ma;
  }

  private static findLastCross(shortMA: number[], longMA: number[]): { index: number; type: 'golden' | 'death'; strength: number } | null {
    for (let i = shortMA.length - 1; i > 0; i--) {
      // Check for potential cross
      const isGoldenCross = shortMA[i] > longMA[i] && shortMA[i - 1] <= longMA[i - 1];
      const isDeathCross = shortMA[i] < longMA[i] && shortMA[i - 1] >= longMA[i - 1];
      
      if (isGoldenCross || isDeathCross) {
        // Calculate slopes for last 5 periods
        const shortSlopes = [];
        const longSlopes = [];
        for (let j = 0; j < 5 && (i - j) > 0; j++) {
          shortSlopes.push(shortMA[i - j] - shortMA[i - j - 1]);
          longSlopes.push(longMA[i - j] - longMA[i - j - 1]);
        }

        // Calculate average slopes
        const avgShortSlope = shortSlopes.reduce((a, b) => a + b, 0) / shortSlopes.length;
        const avgLongSlope = longSlopes.reduce((a, b) => a + b, 0) / longSlopes.length;
        
        // Calculate angle of intersection
        const angleDiff = Math.abs(avgShortSlope - avgLongSlope);
        
        // Calculate MA separation
        const separation = Math.abs(shortMA[i] - longMA[i]);
        
        // Calculate trend consistency
        const shortConsistency = shortSlopes.every(slope => 
          (isGoldenCross && slope > 0) || (isDeathCross && slope < 0)
        );
        const longConsistency = longSlopes.every(slope => 
          (isGoldenCross && slope < 0) || (isDeathCross && slope > 0)
        );
        
        // Calculate combined metrics
        const strength = Math.min(100, (angleDiff * 40) + (separation * 40) + 
          (shortConsistency ? 10 : 0) + (longConsistency ? 10 : 0));
        
        const confidence = Math.min(100, 
          60 + // Base confidence
          (Math.abs(avgShortSlope - avgLongSlope) * 20) + // Slope differential impact
          (separation * 20) // Separation impact
        );
        
        return {
          index: i,
          type: isGoldenCross ? 'golden' : 'death',
          strength,
          confidence
        };
      }
    }
    return null;
  }

  private static findNearestFibLevel(price: number, levels: number[]): { level: number; distance: number } {
    let minDistance = Infinity;
    let nearestLevel = 0;

    levels.forEach((level, i) => {
      const distance = Math.abs(price - level);
      if (distance < minDistance) {
        minDistance = distance;
        nearestLevel = i / (levels.length - 1);
      }
    });

    return { level: nearestLevel, distance: minDistance };
  }

  private static findPriceSwings(priceHistory: PricePoint[]): Array<{ price: number; index: number }> {
    const swings: Array<{ price: number; index: number }> = [];
    let trend: 'up' | 'down' | null = null;

    for (let i = 1; i < priceHistory.length - 1; i++) {
      const prev = priceHistory[i - 1].price;
      const curr = priceHistory[i].price;
      const next = priceHistory[i + 1].price;

      if (curr > prev && curr > next && (!trend || trend === 'up')) {
        swings.push({ price: curr, index: i });
        trend = 'down';
      } else if (curr < prev && curr < next && (!trend || trend === 'down')) {
        swings.push({ price: curr, index: i });
        trend = 'up';
      }
    }

    return swings;
  }

  private static calculateSwingRatios(swings: Array<{ price: number; index: number }>): number[] {
    const ratios: number[] = [];
    for (let i = 1; i < swings.length; i++) {
      const ratio = Math.abs(swings[i].price - swings[i - 1].price) /
                   Math.abs(swings[i - 1].price - swings[i - 2]?.price || swings[i - 1].price);
      ratios.push(ratio);
    }
    return ratios;
  }

  private static identifyHarmonicPattern(ratios: number[]): { name: string; confidence: number; bullish: boolean } | null {
    const [xab, abc, bcd] = ratios;
    const tolerance = 0.1;

    // Gartley Pattern
    if (Math.abs(xab - 0.618) < tolerance &&
        Math.abs(abc - 0.382) < tolerance &&
        Math.abs(bcd - 1.272) < tolerance) {
      return { name: 'Gartley', confidence: 0.8, bullish: true };
    }

    // Butterfly Pattern
    if (Math.abs(xab - 0.786) < tolerance &&
        Math.abs(abc - 0.382) < tolerance &&
        Math.abs(bcd - 1.618) < tolerance) {
      return { name: 'Butterfly', confidence: 0.85, bullish: true };
    }

    // Bat Pattern
    if (Math.abs(xab - 0.382) < tolerance &&
        Math.abs(abc - 0.382) < tolerance &&
        Math.abs(bcd - 2.618) < tolerance) {
      return { name: 'Bat', confidence: 0.75, bullish: true };
    }

    return null;
  }
}
