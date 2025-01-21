import { useRef, useEffect, useState, useCallback } from 'react';
import { vec2, vec3 } from 'gl-matrix';
import {
  SacredPatternConfig,
  GeometryData,
  createFlowerOfLifeGeometry,
  createSriYantraGeometry,
  createMetatronsCubeGeometry,
  SacredPatternAnimator,
  SACRED_RATIOS
} from '../utils/sacred-geometry';
import { CacheManager } from '../utils/cache-manager';
import { PerformanceOptimizer } from '../utils/performance-optimizer';

interface SacredGeometryState {
  geometry: GeometryData | null;
  animator: SacredPatternAnimator | null;
  error: Error | null;
  isLoading: boolean;
  performance: {
    fps: number;
    frameTime: number;
    memoryUsage: number;
  };
}

const geometryCache = new CacheManager<GeometryData>(50); // 50MB cache limit

export function useSacredGeometry(config: SacredPatternConfig) {
  const [state, setState] = useState<SacredGeometryState>({
    geometry: null,
    animator: null,
    error: null,
    isLoading: true,
    performance: {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0
    }
  });

  const glContextRef = useRef<WebGL2RenderingContext | null>(null);
  const optimizerRef = useRef<PerformanceOptimizer | null>(null);
  const shaderManagerRef = useRef<ShaderManager | null>(null);
  const frameIdRef = useRef<number>(0);

  const initializeWebGL = useCallback(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (!gl) throw new Error('WebGL 2 not supported');
      
      glContextRef.current = gl;
      optimizerRef.current = new PerformanceOptimizer(gl);
      shaderManagerRef.current = new ShaderManager(gl);
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  }, []);

  const createGeometry = useCallback(() => {
    const cacheKey = JSON.stringify(config);
    const cachedGeometry = geometryCache.get(cacheKey);
    
    if (cachedGeometry) {
      setState(prev => ({
        ...prev,
        geometry: cachedGeometry,
        isLoading: false
      }));
      return;
    }

    try {
      let geometry: GeometryData;
      
      switch (config.type) {
        case 'flowerOfLife':
          geometry = createFlowerOfLifeGeometry(config);
          break;
        case 'sriYantra':
          geometry = createSriYantraGeometry(config);
          break;
        case 'metatronsCube':
          geometry = createMetatronsCubeGeometry(config);
          break;
        case 'torus':
          // To be implemented
          throw new Error('Torus pattern not implemented yet');
        default:
          throw new Error('Invalid pattern type');
      }

      // Estimate memory size (rough calculation)
      const memorySize = 
        geometry.vertices.byteLength +
        geometry.normals.byteLength +
        (geometry.indices?.byteLength || 0) +
        (geometry.uvs?.byteLength || 0);

      geometryCache.set(cacheKey, geometry, memorySize);

      setState(prev => ({
        ...prev,
        geometry,
        animator: new SacredPatternAnimator(geometry),
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error, isLoading: false }));
    }
  }, [config]);

  const animate = useCallback((time: number) => {
    if (!state.animator || !optimizerRef.current) return;

    optimizerRef.current.beginFrame();

    const updatedGeometry = state.animator.update(time);
    const metrics = optimizerRef.current.getPerformanceMetrics();

    setState(prev => ({
      ...prev,
      geometry: updatedGeometry,
      performance: {
        fps: 1000 / metrics.frameTime,
        frameTime: metrics.frameTime,
        memoryUsage: metrics.memoryUsage
      }
    }));

    optimizerRef.current.endFrame();
    frameIdRef.current = requestAnimationFrame(animate);
  }, [state.animator]);

  useEffect(() => {
    initializeWebGL();
    createGeometry();

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      // Clean up WebGL resources
      if (glContextRef.current) {
        const gl = glContextRef.current;
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    };
  }, [config, initializeWebGL, createGeometry]);

  useEffect(() => {
    if (config.animate && state.geometry) {
      frameIdRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [config.animate, state.geometry, animate]);

  return {
    ...state,
    updateConfig: (newConfig: Partial<SacredPatternConfig>) => {
      setState(prev => ({ ...prev, isLoading: true }));
      createGeometry();
    }
  };
}