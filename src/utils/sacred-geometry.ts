import { vec2, vec3, mat4 } from 'gl-matrix';

// Core Constants
export const PHI = 1.618033988749895; // Golden Ratio
export const SQRT_PHI = Math.sqrt(PHI);
export const PI_PHI = Math.PI * PHI;
export const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
export const SACRED_RATIOS = {
  PHI,
  SQRT_PHI,
  PI_PHI,
  VESICA_PISCIS: Math.sqrt(3),
  SQUARED_PHI: PHI * PHI,
  CUBE_PHI: PHI * PHI * PHI
};

// Types and Interfaces
export interface GeometryData {
  vertices: Float32Array;
  normals: Float32Array;
  indices?: Uint16Array;
  uvs?: Float32Array;
  tangents?: Float32Array;
  colors?: Float32Array;
  bounds?: {
    min: vec3;
    max: vec3;
  };
  metadata?: {
    vertexCount: number;
    triangleCount: number;
    optimizationLevel: number;
    creationTime: number;
    lastModified: number;
  };
}

export interface MetatronsCubeConfig {
  phi?: number;
  rotation?: 'continuous' | 'interactive';
  duration?: number;
  energyFlow?: boolean;
  mouseFollow?: boolean;
  particleAttraction?: boolean;
  scale?: number;
  detail?: number;
  colorScheme?: 'cosmic' | 'ethereal' | 'golden';
}

export interface SacredPatternConfig {
  type: 'flowerOfLife' | 'sriYantra' | 'metatronsCube' | 'torus';
  scale?: number;
  rotation?: number;
  detail?: number;
  animate?: boolean;
  dimensions?: '2d' | '3d';
}

export interface ShaderConfig {
  vertexShader: string;
  fragmentShader: string;
  uniforms: {
    [key: string]: {
      type: string;
      value: any;
    };
  };
}

// Core Shader Templates
const baseVertexShader = `#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform vec2 mousePosition;
uniform float phi;

out vec3 vNormal;
out vec3 vPosition;
out vec2 vUv;

void main() {
  vNormal = normal;
  vPosition = position;
  vUv = uv;
  
  vec3 pos = position;
  float energyPulse = sin(time * 0.001) * 0.1 + 1.0;
  
  // Sacred geometry transformations will be applied here
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos * energyPulse, 1.0);
}`;

const baseFragmentShader = `#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vPosition;
in vec2 vUv;

uniform float time;
uniform vec2 resolution;
uniform vec3 baseColor;
uniform float energyIntensity;

out vec4 fragColor;

// Sacred geometry utility functions
float goldenAngle(float t) {
  return t * ${PI_PHI};
}

vec3 sacredColor(vec3 base, float energy) {
  float pulse = sin(time * 0.002) * 0.3 + 0.7;
  return base * energy * pulse;
}

void main() {
  vec3 color = baseColor;
  float brightness = dot(normalize(vNormal), normalize(vec3(1.0)));
  brightness = brightness * 0.5 + 0.5;
  
  vec3 finalColor = sacredColor(color, brightness * energyIntensity);
  fragColor = vec4(finalColor, 1.0);
}`;

// Utility Functions
function createSacredRatio(a: number, b: number): number {
  return (a + Math.sqrt(a * a + 4 * b)) / (2 * b);
}

function generateFibonacciSpiral(points: number): vec2[] {
  const spiral: vec2[] = [];
  let radius = 1;
  
  for (let i = 0; i < points; i++) {
    const angle = i * PI_PHI;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    spiral.push(vec2.fromValues(x, y));
    radius *= PHI;
  }
  
  return spiral;
}

