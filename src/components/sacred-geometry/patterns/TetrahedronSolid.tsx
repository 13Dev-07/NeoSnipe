import React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SACRED_RATIOS } from '../../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

interface TetrahedronSolidProps {
  size?: number;
  color?: string;
  rotationSpeed?: number;
  energyFlowIntensity?: number;
}

export const TetrahedronSolid: React.FC<TetrahedronSolidProps> = ({
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

    // Create Tetrahedron with sacred proportions
    const createTetrahedron = () => {
      const group = new THREE.Group();

      // Create base tetrahedron geometry
      const radius = size * 0.5 * PHI; // Use golden ratio for sacred proportion
      const tetraGeometry = new THREE.TetrahedronGeometry(radius);
      const tetraMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.4,
        wireframe: true
      });
      
      const tetraMesh = new THREE.Mesh(tetraGeometry, tetraMaterial);
      group.add(tetraMesh);

      // Create inner tetrahedron for energy flow
      const innerRadius = radius * (1 / PHI); // Sacred ratio for inner form
      const innerTetraGeometry = new THREE.TetrahedronGeometry(innerRadius);
      const innerTetraMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2,
        wireframe: false
      });
      
      const innerTetraMesh = new THREE.Mesh(innerTetraGeometry, innerTetraMaterial);
      group.add(innerTetraMesh);

      // Create energy flow lines
      const vertices = tetraGeometry.getAttribute('position').array;
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions: number[] = [];

      // Connect vertices with golden ratio proportions
      for (let i = 0; i < vertices.length; i += 3) {
        const startPoint = new THREE.Vector3(
          vertices[i] * (1 / PHI),
          vertices[i + 1] * (1 / PHI),
          vertices[i + 2] * (1 / PHI)
        );
        
        const endPoint = new THREE.Vector3(
          vertices[i],
          vertices[i + 1],
          vertices[i + 2]
        );

        linePositions.push(
          startPoint.x, startPoint.y, startPoint.z,
          endPoint.x, endPoint.y, endPoint.z
        );
      }

      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.3
      });

      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      group.add(lines);

      return group;
    };

    const tetrahedron = createTetrahedron();
    scene.add(tetrahedron);

    camera.position.z = size * 3;
    camera.position.y = size * 1.5;
    camera.lookAt(0, 0, 0);

    // Animation loop with sacred geometry principles
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate based on PHI for harmonic motion
      tetrahedron.rotation.y += rotationSpeed * PHI;
      tetrahedron.rotation.x += rotationSpeed * (1 / PHI);
      
      // Energy flow effect using sacred wave patterns
      const time = Date.now() * 0.001;
      const energyPulse = (Math.sin(time * PHI) * 0.5 + 0.5) * energyFlowIntensity;
      
      tetrahedron.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshBasicMaterial;
          material.opacity = index === 0 ? 
            0.3 + energyPulse * 0.3 : // Outer tetrahedron
            0.1 + energyPulse * 0.2;  // Inner tetrahedron
        } else if (child instanceof THREE.LineSegments) {
          (child.material as THREE.LineBasicMaterial).opacity = 0.2 + energyPulse * 0.3;
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
        } else if (object instanceof THREE.LineSegments) {
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
      className="tetrahedron-container"
      role="img"
      aria-label="Sacred Tetrahedron geometry visualization"
    />
  );
};