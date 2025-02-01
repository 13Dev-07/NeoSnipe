import React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SACRED_RATIOS } from '../../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

interface OctahedronSolidProps {
  size?: number;
  color?: string;
  rotationSpeed?: number;
  energyFlowIntensity?: number;
}

export const OctahedronSolid: React.FC<OctahedronSolidProps> = ({
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

    // Create Octahedron with sacred proportions
    const createOctahedron = () => {
      const group = new THREE.Group();

      // Create outer octahedron geometry using sacred ratios
      const radius = size * 0.5 * PHI; // Golden ratio proportion
      const octaGeometry = new THREE.OctahedronGeometry(radius);
      const octaMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.4,
        wireframe: true
      });
      
      const octaMesh = new THREE.Mesh(octaGeometry, octaMaterial);
      group.add(octaMesh);

      // Create inner octahedron for energy flow
      const innerRadius = radius * (1 / PHI); // Sacred ratio for inner form
      const innerOctaGeometry = new THREE.OctahedronGeometry(innerRadius);
      const innerOctaMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2,
        wireframe: false
      });
      
      const innerOctaMesh = new THREE.Mesh(innerOctaGeometry, innerOctaMaterial);
      group.add(innerOctaMesh);

      // Create energy flow lines using sacred geometry
      const vertices = octaGeometry.getAttribute('position').array;
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions: number[] = [];

      // Connect vertices with golden ratio proportions
      for (let i = 0; i < vertices.length; i += 9) {
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

        // Create three-point energy flow connections
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

      // Add sacred energy vortex effects
      const vortexGeometry = new THREE.TorusGeometry(radius * 0.7, radius * 0.02, 8, 32);
      const vortexMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2
      });

      // Create energy vortices along major axes
      const vortexPositions = [
        { rotation: [Math.PI / 2, 0, 0] },
        { rotation: [0, Math.PI / 2, 0] },
        { rotation: [0, 0, Math.PI / 2] }
      ];

      vortexPositions.forEach(({ rotation }) => {
        const vortex = new THREE.Mesh(vortexGeometry, vortexMaterial);
        vortex.rotation.set(...rotation);
        group.add(vortex);
      });

      return group;
    };

    const octahedron = createOctahedron();
    scene.add(octahedron);

    camera.position.z = size * 3;
    camera.position.y = size * 1.5;
    camera.lookAt(0, 0, 0);

    // Animation loop with sacred geometry principles
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate based on PHI for harmonic motion
      octahedron.rotation.y += rotationSpeed * PHI;
      octahedron.rotation.x += rotationSpeed * (1 / PHI);
      octahedron.rotation.z += rotationSpeed * (1 / (PHI * PHI));
      
      // Energy flow effect using sacred wave patterns
      const time = Date.now() * 0.001;
      const energyPulse = (Math.sin(time * PHI) * 0.5 + 0.5) * energyFlowIntensity;
      
      octahedron.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshBasicMaterial;
          if (index === 0) { // Outer octahedron
            material.opacity = 0.3 + energyPulse * 0.3;
          } else if (index === 1) { // Inner octahedron
            material.opacity = 0.1 + energyPulse * 0.2;
          } else { // Vortex rings
            material.opacity = 0.1 + energyPulse * 0.3;
            // Add harmonic scaling effect to vortex rings
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
      className="octahedron-container"
      role="img"
      aria-label="Sacred Octahedron geometry visualization"
    />
  );
};