// Geometry Generation Functions
export function createMetatronsCubeGeometry(config: MetatronsCubeConfig): GeometryData {
  const phi = config.phi || PHI;
  const scale = config.scale || 1;
  const detail = config.detail || 32;
  
  const vertices: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];
  
  // Center sphere
  addSphereGeometry(vertices, normals, indices, uvs, [0, 0, 0], scale, detail);
  
  // First ring of spheres
  const firstRingRadius = scale * 2;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const x = Math.cos(angle) * firstRingRadius;
    const y = Math.sin(angle) * firstRingRadius;
    addSphereGeometry(vertices, normals, indices, uvs, [x, y, 0], scale, detail);
  }
  
  // Second ring of spheres (scaled by phi)
  const secondRingRadius = scale * phi * 2;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6 + Math.PI / 6;
    const x = Math.cos(angle) * secondRingRadius;
    const y = Math.sin(angle) * secondRingRadius;
    addSphereGeometry(vertices, normals, indices, uvs, [x, y, 0], scale * SQRT_PHI, detail);
  }
  
  // Add connecting lines
  addConnectingLines(vertices, normals, indices, uvs, scale, phi);
  
  return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
    uvs: new Float32Array(uvs)
  };
}

export function createFlowerOfLifeGeometry(config: SacredPatternConfig): GeometryData {
  const scale = config.scale || 1;
  const detail = config.detail || 64;
  
  const vertices: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];
  
  // Center circle
  addCircleGeometry(vertices, normals, indices, uvs, [0, 0, 0], scale, detail);
  
  // First ring of circles
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const x = Math.cos(angle) * scale * 2;
    const y = Math.sin(angle) * scale * 2;
    addCircleGeometry(vertices, normals, indices, uvs, [x, y, 0], scale, detail);
  }
  
  // Second ring of circles
  const secondRingPositions = generateSecondRingPositions(scale);
  secondRingPositions.forEach(pos => {
    addCircleGeometry(vertices, normals, indices, uvs, [pos[0], pos[1], 0], scale, detail);
  });
  
  return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
    uvs: new Float32Array(uvs)
  };
}

export function createSriYantraGeometry(config: SacredPatternConfig): GeometryData {
  const scale = config.scale || 1;
  const vertices: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];
  
  // Generate the nine interlocking triangles
  const triangleLevels = 9;
  for (let i = 0; i < triangleLevels; i++) {
    const radius = scale * (1 - i / triangleLevels);
    const rotation = (i % 2) * Math.PI / triangleLevels;
    addTriangleGeometry(
      vertices, normals, indices, uvs,
      [0, 0, 0], radius, rotation
    );
  }
  
  // Add bindu (central point)
  addBinduGeometry(vertices, normals, indices, uvs, scale / 10);
  
  return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
    uvs: new Float32Array(uvs)
  };
}

// Helper Geometry Functions
function addSphereGeometry(
  vertices: number[],
  normals: number[],
  indices: number[],
  uvs: number[],
  center: number[],
  radius: number,
  detail: number
): void {
  const startIndex = vertices.length / 3;
  
  for (let lat = 0; lat <= detail; lat++) {
    const theta = (lat * Math.PI) / detail;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    
    for (let lon = 0; lon <= detail; lon++) {
      const phi = (lon * 2 * Math.PI) / detail;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      
      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;
      
      vertices.push(x * radius + center[0], y * radius + center[1], z * radius + center[2]);
      normals.push(x, y, z);
      uvs.push(lon / detail, lat / detail);
      
      if (lat < detail && lon < detail) {
        const first = startIndex + lat * (detail + 1) + lon;
        const second = first + detail + 1;
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }
  }
}

function addCircleGeometry(
  vertices: number[],
  normals: number[],
  indices: number[],
  uvs: number[],
  center: number[],
  radius: number,
  segments: number
): void {
  const startIndex = vertices.length / 3;
  
  // Center vertex
  vertices.push(center[0], center[1], center[2]);
  normals.push(0, 0, 1);
  uvs.push(0.5, 0.5);
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i * Math.PI * 2) / segments;
    const x = Math.cos(angle) * radius + center[0];
    const y = Math.sin(angle) * radius + center[1];
    
    vertices.push(x, y, center[2]);
    normals.push(0, 0, 1);
    uvs.push((Math.cos(angle) + 1) / 2, (Math.sin(angle) + 1) / 2);
    
    if (i < segments) {
      indices.push(startIndex, startIndex + i + 1, startIndex + i + 2);
    }
  }
}

// Pattern Transformation and Animation Utilities
interface TransformationState {
  progress: number;
  startGeometry: GeometryData;
  endGeometry: GeometryData;
  duration: number;
  startTime: number;
  easing: (t: number) => number;
}

export class SacredPatternAnimator {
  private transformationState?: TransformationState;
  private currentGeometry: GeometryData;
  
