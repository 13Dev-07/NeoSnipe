import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { handleWebGLError } from '../../utils/webgl/WebGLErrorHandler';
import { useWebGLContext } from '../../hooks/useWebGLContext';
import { useSacredGeometry } from './SacredGeometryProvider';

interface TorusEnergyFlowProps {
  radius: number;
  tubeRadius: number;
  segments: number;
  rotation: number;
  color: [number, number, number, number];
}

export const TorusEnergyFlow: React.FC<TorusEnergyFlowProps> = ({
  radius,
  tubeRadius,
  segments,
  rotation,
  color
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gl, isContextLost } = useWebGLContext();
  const { scale } = useSacredGeometry();
  
  // Memoize vertices and indices calculations
  const geometry = useMemo(() => {
    const vertices: number[] = [];
    const indices: number[] = [];
    const tubularSegments = segments;
    const radialSegments = Math.floor(segments / 2);

    // Pre-calculate trigonometric values
    const cosValues = new Float32Array(tubularSegments + 1);
    const sinValues = new Float32Array(tubularSegments + 1);
    for (let i = 0; i <= tubularSegments; i++) {
      const angle = (i / tubularSegments) * Math.PI * 2;
      cosValues[i] = Math.cos(angle);
      sinValues[i] = Math.sin(angle);
    }

    // Generate vertices
    for (let i = 0; i <= tubularSegments; i++) {
      const u = i / tubularSegments * Math.PI * 2;
      const centerX = radius * cosValues[i];
      const centerY = radius * sinValues[i];

      for (let j = 0; j <= radialSegments; j++) {
        const v = j / radialSegments * Math.PI * 2;
        const cosV = Math.cos(v);
        const sinV = Math.sin(v);

        // Calculate vertex position
        const x = (radius + tubeRadius * cosV) * cosValues[i];
        const y = (radius + tubeRadius * cosV) * sinValues[i];
        const z = tubeRadius * sinV;

        vertices.push(x, y, z);
      }
    }

    // Generate indices for triangles
    for (let i = 0; i < tubularSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const base = (radialSegments + 1) * i + j;
        const next = (radialSegments + 1) * ((i + 1) % tubularSegments) + j;

        indices.push(
          base, base + 1, next,
          next, base + 1, next + 1
        );
      }
    }

    return { vertices, indices };
  }, [radius, tubeRadius, segments]);

  // Optimized render function using WebGL instancing
  const render = useCallback(() => {
    if (!gl || isContextLost) return;

    try {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Apply transformations
      const modelMatrix = new Float32Array(16);
      // ... Matrix calculations here ...

      // Draw using instancing for better performance
      gl.drawElementsInstanced(
        gl.TRIANGLES,
        geometry.indices.length,
        gl.UNSIGNED_SHORT,
        0,
        4 // Number of instances
      );

    } catch (error) {
      handleWebGLError(error as Error, gl);
    }
  }, [gl, isContextLost, geometry, scale, rotation]);

  // Setup WebGL resources
  useEffect(() => {
    if (!gl || !canvasRef.current) return;

    try {
      // Set up WebGL state
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // Create and bind buffers
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), gl.STATIC_DRAW);

      const indexBuffer = gl.createBuffer();
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

  // Animation loop
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
      fallback={<div>Error rendering Torus Energy Flow</div>}
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

export default TorusEnergyFlow;