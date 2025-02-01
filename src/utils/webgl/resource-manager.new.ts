import { TextureManager } from './texture-manager';
import { ShaderManager } from './shader-manager';
import { StateManager } from './state-manager';
import { ErrorHandler } from '../../core/error/ErrorHandler';
import { ErrorType } from '../../core/error/ErrorTypes';

interface ResourceMetrics {
  totalMemoryUsage: number;
  textureMemory: number;
  bufferMemory: number;
  activeTextures: number;
  activeBuffers: number;
  activePrograms: number;
  vertexCount: number;
  indexCount: number;
}

export class ResourceManager {
  private gl: WebGL2RenderingContext;
  private textureManager: TextureManager;
  private stateManager: StateManager;
  private shaderManager: ShaderManager;
  private buffers: Map<string, { buffer: WebGLBuffer, size: number, type: number }>;
  private vaoCache: Map<string, WebGLVertexArrayObject>;
  private totalMemoryUsage: number;
  private errorHandler: ErrorHandler;
  private vertexCounts: Map<string, number>;
  private indexCounts: Map<string, number>;

  constructor(gl: WebGL2RenderingContext, errorHandler: ErrorHandler) {
    this.gl = gl;
    this.errorHandler = errorHandler;
    this.textureManager = new TextureManager(gl, errorHandler);
    this.stateManager = new StateManager(gl);
    this.shaderManager = new ShaderManager(gl, errorHandler);
    this.buffers = new Map();
    this.vaoCache = new Map();
    this.totalMemoryUsage = 0;
    this.vertexCounts = new Map();
    this.indexCounts = new Map();
  }

  public createBuffer(key: string, data: BufferSource, type: number, usage: number): WebGLBuffer | null {
    try {
      const buffer = this.gl.createBuffer();
      if (!buffer) {
        throw new Error('Failed to create WebGL buffer');
      }

      this.gl.bindBuffer(type, buffer);
      this.gl.bufferData(type, data, usage);

      const size = (data as ArrayBuffer).byteLength;
      this.buffers.set(key, { buffer, size, type });
      this.totalMemoryUsage += size;

      if (type === this.gl.ARRAY_BUFFER) {
        this.vertexCounts.set(key, data.byteLength / 12); // Assuming float32 xyz
      } else if (type === this.gl.ELEMENT_ARRAY_BUFFER) {
        this.indexCounts.set(key, data.byteLength / 2); // Assuming uint16
      }

      return buffer;
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        type: ErrorType.RESOURCE_ERROR,
        context: { resourceType: 'buffer', key }
      });
      return null;
    }
  }

  public deleteBuffer(key: string): void {
    const bufferData = this.buffers.get(key);
    if (bufferData) {
      this.gl.deleteBuffer(bufferData.buffer);
      this.totalMemoryUsage -= bufferData.size;
      this.buffers.delete(key);
      this.vertexCounts.delete(key);
      this.indexCounts.delete(key);
    }
  }

  public createVAO(key: string, setupFunction: () => void): WebGLVertexArrayObject | null {
    try {
      const vao = this.gl.createVertexArray();
      if (!vao) {
        throw new Error('Failed to create vertex array object');
      }

      this.gl.bindVertexArray(vao);
      setupFunction();
      this.gl.bindVertexArray(null);

      this.vaoCache.set(key, vao);
      return vao;
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        type: ErrorType.RESOURCE_ERROR,
        context: { resourceType: 'vao', key }
      });
      return null;
    }
  }

  public deleteVAO(key: string): void {
    const vao = this.vaoCache.get(key);
    if (vao) {
      this.gl.deleteVertexArray(vao);
      this.vaoCache.delete(key);
    }
  }

  public getMetrics(): ResourceMetrics {
    return {
      totalMemoryUsage: this.totalMemoryUsage,
      textureMemory: this.textureManager.getMemoryUsage(),
      bufferMemory: this.calculateBufferMemory(),
      activeTextures: this.textureManager.getTextureCount(),
      activeBuffers: this.buffers.size,
      activePrograms: this.shaderManager.getProgramCount(),
      vertexCount: this.calculateTotalVertices(),
      indexCount: this.calculateTotalIndices()
    };
  }

  public cleanup(): void {
    this.textureManager.cleanup();
    this.shaderManager.cleanup();
    this.cleanupBuffers();
    this.cleanupVAOs();
    this.totalMemoryUsage = 0;
    this.vertexCounts.clear();
    this.indexCounts.clear();
  }

  private cleanupBuffers(): void {
    this.buffers.forEach(({ buffer }) => {
      this.gl.deleteBuffer(buffer);
    });
    this.buffers.clear();
  }

  private cleanupVAOs(): void {
    this.vaoCache.forEach(vao => {
      this.gl.deleteVertexArray(vao);
    });
    this.vaoCache.clear();
  }

  private calculateTotalVertices(): number {
    return Array.from(this.vertexCounts.values()).reduce((sum, count) => sum + count, 0);
  }

  private calculateTotalIndices(): number {
    return Array.from(this.indexCounts.values()).reduce((sum, count) => sum + count, 0);
  }

  private calculateBufferMemory(): number {
    return Array.from(this.buffers.values()).reduce((sum, { size }) => sum + size, 0);
  }
}