  constructor(initialGeometry: GeometryData) {
    this.currentGeometry = initialGeometry;
  }

  public morphTo(targetGeometry: GeometryData, duration: number = 1000): void {
    this.transformationState = {
      progress: 0,
      startGeometry: this.currentGeometry,
      endGeometry: targetGeometry,
      duration,
      startTime: performance.now(),
      easing: this.goldenRatioEasing
    };
  }

  public update(currentTime: number): GeometryData {
    if (!this.transformationState) return this.currentGeometry;

    const { startTime, duration, startGeometry, endGeometry, easing } = this.transformationState;
    let progress = (currentTime - startTime) / duration;

    if (progress >= 1) {
      this.currentGeometry = endGeometry;
      this.transformationState = undefined;
      return this.currentGeometry;
    }

    progress = easing(progress);
    return this.interpolateGeometries(startGeometry, endGeometry, progress);
  }

  private goldenRatioEasing(t: number): number {
    return 1 - Math.pow(1 - t, PHI);
  }

  private interpolateGeometries(start: GeometryData, end: GeometryData, progress: number): GeometryData {
    const result: GeometryData = {
      vertices: new Float32Array(start.vertices.length),
      normals: new Float32Array(start.normals.length),
      uvs: start.uvs ? new Float32Array(start.uvs.length) : undefined
    };

    for (let i = 0; i < start.vertices.length; i++) {
      result.vertices[i] = start.vertices[i] + (end.vertices[i] - start.vertices[i]) * progress;
      result.normals[i] = start.normals[i] + (end.normals[i] - start.normals[i]) * progress;
    }

    if (start.uvs && end.uvs && result.uvs) {
      for (let i = 0; i < start.uvs.length; i++) {
        result.uvs[i] = start.uvs[i] + (end.uvs[i] - start.uvs[i]) * progress;
      }
    }

    return result;
  }
}

// Sacred Pattern Transformations
export class SacredPatternTransformer {
  private static readonly GOLDEN_SPIRAL_POINTS = 89; // Fibonacci number

  public static spiralTransform(geometry: GeometryData, progress: number): GeometryData {
    const spiral = generateFibonacciSpiral(this.GOLDEN_SPIRAL_POINTS);
    const result = this.deepCloneGeometry(geometry);
    
    for (let i = 0; i < result.vertices.length; i += 3) {
      const spiralIndex = Math.floor((i / result.vertices.length) * spiral.length);
      const spiralPoint = spiral[spiralIndex];
      
      const originalX = geometry.vertices[i];
      const originalY = geometry.vertices[i + 1];
      
      result.vertices[i] = originalX + (spiralPoint[0] - originalX) * progress;
      result.vertices[i + 1] = originalY + (spiralPoint[1] - originalY) * progress;
    }
    
    return result;
  }

  public static vesicaPiscisTransform(geometry: GeometryData, progress: number): GeometryData {
    const result = this.deepCloneGeometry(geometry);
    const vesicaRatio = SACRED_RATIOS.VESICA_PISCIS;
    
    for (let i = 0; i < result.vertices.length; i += 3) {
      const x = geometry.vertices[i];
      const y = geometry.vertices[i + 1];
      const radius = Math.sqrt(x * x + y * y);
      
      const angle = Math.atan2(y, x);
      const newRadius = radius * (1 + (vesicaRatio - 1) * progress);
      
      result.vertices[i] = Math.cos(angle) * newRadius;
      result.vertices[i + 1] = Math.sin(angle) * newRadius;
    }
    
    return result;
  }

  public static torusTransform(geometry: GeometryData, progress: number): GeometryData {
    const result = this.deepCloneGeometry(geometry);
    const torusRadius = 2 * PHI;
    const tubeRadius = 0.5;
    
    for (let i = 0; i < result.vertices.length; i += 3) {
      const x = geometry.vertices[i];
      const y = geometry.vertices[i + 1];
      const z = geometry.vertices[i + 2];
      
      const radius = Math.sqrt(x * x + y * y);
      const angle = Math.atan2(y, x);
      
      const torusX = (torusRadius + tubeRadius * Math.cos(angle)) * Math.cos(radius * PHI);
      const torusY = (torusRadius + tubeRadius * Math.cos(angle)) * Math.sin(radius * PHI);
      const torusZ = tubeRadius * Math.sin(angle);
      
      result.vertices[i] = x + (torusX - x) * progress;
      result.vertices[i + 1] = y + (torusY - y) * progress;
      result.vertices[i + 2] = z + (torusZ - z) * progress;
    }
    
    return result;
  }

