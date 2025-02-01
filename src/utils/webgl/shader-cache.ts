import { ShaderConfig, ComputeShaderConfig } from '../../types/sacred-geometry';

interface CachedShader {
  program: WebGLProgram;
  lastUsed: number;
  config: ShaderConfig | ComputeShaderConfig;
}

export class ShaderCache {
  private cache: Map<string, CachedShader>;
  private maxSize: number;
  private cleanupThreshold: number;

  constructor(maxSize: number = 100, cleanupThreshold: number = 0.8) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.cleanupThreshold = cleanupThreshold;
  }

  public get(key: string): WebGLProgram | null {
    const cached = this.cache.get(key);
    if (cached) {
      cached.lastUsed = Date.now();
      return cached.program;
    }
    return null;
  }

  public set(key: string, program: WebGLProgram, config: ShaderConfig | ComputeShaderConfig): void {
    if (this.cache.size >= this.maxSize * this.cleanupThreshold) {
      this.cleanup();
    }

    this.cache.set(key, {
      program,
      lastUsed: Date.now(),
      config
    });
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  private cleanup(): void {
    if (this.cache.size < this.maxSize * this.cleanupThreshold) {
      return;
    }

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);

    // Remove oldest 20% of entries
    const removeCount = Math.floor(this.cache.size * 0.2);
    entries.slice(0, removeCount).forEach(([key]) => {
      this.cache.delete(key);
    });
  }

  public clear(): void {
    this.cache.clear();
  }
}