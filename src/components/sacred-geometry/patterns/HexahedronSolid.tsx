import React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SACRED_RATIOS } from '../../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

interface HexahedronSolidProps {
  size?: number;
  color?: string;
  rotationSpeed?: number;
  energyFlowIntensity?: number;
}

export const HexahedronSolid: React.FC<HexahedronSolidProps> = ({
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

    // Create Hexahedron (Cube) with sacred proportions
    const createHexahedron = () => {
      const group = new THREE.Group();

      // Create outer cube geometry with golden ratio proportions
      const radius = size * 0.5 * PHI;
      const cubeGeometry = new THREE.BoxGeometry(radius, radius, radius);
      const cubeMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.4,
        wireframe: true
      });
      
      const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
      group.add(cubeMesh);

      // Create inner cube for energy flow
      const innerRadius = radius * (1 / PHI); // Sacred ratio for inner form
      const innerCubeGeometry = new THREE.BoxGeometry(innerRadius, innerRadius, innerRadius);
      const innerCubeMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2,
        wireframe: false
      });
      
      const innerCubeMesh = new THREE.Mesh(innerCubeGeometry, innerCubeMaterial);
      group.add(innerCubeMesh);

      // Create sacred geometric energy flow lines
      const vertices = cubeGeometry.getAttribute('position').array;
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions: number[] = [];

      // Create diagonal energy flow lines using golden ratio
      for (let i = 0; i < vertices.length; i += 9) {
        // Create diagonal connections between vertices
        const v1 = new THREE.Vector3(
          vertices[i] * (1 / PHI),
          vertices[i + 1] * (1 / PHI),
          vertices[i + 2] * (1 / PHI)
        );
        
        const v2 = new THREE.Vector3(
          vertices[i + 3],
          vertices[i + 4],
          vertices[i + 5]
        );

        const v3 = new THREE.Vector3(
          vertices[i + 6] * PHI,
          vertices[i + 7] * PHI,
          vertices[i + 8] * PHI
        );

        // Add lines connecting the vertices
        linePositions.push(
          v1.x, v1.y, v1.z,
          v2.x, v2.y, v2.z,
          v2.x, v2.y, v2.z,
          v3.x, v3.y, v3.z
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

      // Add sacred vortex effect
      const vortexGeometry = new THREE.TorusGeometry(radius * 0.7, radius * 0.02, 8, 32);
      const vortexMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2
      });

      const vortex1 = new THREE.Mesh(vortexGeometry, vortexMaterial);
      vortex1.rotation.x = Math.PI / 2;
      group.add(vortex1);

      const vortex2 = new THREE.Mesh(vortexGeometry, vortexMaterial);
      vortex2.rotation.y = Math.PI / 2;
      group.add(vortex2);

      const vortex3 = new THREE.Mesh(vortexGeometry, vortexMaterial);
      vortex3.rotation.z = Math.PI / 2;
      group.add(vortex3);

      return group;
    };

    const hexahedron = createHexahedron();
    scene.add(hexahedron);

    camera.position.z = size * 3;
    camera.position.y = size * 1.5;
    camera.lookAt(0, 0, 0);

    // Animation loop with sacred geometry principles
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate based on PHI for harmonic motion
      hexahedron.rotation.y += rotationSpeed * PHI;
      hexahedron.rotation.x += rotationSpeed * (1 / PHI);
      
      // Energy flow effect using sacred wave patterns
      const time = Date.now() * 0.001;
      const energyPulse = (Math.sin(time * PHI) * 0.5 + 0.5) * energyFlowIntensity;
      
      hexahedron.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshBasicMaterial;
          if (index === 0) { // Outer cube
            material.opacity = 0.3 + energyPulse * 0.3;
          } else if (index === 1) { // Inner cube
            material.opacity = 0.1 + energyPulse * 0.2;
          } else { // Vortex rings
            material.opacity = 0.1 + energyPulse * 0.3;
            // Add subtle scaling effect to vortex rings
            child.scale.setScalar(1 + energyPulse * 0.1);
          }
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
      className="hexahedron-container"
      role="img"
      aria-label="Sacred Hexahedron (Cube) geometry visualization"
    />
  );
};