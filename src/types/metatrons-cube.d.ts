import { EnergyFlowType } from './sacred-geometry/energy-flow';

export interface MetatronsCubeProps {
  rotation?: 'continuous' | 'interactive';
  duration?: number;
  energyFlow?: 'clockwise' | 'counterclockwise' | 'bidirectional' | 'static' | 'spiral';
  mouseFollow?: boolean;
  particleAttraction?: boolean;
}

// Interface moved to sacred-geometry/patterns.d.ts
export interface MetatronsCubeConfig extends MetatronsCubeProps {
  type: 'metatronsCube';
  phi?: number;
  duration?: number;
  energyFlow?: 'clockwise' | 'counterclockwise' | 'bidirectional' | 'static' | 'spiral';
}