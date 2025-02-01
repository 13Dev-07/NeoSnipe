import { PatternRecognizer } from '../pattern_recognition';
import { PricePoint, PatternType } from '../pattern-types';

describe('PatternRecognizer', () => {
    let recognizer: PatternRecognizer;
    
    beforeEach(() => {
        recognizer = new PatternRecognizer();
    });
    
    describe('analyzePattern', () => {
        it('should analyze patterns in price data', async () => {
            const priceData: PricePoint[] = [
                { price: 100, timestamp: 1000 },
                { price: 161.8, timestamp: 1001 },
                { price: 261.8, timestamp: 1002 },
                { price: 423.6, timestamp: 1003 }
            ];
            
            const result = await recognizer.analyzePattern(priceData);
            
            expect(result).toBeDefined();
            expect(result.patterns).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.executionTime).toBeGreaterThan(0);
            expect(result.timestamp).toBeDefined();
        });
        
        it('should handle empty price data', async () => {
            const result = await recognizer.analyzePattern([]);
            
            expect(result.patterns).toHaveLength(0);
            expect(result.confidence).toBe(0);
        });
        
        it('should identify golden ratio patterns', async () => {
            const priceData: PricePoint[] = [
                { price: 100, timestamp: 1000 },
                { price: 161.8, timestamp: 1001 },  // Golden ratio ≈ 1.618
                { price: 261.8, timestamp: 1002 },  // Golden ratio ≈ 1.618
                { price: 423.6, timestamp: 1003 }   // Golden ratio ≈ 1.618
            ];
            
            const result = await recognizer.analyzePattern(priceData);
            
            expect(result.patterns).toContainEqual(expect.objectContaining({
                type: PatternType.GOLDEN_SPIRAL
            }));
        });
    });
});