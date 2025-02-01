type PerformanceMetric = {
  timestamp: number;
  duration: number;
  type: string;
  details?: Record<string, any>;
};

export class WebGLPerformanceMonitor {
  private static instance: WebGLPerformanceMonitor;
  private metrics: PerformanceMetric[];
  private frameStartTime: number;
  private frameCount: number;
  private fps: number;
  private enabled: boolean;
  private frameCallback?: (fps: number) => void;

  private constructor() {
    this.metrics = [];
    this.frameStartTime = performance.now();
    this.frameCount = 0;
    this.fps = 0;
    this.enabled = false;
  }

  public static getInstance(): WebGLPerformanceMonitor {
    if (!WebGLPerformanceMonitor.instance) {
      WebGLPerformanceMonitor.instance = new WebGLPerformanceMonitor();
    }
    return WebGLPerformanceMonitor.instance;
  }

  public enable(): void {
    this.enabled = true;
    this.frameStartTime = performance.now();
    this.frameCount = 0;
  }

  public disable(): void {
    this.enabled = false;
  }

  public setFrameCallback(callback: (fps: number) => void): void {
    this.frameCallback = callback;
  }

  public startFrame(): void {
    if (!this.enabled) return;

    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.frameStartTime;

    if (elapsed >= 1000) { // Update FPS every second
      this.fps = (this.frameCount * 1000) / elapsed;
      this.frameCount = 0;
      this.frameStartTime = now;

      if (this.frameCallback) {
        this.frameCallback(this.fps);
      }
    }
  }

  public recordMetric(type: string, duration: number, details?: Record<string, any>): void {
    if (!this.enabled) return;

    this.metrics.push({
      timestamp: performance.now(),
      duration,
      type,
      details
    });

    // Keep only last 1000 metrics to prevent memory bloat
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  public measureOperation<T>(type: string, operation: () => T, details?: Record<string, any>): T {
    if (!this.enabled) {
      return operation();
    }

    const start = performance.now();
    const result = operation();
    const duration = performance.now() - start;

    this.recordMetric(type, duration, details);
    return result;
  }

  public async measureAsyncOperation<T>(
    type: string, 
    operation: Promise<T>, 
    details?: Record<string, any>
  ): Promise<T> {
    if (!this.enabled) {
      return operation;
    }

    const start = performance.now();
    const result = await operation;
    const duration = performance.now() - start;

    this.recordMetric(type, duration, details);
    return result;
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getMetricsByType(type: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.type === type);
  }

  public getAverageMetric(type: string): number {
    const metrics = this.getMetricsByType(type);
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, metric) => acc + metric.duration, 0);
    return sum / metrics.length;
  }

  public getCurrentFPS(): number {
    return this.fps;
  }

  public clearMetrics(): void {
    this.metrics = [];
  }

  public getPerformanceReport(): Record<string, any> {
    if (!this.enabled) {
      return { enabled: false };
    }

    const uniqueTypes = new Set(this.metrics.map(m => m.type));
    const report: Record<string, any> = {
      enabled: true,
      currentFPS: this.fps,
      totalMetrics: this.metrics.length,
      averages: {}
    };

    uniqueTypes.forEach(type => {
      report.averages[type] = this.getAverageMetric(type);
    });

    return report;
  }
}

// Export singleton instance
export const webGLPerformanceMonitor = WebGLPerformanceMonitor.getInstance();