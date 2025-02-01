import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSacredGeometry } from '../sacred-geometry/SacredGeometryProvider';
import { SACRED_RATIOS, PERFORMANCE_THRESHOLDS } from '@/shared/constants';
import { createSacredGrid, calculateHarmonicResonance } from '@/utils/geometric-helpers';

const { PHI } = SACRED_RATIOS;

interface Props {
  patternType?: 'flower' | 'harmonic' | 'protection';
}

export const PatternShowcase: React.FC<Props> = ({ patternType = 'flower' }) => {
  const { flowerAnimation, isInitialized } = useSacredGeometry();
  const containerRef = useRef<HTMLDivElement>(null);
  const performanceMetricsRef = useRef({
    lastFrameTime: 0,
    frameCount: 0,
    fps: 0,
  });

  useEffect(() => {
    if (!isInitialized || !flowerAnimation || !containerRef.current) return;

    let rafId: number;
    let lastTime = performance.now();
    const targetFPS = PERFORMANCE_THRESHOLDS.TARGET_FPS;
    const minFPS = PERFORMANCE_THRESHOLDS.MIN_FPS;

    const updatePerformance = (currentTime: number) => {
      const deltaTime = currentTime - performanceMetricsRef.current.lastFrameTime;
      performanceMetricsRef.current.frameCount++;

      if (currentTime - lastTime >= 1000) {
        performanceMetricsRef.current.fps = performanceMetricsRef.current.frameCount;
        performanceMetricsRef.current.frameCount = 0;
        lastTime = currentTime;

        // Adjust quality if needed
        if (performanceMetricsRef.current.fps < minFPS) {
          flowerAnimation.optimizeRendering();
        }
      }

      performanceMetricsRef.current.lastFrameTime = currentTime;
    };

    const animate = () => {
      const currentTime = performance.now();
      
      // Update pattern based on type
      const resonance = calculateHarmonicResonance(PHI, 1, currentTime / 1000);
      
      flowerAnimation.transformPattern({
        type: patternType,
        intensity: 0.8 + resonance * 0.2,
        duration: 1000 / targetFPS
      });

      updatePerformance(currentTime);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          rafId = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(rafId);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [isInitialized, flowerAnimation, patternType]);

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-[600px] overflow-hidden bg-deep-space"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: PHI * 0.5 }}
    >
      {/* Sacred Geometry Overlay */}
      <div className="absolute inset-0 sacred-geometry-bg opacity-30" />

      {/* Interactive Elements */}
      <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="aspect-square rounded-lg bg-gradient-to-br from-neon-teal/10 to-cosmic-purple/10 backdrop-blur-sm border border-neon-teal/20"
            whileHover={{
              scale: 1.05,
              borderColor: 'rgba(0, 255, 204, 0.4)',
            }}
            animate={{
              y: [0, 10 * Math.sin(i * PHI), 0],
            }}
            transition={{
              y: {
                duration: PHI * 2,
                delay: i * 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          />
        ))}
      </div>

      {/* Energy Flow Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ filter: 'blur(1px)' }}
      >
        <motion.path
          d={createSacredGrid(800, 600, 100)
            .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`)
            .join(' ')}
          stroke="url(#gridGradient)"
          strokeWidth="0.5"
          strokeOpacity="0.3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: PHI * 2,
            ease: 'linear',
            repeat: Infinity,
          }}
        />
        <defs>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--neon-teal)" />
            <stop offset="50%" stopColor="var(--cosmic-purple)" />
            <stop offset="100%" stopColor="var(--neon-teal)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Performance Monitor (Dev Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 text-xs text-neon-teal/60 font-mono">
          FPS: {performanceMetricsRef.current.fps}
        </div>
      )}
    </motion.div>
  );
};