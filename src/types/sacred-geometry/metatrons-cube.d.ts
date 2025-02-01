import type { SacredGeometryConfig } from './config';
import type { EnergyFlowType } from './energy-flow';

export interface MetatronsCubeConfig extends SacredGeometryConfig {
    showPlatonic: boolean;
    sphereDetail: number;
    lineWidth: number;
    energyFlow?: EnergyFlowType;
}