import React, { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { handleWebGLError, setupContextLossHandler } from '../utils/webgl/WebGLErrorHandler';
import { ResourcePool } from '../utils/webgl/resource-pool';

interface OptimizedWebGLBackgroundProps {
  width: number;
  height: number;
  pattern: string;
}

export const OptimizedWebGLBackground: React.FC<OptimizedWebGLBackgroundProps> = ({
  width,
  height,
  pattern
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<WebGLRenderingContext | null>(null);
  const resourcePoolRef = useRef<ResourcePool | null>(null);
  const [isContextLost, setIsContextLost] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize WebGL context with memory-efficient options
    const gl = canvas.getContext('webgl', {
      alpha: false, // Disable alpha if not needed
      depth: false, // Disable depth buffer if not needed
      stencil: false, // Disable stencil buffer if not needed
      antialias: false, // Disable antialiasing for better performance
      preserveDrawingBuffer: false // Don't preserve drawing buffer
    });

    if (!gl) {
      handleWebGLError(new Error('WebGL not supported'), gl!);
      return;
    }

    contextRef.current = gl;

    // Initialize resource pool with strict memory management
    resourcePoolRef.current = new ResourcePool(gl, {
      maxTextureSize: 2048,
      maxBufferSize: 1024 * 1024, // 1MB buffer size limit
      enableAutomaticCleanup: true,
      cleanupInterval: 5000 // Cleanup every 5 seconds
    });

    // Setup context loss handling
    setupContextLossHandler(
      canvas,
      () => {
        setIsContextLost(true);
        // Clean up resources
        resourcePoolRef.current?.cleanup();
      },
      () => {
        setIsContextLost(false);
        // Reinitialize resources
        initializeResources();
      }
    );

    initializeResources();

    return () => {
      // Cleanup resources on unmount
      resourcePoolRef.current?.cleanup();
      resourcePoolRef.current?.dispose();
    };
  }, []);

  const initializeResources = () => {
    const gl = contextRef.current;
    const resourcePool = resourcePoolRef.current;
    
    if (!gl || !resourcePool) return;

    try {
      // Initialize shaders and buffers using resource pool
      resourcePool.initializeShaders(pattern);
      resourcePool.initializeBuffers();
    } catch (error) {
      handleWebGLError(error as Error, gl);
    }
  };

  const render = () => {
    const gl = contextRef.current;
    const resourcePool = resourcePoolRef.current;
    
    if (!gl || !resourcePool || isContextLost) return;

    try {
      gl.viewport(0, 0, width, height);
      resourcePool.render();
    } catch (error) {
      handleWebGLError(error as Error, gl);
    }
  };

  // Main render loop
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      render();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height, pattern, isContextLost]);

  return (
    <ErrorBoundary
      fallback={<div>Error loading WebGL background</div>}
      onReset={() => {
        // Reset logic here
        initializeResources();
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%' }}
      />
    </ErrorBoundary>
  );
};

export default OptimizedWebGLBackground;