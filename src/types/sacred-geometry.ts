/**
 * Represents a sacred geometry pattern configuration
 */
export interface PatternConfig {
  /** Number of segments in the pattern (min: 3, max: 12) */
  segments: number;
  /** Number of concentric layers (min: 1, max: 10) */
  layers: number;
  /** Radius of the pattern in pixels */
  radius: number;
  /** Optional color scheme for the pattern */
  colorScheme?: ColorScheme;
  /** Optional animation settings */
  animation?: AnimationConfig;
}

/**
 * Color scheme configuration for patterns
 */
export interface ColorScheme {
  /** Primary color in hex format */
  primary: string;
  /** Secondary color in hex format */
  secondary: string;
  /** Background color in hex format */
  background: string;
  /** Accent color in hex format */
  accent?: string;
  /** Optional opacity value (0-1) */
  opacity?: number;
}

/**
 * Animation configuration for dynamic patterns
 */
export interface AnimationConfig {
  /** Duration of animation in milliseconds */
  duration: number;
  /** Type of animation effect */
  type: 'rotate' | 'pulse' | 'wave' | 'morph';
  /** Animation easing function */
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  /** Whether animation should loop */
  loop?: boolean;
  /** Custom animation parameters */
  params?: Record<string, number>;
}

/**
 * Geometry data structure for WebGL rendering
 */
export interface GeometryData {
  /** Vertex positions */
  vertices: Float32Array;
  /** Vertex indices */
  indices: Uint16Array;
  /** Vertex normals */
  normals?: Float32Array;
  /** Texture coordinates */
  texCoords?: Float32Array;
  /** Number of triangles */
  triangleCount: number;
  /** Vertex attribute configurations */
  attributes: VertexAttributes;
}

/**
 * Vertex attribute configuration
 */
export interface VertexAttributes {
  /** Position attribute configuration */
  position: AttributeConfig;
  /** Normal attribute configuration */
  normal?: AttributeConfig;
  /** Texture coordinate attribute configuration */
  texCoord?: AttributeConfig;
  /** Color attribute configuration */
  color?: AttributeConfig;
}

/**
 * Vertex attribute configuration
 */
export interface AttributeConfig {
  /** Number of components per vertex */
  size: number;
  /** Data type of components */
  type: number;
  /** Whether to normalize the data */
  normalized?: boolean;
  /** Stride between consecutive vertices */
  stride?: number;
  /** Offset within the vertex */
  offset?: number;
}

/**
 * Shader configuration for WebGL
 */
export interface ShaderConfig {
  /** Vertex shader source code */
  vertexShader: string;
  /** Fragment shader source code */
  fragmentShader: string;
  /** Uniform variable declarations */
  uniforms?: UniformDeclarations;
  /** Attribute variable declarations */
  attributes?: AttributeDeclarations;
}

/**
 * Uniform variable declarations
 */
export interface UniformDeclarations {
  [key: string]: {
    type: string;
    value: number | number[] | Float32Array;
  };
}

/**
 * Attribute variable declarations
 */
export interface AttributeDeclarations {
  [key: string]: {
    size: number;
    type: number;
  };
}

/**
 * Performance metrics for monitoring
 */
export interface PerformanceMetrics {
  /** Frames per second */
  fps: number;
  /** Average frame render time in milliseconds */
  averageFrameTime: number;
  /** GPU memory usage in bytes */
  gpuMemoryUsage?: number;
  /** JavaScript heap size in bytes */
  memoryUsage: number;
  /** Cache hit rate (0-1) */
  cacheEfficiency: number;
  /** Number of draw calls per frame */
  drawCalls: number;
  /** Number of triangles rendered */
  triangleCount: number;
}

/**
 * Custom error types for sacred geometry operations
 */
export enum GeometryErrorType {
  INVALID_SEGMENTS = 'INVALID_SEGMENTS',
  INVALID_LAYERS = 'INVALID_LAYERS',
  INVALID_RADIUS = 'INVALID_RADIUS',
  SHADER_COMPILATION = 'SHADER_COMPILATION',
  BUFFER_ALLOCATION = 'BUFFER_ALLOCATION',
  RENDER_ERROR = 'RENDER_ERROR'
}

/**
 * Error class for sacred geometry operations
 */
export class GeometryError extends Error {
  constructor(
    public type: GeometryErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GeometryError';
  }
}