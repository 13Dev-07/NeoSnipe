import { GeometricRatio, PatternType } from './pattern-types';
import { SACRED_RATIOS } from '../../../src/shared/constants';

export class ConfidenceCalculator {
    private readonly goldenRatio = SACRED_RATIOS.PHI;
    
    calculateBaseConfidence(geometricRatios: GeometricRatio[]): number {
        const ratios = geometricRatios.map(g => g.ratio);
        const trendStrength = this.calculateTrendStrength(ratios);
        const complexity = this.calculatePatternComplexity(ratios);
        const stability = this.calculateRatioStability(geometricRatios);
        const alignment = this.calculateGoldenRatioAlignment(geometricRatios);

        return (
            trendStrength * 0.3 +
            (1 - complexity) * 0.2 +
            stability * 0.2 +
            alignment * 0.3
        );
    }

    calculateHistoricalConfidence(pattern: PatternType, historicalPatterns: Map<PatternType, number>): number {
        const patternCount = historicalPatterns.get(pattern) || 0;
        const totalPatterns = Array.from(historicalPatterns.values()).reduce((a, b) => a + b, 0);
        
        if (totalPatterns === 0) return 0.5; // Neutral confidence for new patterns
        
        const frequency = patternCount / totalPatterns;
        const reliability = Math.min(patternCount / 10, 1); // Caps at 10 successful identifications
        
        return (frequency * 0.4 + reliability * 0.6);
    }

    calculateVolatilityAdjustment(geometricRatios: GeometricRatio[]): number {
        if (geometricRatios.length < 2) return 0;
        
        let volatility = 0;
        for (let i = 1; i < geometricRatios.length; i++) {
            const diff = Math.abs(geometricRatios[i].ratio - geometricRatios[i-1].ratio);
            volatility += diff;
        }
        
        const avgVolatility = volatility / (geometricRatios.length - 1);
        const normalizedVolatility = 1 / (1 + Math.exp(5 * (avgVolatility - 0.5)));
        
        return normalizedVolatility;
    }

    calculateTimeSeriesQuality(geometricRatios: GeometricRatio[]): number {
        if (geometricRatios.length < 3) return 0;
        
        let quality = 0;
        const timeDiffs: number[] = [];
        
        // Calculate time differences between consecutive points
        for (let i = 1; i < geometricRatios.length; i++) {
            timeDiffs.push(geometricRatios[i].timestamp - geometricRatios[i-1].timestamp);
        }
        
        // Check for regular spacing
        const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
        const timeRegularity = timeDiffs.reduce((acc, diff) => {
            return acc + (1 - Math.abs(diff - avgTimeDiff) / avgTimeDiff);
        }, 0) / timeDiffs.length;
        
        // Check for missing data points
        const completeness = geometricRatios.filter(r => r.ratio !== 0).length / geometricRatios.length;
        
        quality = (timeRegularity * 0.6 + completeness * 0.4);
        return Math.max(0, Math.min(1, quality));
    }
}