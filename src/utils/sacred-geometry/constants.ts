// Geometry validation constants
export const VERTEX_EPSILON = 1e-6;
export const MIN_VERTICES = 3;
export const MAX_VERTICES = 1000000; // 1M vertices max for performance
export const MIN_INDICES = 3;
export const MAX_INDICES = 3000000; // 3M indices max (1M triangles)

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  drawCalls: 1000,
  triangles: 1000000,
  vertices: 1000000,
  memoryUsage: 512 * 1024 * 1024 // 512MB
};

// Sacred geometry constants
export const SACRED_GEOMETRY = {
  phi: (1 + Math.sqrt(5)) / 2, // Golden ratio
  metatronsCube: {
    outerSphereCount: 13,
    minConnections: 91,
    sphereSegments: 32,
    circleSegments: 64,
    centerRadius: 1.0,
    outerRadius: 0.5
  },
  flowerOfLife: {
    circleCount: 19,
    segments: 64,
    radius: 1.0
  }
};

// WebGL constants
export const WEBGL = {
  maxTextureSize: 8192, // Common max texture size, will be queried from context
  maxBufferSize: 512 * 1024 * 1024, // 512MB max buffer size
  defaultBatchSize: 1000,
  maxDrawCalls: 5000
};