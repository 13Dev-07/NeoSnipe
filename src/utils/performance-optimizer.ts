import { GeometryData, ShaderConfig, PerformanceMetrics } from '../types/sacred-geometry';
import { GeometryOptimizer } from './optimizations/geometry-optimizer';
import { ShaderComplexityAnalyzer } from './optimizations/shader-complexity-analyzer';

interface CachedGeometry extends GeometryData {
  lastUsed: number;
  useCount: number;
  memorySize: number;
}

interface CachedProgram {
  program: WebGLProgram;
  config: ShaderConfig;
  lastUsed: number;
  useCount: number;
}

interface PerformanceStats {
  frameTime: number;
  drawCalls: number;
  triangleCount: number;
  geometryCacheHits: number;
  geometryCacheMisses: number;
  shaderCacheHits: number;
  shaderCacheMisses: number;
  memoryUsage: number;
}

export class PerformanceOptimizer {
  private static readonly CACHE_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB
  private static readonly CACHE_TTL = 5000; // 5 seconds
  private static readonly MONITORING_INTERVAL = 1000; // 1 second

  private gl: WebGL2RenderingContext;
  private geometryCache: Map<string, CachedGeometry>;
  private programCache: Map<string, CachedProgram>;
  private stats: PerformanceStats;
  private lastCleanup: number;
  private frameStartTime: number;
  private totalMemoryUsage: number;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.geometryCache = new Map();
    this.programCache = new Map();
    this.totalMemoryUsage = 0;
    this.lastCleanup = performance.now();
    this.frameStartTime = performance.now();
    
    this.stats = {
      frameTime: 0,
      drawCalls: 0,
      triangleCount: 0,
      geometryCacheHits: 0,
      geometryCacheMisses: 0,
      shaderCacheHits: 0,
      shaderCacheMisses: 0,
      memoryUsage: 0
    };

    // Start performance monitoring
    this.startPerformanceMonitoring();
  }

  /**
   * Geometry Caching
   */
  cacheGeometry(key: string, geometry: GeometryData): void {
    const memorySize = this.calculateGeometrySize(geometry);
    
    // Check if we need to clean up cache before adding
    if (this.totalMemoryUsage + memorySize > PerformanceOptimizer.CACHE_SIZE_LIMIT) {
      this.cleanupCache();
    }

    const cachedGeometry: CachedGeometry = {
      ...geometry,
      lastUsed: performance.now(),
      useCount: 0,
      memorySize
    };

    this.geometryCache.set(key, cachedGeometry);
    this.totalMemoryUsage += memorySize;
  }

  getGeometry(key: string): GeometryData | null {
    const cached = this.geometryCache.get(key);
    if (cached) {
      cached.lastUsed = performance.now();
      cached.useCount++;
      this.stats.geometryCacheHits++;
      return cached;
    }
    this.stats.geometryCacheMisses++;
    return null;
  }

  /**
   * Shader Program Caching
   */
  cacheProgram(key: string, program: WebGLProgram, config: ShaderConfig): void {
    this.programCache.set(key, {
      program,
      config,
      lastUsed: performance.now(),
      useCount: 0
    });
  }

  getProgram(key: string): WebGLProgram | null {
    const cached = this.programCache.get(key);
    if (cached) {
      cached.lastUsed = performance.now();
      cached.useCount++;
      this.stats.shaderCacheHits++;
      return cached.program;
    }
    this.stats.shaderCacheMisses++;
    return null;
  }

  /**
   * Performance Monitoring
   */
  beginFrame(): void {
    this.frameStartTime = performance.now();
    this.stats.drawCalls = 0;
    this.stats.triangleCount = 0;
  }

  endFrame(): void {
    this.stats.frameTime = performance.now() - this.frameStartTime;
    
    // Periodic cache cleanup
    if (performance.now() - this.lastCleanup > PerformanceOptimizer.CACHE_TTL) {
      this.cleanupCache();
    }
  }

  recordDrawCall(triangleCount: number): void {
    this.stats.drawCalls++;
    this.stats.triangleCount += triangleCount;
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return {
      frameTime: this.stats.frameTime,
      drawCalls: this.stats.drawCalls,
      triangleCount: this.stats.triangleCount,
      cacheEfficiency: {
        geometry: this.calculateCacheEfficiency(
          this.stats.geometryCacheHits,
          this.stats.geometryCacheMisses
        ),
        shader: this.calculateCacheEfficiency(
          this.stats.shaderCacheHits,
          this.stats.shaderCacheMisses
        )
      },
      memoryUsage: this.totalMemoryUsage
    };
  }

  /**
   * Cache Management
   */
  private cleanupCache(): void {
    const now = performance.now();
    this.lastCleanup = now;

    // Cleanup geometry cache
    for (const [key, geometry] of this.geometryCache.entries()) {
      if (now - geometry.lastUsed > PerformanceOptimizer.CACHE_TTL) {
        this.totalMemoryUsage -= geometry.memorySize;
        this.geometryCache.delete(key);
      }
    }

    // Cleanup shader cache
    for (const [key, program] of this.programCache.entries()) {
      if (now - program.lastUsed > PerformanceOptimizer.CACHE_TTL) {
        this.gl.deleteProgram(program.program);
        this.programCache.delete(key);
      }
    }
  }

  /**
   * Utility Methods
   */
  private calculateGeometrySize(geometry: GeometryData): number {
    let size = 0;
    size += geometry.vertices.byteLength;
    size += geometry.normals.byteLength;
    if (geometry.indices) size += geometry.indices.byteLength;
    if (geometry.uvs) size += geometry.uvs.byteLength;
    if (geometry.tangents) size += geometry.tangents.byteLength;
    if (geometry.colors) size += geometry.colors.byteLength;
    return size;
  }

  private calculateCacheEfficiency(hits: number, misses: number): number {
    const total = hits + misses;
    return total > 0 ? hits / total : 1;
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      const metrics = this.getPerformanceMetrics();
      console.debug('Performance Metrics:', {
        FPS: Math.round(1000 / metrics.frameTime),
        DrawCalls: metrics.drawCalls,
        Triangles: metrics.triangleCount,
        'Memory (MB)': Math.round(metrics.memoryUsage / (1024 * 1024)),
        'Cache Efficiency': {
          Geometry: `${Math.round(metrics.cacheEfficiency.geometry * 100)}%`,
          Shader: `${Math.round(metrics.cacheEfficiency.shader * 100)}%`
        }
      });
    }, PerformanceOptimizer.MONITORING_INTERVAL);
  }

  /**
   * Advanced Optimization Methods
   */
  optimizeGeometry(geometry: GeometryData): GeometryData {
    // Implement geometry optimization techniques
    // - Vertex deduplication
    // - Index buffer optimization
    // - Triangle strip conversion
    const optimizer = new GeometryOptimizer();
    return optimizer.optimizeGeometry(geometry);
  }

  analyzeShaderComplexity(config: ShaderConfig): void {
    // Analyze shader complexity and provide optimization suggestions
    const complexity = this.calculateShaderComplexity(config);
    if (complexity > 100) {
      console.warn('High shader complexity detected. Consider optimizing:', {
        uniformCount: Object.keys(config.uniforms).length,
        sourceLength: config.vertexShader.length + config.fragmentShader.length,
        complexity
      });
    }
  }

  private calculateShaderComplexity(config: ShaderConfig): number {
    // Simple complexity metric based on source length and uniform count
    return (
      (config.vertexShader.length + config.fragmentShader.length) / 100 +
      Object.keys(config.uniforms).length * 10
    );
  }
}

export default PerformanceOptimizer;