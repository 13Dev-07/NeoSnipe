import { PatternRecognizer } from '../pattern_recognition';
import { PricePoint } from '../../../types/market-types';
import { Pattern, PatternType } from '../pattern-types';
import { ConfidenceCalculator } from '../confidence-calculator';

describe('PatternRecognizer', () => {
    let recognizer: PatternRecognizer;
    
    beforeEach(() => {
        recognizer = new PatternRecognizer();
    });
    
    afterEach(() => {
        recognizer.dispose();
    });

    describe('Pattern Analysis', () => {
        it('should handle empty input data', async () => {
            const result = await recognizer.analyzePattern([]);
            expect(result.patterns).toHaveLength(0);
            expect(result.confidence).toBe(0);
            expect(result.metadata?.gpuAccelerated).toBe(false);
        });

        it('should detect golden ratio patterns', async () => {
            const priceData: PricePoint[] = [
                { price: 100, timestamp: 1000, volume: 1000 },
                { price: 161.8, timestamp: 2000, volume: 1200 }, // Golden ratio: 1.618
                { price: 261.8, timestamp: 3000, volume: 1500 }, // Golden ratio: 1.618
                { price: 423.6, timestamp: 4000, volume: 1800 }, // Golden ratio: 1.618
                { price: 685.4, timestamp: 5000, volume: 2000 }  // Golden ratio: 1.618
            ];

            const result = await recognizer.analyzePattern(priceData);
            expect(result.patterns.length).toBeGreaterThan(0);
            expect(result.patterns[0].type).toBe(PatternType.GOLDEN_SPIRAL);
            expect(result.patterns[0].confidence).toBeGreaterThan(0.8);
            expect(result.metadata?.gpuAccelerated).toBeDefined();
        });

        it('should detect harmonic patterns', async () => {
            const priceData: PricePoint[] = [
                { price: 100, timestamp: 1000, volume: 1000 },
                { price: 138.2, timestamp: 2000, volume: 1200 }, // 0.382 retracement
                { price: 88.6, timestamp: 3000, volume: 1500 },  // 0.886 retracement
                { price: 261.8, timestamp: 4000, volume: 1800 }, // 2.618 extension
                { price: 161.8, timestamp: 5000, volume: 2000 }  // 1.618 retracement
            ];

            const result = await recognizer.analyzePattern(priceData);
            const harmonicPattern = result.patterns.find(p => 
                p.type === PatternType.HARMONIC_BAT ||
                p.type === PatternType.HARMONIC_BUTTERFLY
            );
            expect(harmonicPattern).toBeDefined();
            expect(harmonicPattern?.confidence).toBeGreaterThan(0.7);
        });

        it('should validate pattern metrics', async () => {
            const priceData: PricePoint[] = [
                { price: 100, timestamp: 1000, volume: 1000 },
                { price: 161.8, timestamp: 2000, volume: 1200 },
                { price: 261.8, timestamp: 3000, volume: 1500 },
                { price: 423.6, timestamp: 4000, volume: 1800 }
            ];

            const result = await recognizer.analyzePattern(priceData);
            const pattern = result.patterns[0];
            expect(pattern.metadata?.validation).toBeDefined();
            expect(pattern.metadata?.validation.ratioAccuracy).toBeGreaterThan(0.8);
            expect(pattern.metadata?.validation.priceStructure).toBeGreaterThan(0.7);
            expect(pattern.metadata?.validation.timeSymmetry).toBeGreaterThan(0.6);
        });

        it('should fall back to CPU when GPU is unavailable', async () => {
            const mockGL = global.WebGL2RenderingContext;
            delete global.WebGL2RenderingContext;

            const priceData: PricePoint[] = [
                { price: 100, timestamp: 1000, volume: 1000 },
                { price: 161.8, timestamp: 2000, volume: 1200 },
                { price: 261.8, timestamp: 3000, volume: 1500 }
            ];

            const result = await recognizer.analyzePattern(priceData);
            expect(result.metadata?.gpuAccelerated).toBe(false);
            expect(result.patterns.length).toBeGreaterThan(0);

            // Restore WebGL
            global.WebGL2RenderingContext = mockGL;
        });

        it('should maintain historical pattern confidence', async () => {
            const priceData: PricePoint[] = [
                { price: 100, timestamp: 1000, volume: 1000 },
                { price: 161.8, timestamp: 2000, volume: 1200 },
                { price: 261.8, timestamp: 3000, volume: 1500 }
            ];

            // First analysis
            let result = await recognizer.analyzePattern(priceData);
            const initialConfidence = result.patterns[0].confidence;

            // Repeated analysis should increase confidence
            result = await recognizer.analyzePattern(priceData);
            expect(result.patterns[0].confidence).toBeGreaterThan(initialConfidence);
        });
    });

    describe('ConfidenceCalculator Integration', () => {
        it('should properly calculate pattern confidence', () => {
            const calculator = new ConfidenceCalculator();
            const geometricRatios = [
                { ratio: 1.618, significance: 0.95, timestamp: 1000 },
                { ratio: 1.618, significance: 0.92, timestamp: 2000 },
                { ratio: 1.618, significance: 0.90, timestamp: 3000 }
            ];

            const confidence = calculator.calculateBaseConfidence(geometricRatios);
            expect(confidence).toBeGreaterThan(0.8);
            expect(confidence).toBeLessThanOrEqual(1.0);
        });
    });
});