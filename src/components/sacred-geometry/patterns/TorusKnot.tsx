import React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SACRED_RATIOS } from '../../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

interface TorusKnotProps {
  size?: number;
  color?: string;
  rotationSpeed?: number;
  energyFlowIntensity?: number;
  p?: number; // Number of times the curve winds around the torus in the theta direction
  q?: number; // Number of times the curve winds around the torus in the phi direction
}

export const TorusKnot: React.FC<TorusKnotProps> = ({
  size = 10,
  color = '#00FFCC',
  rotationSpeed = 0.001,
  energyFlowIntensity = 1.0,
  p = 2,
  q = 3
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

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

    // Create Torus Knot with sacred geometry principles
    const createTorusKnot = () => {
      const group = new THREE.Group();
      
      // Main torus knot using golden ratio proportions
      const radius = size * 0.5;
      const tube = radius * (1 / PHI); // Tube radius based on golden ratio
      const radialSegments = 89; // Fibonacci number
      const tubularSegments = 233; // Fibonacci number
      
      const geometry = new THREE.TorusKnotGeometry(
        radius,
        tube,
        tubularSegments,
        radialSegments,
        p,
        q
      );
      
      // Create wireframe for sacred structure visualization
      const wireframeMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.3
      });
      
      const wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        wireframeMaterial
      );
      group.add(wireframe);

      // Create mesh with sacred proportions
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

      // Add energy flow particles along the knot
      const particleCount = 377; // Fibonacci number
      const particlesGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      
      // Calculate positions along the knot curve
      for (let i = 0; i < particleCount; i++) {
        const t = (i / particleCount) * Math.PI * 2;
        const phi = p * t;
        const theta = q * t;
        
        const r = radius + tube * Math.cos(q * phi);
        const x = r * Math.cos(p * phi);
        const y = r * Math.sin(p * phi);
        const z = tube * Math.sin(q * phi);
        
        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;
      }
      
      particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size: 0.05,
        transparent: true,
        opacity: 0.6
      });
      
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      group.add(particles);
      
      // Add energy flow lines
      const flowLinesCount = 13; // Fibonacci number
      const flowGeometry = new THREE.BufferGeometry();
      const flowPositions: number[] = [];
      
      // Create flow lines using golden ratio
      for (let i = 0; i < flowLinesCount; i++) {
        const t1 = (i / flowLinesCount) * Math.PI * 2;
        const t2 = ((i + PHI) / flowLinesCount) * Math.PI * 2;
        
        const phi1 = p * t1;
        const theta1 = q * t1;
        const phi2 = p * t2;
        const theta2 = q * t2;
        
        const r1 = radius + tube * Math.cos(q * phi1);
        const r2 = radius + tube * Math.cos(q * phi2);
        
        const x1 = r1 * Math.cos(p * phi1);
        const y1 = r1 * Math.sin(p * phi1);
        const z1 = tube * Math.sin(q * phi1);
        
        const x2 = r2 * Math.cos(p * phi2);
        const y2 = r2 * Math.sin(p * phi2);
        const z2 = tube * Math.sin(q * phi2);
        
        flowPositions.push(x1, y1, z1, x2, y2, z2);
      }
      
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

    const torusKnot = createTorusKnot();
    scene.add(torusKnot);

    camera.position.z = size * 3;
    camera.position.y = size * 0.5;

    // Animation loop with sacred geometry principles
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate based on PHI for harmonic motion
      torusKnot.rotation.x += rotationSpeed * PHI;
      torusKnot.rotation.y += rotationSpeed * (1 / PHI);
      
      // Energy flow effect using sacred wave patterns
      const time = Date.now() * 0.001;
      const energyPulse = (Math.sin(time * PHI) * 0.5 + 0.5) * energyFlowIntensity;
      
      torusKnot.children.forEach((child, index) => {
        if (child instanceof THREE.LineSegments) {
          const material = child.material as THREE.LineBasicMaterial;
          if (index === 0) { // Wireframe
            material.opacity = 0.2 + energyPulse * 0.2;
          } else { // Flow lines
            material.opacity = 0.1 + energyPulse * 0.3;
          }
        } else if (child instanceof THREE.Points) {
          (child.material as THREE.PointsMaterial).opacity = 0.4 + energyPulse * 0.4;
        } else if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshBasicMaterial).opacity = 0.1 + energyPulse * 0.1;
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
        } else if (child instanceof THREE.LineSegments) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        } else if (child instanceof THREE.Points) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
      
      renderer.dispose();
    };
  }, [size, color, rotationSpeed, energyFlowIntensity, p, q]);

  return (
    <div 
      ref={mountRef}
      className="torus-knot-container"
      role="img"
      aria-label="Torus knot sacred geometry visualization"
    />
  );
};