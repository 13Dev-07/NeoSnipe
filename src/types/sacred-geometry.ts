import { vec2, vec3, mat4 } from 'gl-matrix';

// Core WebGL Types
export interface WebGL2Context extends WebGL2RenderingContext {
  programCache?: Map<string, WebGLProgram>;
}

// Geometry Types
export interface GeometryData {
  vertices: Float32Array;
  normals: Float32Array;
  indices: Uint16Array;
  uvs?: Float32Array;
  tangents?: Float32Array;
  colors?: Float32Array;
  energyFields?: Float32Array;
  harmonicWeights?: Float32Array;
  metadata?: GeometryMetadata;
}

export interface GeometryMetadata {
  rings: number;
  scale: number;
  vertexCount: number;
  triangleCount: number;
  generationTime: number;
}

// Shader Types
export interface ShaderConfig {
  vertexShader: string;
  fragmentShader: string;
  uniforms: Record<string, any>;
  attributes?: string[];
}

// Animation Types
export interface AnimationConfig {
  type: 'transform' | 'energyFlow' | 'harmonic' | 'pattern' | 'morph';
  duration: number;
  startTime?: number;
  easing?: string;
  onProgress?: (progress: number) => void;
  startConfig?: FlowerOfLifeConfig;
  targetConfig?: FlowerOfLifeConfig;
}

// Pattern Types
export interface FlowerOfLifeConfig {
  rings: number;
  scale?: number;
  seedVisible?: boolean;
  overlap?: boolean;
  rotationSpeed?: number;
  energyFlow?: boolean;
  harmonicResonance?: boolean;
  transformations?: TransformationConfig[];
  animations?: AnimationConfig[];
  renderQuality?: 'low' | 'medium' | 'high';
  optimizationLevel?: 'performance' | 'balanced' | 'quality';
  program?: WebGLProgram;
  energyFieldProgram?: WebGLProgram;
  harmonicProgram?: WebGLProgram;
  debug?: boolean;
}

export interface TransformationConfig {
  type: string;
  startTime?: number;
  progress?: number;
  interpolator?: (t: number) => number;
}

// Energy Field Types
export interface EnergyFieldConfig {
  intensity: number;
  frequency: number;
  resonance: number;
  harmonics: number[];
  flowPattern: string;
  interaction: string;
  phaseShift: number;
  amplitudeModulation: number;
  frequencyModulation: number;
  resonanceHarmonics: number[];
  energyDistribution: string;
  fieldInteractions: Map<string, number>;
}

// Harmonic Types
export interface HarmonicConfig {
  baseFrequency: number;
  ratios: number[];
  phases: number[];
  amplitudes: number[];
  resonances: number[];
  interactions: Map<string, number>;
  modulation: {
    frequency: number;
    amplitude: number;
    phase: number;
    type: string;
  };
}

// Performance Types
export interface PerformanceMetrics {
  frameTime: number;
  drawCalls: number;
  triangleCount: number;
  cacheEfficiency: {
    geometry: number;
    shader: number;
  };
  memoryUsage: number;
}

// Pattern State Types
export interface PatternState {
  active: boolean;
  energy: number;
  phase: number;
  resonance: number;
}

// Error Types
export class SacredGeometryError extends Error {
  constructor(message: string, public type: string) {
    super(message);
    this.name = 'SacredGeometryError';
  }
}

// Utility Types
export interface GeometryComponents {
  vertices: number[];
  normals: number[];
  indices: number[];
  uvs: number[];
  energyFields: number[];
  tangents: number[];
  colors: number[];
  harmonicWeights: number[];
}