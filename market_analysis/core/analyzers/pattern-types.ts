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

export enum PatternType {
    GOLDEN_SPIRAL = 'GOLDEN_SPIRAL',
    FIBONACCI_RETRACEMENT = 'FIBONACCI_RETRACEMENT',
    HARMONIC_BUTTERFLY = 'HARMONIC_BUTTERFLY',
    HARMONIC_GARTLEY = 'HARMONIC_GARTLEY',
    HARMONIC_BAT = 'HARMONIC_BAT',
    HARMONIC_CRAB = 'HARMONIC_CRAB',
    GOLDEN_RATIO_CHANNEL = 'GOLDEN_RATIO_CHANNEL'
}

export interface Pattern {
    type: PatternType;
    startIndex: number;
    endIndex: number;
    confidence: number;
    points: number[];
    metadata?: {
        ratios: number[];
        priceRange: [number, number];
        timeRange: [number, number];
        validation: ValidationMetrics;
    };
}

export interface ValidationMetrics {
    ratioAccuracy: number;
    priceStructure: number;
    timeSymmetry: number;
    volumeConfirmation: number;
    trendConsistency: number;
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