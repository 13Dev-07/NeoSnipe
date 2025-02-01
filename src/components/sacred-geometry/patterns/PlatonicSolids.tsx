import React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SACRED_RATIOS } from '../../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

interface PlatonicSolidsProps {
  size?: number;
  color?: string;
  rotationSpeed?: number;
  energyFlowIntensity?: number;
  activeType?: 'tetrahedron' | 'cube' | 'octahedron' | 'icosahedron' | 'dodecahedron';
}

export const PlatonicSolids: React.FC<PlatonicSolidsProps> = ({
  size = 10,
  color = '#00FFCC',
  rotationSpeed = 0.001,
  energyFlowIntensity = 1.0,
  activeType = 'tetrahedron'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentType, setCurrentType] = useState(activeType);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup with sacred proportions
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Create Platonic Solid geometry using sacred ratios
    const createPlatonicSolid = (type: string) => {
      const group = new THREE.Group();
      let geometry: THREE.BufferGeometry;
      
      // All sizes are based on golden ratio relationships
      switch (type) {
        case 'tetrahedron':
          geometry = new THREE.TetrahedronGeometry(size * 0.5 * PHI);
          break;
        case 'cube':
          geometry = new THREE.BoxGeometry(size * 0.5, size * 0.5, size * 0.5);
          break;
        case 'octahedron':
          geometry = new THREE.OctahedronGeometry(size * 0.5 * Math.sqrt(PHI));
          break;
        case 'icosahedron':
          geometry = new THREE.IcosahedronGeometry(size * 0.5 * (PHI * 0.5));
          break;
        case 'dodecahedron':
          geometry = new THREE.DodecahedronGeometry(size * 0.5 * (1/PHI));
          break;
        default:
          geometry = new THREE.TetrahedronGeometry(size * 0.5);
      }

      // Create sacred geometry wireframe
      const wireframeMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.5
      });
      
      const wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        wireframeMaterial
      );
      group.add(wireframe);

      // Create faces with sacred proportions
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

      // Add energy flow lines
      const vertexCount = geometry.attributes.position.count;
      const flowGeometry = new THREE.BufferGeometry();
      const flowPositions: number[] = [];
      
      // Create sacred flow patterns using vertices
      for (let i = 0; i < vertexCount; i += 3) {
        const idx1 = i;
        const idx2 = (i + fibonacci[i % 7]) % vertexCount;
        
        const positions = geometry.attributes.position;
        const x1 = positions.getX(idx1);
        const y1 = positions.getY(idx1);
        const z1 = positions.getZ(idx1);
        const x2 = positions.getX(idx2);
        const y2 = positions.getY(idx2);
        const z2 = positions.getZ(idx2);
        
        flowPositions.push(x1, y1, z1, x2, y2, z2);
      }

      const fibonacci = [1, 1, 2, 3, 5, 8, 13];
      flowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(flowPositions, 3));
      
      const flowMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2
      });
      
      const flowLines = new THREE.LineSegments(flowGeometry, flowMaterial);
      group.add(flowLines);

      return group;
    };

    const platonicSolid = createPlatonicSolid(currentType);
    scene.add(platonicSolid);

    camera.position.z = size * 3;
    camera.position.y = size * 0.5;

    // Animation loop with sacred geometry principles
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate based on PHI for harmonic motion
      platonicSolid.rotation.x += rotationSpeed * PHI;
      platonicSolid.rotation.y += rotationSpeed * PHI * 0.618; // 1/PHI
      
      // Energy flow effect using sacred wave patterns
      const time = Date.now() * 0.001;
      const energyPulse = (Math.sin(time * PHI) * 0.5 + 0.5) * energyFlowIntensity;
      
      platonicSolid.children.forEach((child, index) => {
        if (child instanceof THREE.LineSegments) {
          const material = child.material as THREE.LineBasicMaterial;
          if (index === 0) { // Wireframe
            material.opacity = 0.3 + energyPulse * 0.2;
          } else { // Flow lines
            material.opacity = 0.1 + energyPulse * 0.3;
          }
        } else if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshBasicMaterial).opacity = 0.1 + energyPulse * 0.05;
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
  }, [size, color, rotationSpeed, energyFlowIntensity, currentType]);

  // Effect to handle type changes
  useEffect(() => {
    setCurrentType(activeType);
  }, [activeType]);

  return (
    <div 
      ref={mountRef}
      className="platonic-solids-container"
      role="img"
      aria-label={`${currentType} sacred geometry visualization`}
    />
  );
};