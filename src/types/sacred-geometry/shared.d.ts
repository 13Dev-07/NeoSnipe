import { EnergyFlowType } from './energy-flow';
import { SacredPatternType } from './pattern-types';

export interface BaseSacredGeometryConfig {
    type: SacredPatternType;
    scale?: number;
    rotation?: number;
    energyFlow?: EnergyFlowType;
}