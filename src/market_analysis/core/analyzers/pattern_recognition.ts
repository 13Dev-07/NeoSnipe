import { PricePoint, SACRED_RATIOS } from '../../../shared/constants';

interface Pattern {
  type: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  strength: number;
  description: string;
}

export class PatternRecognition {
  private static readonly PHI = SACRED_RATIOS.PHI;
  private static readonly PATTERNS = {
    GOLDEN_CROSS: 'Golden Cross',
    DEATH_CROSS: 'Death Cross',
    FIBONACCI_RETRACEMENT: 'Fibonacci Retracement',
    HARMONIC_PATTERN: 'Harmonic Pattern',
  };

  static analyzePrice(priceHistory: PricePoint[]): Pattern[] {
    const patterns: Pattern[] = [];

    if (priceHistory.length < 2) return patterns;

    // Detect Golden/Death Cross
    const crossPattern = this.detectCrossPattern(priceHistory);
    if (crossPattern) patterns.push(crossPattern);

    // Detect Fibonacci Retracements
    const fibPatterns = this.detectFibonacciPatterns(priceHistory);
    patterns.push(...fibPatterns);

    // Detect Harmonic Patterns
    const harmonicPatterns = this.detectHarmonicPatterns(priceHistory);
    patterns.push(...harmonicPatterns);

    return patterns;
  }

  private static detectCrossPattern(priceHistory: PricePoint[]): Pattern | null {
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
    const patterns: Pattern[] = [];
    const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    
    let high = -Infinity;
    let low = Infinity;
    let highIndex = 0;
    let lowIndex = 0;

    // Find significant high and low points
    priceHistory.forEach((point, i) => {
      if (point.high > high) {
        high = point.high;
        highIndex = i;
      }
      if (point.low < low) {
        low = point.low;
        lowIndex = i;
      }
    });

    const range = high - low;
    const retracements = fibLevels.map(level => low + range * level);

    // Check if current price is near any Fibonacci level
    const currentPrice = priceHistory[priceHistory.length - 1].price;
    const nearestLevel = this.findNearestFibLevel(currentPrice, retracements);
    
    if (nearestLevel.distance < range * 0.02) {
      patterns.push({
        type: this.PATTERNS.FIBONACCI_RETRACEMENT,
        startIndex: Math.min(highIndex, lowIndex),
        endIndex: priceHistory.length - 1,
        confidence: 1 - (nearestLevel.distance / (range * 0.02)),
        strength: nearestLevel.level < 0.5 ? 1 : -1,
        description: `Price near ${(nearestLevel.level * 100).toFixed(1)}% retracement`,
      });
    }

    return patterns;
  }

  private static detectHarmonicPatterns(priceHistory: PricePoint[]): Pattern[] {
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
    const ma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((acc, p) => acc + p.price, 0);
      ma.push(sum / period);
    }
    return ma;
  }

  private static findLastCross(shortMA: number[], longMA: number[]): { index: number; type: 'golden' | 'death' } | null {
    for (let i = shortMA.length - 1; i > 0; i--) {
      if (shortMA[i] > longMA[i] && shortMA[i - 1] <= longMA[i - 1]) {
        return { index: i, type: 'golden' };
      }
      if (shortMA[i] < longMA[i] && shortMA[i - 1] >= longMA[i - 1]) {
        return { index: i, type: 'death' };
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
