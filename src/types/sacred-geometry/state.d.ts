import { GeometryData, ShaderConfig } from './core';

export interface WebGLStateSnapshot {
  program: WebGLProgram | null;
  vertexArray: WebGLVertexArrayObject | null;
  viewport: [number, number, number, number];
  depthTest: boolean;
  blending: boolean;
  cullFace: boolean;
  frontFace: number;
  depthMask: boolean;
  depthFunc: number;
  blendFunc: [number, number];
  clearColor: [number, number, number, number];
  boundTextures: Map<number, WebGLTexture>;
  boundBuffers: Map<number, WebGLBuffer>;
  activeAttributes: Set<number>;
}

export interface StateManagerConfig {
  maxStateStackDepth?: number;
  validateStateChanges?: boolean;
  autoRestoreState?: boolean;
  trackResourceUsage?: boolean;
}

export interface ResourceUsageStats {
  textureBinds: number;
  bufferBinds: number;
  shaderSwitches: number;
  stateChanges: number;
  stackDepth: number;
}