import { Pattern, ValidationMetrics, PatternType } from './pattern-types';
import { PricePoint } from '../../../types/market-types';

export class PatternValidator {
    private readonly VALIDATION_THRESHOLDS = {
        ratioAccuracy: 0.85,
        priceStructure: 0.75,
        timeSymmetry: 0.70,
        volumeConfirmation: 0.65,
        trendConsistency: 0.80
    };

    validatePattern(pattern: Pattern, priceData: PricePoint[]): ValidationMetrics {
        const ratioAccuracy = this.validateRatioAccuracy(pattern);
        const priceStructure = this.validatePriceStructure(pattern, priceData);
        const timeSymmetry = this.validateTimeSymmetry(pattern, priceData);
        const volumeConfirmation = this.validateVolumeConfirmation(pattern, priceData);
        const trendConsistency = this.validateTrendConsistency(pattern, priceData);

        return {
            ratioAccuracy,
            priceStructure,
            timeSymmetry,
            volumeConfirmation,
            trendConsistency
        };
    }

    isPatternValid(metrics: ValidationMetrics): boolean {
        return (
            metrics.ratioAccuracy >= this.VALIDATION_THRESHOLDS.ratioAccuracy &&
            metrics.priceStructure >= this.VALIDATION_THRESHOLDS.priceStructure &&
            metrics.timeSymmetry >= this.VALIDATION_THRESHOLDS.timeSymmetry &&
            metrics.volumeConfirmation >= this.VALIDATION_THRESHOLDS.volumeConfirmation &&
            metrics.trendConsistency >= this.VALIDATION_THRESHOLDS.trendConsistency
        );
    }

    private validateRatioAccuracy(pattern: Pattern): number {
        if (!pattern.metadata?.ratios) return 0;

        const expectedRatios = this.getExpectedRatios(pattern.type);
        const actualRatios = pattern.metadata.ratios;

        let accuracy = 0;
        for (let i = 0; i < expectedRatios.length; i++) {
            const deviation = Math.abs(actualRatios[i] - expectedRatios[i]);
            accuracy += Math.max(0, 1 - deviation / expectedRatios[i]);
        }

        return accuracy / expectedRatios.length;
    }

    private validatePriceStructure(pattern: Pattern, priceData: PricePoint[]): number {
        const points = pattern.points.map(idx => priceData[idx].price);
        const [min, max] = [Math.min(...points), Math.max(...points)];
        const range = max - min;

        // Check if price points form expected structure based on pattern type
        let structureScore = 0;
        switch (pattern.type) {
            case PatternType.GOLDEN_SPIRAL:
                structureScore = this.validateGoldenSpiralStructure(points, range);
                break;
            case PatternType.FIBONACCI_RETRACEMENT:
                structureScore = this.validateFibonacciRetracementStructure(points, range);
                break;
            // Add cases for other pattern types
        }

        return structureScore;
    }

    private validateTimeSymmetry(pattern: Pattern, priceData: PricePoint[]): number {
        const timestamps = pattern.points.map(idx => priceData[idx].timestamp);
        const intervals = [];
        
        for (let i = 1; i < timestamps.length; i++) {
            intervals.push(timestamps[i] - timestamps[i - 1]);
        }

        // Calculate symmetry score based on time intervals
        let symmetryScore = 0;
        for (let i = 0; i < intervals.length / 2; i++) {
            const symmetryRatio = Math.min(
                intervals[i] / intervals[intervals.length - 1 - i],
                intervals[intervals.length - 1 - i] / intervals[i]
            );
            symmetryScore += symmetryRatio;
        }

        return symmetryScore / Math.floor(intervals.length / 2);
    }

    private validateVolumeConfirmation(pattern: Pattern, priceData: PricePoint[]): number {
        const volumes = pattern.points.map(idx => priceData[idx].volume);
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;

        // Calculate volume trend correlation with pattern
        let volumeScore = 0;
        for (let i = 1; i < volumes.length; i++) {
            const volumeChange = volumes[i] / volumes[i - 1];
            const priceChange = priceData[pattern.points[i]].price / 
                              priceData[pattern.points[i - 1]].price;
            
            // Volume should confirm price movement
            const confirmation = Math.min(volumeChange, priceChange) / 
                               Math.max(volumeChange, priceChange);
            volumeScore += confirmation;
        }

        return volumeScore / (volumes.length - 1);
    }

    private validateTrendConsistency(pattern: Pattern, priceData: PricePoint[]): number {
        const prices = pattern.points.map(idx => priceData[idx].price);
        let trendScore = 0;
        
        // Calculate moving averages
        const ma20 = this.calculateMA(priceData, pattern.startIndex, 20);
        const ma50 = this.calculateMA(priceData, pattern.startIndex, 50);
        
        // Check if pattern aligns with longer-term trends
        for (let i = 0; i < prices.length; i++) {
            const price = prices[i];
            const idx = pattern.points[i];
            const trendAlignment = (
                (price > ma20[idx] && ma20[idx] > ma50[idx]) ||
                (price < ma20[idx] && ma20[idx] < ma50[idx])
            ) ? 1 : 0;
            trendScore += trendAlignment;
        }
        
        return trendScore / prices.length;
    }

    private calculateMA(data: PricePoint[], startIdx: number, period: number): number[] {
        const ma: number[] = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                ma[i] = data[i].price;
                continue;
            }
            
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += data[i - j].price;
            }
            ma[i] = sum / period;
        }
        return ma;
    }

    private getExpectedRatios(patternType: PatternType): number[] {
        switch (patternType) {
            case PatternType.GOLDEN_SPIRAL:
                return [1.618, 1.618, 1.618];
            case PatternType.FIBONACCI_RETRACEMENT:
                return [0.236, 0.382, 0.618, 0.786];
            case PatternType.HARMONIC_BUTTERFLY:
                return [0.786, 0.382, 1.618, 1.27];
            case PatternType.HARMONIC_GARTLEY:
                return [0.618, 0.382, 1.272, 0.786];
            case PatternType.HARMONIC_BAT:
                return [0.382, 0.886, 2.618, 1.618];
            case PatternType.HARMONIC_CRAB:
                return [0.382, 0.886, 3.618, 1.618];
            default:
                return [];
        }
    }

    private validateGoldenSpiralStructure(points: number[], range: number): number {
        let score = 0;
        const normalizedPoints = points.map(p => (p - points[0]) / range);
        
        // Check if points form a logarithmic spiral pattern
        for (let i = 1; i < normalizedPoints.length - 1; i++) {
            const angle = Math.atan2(
                normalizedPoints[i + 1] - normalizedPoints[i],
                normalizedPoints[i] - normalizedPoints[i - 1]
            );
            // Golden spiral should maintain consistent angular increment
            score += Math.abs(angle - Math.PI / 4) < 0.1 ? 1 : 0;
        }
        
        return score / (normalizedPoints.length - 2);
    }

    private validateFibonacciRetracementStructure(points: number[], range: number): number {
        const fibLevels = [0.236, 0.382, 0.5, 0.618, 0.786];
        let score = 0;
        
        // Check if retracement levels align with Fibonacci ratios
        for (let i = 1; i < points.length; i++) {
            const retracement = (points[i] - points[0]) / range;
            const alignmentScore = fibLevels.reduce((best, level) => 
                Math.min(best, Math.abs(retracement - level)), 1);
            score += 1 - alignmentScore;
        }
        
        return score / (points.length - 1);
    }
}