  private static deepCloneGeometry(geometry: GeometryData): GeometryData {
    return {
      vertices: new Float32Array(geometry.vertices),
      normals: new Float32Array(geometry.normals),
      indices: geometry.indices ? new Uint16Array(geometry.indices) : undefined,
      uvs: geometry.uvs ? new Float32Array(geometry.uvs) : undefined,
      tangents: geometry.tangents ? new Float32Array(geometry.tangents) : undefined,
      colors: geometry.colors ? new Float32Array(geometry.colors) : undefined
    };
  }
}

// Animation Utilities
export class SacredAnimationUtils {
  public static createPulseAnimation(frequency: number = 1): (time: number) => number {
    return (time: number) => {
      return 0.5 * (1 + Math.sin(time * frequency * PI_PHI));
    };
  }

  public static createSpiralAnimation(radius: number = 1): (time: number) => [number, number] {
    return (time: number) => {
      const angle = time * PI_PHI;
      const growthFactor = Math.pow(PHI, time * 0.001);
      return [
        radius * growthFactor * Math.cos(angle),
        radius * growthFactor * Math.sin(angle)
      ];
    };
  }

  public static createFlowFieldAnimation(
    resolution: number = 32,
    scale: number = 1
  ): (time: number) => Float32Array {
    return (time: number) => {
      const field = new Float32Array(resolution * resolution * 2);
      for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
          const index = (y * resolution + x) * 2;
          const angle = (
            Math.sin(x / resolution * PI_PHI + time) +
            Math.cos(y / resolution * PI_PHI + time)
          ) * scale;
          field[index] = Math.cos(angle);
          field[index + 1] = Math.sin(angle);
        }
      }
      return field;
    };
  }
}

// Shader Utilities and Constants
export class SacredShaderUtils {
  private static readonly GOLDEN_NOISE_FUNCTION = `
    float goldenNoise(vec2 pos, float seed) {
      return fract(sin(dot(pos * PHI, vec2(12.9898, 78.233))) * 43758.5453123 + seed);
    }
  `;

  private static readonly SACRED_PATTERN_FUNCTIONS = `
    float flowerOfLife(vec2 uv, float scale) {
      float pattern = 0.0;
      vec2 pos = uv * scale;
      
      // Center circle
      float d = length(pos);
      pattern = smoothstep(1.1, 0.9, d);
      
      // Surrounding circles
      for(float i = 0.0; i < 6.0; i++) {
        float angle = i * PI / 3.0;
        vec2 offset = vec2(cos(angle), sin(angle)) * 2.0;
        d = length(pos - offset);
        pattern += smoothstep(1.1, 0.9, d);
      }
      
      return clamp(pattern, 0.0, 1.0);
    }

    float metatronsCube(vec2 uv, float scale) {
      float pattern = 0.0;
      vec2 pos = uv * scale;
      
      // Central hexagon
      for(float i = 0.0; i < 6.0; i++) {
        float angle = i * PI / 3.0;
        vec2 hexCorner = vec2(cos(angle), sin(angle));
        float d = abs(dot(pos, hexCorner));
        pattern += smoothstep(1.1, 0.9, d);
      }
      
      return clamp(pattern, 0.0, 1.0);
    }

    float sriYantra(vec2 uv, float scale) {
      float pattern = 0.0;
      vec2 pos = uv * scale;
      float angle = atan(pos.y, pos.x);
      float r = length(pos);
      
      // Nine interlocking triangles
      for(float i = 0.0; i < 9.0; i++) {
        float a = angle + i * PI / 9.0;
        float d = abs(r * cos(a * 3.0));
        pattern += smoothstep(0.1, 0.05, d);
      }
      
      return clamp(pattern, 0.0, 1.0);
    }
  `;

