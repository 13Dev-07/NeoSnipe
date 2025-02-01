import { GeometricRatio, Pattern, PatternType } from './pattern-types';
import { calculateGoldenRatioAlignment, calculatePatternComplexity } from './pattern-helper';
import { PatternDetection } from './pattern-detection';

export class PatternDetector {
    private readonly detector: PatternDetection;
    private readonly goldenRatio: number;
    private readonly tolerance: number;

    constructor(goldenRatio: number, tolerance: number) {
        this.detector = new PatternDetection();
        this.goldenRatio = goldenRatio;
        this.tolerance = tolerance;
    }

    async detectPatterns(geometricRatios: GeometricRatio[]): Promise<Pattern[]> {
        if (!geometricRatios || geometricRatios.length < 3) {
            return [];
        }

        const patterns: Pattern[] = [];
        let currentWindow = [];
        
        // Sliding window pattern detection
        for (let i = 0; i < geometricRatios.length - 2; i++) {
            currentWindow = geometricRatios.slice(i, i + 3);
            const pattern = this.analyzeWindow(currentWindow, i);
            if (pattern) {
                patterns.push(pattern);
            }
        }

        return this.consolidatePatterns(patterns);
    }

    private analyzeWindow(window: GeometricRatio[], startIndex: number): Pattern | null {
        const alignment = calculateGoldenRatioAlignment(window, this.goldenRatio, this.tolerance);
        const complexity = calculatePatternComplexity(window.map(r => r.ratio));
        
        if (alignment > 0.7) {
            const patternType = this.determinePatternType(window);
            return {
                type: patternType,
                confidence: alignment * (1 - complexity),
                startIndex,
                endIndex: startIndex + window.length
            };
        }
        
        return null;
    }

    private determinePatternType(window: GeometricRatio[]): PatternType {
        const ratios = window.map(r => r.ratio);
        const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
        
        if (Math.abs(avgRatio - this.goldenRatio) <= this.tolerance) {
            return PatternType.GOLDEN_SPIRAL;
        }
        if (Math.abs(avgRatio - 1.618) <= this.tolerance) {
            return PatternType.FIBONACCI_EXTENSION;
        }
        return PatternType.UNKNOWN;
    }

    private consolidatePatterns(patterns: Pattern[]): Pattern[] {
        if (patterns.length <= 1) return patterns;
        
        const consolidated: Pattern[] = [];
        let current = patterns[0];
        
        for (let i = 1; i < patterns.length; i++) {
            const next = patterns[i];
            if (next.startIndex <= current.endIndex && next.type === current.type) {
                // Merge overlapping patterns
                current = {
                    ...current,
                    endIndex: Math.max(current.endIndex, next.endIndex),
                    confidence: (current.confidence + next.confidence) / 2
                };
            } else {
                consolidated.push(current);
                current = next;
            }
        }
        consolidated.push(current);
        
        return consolidated;
    }
}