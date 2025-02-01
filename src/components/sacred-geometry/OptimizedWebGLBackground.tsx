import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WebGLPerformanceMonitor } from '../../utils/webgl/performance-monitor';
import { WebGLContextLossHandler } from '../../utils/webgl/context-loss-handler';
import { BrowserCompatibility } from '../../utils/webgl/browser-compatibility';
import { WebGLResourcePool } from '../../utils/webgl/resource-pool';
import flowerOfLifeShader from '../../../shaders/flower-of-life';
import sriYantraShader from '../../../shaders/sri-yantra';

const PHI = 1.618033988749895;

interface WebGLBackgroundProps {
  intensity?: number;
  color?: string;
  particleCount?: number;
}

export const OptimizedWebGLBackground: React.FC<WebGLBackgroundProps> = ({
  intensity = 1,
  color = '#00FFCC',
  particleCount = 5000
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const performanceMonitorRef = useRef<WebGLPerformanceMonitor | null>(null);
  const contextLossHandlerRef = useRef<WebGLContextLossHandler | null>(null);
  const resourcePoolRef = useRef<WebGLResourcePool | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const browserCompat = BrowserCompatibility.getInstance();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Check WebGL support and set fallback mode if needed
    if (!browserCompat.isWebGLAvailable()) {
      setFallbackMode(true);
      const fallbackCanvas = browserCompat.createFallbackRenderer();
      mount.appendChild(fallbackCanvas);
      return;
    }

    // Scene setup with performance monitoring
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    rendererRef.current = renderer;
    
    const pixelRatio = browserCompat.getDevicePixelRatio();
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Adjust settings based on GPU capabilities
    const gpuTier = browserCompat.getGPUTier();
    const maxParticles = gpuTier === 'low' ? 2000 : 
                        gpuTier === 'medium' ? 3500 : 
                        particleCount;
    const useAntialias = gpuTier !== 'low';

    // Initialize performance monitoring and resource pooling
    performanceMonitorRef.current = WebGLPerformanceMonitor.getInstance(renderer.getContext());
    performanceMonitorRef.current.startMonitoring();
    
    // Initialize WebGL resource pool
    resourcePoolRef.current = new WebGLResourcePool(renderer.getContext() as WebGL2RenderingContext);

    // Initialize context loss handling
    contextLossHandlerRef.current = new WebGLContextLossHandler(
      renderer.getContext(),
      () => {
        console.log('WebGL context lost');
      },
      () => {
        console.log('WebGL context restored');
        setupScene();
      }
    );

    // Shader setup with caching
    const shaderKey = Math.random() > 0.5 ? 'flower' : 'sri';
    const selectedShader = shaderKey === 'flower' ? flowerOfLifeShader : sriYantraShader;
    
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
        intensity: { value: intensity },
        baseColor: { value: new THREE.Color(color) }
      },
      vertexShader: selectedShader.vertexShader,
      fragmentShader: selectedShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    // Optimized particle system with instancing
    const particleInstances = Math.min(maxParticles, 10000); // Cap for performance
    const instancedGeometry = new THREE.InstancedBufferGeometry();
    const baseGeometry = new THREE.PlaneGeometry(0.1, 0.1);
    
    instancedGeometry.index = baseGeometry.index;
    instancedGeometry.attributes = baseGeometry.attributes;

    const instancePositions = new Float32Array(particleInstances * 3);
    const instanceScales = new Float32Array(particleInstances);
    const instanceOpacities = new Float32Array(particleInstances);

    for (let i = 0; i < particleInstances; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      instancePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      instancePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      instancePositions[i3 + 2] = radius * Math.cos(phi);
      
      instanceScales[i] = Math.random() * 2;
      instanceOpacities[i] = Math.random();
    }

    instancedGeometry.setAttribute('instancePosition', 
      new THREE.InstancedBufferAttribute(instancePositions, 3));
    instancedGeometry.setAttribute('instanceScale', 
      new THREE.InstancedBufferAttribute(instanceScales, 1));
    instancedGeometry.setAttribute('instanceOpacity', 
      new THREE.InstancedBufferAttribute(instanceOpacities, 1));

    const particlesMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute vec3 instancePosition;
        attribute float instanceScale;
        attribute float instanceOpacity;
        varying float vOpacity;
        
        void main() {
          vOpacity = instanceOpacity;
          vec3 pos = position * instanceScale + instancePosition;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        uniform vec3 color;
        
        void main() {
          gl_FragColor = vec4(color, vOpacity * 0.6);
        }
      `,
      uniforms: {
        color: { value: new THREE.Color(color) }
      },
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Mesh(instancedGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 20;

    // Optimized animation loop
    let lastTime = 0;
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (performanceMonitorRef.current) {
        performanceMonitorRef.current.beginFrame();
      }

      shaderMaterial.uniforms.time.value = currentTime * 0.001;
      
      // Optimized rotation using deltaTime
      particlesMesh.rotation.y += (0.001 * PHI) * (deltaTime / 16.67);  // Normalized to 60fps
      particlesMesh.rotation.x += (0.0005 * PHI) * (deltaTime / 16.67);
      
      renderer.render(scene, camera);

      if (performanceMonitorRef.current) {
        performanceMonitorRef.current.endFrame();
      }

      requestAnimationFrame(animate);
    };

    // Optimized resize handler with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        shaderMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    animate(0);

    // Enhanced cleanup
    return () => {
      if (fallbackMode) {
        if (mount.firstChild) {
          mount.removeChild(mount.firstChild);
        }
        return;
      }
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      
      if (performanceMonitorRef.current) {
        performanceMonitorRef.current.stopMonitoring();
      }
      
      if (contextLossHandlerRef.current) {
        contextLossHandlerRef.current.cleanup();
      }

      mount.removeChild(renderer.domElement);
      
      // Dispose of resources using resource pool
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry.index && object.geometry.index.buffer) {
            resourcePoolRef.current?.releaseBuffer('index', object.geometry.index.buffer);
          }
          Object.values(object.geometry.attributes).forEach(attribute => {
            if (attribute.buffer) {
              resourcePoolRef.current?.releaseBuffer('attribute', attribute.buffer);
            }
          });
          if (Array.isArray(object.material)) {
            object.material.forEach(material => {
              Object.values(material).forEach(value => {
                if (value instanceof THREE.Texture) {
                  resourcePoolRef.current?.releaseTexture('material', value.source.data);
                }
              });
              material.dispose();
            });
          } else {
            Object.values(object.material).forEach(value => {
              if (value instanceof THREE.Texture) {
                resourcePoolRef.current?.releaseTexture('material', value.source.data);
              }
            });
            object.material.dispose();
          }
          object.geometry.dispose();
        }
      });
      
      // Clean up all pooled resources
      if (resourcePoolRef.current) {
        resourcePoolRef.current.cleanup();
      }
      
      instancedGeometry.dispose();
      particlesMaterial.dispose();
      shaderMaterial.dispose();
      renderer.dispose();
    };
  }, [intensity, color, particleCount]);

  return (
    <div 
      ref={mountRef} 
      className="webgl-container"
      role="img"
      aria-label="Sacred geometry visualization"
      tabIndex={-1}
    />
  );
};

export default OptimizedWebGLBackground;