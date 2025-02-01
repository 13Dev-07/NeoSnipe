import React, { useState, useEffect } from 'react';
import { SACRED_RATIOS } from '../../../shared/constants';
import * as THREE from 'three';

const PHI = SACRED_RATIOS.PHI;

interface SacredTransitionManagerProps {
  size?: number;
  color?: string;
  transitionSpeed?: number;
  energyFlowIntensity?: number;
  children: React.ReactNode;
}

interface TransitionState {
  progress: number;
  sourceGeometry?: THREE.BufferGeometry;
  targetGeometry?: THREE.BufferGeometry;
  morphTargets: THREE.BufferAttribute[];
}

export const SacredTransitionManager: React.FC<SacredTransitionManagerProps> = ({
  size = 10,
  color = '#00FFCC',
  transitionSpeed = 0.001,
  energyFlowIntensity = 1.0,
  children
}) => {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    progress: 0,
    morphTargets: []
  });

  const mountRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<THREE.Scene>();
  const rendererRef = React.useRef<THREE.WebGLRenderer>();
  const activeGeometryRef = React.useRef<THREE.BufferGeometry>();

  // Initialize sacred transition system
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Setup THREE.js scene with sacred proportions
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    camera.position.z = size * 3;
    camera.position.y = size * 1.5;
    camera.lookAt(0, 0, 0);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    return () => {
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [size]);

  // Sacred morphing system using golden ratio
  const createMorphGeometry = (source: THREE.BufferGeometry, target: THREE.BufferGeometry) => {
    // Ensure consistent vertex counts using sacred numbers
    const vertexCount = Math.max(
      source.getAttribute('position').count,
      target.getAttribute('position').count
    );

    // Create normalized position arrays
    const sourcePositions = normalizeGeometry(source, vertexCount);
    const targetPositions = normalizeGeometry(target, vertexCount);

    // Create morph targets using sacred proportions
    const morphTargets = [];
    const steps = 8; // Fibonacci number for transition steps
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const phi = t * Math.PI * 2 / PHI;
      
      const morphPositions = new Float32Array(vertexCount * 3);
      
      for (let j = 0; j < morphPositions.length; j += 3) {
        const sourcePoint = new THREE.Vector3(
          sourcePositions[j],
          sourcePositions[j + 1],
          sourcePositions[j + 2]
        );
        
        const targetPoint = new THREE.Vector3(
          targetPositions[j],
          targetPositions[j + 1],
          targetPositions[j + 2]
        );

        // Apply sacred curve interpolation
        const x = sourcePoint.x + (targetPoint.x - sourcePoint.x) * (Math.sin(phi) * 0.5 + 0.5);
        const y = sourcePoint.y + (targetPoint.y - sourcePoint.y) * (Math.sin(phi + PHI) * 0.5 + 0.5);
        const z = sourcePoint.z + (targetPoint.z - sourcePoint.z) * (Math.sin(phi + PHI * 2) * 0.5 + 0.5);

        morphPositions[j] = x;
        morphPositions[j + 1] = y;
        morphPositions[j + 2] = z;
      }

      morphTargets.push(new THREE.BufferAttribute(morphPositions, 3));
    }

    return morphTargets;
  };

  // Normalize geometry to consistent vertex count
  const normalizeGeometry = (geometry: THREE.BufferGeometry, targetCount: number) => {
    const positions = geometry.getAttribute('position').array;
    const normalized = new Float32Array(targetCount * 3);
    
    // Use sacred ratios for interpolation
    const step = positions.length / (targetCount * 3);
    
    for (let i = 0; i < targetCount * 3; i += 3) {
      const sourceIndex = Math.min(Math.floor(i * step), positions.length - 3);
      normalized[i] = positions[sourceIndex];
      normalized[i + 1] = positions[sourceIndex + 1];
      normalized[i + 2] = positions[sourceIndex + 2];
    }

    return normalized;
  };

  // Handle transition animations
  const animate = (time: number) => {
    if (!sceneRef.current || !rendererRef.current) return;
    
    const progress = (Math.sin(time * PHI) * 0.5 + 0.5) * energyFlowIntensity;
    
    // Update geometries with sacred proportions
    if (activeGeometryRef.current && transitionState.morphTargets.length > 0) {
      const targetIndex = Math.floor(progress * (transitionState.morphTargets.length - 1));
      const nextIndex = Math.min(targetIndex + 1, transitionState.morphTargets.length - 1);
      const t = progress * (transitionState.morphTargets.length - 1) - targetIndex;
      
      const currentTarget = transitionState.morphTargets[targetIndex];
      const nextTarget = transitionState.morphTargets[nextIndex];
      
      const positions = activeGeometryRef.current.getAttribute('position');
      
      for (let i = 0; i < positions.count; i++) {
        const current = new THREE.Vector3(
          currentTarget.getX(i),
          currentTarget.getY(i),
          currentTarget.getZ(i)
        );
        
        const next = new THREE.Vector3(
          nextTarget.getX(i),
          nextTarget.getY(i),
          nextTarget.getZ(i)
        );
        
        current.lerp(next, t);
        positions.setXYZ(i, current.x, current.y, current.z);
      }
      
      positions.needsUpdate = true;
    }

    rendererRef.current.render(sceneRef.current, camera);
    requestAnimationFrame(animate);
  };

  // Initialize animation loop
  useEffect(() => {
    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [transitionState]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (!rendererRef.current) return;
      
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      
      camera.position.z = size * 3;
      camera.position.y = size * 1.5;
      camera.lookAt(0, 0, 0);
      
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);

  return (
    <div 
      ref={mountRef}
      className="sacred-transition-container"
      role="img"
      aria-label="Sacred geometry transition visualization"
    >
      {children}
    </div>
  );
};