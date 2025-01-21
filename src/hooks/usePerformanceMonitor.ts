import { useState, useEffect, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  vertexCount: number;
  resourceUtilization: {
    cpu: number;
    gpu: number;
    memory: number;
  };
}

export function usePerformanceMonitor(sampleSize: number = 60) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const frameTimestamps = useRef<number[]>([]);
  const rafId = useRef<number>();
  const isMonitoring = useRef(false);

  const calculateMetrics = useCallback(() => {
    const now = performance.now();
    frameTimestamps.current.push(now);

    // Keep only the last 'sampleSize' frames
    if (frameTimestamps.current.length > sampleSize) {
      frameTimestamps.current.shift();
    }

    const timestamps = frameTimestamps.current;
    if (timestamps.length >= 2) {
      const framesTimes = timestamps.slice(1).map((t, i) => t - timestamps[i]);
      const averageFrameTime = framesTimes.reduce((a, b) => a + b, 0) / framesTimes.length;
      const fps = 1000 / averageFrameTime;

      // Get memory usage if available
      let memoryUsage = 0;
      if (performance.memory) {
        memoryUsage = (performance as any).memory.usedJSHeapSize;
      }

      setMetrics({
        fps,
        frameTime: averageFrameTime,
        memoryUsage,
        drawCalls: 0, // Would be set by WebGL context
        vertexCount: 0, // Would be set by geometry system
        resourceUtilization: {
          cpu: 0, // Would require native API access
          gpu: 0, // Would require WebGL timing queries
          memory: memoryUsage / ((performance as any).memory?.jsHeapSizeLimit || 1)
        }
      });
    }

    if (isMonitoring.current) {
      rafId.current = requestAnimationFrame(calculateMetrics);
    }
  }, [sampleSize]);

  const startMonitoring = useCallback(() => {
    isMonitoring.current = true;
    frameTimestamps.current = [];
    calculateMetrics();
  }, [calculateMetrics]);

  const stopMonitoring = useCallback(() => {
    isMonitoring.current = false;
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    metrics,
    startMonitoring,
    stopMonitoring
  };
}