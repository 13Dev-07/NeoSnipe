import { useState, useEffect, useRef } from 'react';
// Enhanced imports for WebGL and pattern recognition
import { WebGLPerformanceMonitor } from '../utils/webgl/performance-monitor';
import { PatternCache } from '../utils/pattern-cache';
import { Pattern } from '../types/pattern-recognition';
import { PatternAnalysisInput, PatternAnalysisResult } from '../types/pattern-analysis';
import { WebGLResourceManager } from '../utils/webgl/resource-manager';
import { WebGLContextLostError, PatternRecognitionError } from '../types/errors';
import { PatternRecognizer } from '../utils/pattern-recognition';
import { PricePoint } from '../shared/constants';

interface PatternRecognitionHook {
  patterns: Pattern[];
  loading: boolean;
  error: Error | null;
  isInitialized: boolean;
  analyzePatterns: (priceHistory: PricePoint[]) => Promise<PatternAnalysisResult>;
  cleanup: () => void;
}

export const usePatternRecognition = (gl: WebGL2RenderingContext | null): PatternRecognitionHook => {
  const refs = {
    recognizer: useRef<PatternRecognizer | null>(null),
    resourceManager: useRef<WebGLResourceManager | null>(null),
    performanceMonitor: useRef<WebGLPerformanceMonitor | null>(null),
    patternCache: useRef<PatternCache | null>(null),
    abortController: useRef<AbortController | null>(null)
  };

  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!gl) return;

    try {
      refs.resourceManager.current = new WebGLResourceManager(gl);
      refs.performanceMonitor.current = WebGLPerformanceMonitor.getInstance(gl);
      refs.patternCache.current = new PatternCache();
      refs.recognizer.current = new PatternRecognizer(gl);
      refs.abortController.current = new AbortController();

      refs.performanceMonitor.current.startMonitoring();
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize pattern recognition'));
      setIsInitialized(false);
    }

    return () => cleanup();
  }, [gl]);

  useEffect(() => {
    if (!gl) return;

    const handleContextLost = (event: WebGLContextEvent) => {
      event.preventDefault();
      setError(new WebGLContextLostError());
      cleanup();
    };

    const handleContextRestored = () => {
      setError(null);
      if (refs.performanceMonitor.current) {
        refs.performanceMonitor.current.startMonitoring();
      }
    };

    gl.canvas.addEventListener('webglcontextlost', handleContextLost);
    gl.canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      gl.canvas.removeEventListener('webglcontextlost', handleContextLost);
      gl.canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  const cleanup = () => {
    refs.abortController.current?.abort();
    
    if (refs.performanceMonitor.current) {
      refs.performanceMonitor.current.stopMonitoring();
    }
    
    if (refs.patternCache.current) {
      refs.patternCache.current.cleanup();
    }
    
    if (refs.resourceManager.current) {
      refs.resourceManager.current.dispose();
    }
    
    if (refs.recognizer.current?.cleanup) {
      refs.recognizer.current.cleanup();
    }

    Object.values(refs).forEach(ref => {
      ref.current = null;
    });

    setIsInitialized(false);
  };

  const analyzePatterns = async (priceHistory: PricePoint[]): Promise<PatternAnalysisResult> => {
    if (!isInitialized || !refs.recognizer.current) {
      throw new PatternRecognitionError('Pattern recognition not initialized');
    }

    setLoading(true);

    try {
      const input: PatternAnalysisInput = {
        data: new Float32Array(priceHistory.map(p => p.price)),
        timeframe: priceHistory[priceHistory.length - 1].timestamp - priceHistory[0].timestamp,
      };

      refs.performanceMonitor.current?.beginFrame();
      
      const cacheKey = JSON.stringify(input);
      if (input.options?.useCache !== false) {
        const cachedResult = refs.patternCache.current?.get(cacheKey);
        if (cachedResult) {
          setPatterns(cachedResult);
          return {
            patterns: cachedResult,
            metadata: {
              cacheHit: true,
              computeTime: 0,
              timestamp: Date.now()
            }
          };
        }
      }

      const startTime = performance.now();
      const patterns = await refs.recognizer.current.analyze(input, {
        signal: refs.abortController.current?.signal
      });
      const computeTime = performance.now() - startTime;

      if (input.options?.useCache !== false) {
        refs.patternCache.current?.set(cacheKey, patterns);
      }
      
      const performanceMetrics = refs.performanceMonitor.current?.getMetrics();
      refs.performanceMonitor.current?.endFrame();

      setPatterns(patterns);
      return {
        patterns,
        metadata: {
          cacheHit: false,
          computeTime,
          performanceMetrics,
          timestamp: Date.now()
        }
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to analyze patterns');
      setError(error);
      setPatterns([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    patterns,
    loading,
    error,
    analyzePatterns,
    isInitialized,
    cleanup
  };
};