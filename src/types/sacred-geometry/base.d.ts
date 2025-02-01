import { vec2, vec3, mat4 } from 'gl-matrix';
import { EnergyFlowType } from './energy-flow';

export interface SacredGeometryConfig {
    scale?: number;
    rotation?: number;
    energyFlow?: EnergyFlowType;
    color?: [number, number, number, number];
    opacity?: number;
    animate?: boolean;
    detail?: number;
}