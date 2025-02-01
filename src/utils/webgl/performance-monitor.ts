import { MemoryMonitor } from '../memory-monitor';

interface PerformanceMetrics {
  frameTime: number;
  drawCalls: number;
  triangleCount: number;
  memoryUsage: number;
  shaderSwitches: number;
  bufferUploads: number;
  textureUploads: number;
}

export class WebGLPerformanceMonitor {
    private static instance: WebGLPerformanceMonitor | null = null;
    private gl: WebGL2RenderingContext;
    private memoryMonitor: MemoryMonitor;
    private metrics: PerformanceMetrics;
    private lastFrameTime: number;
    private frameCount: number;
    private enabled: boolean;

  private constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.memoryMonitor = MemoryMonitor.getInstance();
    this.metrics = {
      frameTime: 0,
      drawCalls: 0,
      triangleCount: 0,
      memoryUsage: 0,
      shaderSwitches: 0,
      bufferUploads: 0,
      textureUploads: 0
    };
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.enabled = false;
  }

  public static getInstance(gl: WebGL2RenderingContext): WebGLPerformanceMonitor {
    if (!WebGLPerformanceMonitor.instance) {
      WebGLPerformanceMonitor.instance = new WebGLPerformanceMonitor(gl);
    }
    return WebGLPerformanceMonitor.instance;
  }

  public startMonitoring(): void {
    this.enabled = true;
    this.memoryMonitor.startMonitoring();
    this.resetMetrics();
  }

  public stopMonitoring(): void {
    this.enabled = false;
    this.memoryMonitor.stopMonitoring();
  }

  public beginFrame(): void {
    if (!this.enabled) return;
    
    const currentTime = performance.now();
    this.metrics.frameTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    this.frameCount++;
    
    // Reset per-frame counters
    this.metrics.drawCalls = 0;
    this.metrics.triangleCount = 0;
    this.metrics.shaderSwitches = 0;
  }

  public endFrame(): void {
    if (!this.enabled) return;
    
    // Update memory usage
    this.metrics.memoryUsage = performance.memory?.usedJSHeapSize || 0;
  }

  public recordDrawCall(triangleCount: number): void {
    if (!this.enabled) return;
    
    this.metrics.drawCalls++;
    this.metrics.triangleCount += triangleCount;
  }

  public recordShaderSwitch(): void {
    if (!this.enabled) return;
    this.metrics.shaderSwitches++;
  }

  public recordBufferUpload(): void {
    if (!this.enabled) return;
    this.metrics.bufferUploads++;
  }

  public recordTextureUpload(): void {
    if (!this.enabled) return;
    this.metrics.textureUploads++;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getAverageFrameTime(): number {
    return this.metrics.frameTime / (this.frameCount || 1);
  }

  private resetMetrics(): void {
    this.metrics = {
      frameTime: 0,
      drawCalls: 0,
      triangleCount: 0,
      memoryUsage: 0,
      shaderSwitches: 0,
      bufferUploads: 0,
      textureUploads: 0
    };
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
  }

  public cleanup(): void {
    this.stopMonitoring();
    this.resetMetrics();
    WebGLPerformanceMonitor.instance = null;
  }

  private resetMetrics(): void {
    this.metrics = {
      frameTime: 0,
      drawCalls: 0,
      triangleCount: 0,
      memoryUsage: 0,
      shaderSwitches: 0,
      bufferUploads: 0,
      textureUploads: 0
    };
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
  }
}