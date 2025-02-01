import React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MetatronsCubeConfig } from '../../../types/sacred-geometry/metatrons-cube';
import { SACRED_RATIOS } from '../../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

interface MetatronsCubeProps {
  size?: number;
  color?: string;
  rotationSpeed?: number;
  energyFlowIntensity?: number;
}

export const MetatronsCube: React.FC<MetatronsCubeProps> = ({
  size = 10,
  color = '#00FFCC',
  rotationSpeed = 0.001,
  energyFlowIntensity = 1.0
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Create Metatron's Cube geometry
    const createMetatronsCube = () => {
      const group = new THREE.Group();
      
      // Center circle
      const centerGeometry = new THREE.CircleGeometry(size * 0.2, 32);
      const centerMaterial = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.8
      });
      const centerCircle = new THREE.Mesh(centerGeometry, centerMaterial);
      group.add(centerCircle);

      // First layer of circles - uses PHI for sacred proportions
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const radius = size * 0.4 * PHI;
        const circleGeometry = new THREE.CircleGeometry(size * 0.2, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.6
        });
        const circle = new THREE.Mesh(circleGeometry, circleMaterial);
        
        circle.position.x = Math.cos(angle) * radius;
        circle.position.y = Math.sin(angle) * radius;
        group.add(circle);
      }

      // Connecting lines using Fibonacci proportions
      const fibonacci = [1, 1, 2, 3, 5, 8, 13];
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions: number[] = [];
      
      // Create sacred geometric patterns using lines
      for (let i = 0; i < 13; i++) {
        const angle1 = (i * Math.PI * 2) / 13;
        const angle2 = ((i + fibonacci[i % 7]) * Math.PI * 2) / 13;
        
        const x1 = Math.cos(angle1) * size;
        const y1 = Math.sin(angle1) * size;
        const x2 = Math.cos(angle2) * size;
        const y2 = Math.sin(angle2) * size;
        
        linePositions.push(x1, y1, 0, x2, y2, 0);
      }

      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.3
      });
      
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      group.add(lines);

      return group;
    };

    const metatronsCube = createMetatronsCube();
    scene.add(metatronsCube);

    camera.position.z = size * 3;

    // Animation loop with sacred geometry principles
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate based on PHI for harmonic motion
      metatronsCube.rotation.z += rotationSpeed * PHI;
      
      // Energy flow effect using sine waves
      const time = Date.now() * 0.001;
      const energyPulse = Math.sin(time * PHI) * 0.5 + 0.5;
      
      metatronsCube.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshBasicMaterial).opacity = 
            0.3 + (energyPulse * energyFlowIntensity * 0.5);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Responsive handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
      
      renderer.dispose();
    };
  }, [size, color, rotationSpeed, energyFlowIntensity]);

  return (
    <div 
      ref={mountRef}
      className="metatrons-cube-container"
      role="img"
      aria-label="Metatron's Cube sacred geometry visualization"
    />
  );
};