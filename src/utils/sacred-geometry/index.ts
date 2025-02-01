import { vec2, vec3, mat4 } from 'gl-matrix';
import { MetatronsCubeConfig } from '../../types/metatrons-cube';
import { GeometryData, SacredGeometryConfig } from '../../types/sacred-geometry';

export const PHI = (1 + Math.sqrt(5)) / 2;
export const SQRT_PHI = Math.sqrt(PHI);
export const goldenAngle = Math.PI * (3 - Math.sqrt(5));

// Re-export other functions and types as needed
export * from './geometry';

export const initMetatronsCube = (gl: WebGLRenderingContext, config: MetatronsCubeConfig) => {
  // Initialize metatron's cube with WebGL context
  const setup = () => {
    // Setup code here
  };

  const cleanup = () => {
    // Cleanup code here
  };

  setup();
  return { cleanup };
};
export * from './patterns';
export * from './transforms';