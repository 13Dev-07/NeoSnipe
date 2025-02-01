import { EnergyFlowType } from './energy-flow';

export interface SacredGeometryConfig {
    type?: string;
    scale?: number;
    rotation?: number;
    energyFlow?: EnergyFlowType;
    color?: [number, number, number, number];
    opacity?: number;
    animate?: boolean;
    detail?: number;
}