import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import FlowerAnimation from '../../../visual_design/sacred_patterns/FlowerOfLife/FlowerAnimation';
import { WebGLRenderer } from '../../../visual_design/sacred_patterns/FlowerOfLife/WebGLRenderer';

interface SacredGeometryContextType {
  flowerAnimation: FlowerAnimation | null;
  renderer: WebGLRenderer | null;
  isInitialized: boolean;
}

const SacredGeometryContext = createContext<SacredGeometryContextType>({
  flowerAnimation: null,
  renderer: null,
  isInitialized: false,
});

export const useSacredGeometry = () => useContext(SacredGeometryContext);

interface Props {
  children: React.ReactNode;
}

export const SacredGeometryProvider: React.FC<Props> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const flowerAnimationRef = useRef<FlowerAnimation | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);

  useEffect(() => {
    const initializeSacredGeometry = async () => {
      try {
        // Initialize WebGL2 renderer with enhanced features
        const canvas = document.createElement('canvas');
        canvas.id = 'sacred-geometry-canvas';
        document.body.appendChild(canvas);
        
        const gl = canvas.getContext('webgl2');
        if (!gl) {
          throw new Error('WebGL2 not available');
        }
        
        const renderer = new WebGLRenderer(canvas, {
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          precision: 'highp',
          premultipliedAlpha: false,
          preserveDrawingBuffer: false
        });
        rendererRef.current = renderer;

        // Initialize Flower Animation with optimized configuration
        const animation = new FlowerAnimation(renderer, {
          energyFlow: true,
          harmonicResonance: true,
          transformations: ['spiral', 'golden', 'fibonacci', 'vortex'],
          renderQuality: 'adaptive',
          optimizationLevel: 'performance',
          initialScale: window.innerWidth > 768 ? 1 : 0.8,
          useInstancing: true,
          useMorphing: true,
          useProgressive: true,
          cachePatterns: true,
          useGeometryBatching: true
        });
        
        flowerAnimationRef.current = animation;
        
        // Start optimized animation loop with pattern transitions
        renderer.startAnimation({
          useRAF: true,
          useWorker: true,
          batchSize: 1000,
          transitionDuration: 1000,
          easing: 'easeInOutCubic'
        });
        setIsInitialized(true);

      } catch (error) {
        console.error('Failed to initialize sacred geometry:', error);
        // Implement fallback visualization
      }
    };

    initializeSacredGeometry();

    return () => {
      // Cleanup
      if (flowerAnimationRef.current) {
        flowerAnimationRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      const canvas = document.getElementById('sacred-geometry-canvas');
      if (canvas) {
        document.body.removeChild(canvas);
      }
    };
  }, []);

  return (
    <SacredGeometryContext.Provider 
      value={{
        flowerAnimation: flowerAnimationRef.current,
        renderer: rendererRef.current,
        isInitialized,
      }}
    >
      {children}
    </SacredGeometryContext.Provider>
  );
};