  public static generateShaderConfig(patternType: SacredPatternConfig['type']): ShaderConfig {
    const uniforms = {
      time: { type: 'float', value: 0 },
      resolution: { type: 'vec2', value: [0, 0] },
      scale: { type: 'float', value: 1.0 },
      phi: { type: 'float', value: PHI },
      energyFlow: { type: 'float', value: 1.0 },
      baseColor: { type: 'vec3', value: [1, 1, 1] }
    };

    const vertexShader = `#version 300 es
      precision highp float;
      
      in vec3 position;
      in vec3 normal;
      in vec2 uv;
      
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform float time;
      uniform float phi;
      
      out vec3 vNormal;
      out vec2 vUv;
      out vec3 vPosition;
      
      ${this.GOLDEN_NOISE_FUNCTION}
      
      void main() {
        vNormal = normal;
        vUv = uv;
        vPosition = position;
        
        // Apply sacred geometry transformation
        vec3 pos = position;
        float noise = goldenNoise(uv, time * 0.001);
        pos += normal * noise * 0.1;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `#version 300 es
      precision highp float;
      
      in vec3 vNormal;
      in vec2 vUv;
      in vec3 vPosition;
      
      uniform float time;
      uniform vec2 resolution;
      uniform float scale;
      uniform float phi;
      uniform float energyFlow;
      uniform vec3 baseColor;
      
      out vec4 fragColor;
      
      const float PI = 3.141592653589793;
      const float PHI = ${PHI};
      
      ${this.GOLDEN_NOISE_FUNCTION}
      ${this.SACRED_PATTERN_FUNCTIONS}
      
      void main() {
        vec2 uv = vUv;
        float pattern = 0.0;
        
        // Select pattern based on type
        ${this.getPatternCode(patternType)}
        
        // Apply energy flow
        float energy = sin(time * 0.001 * phi) * 0.5 + 0.5;
        pattern *= mix(0.5, 1.0, energy * energyFlow);
        
        // Final color
        vec3 color = baseColor * pattern;
        float alpha = pattern;
        
        fragColor = vec4(color, alpha);
      }
    `;

    return { vertexShader, fragmentShader, uniforms };
  }

  private static getPatternCode(type: SacredPatternConfig['type']): string {
    switch (type) {
      case 'flowerOfLife':
        return 'pattern = flowerOfLife(uv, scale);';
      case 'metatronsCube':
        return 'pattern = metatronsCube(uv, scale);';
      case 'sriYantra':
        return 'pattern = sriYantra(uv, scale);';
      case 'torus':
        return `
          float angle = atan(vPosition.y, vPosition.x);
          float radius = length(vPosition.xy);
          pattern = smoothstep(1.1, 0.9, abs(radius - 1.0));
        `;
      default:
        return 'pattern = 1.0;';
    }
  }
}

// Export main initialization function
export function initSacredGeometry(
  gl: WebGL2RenderingContext,
  config: SacredPatternConfig
): {
  geometry: GeometryData;
  shaderConfig: ShaderConfig;
  animator: SacredPatternAnimator;
  transformer: typeof SacredPatternTransformer;
  utils: typeof SacredAnimationUtils;
} {
  let geometry: GeometryData;

  // Generate geometry based on pattern type
  switch (config.type) {
    case 'metatronsCube':
      geometry = createMetatronsCubeGeometry({ scale: config.scale });
      break;
    case 'flowerOfLife':
      geometry = createFlowerOfLifeGeometry(config);
      break;
    case 'sriYantra':
      geometry = createSriYantraGeometry(config);
      break;
    default:
      throw new Error(`Unsupported pattern type: ${config.type}`);
  }

  // Generate shader configuration
  const shaderConfig = SacredShaderUtils.generateShaderConfig(config.type);

  // Initialize animator
  const animator = new SacredPatternAnimator(geometry);

  return {
    geometry,
    shaderConfig,
    animator,
    transformer: SacredPatternTransformer,
    utils: SacredAnimationUtils
  };
}

// Export all constants and types
export {
  SACRED_RATIOS,
  PHI,
  SQRT_PHI,
  PI_PHI,
  FIBONACCI_SEQUENCE
};

export type {
  GeometryData,
  MetatronsCubeConfig,
  SacredPatternConfig,
  ShaderConfig
};