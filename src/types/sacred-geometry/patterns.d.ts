import { SacredGeometryConfig } from './base';
import { EnergyFlowType } from './energy-flow';

import { SacredPatternType } from './index';

export interface MetatronsCubeConfig extends SacredGeometryConfig {
    type: 'metatronsCube';
    rotation?: 'continuous' | 'interactive';
    duration?: number;
    energyFlow?: EnergyFlowType;
    mouseFollow?: boolean;
    particleAttraction?: boolean;
    phi?: number;
    /* MetatronsCube specific properties */
    colorScheme?: 'cosmic' | 'ethereal' | 'golden';
}

export interface FlowerOfLifeConfig extends SacredGeometryConfig {
    type: 'flowerOfLife';
    rings: number;
    overlap: boolean;
    seedVisible: boolean;
    animationSpeed: number;
    colorScheme: 'chakra' | 'golden' | 'rainbow';
}