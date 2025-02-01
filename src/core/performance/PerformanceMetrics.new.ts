import { ErrorHandler } from '../error/ErrorHandler';
import { ErrorType } from '../error/ErrorTypes';

export interface Metric {
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface MetricSummary {
  average: number;
  min: number;
  max: number;
  current: number;
  samples: number;
}

export interface PerformanceThresholds {
  fpsMin: number;
  frameTimeMax: number;
  memoryMax: number;
  loadTimeMax: number;
  warningThresholdPercent: number;
  criticalThresholdPercent: number;
}

export interface ThresholdViolation {
  type: MetricType;
  value: number;
  threshold: number;
  timestamp: number;
  severity: 'warning' | 'critical';
}

export type MetricType = 
  | 'FPS'
  | 'FRAME_TIME'
  | 'MEMORY_USAGE'
  | 'LOAD_TIME'
  | 'GPU_TIME'
  | 'DRAW_CALLS'
  | 'TEXTURE_MEMORY'
  | 'BUFFER_MEMORY';

export type ThresholdCallback = (violation: ThresholdViolation) => void;

export class PerformanceMetrics {
  private metrics: Map<MetricType, Metric[]> = new Map();
  private thresholds: PerformanceThresholds;
  private windowSize: number;
  private maxSamples: number;
  private errorHandler: ErrorHandler;
  private thresholdCallbacks: Set<ThresholdCallback> = new Set();
  private lastViolationTime: Map<MetricType, number> = new Map();
  private violationCooldown: number = 1000; // Minimum ms between violations

  constructor(
    thresholds: Partial<PerformanceThresholds> = {},
    windowSize: number = 5000,
    maxSamples: number = 1000,
    errorHandler: ErrorHandler
  ) {
    this.thresholds = {
      fpsMin: 30,
      frameTimeMax: 33.33,
      memoryMax: 1024 * 1024 * 1024, // 1GB
      loadTimeMax: 5000,
      warningThresholdPercent: 80,
      criticalThresholdPercent: 90,
      ...thresholds
    };
    this.windowSize = windowSize;
    this.maxSamples = maxSamples;
    this.errorHandler = errorHandler;
  }

  public record(type: MetricType, value: number, metadata?: Record<string, unknown>): void {
    const metric: Metric = {
      value,
      timestamp: Date.now(),
      metadata
    };

    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }

    const metrics = this.metrics.get(type)!;
    metrics.push(metric);

    // Maintain sliding window
    const cutoffTime = Date.now() - this.windowSize;
    while (metrics.length > 0 && metrics[0].timestamp < cutoffTime) {
      metrics.shift();
    }

    // Limit number of samples
    if (metrics.length > this.maxSamples) {
      metrics.shift();
    }

    this.checkThresholds(type, value);
  }

  private checkThresholds(type: MetricType, value: number): void {
    const now = Date.now();
    const lastViolation = this.lastViolationTime.get(type) || 0;
    
    if (now - lastViolation < this.violationCooldown) {
      return;
    }

    let threshold: number;
    let isViolation = false;
    let severity: 'warning' | 'critical' = 'warning';

    switch (type) {
      case 'FPS':
        threshold = this.thresholds.fpsMin;
        isViolation = value < threshold;
        severity = value < threshold * (this.thresholds.criticalThresholdPercent / 100) 
          ? 'critical' 
          : 'warning';
        break;
      case 'FRAME_TIME':
        threshold = this.thresholds.frameTimeMax;
        isViolation = value > threshold;
        severity = value > threshold * (this.thresholds.criticalThresholdPercent / 100) 
          ? 'critical' 
          : 'warning';
        break;
      case 'MEMORY_USAGE':
      case 'TEXTURE_MEMORY':
      case 'BUFFER_MEMORY':
        threshold = this.thresholds.memoryMax;
        isViolation = value > threshold;
        severity = value > threshold * (this.thresholds.criticalThresholdPercent / 100) 
          ? 'critical' 
          : 'warning';
        break;
      case 'LOAD_TIME':
        threshold = this.thresholds.loadTimeMax;
        isViolation = value > threshold;
        severity = value > threshold * (this.thresholds.criticalThresholdPercent / 100) 
          ? 'critical' 
          : 'warning';
        break;
    }

    if (isViolation) {
      const violation: ThresholdViolation = {
        type,
        value,
        threshold,
        timestamp: now,
        severity
      };

      this.lastViolationTime.set(type, now);
      this.notifyThresholdViolation(violation);
      
      if (severity === 'critical') {
        this.errorHandler.handleError(
          new Error(`Performance threshold violation: ${type}`),
          {
            type: ErrorType.PERFORMANCE_ERROR,
            context: {
              metricType: type,
              value,
              threshold,
              severity
            }
          }
        );
      }
    }
  }

  public onThresholdViolation(callback: ThresholdCallback): void {
    this.thresholdCallbacks.add(callback);
  }

  public offThresholdViolation(callback: ThresholdCallback): void {
    this.thresholdCallbacks.delete(callback);
  }

  private notifyThresholdViolation(violation: ThresholdViolation): void {
    this.thresholdCallbacks.forEach(callback => {
      try {
        callback(violation);
      } catch (error) {
        console.error('Error in threshold violation callback:', error);
      }
    });
  }

  public getSummary(type: MetricType): MetricSummary {
    const metrics = this.metrics.get(type) || [];
    if (metrics.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        current: 0,
        samples: 0
      };
    }

    const values = metrics.map(m => m.value);
    return {
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      current: metrics[metrics.length - 1].value,
      samples: metrics.length
    };
  }

  public getMetrics(type: MetricType): Metric[] {
    return [...(this.metrics.get(type) || [])];
  }

  public clearMetrics(type?: MetricType): void {
    if (type) {
      this.metrics.delete(type);
      this.lastViolationTime.delete(type);
    } else {
      this.metrics.clear();
      this.lastViolationTime.clear();
    }
  }

  public updateThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = {
      ...this.thresholds,
      ...thresholds
    };
  }

  public getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }
}