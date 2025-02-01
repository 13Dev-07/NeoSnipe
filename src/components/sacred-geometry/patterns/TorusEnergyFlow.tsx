import React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SACRED_RATIOS } from '../../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

interface TorusEnergyFlowProps {
  size?: number;
  color?: string;
  rotationSpeed?: number;
  energyFlowIntensity?: number;
  complexity?: number;
}

export const TorusEnergyFlow: React.FC<TorusEnergyFlowProps> = ({
  size = 10,
  color = '#00FFCC',
  rotationSpeed = 0.001,
  energyFlowIntensity = 1.0,
  complexity = 3
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

    // Create Torus with sacred energy flow patterns
    const createTorusEnergySystem = () => {
      const group = new THREE.Group();

      // Create main torus using golden ratio proportions
      const mainRadius = size * 0.5 * PHI;
      const tubeRadius = size * 0.1;
      const radialSegments = 100; // High detail for smooth energy flow
      const tubularSegments = 100;

      const torusGeometry = new THREE.TorusGeometry(
        mainRadius,
        tubeRadius,
        radialSegments,
        tubularSegments
      );

      const torusMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.4,
        wireframe: true
      });
      
      const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
      group.add(torusMesh);

      // Create energy flow spirals using Fibonacci sequence
      const createEnergySpiral = (scale: number, offset: number) => {
        const spiralPoints: THREE.Vector3[] = [];
        const steps = 144; // Fibonacci number
        const turns = 3 * PHI; // Sacred number of rotations

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const angle = t * Math.PI * 2 * turns;
          const radius = mainRadius + (Math.sin(angle * PHI + offset) * tubeRadius * scale);
          
          spiralPoints.push(new THREE.Vector3(
            radius * Math.cos(angle),
            radius * Math.sin(angle),
            0
          ));
        }

        const spiralGeometry = new THREE.BufferGeometry().setFromPoints(spiralPoints);
        const spiralMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.3
        });

        return new THREE.Line(spiralGeometry, spiralMaterial);
      };

      // Add multiple energy spirals with sacred proportions
      for (let i = 0; i < complexity; i++) {
        const scale = 1 + (i / complexity) * (1 / PHI);
        const offset = (i / complexity) * Math.PI * 2;
        const spiral = createEnergySpiral(scale, offset);
        group.add(spiral);

        // Add perpendicular spiral for 3D effect
        const perpSpiral = createEnergySpiral(scale, offset + Math.PI / 2);
        perpSpiral.rotation.x = Math.PI / 2;
        group.add(perpSpiral);
      }

      // Add vortex rings at sacred points
      const vortexGeometry = new THREE.TorusGeometry(tubeRadius * 2, tubeRadius * 0.1, 8, 32);
      const vortexMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2
      });

      const vortexPoints = complexity * 2;
      for (let i = 0; i < vortexPoints; i++) {
        const angle = (i / vortexPoints) * Math.PI * 2;
        const vortex = new THREE.Mesh(vortexGeometry, vortexMaterial.clone());
        
        vortex.position.x = mainRadius * Math.cos(angle);
        vortex.position.y = mainRadius * Math.sin(angle);
        vortex.rotation.z = angle;
        
        group.add(vortex);
      }

      // Add energy flow particles
      const particleCount = 89; // Fibonacci number
      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        const angle = (i / particleCount) * Math.PI * 2;
        particlePositions[i] = mainRadius * Math.cos(angle);
        particlePositions[i + 1] = mainRadius * Math.sin(angle);
        particlePositions[i + 2] = 0;
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size: size * 0.02,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      group.add(particles);

      return group;
    };

    const torusSystem = createTorusEnergySystem();
    scene.add(torusSystem);

    camera.position.z = size * 4;

    // Animation loop with sacred geometry principles
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate based on PHI for harmonic motion
      torusSystem.rotation.y += rotationSpeed * PHI;
      torusSystem.rotation.z += rotationSpeed * (1 / PHI);
      
      // Energy flow effects using sacred wave patterns
      const time = Date.now() * 0.001;
      const energyPulse = (Math.sin(time * PHI) * 0.5 + 0.5) * energyFlowIntensity;
      
      torusSystem.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshBasicMaterial;
          if (index === 0) { // Main torus
            material.opacity = 0.3 + energyPulse * 0.3;
          } else { // Vortex rings
            material.opacity = 0.1 + energyPulse * 0.3;
            // Add harmonic scaling effect
            child.scale.setScalar(1 + energyPulse * 0.1);
          }
        } else if (child instanceof THREE.Line) {
          // Animate energy spirals
          const material = child.material as THREE.LineBasicMaterial;
          material.opacity = 0.2 + energyPulse * 0.3;
          child.rotation.z += rotationSpeed * (1 / PHI) * (index % 2 ? 1 : -1);
        } else if (child instanceof THREE.Points) {
          // Animate particles
          const positions = child.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            const angle = Math.atan2(positions[i + 1], positions[i]);
            const radius = Math.sqrt(positions[i] ** 2 + positions[i + 1] ** 2);
            const newAngle = angle + rotationSpeed * PHI * (1 + energyPulse * 0.5);
            
            positions[i] = radius * Math.cos(newAngle);
            positions[i + 1] = radius * Math.sin(newAngle);
          }
          child.geometry.attributes.position.needsUpdate = true;
          (child.material as THREE.PointsMaterial).opacity = 0.3 + energyPulse * 0.4;
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
  }, [size, color, rotationSpeed, energyFlowIntensity, complexity]);

  return (
    <div 
      ref={mountRef}
      className="torus-energy-flow-container"
      role="img"
      aria-label="Sacred Torus energy flow visualization"
    />
  );
};