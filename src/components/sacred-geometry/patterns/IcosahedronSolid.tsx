import React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SACRED_RATIOS } from '../../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

interface IcosahedronSolidProps {
  size?: number;
  color?: string;
  rotationSpeed?: number;
  energyFlowIntensity?: number;
}

export const IcosahedronSolid: React.FC<IcosahedronSolidProps> = ({
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

    // Create Icosahedron with sacred proportions
    const createIcosahedron = () => {
      const group = new THREE.Group();

      // Create outer icosahedron geometry using sacred ratios
      const radius = size * 0.5 * PHI; // Golden ratio proportion
      const icoGeometry = new THREE.IcosahedronGeometry(radius);
      const icoMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.4,
        wireframe: true
      });
      
      const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
      group.add(icoMesh);

      // Create inner icosahedron for energy flow
      const innerRadius = radius * (1 / PHI); // Sacred ratio for inner form
      const innerIcoGeometry = new THREE.IcosahedronGeometry(innerRadius);
      const innerIcoMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2,
        wireframe: false
      });
      
      const innerIcoMesh = new THREE.Mesh(innerIcoGeometry, innerIcoMaterial);
      group.add(innerIcoMesh);

      // Create sacred triangular face highlights
      const triangleGeometry = new THREE.CircleGeometry(radius * 0.2, 3);
      const triangleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });

      // Position triangles on each face using icosahedron vertices
      const vertices = icoGeometry.getAttribute('position').array;
      for (let i = 0; i < vertices.length; i += 9) {
        const center = new THREE.Vector3(
          (vertices[i] + vertices[i + 3] + vertices[i + 6]) / 3,
          (vertices[i + 1] + vertices[i + 4] + vertices[i + 7]) / 3,
          (vertices[i + 2] + vertices[i + 5] + vertices[i + 8]) / 3
        );
        
        const triangle = new THREE.Mesh(triangleGeometry, triangleMaterial.clone());
        triangle.position.copy(center.normalize().multiplyScalar(radius));
        triangle.lookAt(center);
        group.add(triangle);
      }

      // Create energy flow lines using sacred geometry
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

      // Add sacred vortex effects
      const vortexGeometry = new THREE.TorusGeometry(radius * 0.7, radius * 0.02, 8, 32);
      const vortexMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2
      });

      // Create energy vortices along golden ratio axes
      const vortexPositions = [
        { rotation: [Math.PI / 2, 0, 0] },
        { rotation: [0, Math.PI / 2, 0] },
        { rotation: [0, 0, Math.PI / 2] },
        { rotation: [Math.PI / PHI, Math.PI / PHI, 0] },
        { rotation: [0, Math.PI / PHI, Math.PI / PHI] },
        { rotation: [Math.PI / PHI, 0, Math.PI / PHI] }
      ];

      vortexPositions.forEach(({ rotation }) => {
        const vortex = new THREE.Mesh(vortexGeometry, vortexMaterial.clone());
        vortex.rotation.set(...rotation);
        group.add(vortex);
      });

      // Add fibonacci spiral effect
      const spiralGeometry = new THREE.BufferGeometry();
      const spiralPoints: number[] = [];
      const spiralSteps = 34; // Fibonacci number
      let phi = 0;

      for (let i = 0; i < spiralSteps; i++) {
        const t = i / spiralSteps;
        phi += Math.PI * 2 / PHI;
        const r = t * radius;
        
        spiralPoints.push(
          r * Math.cos(phi), r * Math.sin(phi), 0,
          r * Math.cos(phi + 0.1), r * Math.sin(phi + 0.1), 0
        );
      }

      spiralGeometry.setAttribute('position', new THREE.Float32BufferAttribute(spiralPoints, 3));
      const spiralMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2
      });

      const spiral1 = new THREE.LineSegments(spiralGeometry, spiralMaterial);
      const spiral2 = spiral1.clone();
      const spiral3 = spiral1.clone();

      spiral1.rotation.x = Math.PI / 2;
      spiral2.rotation.y = Math.PI / 2;
      spiral3.rotation.z = Math.PI / 2;

      group.add(spiral1);
      group.add(spiral2);
      group.add(spiral3);

      return group;
    };

    const icosahedron = createIcosahedron();
    scene.add(icosahedron);

    camera.position.z = size * 3;
    camera.position.y = size * 1.5;
    camera.lookAt(0, 0, 0);

    // Animation loop with sacred geometry principles
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate based on PHI for harmonic motion
      icosahedron.rotation.y += rotationSpeed * PHI;
      icosahedron.rotation.x += rotationSpeed * (1 / PHI);
      icosahedron.rotation.z += rotationSpeed * (1 / (PHI * PHI));
      
      // Energy flow effect using sacred wave patterns
      const time = Date.now() * 0.001;
      const energyPulse = (Math.sin(time * PHI) * 0.5 + 0.5) * energyFlowIntensity;
      
      icosahedron.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshBasicMaterial;
          if (index === 0) { // Outer icosahedron
            material.opacity = 0.3 + energyPulse * 0.3;
          } else if (index === 1) { // Inner icosahedron
            material.opacity = 0.1 + energyPulse * 0.2;
          } else if (index < 22) { // Triangle faces
            material.opacity = 0.1 + (Math.sin(time * PHI + index) * 0.5 + 0.5) * 0.2;
          } else { // Vortex rings
            material.opacity = 0.1 + energyPulse * 0.3;
            // Add harmonic scaling effect to vortex rings
            child.scale.setScalar(1 + energyPulse * 0.1);
          }
        } else if (child instanceof THREE.LineSegments) {
          const material = child.material as THREE.LineBasicMaterial;
          if (child.userData.type === 'spiral') {
            material.opacity = 0.1 + energyPulse * 0.2;
          } else {
            material.opacity = 0.2 + energyPulse * 0.3;
          }
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
      className="icosahedron-container"
      role="img"
      aria-label="Sacred Icosahedron geometry visualization"
    />
  );
};