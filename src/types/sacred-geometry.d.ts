declare module 'sacred-geometry' {
    import { vec2, vec3, mat4 } from 'gl-matrix';
  
    // Universal Constants
    export const enum UniversalConstants {
      PHI = 1.618033988749895, // Golden Ratio
      PI_PHI = 3.14159265359 * 1.618033988749895, // Pi * Golden Ratio
      SQRT_PHI = 1.272019649514069, // Square root of Golden Ratio
      E_PHI = 2.718281828459045 * 1.618033988749895, // Euler's number * Golden Ratio
      SACRED_SEVEN = 7,
      SACRED_TWELVE = 12
    }
  
    // Sacred Pattern Types
    export type SacredPatternType = 
      | 'flowerOfLife'
      | 'metatronsCube'
      | 'sriYantra'
      | 'torusKnot'
      | 'vesicaPiscis'
      | 'seedOfLife'
      | 'treeOfLife'
      | 'merkaba';
  
    // Energy Flow Types
    export type EnergyFlowType = 
      | 'spiral'
      | 'vortex'
      | 'pulse'
      | 'wave'
      | 'resonance'
      | 'harmonic';
  
    // Dimensional Configurations
    export interface DimensionalConfig {
      dimensions: '2d' | '3d' | '4d';
      scale: number;
      rotation: number | vec3;
      position: vec3;
    }
  
    // Sacred Geometry Base Configuration
    export interface SacredGeometryConfig {
      type: SacredPatternType;
      energyFlow?: EnergyFlowType;
      dimensional: DimensionalConfig;
      phi?: number;
      frequency?: number;
      resonance?: number;
      harmonics?: number[];
    }
  
    // Pattern-Specific Configurations
    export interface FlowerOfLifeConfig extends SacredGeometryConfig {
      rings: number;
      overlap: boolean;
      seedVisible: boolean;
    }
  
    export interface MetatronsCubeConfig extends SacredGeometryConfig {
      showPlatonic: boolean;
      energyFlow: EnergyFlowType;
      sphereDetail: number;
      lineWidth: number;
    }
  
    export interface SriYantraConfig extends SacredGeometryConfig {
      trianglePairs: number;
      binduSize: number;
      shaktiEnergy: number;
    }
  
    // Geometry Data Structures
    export interface GeometryData {
      vertices: Float32Array;
      normals: Float32Array;
      indices?: Uint16Array;
      uvs?: Float32Array;
      tangents?: Float32Array;
      colors?: Float32Array;
      energyFields?: Float32Array;
    }
  
    // Sacred Transformation Types
    export interface TransformationData {
      startGeometry: GeometryData;
      endGeometry: GeometryData;
      duration: number;
      easing: (t: number) => number;
      energyTransfer: number;
    }
  
    // Shader Configurations
    export interface ShaderConfig {
      vertexShader: string;
      fragmentShader: string;
      uniforms: {
        [key: string]: {
          type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat4' | 'sampler2D';
          value: number | number[] | Float32Array | WebGLTexture;
        };
      };
      defines?: {
        [key: string]: boolean | number | string;
      };
    }
  
    // Energy Field Configurations
    export interface EnergyFieldConfig {
      intensity: number;
      frequency: number;
      resonance: number;
      harmonics: number[];
      flowPattern: EnergyFlowType;
      interaction: 'attract' | 'repel' | 'spiral' | 'none';
    }
  
    // Animation System Types
    export interface AnimationConfig {
      duration: number;
      easing: 'linear' | 'golden' | 'harmonic' | 'spiral';
      loops: number | 'infinite';
      direction: 'normal' | 'reverse' | 'alternate';
      energyConservation: boolean;
    }
  
    // Sacred Pattern Manager
    export interface SacredPatternManager {
      createPattern(config: SacredGeometryConfig): GeometryData;
      transformPattern(from: GeometryData, to: GeometryData, config: TransformationData): void;
      updateEnergyField(field: EnergyFieldConfig): void;
      animate(config: AnimationConfig): void;
      dispose(): void;
    }
  
    // Event System Types
    export interface SacredGeometryEvent {
      type: 'transform' | 'energyFlow' | 'resonance' | 'harmonicAlign';
      pattern: SacredPatternType;
      energy: number;
      frequency: number;
      timestamp: number;
    }
  
    // Performance Metrics
    export interface PerformanceMetrics {
      frameTime: number;
      drawCalls: number;
      triangleCount: number;
      energyEfficiency: number;
      resonanceHarmony: number;
    }
  
    // Utility Types
    export type Vec2 = vec2;
    export type Vec3 = vec3;
    export type Mat4 = mat4;
  
    // Error Types
    export class SacredGeometryError extends Error {
      constructor(message: string, type: 'geometry' | 'shader' | 'energy' | 'transformation');
    }
  }