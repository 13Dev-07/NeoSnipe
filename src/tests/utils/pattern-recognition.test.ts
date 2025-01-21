import { PatternRecognizer } from '../../../market_analysis/core/analyzers/pattern_recognition';
import { SACRED_RATIOS } from '../../shared/constants';

describe('PatternRecognizer', () => {
  let recognizer: PatternRecognizer;

  beforeEach(() => {
    recognizer = new PatternRecognizer();
  });

  describe('pattern analysis', () => {
    it('identifies golden spiral patterns correctly', async () => {
      // Create price data that follows golden ratio
      const priceData = [100];
      let current = 100;
      for (let i = 0; i < 5; i++) {
        current *= SACRED_RATIOS.PHI;
        priceData.push(current);
      }

      const result = await recognizer.analyzePattern(priceData);
      
      expect(result.pattern).toBe('Golden Spiral Formation');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('identifies uptrends correctly', async () => {
      const priceData = [100, 110, 120, 130, 140];
      const result = await recognizer.analyzePattern(priceData);
      
      expect(result.pattern).toBe('Strong Uptrend');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('identifies downtrends correctly', async () => {
      const priceData = [100, 90, 80, 70, 60];
      const result = await recognizer.analyzePattern(priceData);
      
      expect(result.pattern).toBe('Strong Downtrend');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('identifies consolidation patterns correctly', async () => {
      const priceData = [100, 102, 98, 101, 99];
      const result = await recognizer.analyzePattern(priceData);
      
      expect(result.pattern).toMatch(/Consolidation/);
    });

    it('handles empty or invalid input gracefully', async () => {
      const result1 = await recognizer.analyzePattern([]);
      expect(result1.pattern).toBe('No Significant Pattern');
      
      const result2 = await recognizer.analyzePattern([100]);
      expect(result2.pattern).toBe('No Significant Pattern');
    });
  });

  describe('WebGL acceleration', () => {
    // Skip these tests in environments without WebGL support
    const hasWebGL = typeof window !== 'undefined' && 
                    !!(window.WebGL2RenderingContext);
    
    (hasWebGL ? it : it.skip)('uses GPU acceleration when available', async () => {
      const priceData = Array.from({ length: 1000 }, (_, i) => 100 + i);
      
      const startTime = performance.now();
      const result = await recognizer.analyzePattern(priceData);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // GPU should be faster
      expect(result.pattern).toBeDefined();
    });
  });
});