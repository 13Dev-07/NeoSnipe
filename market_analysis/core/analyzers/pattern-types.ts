import { SACRED_RATIOS } from '../../../src/shared/constants';

export interface GeometricRatio {
    ratio: number;
    significance: number;
}

export interface PatternAnalysisResult {
    pattern: string;
    confidence: number;
    geometricRatios: GeometricRatio[];
    metadata?: {
        computeTime: number;
        gpuAccelerated: boolean;
    };
}

export interface PatternConfidence {
    value: number;
    ratioStability: number;
    goldenAlignment: number;
    avgSignificance: number;
}

export interface PatternScanConfig {
    windowSize?: number;
    minConfidence?: number;
    significanceThreshold?: number;
    goldenRatioTolerance?: number;
}

export const DEFAULT_CONFIG: PatternScanConfig = {
    windowSize: 10,
    minConfidence: 0.5,
    significanceThreshold: 0.5,
    goldenRatioTolerance: 0.03
};