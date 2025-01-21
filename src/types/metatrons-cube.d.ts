import { EnergyFlowType } from './sacred-geometry';

export interface MetatronsCubeProps {
  rotation?: 'continuous' | 'interactive';
  duration?: number;
  energyFlow?: EnergyFlowType;
  mouseFollow?: boolean;
  particleAttraction?: boolean;
}

export interface MetatronsCubeConfig {
  rotation: 'continuous' | 'interactive';
  duration: number;
  energyFlow: EnergyFlowType;
  mouseFollow: boolean;
  particleAttraction: boolean;
  phi: number;
}