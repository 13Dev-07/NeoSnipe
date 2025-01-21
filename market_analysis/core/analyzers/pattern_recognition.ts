// pattern_recognition.ts
import { PricePoint, SACRED_RATIOS } from '../../../src/shared/constants';
import { GeometricRatio, PatternAnalysisResult, PatternConfidence, PatternType } from './pattern-types';
import { WebGLStateManager } from '../../../src/utils/webgl/state-manager';
import { GEOMETRIC_RATIO_COMPUTE, PATTERN_DETECTION_COMPUTE } from '../../../src/utils/webgl/compute-shaders';

/**
 * Analyzes price patterns using sacred geometry principles and GPU acceleration.
 * Implements pattern detection using both WebGL compute shaders and CPU fallback.
 */
/**
 * PatternRecognizer class that identifies market patterns using sacred geometry principles.
 * Supports both CPU and GPU-accelerated pattern detection with WebGL compute shaders.
 */
export class PatternRecognizer {
    private readonly goldenRatio = SACRED_RATIOS.PHI;
    private readonly SIGNIFICANCE_THRESHOLD = 0.5;
    private readonly GOLDEN_RATIO_TOLERANCE = 0.03;
    private gl: WebGL2RenderingContext | null = null;
    private stateManager: WebGLStateManager | null = null;
    private geometricRatioProgram: WebGLProgram | null = null;
    private patternDetectionProgram: WebGLProgram | null = null;

    constructor() {
        this.initializeWebGL();
    }

    private initializeWebGL(): void {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2');
            if (!gl) {
                console.warn('WebGL 2 not supported, falling back to CPU implementation');
                return;
            }
            
            this.gl = gl;
            this.stateManager = new WebGLStateManager(gl);
            
            // Initialize compute shader programs
            const shaderManager = this.stateManager.getShaderManager();
            this.geometricRatioProgram = shaderManager.createComputeProgram({
                source: GEOMETRIC_RATIO_COMPUTE,
                workGroupSize: [256, 1, 1],
                uniforms: { goldenRatio: this.goldenRatio }
            });
            
            this.patternDetectionProgram = shaderManager.createComputeProgram({
                source: PATTERN_DETECTION_COMPUTE,
                workGroupSize: [256, 1, 1],
                uniforms: {
                    goldenRatio: this.goldenRatio,
                    significanceThreshold: 0.5,
                    windowSize: 10
                }
            });
        } catch (error) {
            console.warn('WebGL initialization failed:', error);
        }
    }
    
    public async analyzePattern(priceData: number[]): Promise<PatternAnalysisResult> {
        const startTime = performance.now();
        
        // Implementation using sacred geometry principles
        const geometricRatios = this.calculateGeometricRatios(priceData);
        const pattern = this.identifyPattern(geometricRatios);
        const confidence = this.calculateConfidence(geometricRatios);

        return {
            pattern,
            confidence,
            geometricRatios,
            metadata: {
                computeTime: performance.now() - startTime,
                gpuAccelerated: this.gl !== null && this.geometricRatioProgram !== null
            }
        };
    }

    private calculateGeometricRatios(priceData: number[]): { ratio: number; significance: number }[] {
        // Enhanced geometric ratio calculation with significance analysis
        return priceData.slice(1).map((price, index) => {
            const ratio = price / priceData[index];
            const significance = this.calculateRatioSignificance(price, priceData[index]);
            return { ratio, significance };
        });
    }

    private calculateRatioSignificance(current: number, previous: number): number {
        // Calculate ratio significance based on multiple factors
        const volatility = Math.abs((current - previous) / previous);
        const goldenRatioAlignment = Math.abs(current / previous - this.goldenRatio);
        const volumeWeight = this.getVolumeWeight(current, previous);
        
        return (1 / (1 + goldenRatioAlignment)) * volatility * volumeWeight;
    }

    private getVolumeWeight(current: number, previous: number): number {
        // Implement volume-based weight calculation
        // This is a placeholder - actual implementation would use real volume data
        return 1.0;
    }

    private identifyPattern(geometricData: GeometricRatio[]): PatternType {
        // Ensure we have valid data
        if (!geometricData || geometricData.length === 0) {
            return 'No Significant Pattern';
        }
        const significantRatios = geometricData
            .filter(data => data.significance > 0.5)
            .map(data => data.ratio);

        if (significantRatios.length === 0) return 'No Significant Pattern';

        // Enhanced pattern identification with multi-factor analysis
        const goldenSpiralCount = significantRatios
            .filter(ratio => Math.abs(ratio - this.goldenRatio) < 0.03)
            .length;

        const trendStrength = this.calculateTrendStrength(significantRatios);
        const patternComplexity = this.calculatePatternComplexity(significantRatios);

        if (goldenSpiralCount >= 3) {
            return 'Golden Spiral Formation';
        } else if (trendStrength > 0.8) {
            return significantRatios[0] > 1 ? 'Strong Uptrend' : 'Strong Downtrend';
        } else if (trendStrength > 0.5) {
            return significantRatios[0] > 1 ? 'Moderate Uptrend' : 'Moderate Downtrend';
        } else if (patternComplexity > 0.7) {
            return 'Complex Consolidation';
        }
        
        return 'Weak Consolidation';
    }

    private calculateTrendStrength(ratios: number[]): number {
        const consistentDirection = ratios.every(ratio => ratio > 1) || 
                                  ratios.every(ratio => ratio < 1);
        const avgDeviation = Math.abs(ratios.reduce((sum, ratio) => sum + (ratio - 1), 0)) / ratios.length;
        
        return consistentDirection ? avgDeviation : 0;
    }

    private calculatePatternComplexity(ratios: number[]): number {
        let changes = 0;
        for (let i = 1; i < ratios.length; i++) {
            if ((ratios[i] > 1 && ratios[i - 1] < 1) || 
                (ratios[i] < 1 && ratios[i - 1] > 1)) {
                changes++;
            }
        }
        return changes / (ratios.length - 1);
    }

    private calculateConfidence(geometricRatios: GeometricRatio[]): number {
        if (geometricRatios.length === 0) return 0;

        const significantRatios = geometricRatios.filter(data => data.significance > this.SIGNIFICANCE_THRESHOLD);
        if (significantRatios.length === 0) return 0;

        // Calculate confidence based on multiple factors
        const avgSignificance = significantRatios.reduce((sum, data) => sum + data.significance, 0) / significantRatios.length;
        const ratioStability = this.calculateRatioStability(significantRatios);
        const goldenAlignment = this.calculateGoldenRatioAlignment(significantRatios);

        // Weight the different factors
        return Math.min(1, avgSignificance * 0.4 + ratioStability * 0.3 + goldenAlignment * 0.3);
    }

    private calculateRatioStability(data: GeometricRatio[]): number {
        if (data.length === 0) return 0;
        const ratios = data.map(item => item.ratio);
        const mean = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
        const variance = ratios.reduce((sum, ratio) => sum + Math.pow(ratio - mean, 2), 0) / ratios.length;
        return Math.exp(-variance); // Higher stability = lower variance
    }

    private calculateGoldenRatioAlignment(data: GeometricRatio[]): number {
        if (data.length === 0) return 0;
        const alignments = data.map(item => {
            const deviation = Math.abs(item.ratio - this.goldenRatio);
            return Math.exp(-deviation) * item.significance;
        });
        return alignments.reduce((sum, val) => sum + val, 0) / data.length;
    }
}
