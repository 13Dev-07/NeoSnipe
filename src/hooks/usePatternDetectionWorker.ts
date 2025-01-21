import { useEffect, useRef, useCallback } from 'react';
import { PerformanceMetrics } from './usePerformanceMonitor';

interface PatternWorkerResult {
  pattern: string;
  confidence: number;
  geometricRatios: { ratio: number; significance: number }[];
  computeTime: number;
  timestamp: number;
}

interface PatternWorkerError {
  error: string;
  timestamp: number;
}

interface UsePatternDetectionWorkerProps {
  onResult: (result: PatternWorkerResult) => void;
  onError: (error: PatternWorkerError) => void;
  onPerformanceMetrics?: (metrics: Partial<PerformanceMetrics>) => void;
}

export function usePatternDetectionWorker({
  onResult,
  onError,
  onPerformanceMetrics
}: UsePatternDetectionWorkerProps) {
  const workerRef = useRef<Worker | null>(null);
  const pendingAnalysisRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/pattern-detection.worker.ts', import.meta.url)
    );

    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, data, error } = e.data;
      
      pendingAnalysisRef.current.delete(data.timestamp);

      if (type === 'PATTERN_RESULT') {
        onResult(data);
        if (onPerformanceMetrics) {
          onPerformanceMetrics({
            computeTime: data.computeTime,
            gpuUtilization: pendingAnalysisRef.current.size > 0 ? 1 : 0
          });
        }
      } else if (type === 'ERROR') {
        onError({ error, timestamp: data.timestamp });
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingAnalysisRef.current.clear();
    };
  }, [onResult, onError, onPerformanceMetrics]);

  const analyzePattern = useCallback((prices: number[], windowSize?: number) => {
    if (!workerRef.current) return;

    const timestamp = Date.now();
    pendingAnalysisRef.current.add(timestamp);

    workerRef.current.postMessage({
      type: 'ANALYZE_PATTERN',
      data: {
        prices,
        timestamp,
        windowSize
      }
    });
  }, []);

  const cancelPendingAnalysis = useCallback(() => {
    pendingAnalysisRef.current.clear();
  }, []);

  return {
    analyzePattern,
    cancelPendingAnalysis,
    hasPendingAnalysis: pendingAnalysisRef.current.size > 0
  };
}