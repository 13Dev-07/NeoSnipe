import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FlowerOfLifeProps {
  size?: number;
  color?: string;
}

export const FlowerOfLife: React.FC<FlowerOfLifeProps> = ({ 
  size = 500,
  color = '#00FFCC'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    renderer.setSize(size, size);
    containerRef.current.appendChild(renderer.domElement);

    // Create Flower of Life geometry
    const geometry = new THREE.CircleGeometry(1, 32);
    const material = new THREE.LineBasicMaterial({ color });
    
    const circles: THREE.Line[] = [];
    const positions = [
      [0, 0], // Center
      [2, 0], [1, 1.732], [-1, 1.732],
      [-2, 0], [-1, -1.732], [1, -1.732]
    ];

    positions.forEach(([x, y]) => {
      const circle = new THREE.Line(geometry, material);
      circle.position.set(x, y, 0);
      circles.push(circle);
      scene.add(circle);
    });

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      circles.forEach(circle => {
        circle.rotation.z += 0.001;
      });
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [size, color]);

  return <div ref={containerRef} style={{ width: size, height: size }} />;
};
