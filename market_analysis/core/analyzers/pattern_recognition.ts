// pattern_recognition.ts
import { PricePoint } from '../../../types/market-types';
import { Pattern, PatternType, GeometricRatio, PatternAnalysisResult } from './pattern-types';
import { SACRED_RATIOS } from '../../../src/shared/constants';
import { ComputeShaderManager } from './gpu/compute-shaders';
import { HarmonicPatternDetector } from './gpu/harmonic-pattern-detection';
import { PatternDetectionProcessor } from './pattern-detection-processor';
import { PatternValidator } from './pattern-validator';
import { ConfidenceCalculator } from './confidence-calculator';
import { WebGLStateManager } from './gpu/state-manager';
import { GEOMETRIC_RATIO_COMPUTE, PATTERN_DETECTION_COMPUTE } from '../../../src/utils/webgl/compute-shaders';
import { PatternDetector } from './detectPatterns';
import { PatternDetection } from './pattern-detection';

export class PatternRecognizer {
    private readonly goldenRatio = SACRED_RATIOS.PHI;
    private readonly SIGNIFICANCE_THRESHOLD = 0.5;
    private readonly GOLDEN_RATIO_TOLERANCE = 0.03;
    private readonly MIN_HISTORICAL_MATCHES = 3;
    private readonly VALIDATION_THRESHOLD = 0.75;
    
    private gl: WebGL2RenderingContext | null = null;
    private stateManager: WebGLStateManager | null = null;
    private geometricRatioProgram: WebGLProgram | null = null;
    private patternDetectionProgram: WebGLProgram | null = null;
    private historicalPatterns: Map<PatternType, number> = new Map();
    private falsePositiveRegistry: Map<PatternType, number> = new Map();
    private canvas: HTMLCanvasElement;

