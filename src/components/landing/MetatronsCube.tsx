import React, { useEffect, useRef, useMemo } from 'react';
import { initMetatronsCube } from '../../utils/sacred-geometry';
import { ParticleSystem } from '../../utils/particle-system';
import { WebGLResourcePool } from '../../utils/webgl/resource-pool';
import { SACRED_RATIOS } from '../../shared/constants';

import { MetatronsCubeProps } from '../../types/metatrons-cube';

export const MetatronsCube: React.FC<MetatronsCubeProps> = ({
  rotation = 'continuous',
  duration = 89, // Fibonacci number
  energyFlow = 'spiral',
  mouseFollow = true,
  particleAttraction = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const resourcePoolRef = useRef<WebGLResourcePool | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Memoize configuration to prevent unnecessary re-renders
  const config = useMemo(() => ({
    rotation,
    duration,
    energyFlow,
    mouseFollow,
    particleAttraction,
    phi: SACRED_RATIOS.PHI,
  }), [rotation, duration, energyFlow, mouseFollow, particleAttraction]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      console.error('WebGL2 not supported');
      return;
    }
    
    // Initialize WebGL resource pool
    resourcePoolRef.current = new WebGLResourcePool(gl);

    // Enable required WebGL features
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    const { cleanup } = initMetatronsCube(gl, config);
    particleSystemRef.current = new ParticleSystem(gl);

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = Math.floor(container.clientWidth * dpr);
      const displayHeight = Math.floor(container.clientHeight * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, displayWidth, displayHeight);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!particleSystemRef.current || !canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      particleSystemRef.current.setMousePosition(x, y);
    };

    const animate = (time: number) => {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (particleSystemRef.current) {
        particleSystemRef.current.update(deltaTime);
      }

      requestAnimationFrame(animate);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    requestAnimationFrame(animate);

    return () => {
      cleanup();
      
      // Clean up WebGL resources
      if (resourcePoolRef.current) {
        resourcePoolRef.current.cleanup();
      }
      
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [config]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          background: 'transparent',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
};
