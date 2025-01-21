/**
 * Token market data structure
 */
export interface TokenMarketData {
  /** Token symbol */
  symbol: string;
  /** Token name */
  name: string;
  /** Current price in USD */
  price: number;
  /** 24h price change percentage */
  priceChangePercent: number;
  /** 24h trading volume */
  volume24h: number;
  /** Market capitalization */
  marketCap: number;
  /** Timestamp of the data */
  timestamp: number;
}

/**
 * Pattern analysis result
 */
export interface PatternAnalysisResult {
  /** Pattern type identified */
  patternType: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Predicted price movement direction */
  predictedDirection: 'up' | 'down' | 'sideways';
  /** Additional pattern characteristics */
  characteristics: PatternCharacteristics;
  /** Timestamp of the analysis */
  timestamp: number;
}

/**
 * Pattern characteristics
 */
export interface PatternCharacteristics {
  /** Duration of the pattern formation */
  duration: number;
  /** Pattern strength indicator */
  strength: number;
  /** Historical reliability percentage */
  reliability: number;
  /** Supporting technical indicators */
  supportingIndicators: string[];
}

/**
 * Market analysis configuration
 */
export interface MarketAnalysisConfig {
  /** Refresh rate in milliseconds */
  refreshRate: number;
  /** Maximum patterns to display */
  maxPatternsDisplay: number;
  /** Analysis timeframe in minutes */
  timeframe: number;
  /** Minimum confidence threshold */
  confidenceThreshold: number;
}