    private confidenceCalculator: ConfidenceCalculator;
    private computeShaderManager: ComputeShaderManager | null = null;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;
        this.canvas.height = 1024;
        this.confidenceCalculator = new ConfidenceCalculator();
        this.initializeWebGL();
    }
    
    public dispose(): void {
        if (this.computeShaderManager) {
            this.computeShaderManager.dispose();
        }
        if (this.gl) {
            this.gl.getExtension('WEBGL_lose_context')?.loseContext();
            this.gl = null;
        }
    }

    private initializeWebGL(): void {
        try {
            this.gl = this.canvas.getContext('webgl2-compute');
            if (!this.gl) {
                console.warn('WebGL 2.0 Compute not available');
                return;
            }
            
            this.computeShaderManager = new ComputeShaderManager(this.gl);
            
        } catch (error) {
            console.error('Failed to initialize WebGL:', error);
            this.gl = null;
            this.computeShaderManager = null;
        }
        try {
            this.gl = this.canvas.getContext('webgl2');
            if (!this.gl) {
                console.warn('WebGL 2 not supported, falling back to CPU implementation');
                return;
            }

            this.stateManager = new WebGLStateManager(this.gl);
            const shaderManager = this.stateManager.getShaderManager();
            
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

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
                    significanceThreshold: this.SIGNIFICANCE_THRESHOLD,
                    windowSize: 10
                }
            });

            if (!this.geometricRatioProgram || !this.patternDetectionProgram) {
                throw new Error('Failed to create shader programs');
            }
        } catch (error) {
            console.warn('WebGL initialization failed:', error);
            if (this.gl) this.gl = null;
            if (this.stateManager) {
                this.stateManager.dispose();
                this.stateManager = null;
            }
            this.geometricRatioProgram = null;
            this.patternDetectionProgram = null;
        }
    }

    public async analyzePattern(priceData: PricePoint[]): Promise<PatternAnalysisResult> {
        const startTime = performance.now();
        
        if (!priceData?.length) {
            return {
                patterns: [],
                confidence: 0,
                executionTime: 0,
                gpuAccelerated: false,
                timestamp: Date.now()
            };
        }

        try {
            const geometricRatios = this.calculateGeometricRatios(priceData);
            let patterns: Pattern[] = [];
            
            if (this.gl && this.geometricRatioProgram && this.patternDetectionProgram) {
                patterns = await this.detectPatternsGPU(priceData);
            } else {
                const patternDetector = new PatternDetector(this.goldenRatio, this.GOLDEN_RATIO_TOLERANCE);
                patterns = await patternDetector.detectPatterns(geometricRatios);
            }

            const validatedPatterns = patterns.filter(pattern => {
                const isValid = pattern.confidence >= this.VALIDATION_THRESHOLD;
                if (isValid) {
                    const count = this.historicalPatterns.get(pattern.type) || 0;
                    this.historicalPatterns.set(pattern.type, count + 1);
                }
                return isValid;
            });

            return {
                patterns: validatedPatterns,
                confidence: this.calculateConfidence(geometricRatios),
                executionTime: performance.now() - startTime,
                gpuAccelerated: Boolean(this.gl),
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Pattern analysis failed:', error);
            throw error;
        }
    }

    private mapPatternType(numericType: number): PatternType {
        switch (numericType) {
            case 1:
                return PatternType.GOLDEN_SPIRAL;
            case 2:
                return PatternType.HARMONIC_BUTTERFLY;
            case 3:
                return PatternType.HARMONIC_GARTLEY;
            case 4:
                return PatternType.HARMONIC_BAT;
            case 5:
                return PatternType.HARMONIC_CRAB;
            default:
                throw new Error(`Unknown pattern type: ${numericType}`);
        }
    }

    private async detectPatternsGPU(priceData: PricePoint[]): Promise<Pattern[]> {
        if (!this.gl || !this.geometricRatioProgram || !this.patternDetectionProgram) {
            console.warn('GPU acceleration not available, falling back to CPU detection');
            return this.detectPatternsCPU(priceData);
        }

        try {
            const prices = new Float32Array(priceData.map(p => p.price));
            
            // Step 1: Calculate geometric ratios using GPU
            const ratios = await this.computeShaderManager.executeGeometricRatioComputation(prices);
            
            // Step 2: Detect basic patterns
            const basicPatternResults = await this.computeShaderManager.executePatternDetection(ratios);
            
            // Step 3: Detect harmonic patterns
            const harmonicDetector = new HarmonicPatternDetector(this.gl);
            const harmonicPatternResults = await harmonicDetector.detectPatterns(prices);
            
            const patterns: Pattern[] = [];
            const validator = new PatternValidator();
            
            // Process basic patterns
            const basicPatterns = await PatternDetectionProcessor.processBasicPatterns(
                basicPatternResults,
                ratios,
                priceData,
                validator,
                this.mapPatternType.bind(this)
            );
            patterns.push(...basicPatterns);
            
            // Process harmonic patterns
            const harmonicPatterns = await PatternDetectionProcessor.processHarmonicPatterns(
                harmonicPatternResults,
                priceData,
                validator,
                this.mapPatternType.bind(this)
            );
            patterns.push(...harmonicPatterns);
            
            // Clean up
            harmonicDetector.dispose();
            
            return patterns;
            
        } catch (error) {
            console.error('GPU pattern detection failed:', error);
            console.warn('Falling back to CPU detection');
            return this.detectPatternsCPU(priceData);
        }

        try {
            const data = new Float32Array(priceData.map(p => p.price));
            const detector = new PatternDetection();
            const results = await detector.executeComputeShader(
                this.gl,
                this.patternDetectionProgram,
                data,
                data.length
            );

            const patternType = detector.interpretResults(
                results,
                this.goldenRatio,
                this.GOLDEN_RATIO_TOLERANCE
            );

            if (patternType !== PatternType.UNKNOWN) {
                const geometricRatios = this.calculateGeometricRatios(priceData);
                return [{
                    type: patternType,
                    confidence: this.calculateConfidence(geometricRatios),
                    startIndex: 0,
                    endIndex: data.length
                }];
            }

            return [];
        } catch (error) {
            console.error('GPU pattern detection failed:', error);
            throw error;
        }
    }

    private calculateGeometricRatios(priceData: PricePoint[]): GeometricRatio[] {
        if (!priceData || priceData.length < 2) return [];

        const points = priceData.map(p => p.price);
        const baseRatios = calculateSacredRatios(points);
        
        // Add timestamps to the ratios
        return baseRatios.map((ratio, i) => ({
            ...ratio,
            timestamp: priceData[i + 1].timestamp
        }));
    }

    private calculateConfidence(geometricRatios: GeometricRatio[]): number {
        if (!geometricRatios || geometricRatios.length < 2) return 0;
        return this.confidenceCalculator.calculateConfidence(geometricRatios);
    }

    private calculateRatioSignificance(current: number, previous: number): number {
        const ratio = current / previous;
        const deviation = Math.abs(ratio - this.goldenRatio);
        return Math.max(0, 1 - deviation / this.GOLDEN_RATIO_TOLERANCE);
    }

    private calculateTrendStrength(ratios: number[]): number {
        if (ratios.length < 2) return 0;
        
        let trendSum = 0;
        for (let i = 1; i < ratios.length; i++) {
            trendSum += Math.abs(ratios[i] - ratios[i - 1]);
        }
        
        return Math.min(1, trendSum / (ratios.length - 1));
    }

    private calculatePatternComplexity(ratios: number[]): number {
        if (ratios.length < 3) return 0;
        
        let complexityScore = 0;
        for (let i = 2; i < ratios.length; i++) {
            const prevDiff = ratios[i - 1] - ratios[i - 2];
            const currDiff = ratios[i] - ratios[i - 1];
            complexityScore += Math.abs(currDiff - prevDiff);
        }
        
        return Math.min(1, complexityScore / (ratios.length - 2));
    }

    private calculateRatioStability(data: GeometricRatio[]): number {
        if (data.length < 2) return 0;
        
        let stabilityScore = 0;
        for (let i = 1; i < data.length; i++) {
            const diff = Math.abs(data[i].ratio - data[i - 1].ratio);
            stabilityScore += Math.exp(-diff);
        }
        
        return stabilityScore / (data.length - 1);
    }

    private calculateGoldenRatioAlignment(data: GeometricRatio[]): number {
        let alignmentScore = 0;
        data.forEach(ratio => {
            const distance = Math.abs(ratio.ratio - this.goldenRatio);
            if (distance <= this.GOLDEN_RATIO_TOLERANCE) {
                alignmentScore += 1 - (distance / this.GOLDEN_RATIO_TOLERANCE);
            }
        });
        
        return Math.min(1, alignmentScore / data.length);
    }
}