import { Pattern, PatternType } from './pattern-recognition';

export interface PatternAnalysisInput {
    data: Float32Array;
    timeframe: number;
    patternTypes?: PatternType[];
    options?: {
        sensitivity?: number;
        maxPatterns?: number;
        minConfidence?: number;
        useCache?: boolean;
        gpuAccelerated?: boolean;
    };
}

export interface PatternAnalysisMetadata {
    cacheHit: boolean;
    computeTime: number;
    timestamp: number;
    performanceMetrics?: {
        frameTime: number;
        drawCalls: number;
        triangleCount: number;
        memoryUsage: number;
        shaderSwitches: number;
        bufferUploads: number;
        textureUploads: number;
    };
}

export interface PatternAnalysisResult {
    patterns: Pattern[];
    metadata: PatternAnalysisMetadata;
}