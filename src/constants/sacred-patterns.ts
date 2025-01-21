import { vec2, vec3 } from 'gl-matrix';

// Mathematical Constants
export const SACRED_MATH = {
  PHI: 1.618033988749895, // Golden Ratio (φ)
  PHI_CONJUGATE: 0.618033988749895, // Golden Ratio Conjugate (1/φ)
  PHI_SQUARED: 2.618033988749895, // φ²
  SQRT_PHI: 1.272019649514069, // √φ
  PI: Math.PI, // π
  PI_PHI: Math.PI * 1.618033988749895, // π * φ
  E_PHI: Math.E * 1.618033988749895, // e * φ
  SQRT_3: Math.sqrt(3), // √3 (Vesica Piscis ratio)
  SQRT_5: Math.sqrt(5), // √5 (Used in golden ratio calculations)
} as const;

// Sacred Numbers
export const SACRED_NUMBERS = {
  UNITY: 1,
  DUALITY: 2,
  TRINITY: 3,
  TETRAD: 4,
  PENTAD: 5,
  HEXAD: 6,
  HEPTAD: 7,
  OCTAD: 8,
  ENNEAD: 9,
  DECAD: 10,
  DODECAD: 12
} as const;

// Fibonacci Sequence (First 13 numbers)
export const FIBONACCI = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144] as const;

// Pattern-Specific Constants
export const FLOWER_OF_LIFE = {
  BASE_RADIUS: 1.0,
  FIRST_RING_COUNT: 6,
  SECOND_RING_COUNT: 12,
  VESICA_PISCIS_RATIO: Math.sqrt(3),
  SEED_SCALE: 0.5,
  PETAL_OVERLAP: 0.1,
  MAX_RINGS: 7,
  ROTATION_ANGLES: {
    FIRST_RING: Math.PI / 3,
    SECOND_RING: Math.PI / 6
  }
} as const;

export const METATRONS_CUBE = {
  SPHERE_POSITIONS: [
    [0, 0, 0], // Center
    [1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1], // First ring
    [1, 1, 0], [-1, 1, 0], [-1, -1, 0], [1, -1, 0] // Second ring
  ] as readonly [number, number, number][],
  PLATONIC_SCALES: {
    TETRAHEDRON: 1.0,
    CUBE: 1.0,
    OCTAHEDRON: 1.0,
    DODECAHEDRON: 1.618033988749895,
    ICOSAHEDRON: 1.618033988749895
  },
  CONNECTION_INDICES: new Uint16Array([
    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6,
    1, 2, 2, 3, 3, 4, 4, 1
  ])
} as const;

export const SRI_YANTRA = {
  TRIANGLE_PAIRS: 9,
  BINDU_RADIUS: 0.05,
  OUTER_RADIUS: 1.0,
  TRIANGLE_RATIOS: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2],
  ENERGY_CENTERS: [
    { position: [0, 0], frequency: 1.0 }, // Bindu
    { position: [0, 0.3], frequency: 1.618033988749895 }, // Upper triangle
    { position: [0, -0.3], frequency: 2.618033988749895 } // Lower triangle
  ] as const
} as const;

// Energy and Resonance Constants
export const ENERGY_PATTERNS = {
  FREQUENCIES: {
    ROOT: 432, // Hz
    SACRED: 528, // Hz
    SOLFEGGIO: [396, 417, 528, 639, 741, 852], // Hz
    PHI_HARMONIC: 1.618033988749895 * 432
  },
  WAVE_FORMS: {
    SINE: 'sine',
    GOLDEN_WAVE: 'golden',
    PHI_SPIRAL: 'spiral',
    TORUS: 'torus'
  } as const,
  RESONANCE_FIELDS: {
    WEAK: 0.382,  // φ²
    MEDIUM: 0.618, // 1/φ
    STRONG: 1.0,
    HARMONIC: 1.618 // φ
  }
} as const;

// WebGL Type Guards and Type Definitions
export interface WebGL2Context extends WebGL2RenderingContext {
  readonly PHI: number;
}

export function isWebGL2Context(context: any): context is WebGL2Context {
  return (
    context instanceof WebGL2RenderingContext &&
    typeof context.createVertexArray === 'function' &&
    typeof context.createTransformFeedback === 'function'
  );
}

// Pattern-Specific Interfaces
export interface PatternVertex {
  position: vec3;
  normal: vec3;
  uv: vec2;
  energy: number;
  resonance: number;
}

export interface PatternGeometry {
  vertices: PatternVertex[];
  indices: number[];
  transformations: {
    scale: number;
    rotation: vec3;
    position: vec3;
  };
  energyField: {
    intensity: number;
    frequency: number;
    pattern: keyof typeof ENERGY_PATTERNS.WAVE_FORMS;
  };
}

// Type Guards for Pattern Validation
export function isValidPatternGeometry(geometry: any): geometry is PatternGeometry {
  return (
    geometry &&
    Array.isArray(geometry.vertices) &&
    geometry.vertices.every(isValidPatternVertex) &&
    Array.isArray(geometry.indices) &&
    typeof geometry.transformations === 'object' &&
    typeof geometry.energyField === 'object'
  );
}

export function isValidPatternVertex(vertex: any): vertex is PatternVertex {
  return (
    vertex &&
    Array.isArray(vertex.position) && vertex.position.length === 3 &&
    Array.isArray(vertex.normal) && vertex.normal.length === 3 &&
    Array.isArray(vertex.uv) && vertex.uv.length === 2 &&
    typeof vertex.energy === 'number' &&
    typeof vertex.resonance === 'number'
  );
}

// Export all constants and types
export {
  SACRED_MATH,
  SACRED_NUMBERS,
  FIBONACCI,
  FLOWER_OF_LIFE,
  METATRONS_CUBE,
  SRI_YANTRA,
  ENERGY_PATTERNS
};

export type {
  WebGL2Context,
  PatternVertex,
  PatternGeometry
};