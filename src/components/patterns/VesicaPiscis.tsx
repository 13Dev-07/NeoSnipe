import React, { useEffect, useRef, useMemo } from 'react';
import { initSacredPattern } from '../../utils/sacred-geometry';
import { ParticleSystem } from '../../utils/particle-system';
import { SACRED_RATIOS } from '../../shared/constants';
import { VesicaPiscisProps } from '../../types/sacred-geometry/patterns';
import { WebGLResourceManager } from '../../utils/webgl-resource-manager';
import { ShaderManager } from '../../utils/webgl/shader-manager';

export const VesicaPiscis: React.FC<VesicaPiscisProps> = ({
  rotation = 'static',
  duration = 55, // Fibonacci number
  energyFlow = 'balanced',
  intensity = 1.0,
  color = '#3366FF',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const resourceManagerRef = useRef<WebGLResourceManager | null>(null);
  const shaderManagerRef = useRef<ShaderManager | null>(null);
  const lastTimeRef = useRef<number>(0);

  const config = useMemo(() => ({
    rotation,
    duration,
    energyFlow,
    intensity,
    color,
    phi: SACRED_RATIOS.PHI,
  }), [rotation, duration, energyFlow, intensity, color]);

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

    // Initialize managers
    resourceManagerRef.current = new WebGLResourceManager(gl);
    shaderManagerRef.current = new ShaderManager(gl);
    particleSystemRef.current = new ParticleSystem(gl);

    // Enable WebGL features
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    const { cleanup } = initSacredPattern(gl, config, 'vesica-piscis');

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
    requestAnimationFrame(animate);

    return () => {
      cleanup();
      window.removeEventListener('resize', handleResize);
      resourceManagerRef.current?.dispose();
      particleSystemRef.current?.dispose();
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

export default VesicaPiscis;