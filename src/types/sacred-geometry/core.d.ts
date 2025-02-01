import { Vector3, Matrix4, BoundingBox } from '../geometry';

export interface RenderContext {
  gl: WebGL2RenderingContext;
  state: WebGLState;
  resources: ResourceManager;
}

export interface WebGLState {
  activeTexture: number;
  boundBuffers: Map<number, WebGLBuffer>;
  boundTextures: Map<number, WebGLTexture>;
  currentProgram: WebGLProgram | null;
  snapshotState(): WebGLStateSnapshot;
  restoreState(snapshot: WebGLStateSnapshot): void;
  resetState(): void;
}

export interface ResourceManager {
  getTexture(key: string): WebGLTexture | null;
  getBuffer(key: string): WebGLBuffer | null;
  getProgram(key: string): WebGLProgram | null;
}

export interface GeometryData {
  vertices: number[];
  indices: number[];
  normals: number[];
  uvs: number[];
  drawMode?: number;
  boundingBox?: BoundingBox;
  materialIndex?: number;
}

export interface ShaderConfig {
  vertexShader: string;
  fragmentShader: string;
  uniforms: Record<string, any>;
  attributes?: Record<string, number>;
  defines?: Record<string, string | number>;
}

export interface ComputeShaderConfig {
  computeShader: string;
  uniforms: Record<string, any>;
  workGroupSize: [number, number, number];
}

export interface PatternConfig {
  name: string;
  type: string;
  parameters: Record<string, any>;
  shaderConfig: ShaderConfig;
  geometryConfig?: GeometryConfig;
}

export interface GeometryConfig {
  segments?: number;
  radius?: number;
  scale?: Vector3;
  rotation?: Vector3;
  position?: Vector3;
  optimization?: OptimizationConfig;
}

export interface OptimizationConfig {
  deduplicateVertices?: boolean;
  generateTriangleStrips?: boolean;
  mergeNearbyVertices?: boolean;
  epsilon?: number;
}

export interface GeometryTransformation {
  translation: Vector3;
  rotation: Vector3;
  scale: Vector3;
  matrix?: Matrix4;
}

export interface PatternMetadata {
  complexity: number;
  vertexCount: number;
  triangleCount: number;
  boundingBox: BoundingBox;
  memoryUsage: number;
  optimizationLevel: number;
}

export interface PerformanceMetrics {
  frameTime: number;
  drawCalls: number;
  triangleCount: number;
  vertexCount: number;
  geometryCacheHits: number;
  geometryCacheMisses: number;
  shaderSwitches: number;
  textureBindings: number;
  bufferUpdates: number;
}

export interface ResourceMetrics {
  totalVertices: number;
  totalIndices: number;
  totalGeometries: number;
  totalTextures: number;
  totalBuffers: number;
  totalShaders: number;
  geometryMemory: number;
  textureMemory: number;
  bufferMemory: number;
}

export interface ValidationConfig {
  validateGeometry?: boolean;
  validateShaders?: boolean;
  validateResources?: boolean;
  strictMode?: boolean;
  maxVertices?: number;
  maxIndices?: number;
  maxDrawCalls?: number;
}

export interface ErrorReport {
  type: 'geometry' | 'shader' | 'resource' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: Record<string, any>;
  timestamp: number;
}

export interface RenderStats {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  vertices: number;
  memoryUsage: number;
}