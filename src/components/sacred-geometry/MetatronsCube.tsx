import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { handleWebGLError } from '../../utils/webgl/WebGLErrorHandler';
import { useWebGLContext } from '../../hooks/useWebGLContext';
import { useSacredGeometry } from './SacredGeometryProvider';

interface MetatronsCubeProps {
  size: number;
  color: [number, number, number, number];
  rotation: number;
}

export const MetatronsCube: React.FC<MetatronsCubeProps> = ({
  size,
  color,
  rotation
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gl, isContextLost } = useWebGLContext();
  const { scale } = useSacredGeometry();

  // Memoize geometry calculations
  const geometry = useMemo(() => {
    const r = size / 2;
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    
    // Calculate vertices for Metatron's Cube
    const vertices = [
      // Center point
      0, 0, 0,
      
      // Inner circle points (scaled by phi)
      r/phi * Math.cos(0), r/phi * Math.sin(0), 0,
      r/phi * Math.cos(2*Math.PI/6), r/phi * Math.sin(2*Math.PI/6), 0,
      r/phi * Math.cos(4*Math.PI/6), r/phi * Math.sin(4*Math.PI/6), 0,
      r/phi * Math.cos(6*Math.PI/6), r/phi * Math.sin(6*Math.PI/6), 0,
      r/phi * Math.cos(8*Math.PI/6), r/phi * Math.sin(8*Math.PI/6), 0,
      r/phi * Math.cos(10*Math.PI/6), r/phi * Math.sin(10*Math.PI/6), 0,
      
      // Outer circle points
      r * Math.cos(0), r * Math.sin(0), 0,
      r * Math.cos(2*Math.PI/6), r * Math.sin(2*Math.PI/6), 0,
      r * Math.cos(4*Math.PI/6), r * Math.sin(4*Math.PI/6), 0,
      r * Math.cos(6*Math.PI/6), r * Math.sin(6*Math.PI/6), 0,
      r * Math.cos(8*Math.PI/6), r * Math.sin(8*Math.PI/6), 0,
      r * Math.cos(10*Math.PI/6), r * Math.sin(10*Math.PI/6), 0
    ];

    // Generate indices for lines
    const indices = [
      // Connect center to inner circle
      0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6,
      
      // Connect inner circle points
      1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 1,
      
      // Connect inner to outer circle
      1, 7, 2, 8, 3, 9, 4, 10, 5, 11, 6, 12,
      
      // Connect outer circle points
      7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 7
    ];

    return { vertices, indices };
  }, [size]);

  // Optimized render function
  const render = useCallback(() => {
    if (!gl || isContextLost) return;

    try {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Draw lines using a single draw call
      gl.drawElements(
        gl.LINES,
        geometry.indices.length,
        gl.UNSIGNED_SHORT,
        0
      );

    } catch (error) {
      handleWebGLError(error as Error, gl);
    }
  }, [gl, isContextLost, geometry]);

  // Setup WebGL resources
  useEffect(() => {
    if (!gl || !canvasRef.current) return;

    try {
      // Initialize buffers
      const vertexBuffer = gl.createBuffer();
      const indexBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), gl.STATIC_DRAW);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);

      // Cleanup
      return () => {
        gl.deleteBuffer(vertexBuffer);
        gl.deleteBuffer(indexBuffer);
      };
    } catch (error) {
      handleWebGLError(error as Error, gl);
    }
  }, [gl, geometry]);

  // Animation loop with rotation
  useEffect(() => {
    if (!gl || isContextLost) return;

    let animationFrameId: number;
    const animate = () => {
      render();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gl, isContextLost, render]);

  return (
    <ErrorBoundary
      fallback={<div>Error rendering Metatron's Cube</div>}
      onReset={() => {
        // Reset logic here
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: isContextLost ? 'none' : 'block'
        }}
      />
    </ErrorBoundary>
  );
};

export default MetatronsCube;