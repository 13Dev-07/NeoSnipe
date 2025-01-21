import { SACRED_RATIOS } from '../shared/constants';

export interface PatternAnalysisResult {
    pattern: string;
    confidence: number;
    geometricRatios: {
        ratio: number;
        significance: number;
    }[];
    metadata?: {
        computeTime: number;
        gpuAccelerated: boolean;
        patternStrength: number;
        consistencyScore: number;
        goldenRatioAlignment: number;
    };
}

export interface PatternRecognizerOptions {
    useGPU?: boolean;
    significanceThreshold?: number;
    windowSize?: number;
    goldenRatio?: number;
}

export interface GeometricAnalysis {
    ratio: number;
    significance: number;
    goldenRatioAlignment: number;
    volumeWeight: number;
}

export type PatternType = 
    | 'No Significant Pattern'
    | 'Golden Spiral Formation'
    | 'Strong Uptrend'
    | 'Strong Downtrend'
    | 'Moderate Uptrend'
    | 'Moderate Downtrend'
    | 'Complex Consolidation'
    | 'Weak Consolidation';

export interface PatternDefinition {
    type: PatternType;
    minConfidence: number;
    description: string;
    sacredRatio: keyof typeof SACRED_RATIOS;
}

export const PATTERN_DEFINITIONS: Record<PatternType, PatternDefinition> = {
    'No Significant Pattern': {
        type: 'No Significant Pattern',
        minConfidence: 0,
        description: 'No clear pattern detected in the price movement',
        sacredRatio: 'PHI'
    },
    'Golden Spiral Formation': {
        type: 'Golden Spiral Formation',
        minConfidence: 0.8,
        description: 'Price movement follows the golden ratio spiral',
        sacredRatio: 'PHI'
    },
    'Strong Uptrend': {
        type: 'Strong Uptrend',
        minConfidence: 0.7,
        description: 'Consistent upward price movement with high momentum',
        sacredRatio: 'SQUARED_PHI'
    },
    'Strong Downtrend': {
        type: 'Strong Downtrend',
        minConfidence: 0.7,
        description: 'Consistent downward price movement with high momentum',
        sacredRatio: 'SQUARED_PHI'
    },
    'Moderate Uptrend': {
        type: 'Moderate Uptrend',
        minConfidence: 0.5,
        description: 'Upward price movement with moderate strength',
        sacredRatio: 'SQRT_PHI'
    },
    'Moderate Downtrend': {
        type: 'Moderate Downtrend',
        minConfidence: 0.5,
        description: 'Downward price movement with moderate strength',
        sacredRatio: 'SQRT_PHI'
    },
    'Complex Consolidation': {
        type: 'Complex Consolidation',
        minConfidence: 0.6,
        description: 'Price consolidation with complex geometric patterns',
        sacredRatio: 'VESICA_PISCIS'
    },
    'Weak Consolidation': {
        type: 'Weak Consolidation',
        minConfidence: 0.3,
        description: 'Price consolidation with weak pattern formation',
        sacredRatio: 'PI_PHI'
    }
};