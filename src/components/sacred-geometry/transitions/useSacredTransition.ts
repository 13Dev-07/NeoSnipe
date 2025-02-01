import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { SACRED_RATIOS } from '../../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

interface SacredTransitionOptions {
  duration?: number;
  easing?: (t: number) => number;
  energyFlowIntensity?: number;
}

const defaultOptions: SacredTransitionOptions = {
  duration: 1000,
  easing: t => {
    // Use golden ratio for smooth sacred transitions
    const phi = t * Math.PI * 2 / PHI;
    return (Math.sin(phi) * 0.5 + 0.5);
  },
  energyFlowIntensity: 1.0
};

export const useSacredTransition = (
  sourceGeometry: THREE.BufferGeometry,
  targetGeometry: THREE.BufferGeometry,
  options: SacredTransitionOptions = {}
) => {
  const [progress, setProgress] = useState(0);
  const [currentGeometry, setCurrentGeometry] = useState(sourceGeometry);

  const mergedOptions = { ...defaultOptions, ...options };

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / mergedOptions.duration!, 1);
      
      // Apply sacred geometry easing
      const easedProgress = mergedOptions.easing!(rawProgress);
      setProgress(easedProgress);

      // Interpolate geometries using sacred proportions
      const morphedGeometry = new THREE.BufferGeometry();
      const sourcePositions = sourceGeometry.getAttribute('position');
      const targetPositions = targetGeometry.getAttribute('position');

      const positions = new Float32Array(sourcePositions.count * 3);
      
      for (let i = 0; i < positions.length; i += 3) {
        // Apply golden ratio to vertex transitions
        const phi = easedProgress * Math.PI * 2;
        const energyFlow = Math.sin(phi / PHI) * mergedOptions.energyFlowIntensity!;
        
        positions[i] = sourcePositions.getX(i / 3) * (1 - easedProgress) +
                      targetPositions.getX(i / 3) * easedProgress +
                      energyFlow * Math.sin(phi + i);
                      
        positions[i + 1] = sourcePositions.getY(i / 3) * (1 - easedProgress) +
                          targetPositions.getY(i / 3) * easedProgress +
                          energyFlow * Math.sin(phi + i + PHI);
                          
        positions[i + 2] = sourcePositions.getZ(i / 3) * (1 - easedProgress) +
                          targetPositions.getZ(i / 3) * easedProgress +
                          energyFlow * Math.sin(phi + i + PHI * 2);
      }

      morphedGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      setCurrentGeometry(morphedGeometry);

      if (rawProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [sourceGeometry, targetGeometry, mergedOptions]);

  return {
    progress,
    currentGeometry
  };
};