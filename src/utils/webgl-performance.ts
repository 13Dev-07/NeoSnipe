import { useEffect, useRef } from 'react';
import { WebGLRenderer } from 'three';

interface WebGLPerformanceOptions {
  targetFPS?: number;
  adaptiveQuality?: boolean;
  monitorGPU?: boolean;
}

export const useWebGLPerformance = (
  renderer: WebGLRenderer | null,
  options: WebGLPerformanceOptions = {}
) => {
  const {
    targetFPS = 60,
    adaptiveQuality = true,
    monitorGPU = true,
  } = options;

  const frameTimeRef = useRef<number[]>([]);
  const qualityLevel = useRef(1);

  useEffect(() => {
    if (!renderer) return;

    const measurePerformance = () => {
      const currentTime = performance.now();
      const frameTimes = frameTimeRef.current;

      // Keep last 60 frame times
      if (frameTimes.length >= 60) {
        frameTimes.shift();
      }
      frameTimes.push(currentTime);

      // Calculate average FPS
      if (frameTimes.length > 1) {
        const elapsed = frameTimes[frameTimes.length - 1] - frameTimes[0];
        const fps = (1000 * (frameTimes.length - 1)) / elapsed;

        // Adjust quality if needed
        if (adaptiveQuality) {
          if (fps < targetFPS * 0.8 && qualityLevel.current > 0.5) {
            qualityLevel.current *= 0.8;
            renderer.setPixelRatio(window.devicePixelRatio * qualityLevel.current);
          } else if (fps > targetFPS * 0.95 && qualityLevel.current < 1) {
            qualityLevel.current = Math.min(1, qualityLevel.current * 1.2);
            renderer.setPixelRatio(window.devicePixelRatio * qualityLevel.current);
          }
        }

        // Log performance warnings
        if (fps < targetFPS * 0.6) {
          console.warn(`Low FPS detected: ${fps.toFixed(1)}`);
        }
      }
    };

    const timer = setInterval(measurePerformance, 1000);

    // Monitor for context loss
    const handleContextLost = (event: WebGLContextEvent) => {
      event.preventDefault();
      console.error('WebGL context lost');
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      qualityLevel.current = 1;
      renderer.setPixelRatio(window.devicePixelRatio);
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      clearInterval(timer);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [renderer, targetFPS, adaptiveQuality]);

  return {
    getCurrentQualityLevel: () => qualityLevel.current,
    resetQuality: () => {
      if (renderer) {
        qualityLevel.current = 1;
        renderer.setPixelRatio(window.devicePixelRatio);
      }
    },
  };
};