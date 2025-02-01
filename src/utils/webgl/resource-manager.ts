import { TextureManager } from './texture-manager';
import { WebGLStateManager } from './state-manager';
import { ShaderManager } from './shader-manager';
import { ResourceMetrics } from '../../types/sacred-geometry/core';

export class ResourceManager {
  private textureManager: TextureManager;
  private stateManager: WebGLStateManager;
  private shaderManager: ShaderManager;
  private buffers: Map<string, WebGLBuffer>;
  private vaoCache: Map<string, WebGLVertexArrayObject>;
  private totalMemoryUsage: number;
  
  constructor(gl: WebGL2RenderingContext) {
    this.textureManager = new TextureManager(gl);
    this.stateManager = new WebGLStateManager(gl);
    this.shaderManager = new ShaderManager(gl);
    this.buffers = new Map();
    this.vaoCache = new Map();
    this.totalMemoryUsage = 0;
  }

  public getTexture(key: string): WebGLTexture | null {
    return this.textureManager.getTexture(key);
  }

  public getBuffer(key: string): WebGLBuffer | null {
    return this.buffers.get(key) || null;
  }

  public getProgram(key: string): WebGLProgram | null {
    return this.shaderManager.getProgram(key);
  }

  public getVAO(key: string): WebGLVertexArrayObject | null {
    return this.vaoCache.get(key) || null;
  }

  public getMetrics(): ResourceMetrics {
    return {
      totalVertices: this.countTotalVertices(),
      totalIndices: this.countTotalIndices(),
      totalGeometries: this.vaoCache.size,
      totalTextures: this.textureManager.getTextureCount(),
      totalBuffers: this.buffers.size,
      totalShaders: this.shaderManager.getProgramCount(),
      geometryMemory: this.calculateGeometryMemory(),
      textureMemory: this.textureManager.getTotalTextureMemory(),
      bufferMemory: this.calculateBufferMemory()
    };
  }

  public cleanup(): void {
    // Clean up all resources
    this.textureManager.cleanup();
    this.shaderManager.cleanup();
    this.cleanupBuffers();
    this.cleanupVAOs();
    this.totalMemoryUsage = 0;
  }

  private cleanupBuffers(): void {
    this.buffers.forEach((buffer) => {
      this.stateManager.gl.deleteBuffer(buffer);
    });
    this.buffers.clear();
  }

  private cleanupVAOs(): void {
    this.vaoCache.forEach((vao) => {
      this.stateManager.gl.deleteVertexArray(vao);
    });
    this.vaoCache.clear();
  }

  private countTotalVertices(): number {
    let count = 0;
    this.buffers.forEach((buffer) => {
      // This is an approximation, would need proper tracking
      if (buffer) count += buffer.byteLength / (4 * 3); // Assuming float32 xyz
    });
    return count;
  }

  private countTotalIndices(): number {
    let count = 0;
    this.buffers.forEach((buffer) => {
      // This is an approximation, would need proper tracking
      if (buffer) count += buffer.byteLength / 2; // Assuming uint16
    });
    return count;
  }

  private calculateGeometryMemory(): number {
    let total = 0;
    this.buffers.forEach((buffer) => {
      if (buffer) total += buffer.byteLength;
    });
    return total;
  }

  private calculateBufferMemory(): number {
    let total = 0;
    this.buffers.forEach((buffer) => {
      if (buffer) total += buffer.byteLength;
    });
    return total;
  }
}