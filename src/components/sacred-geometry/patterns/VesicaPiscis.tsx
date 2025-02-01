import React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SACRED_RATIOS } from '../../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

interface VesicaPiscisProps {
  size?: number;
  color?: string;
  rotationSpeed?: number;
  energyFlowIntensity?: number;
}

export const VesicaPiscis: React.FC<VesicaPiscisProps> = ({
  size = 10,
  color = '#00FFCC',
  rotationSpeed = 0.001,
  energyFlowIntensity = 1.0
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

    // Create Vesica Piscis geometry using sacred ratios
    const createVesicaPiscis = () => {
      const group = new THREE.Group();
      
      // Calculate sacred proportions
      const radius = size * 0.5;
      const centerDistance = radius; // Creates perfect Vesica Piscis
      const vesicaHeight = radius * Math.sqrt(3); // Sacred ratio √3
      
      // Create circles using Fibonacci-based segments
      const segments = 89; // Fibonacci number for smooth curves
      
      // First circle
      const circle1Geometry = new THREE.CircleGeometry(radius, segments);
      const circle1Material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.5
      });
      const circle1 = new THREE.Mesh(circle1Geometry, circle1Material);
      circle1.position.x = -centerDistance / 2;
      group.add(circle1);
      
      // Second circle
      const circle2Geometry = new THREE.CircleGeometry(radius, segments);
      const circle2Material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.5
      });
      const circle2 = new THREE.Mesh(circle2Geometry, circle2Material);
      circle2.position.x = centerDistance / 2;
      group.add(circle2);
      
      // Create the vesica outline
      const vesicaShape = new THREE.Shape();
      const vesicaPoints: THREE.Vector2[] = [];
      
      // Calculate vesica points using sacred geometry
      const steps = 144; // Fibonacci number for smooth curve
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const x = Math.cos(angle) * radius - centerDistance / 2;
        const y = Math.sin(angle) * radius;
        
        if (x >= -centerDistance / 2 && x <= centerDistance / 2) {
          vesicaPoints.push(new THREE.Vector2(x, y));
        }
      }
      
      for (let i = steps; i >= 0; i--) {
        const angle = (i / steps) * Math.PI * 2;
        const x = Math.cos(angle) * radius + centerDistance / 2;
        const y = Math.sin(angle) * radius;
        
        if (x >= -centerDistance / 2 && x <= centerDistance / 2) {
          vesicaPoints.push(new THREE.Vector2(x, y));
        }
      }
      
      vesicaShape.setFromPoints(vesicaPoints);
      
      const vesicaGeometry = new THREE.ShapeGeometry(vesicaShape);
      const vesicaMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      
      const vesicaMesh = new THREE.Mesh(vesicaGeometry, vesicaMaterial);
      group.add(vesicaMesh);
      
      // Add energy flow lines
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions: number[] = [];
      const phi = PHI;
      
      // Create sacred geometric flow lines
      for (let i = 0; i < 13; i++) {
        const t = i / 12;
        const x1 = -centerDistance / 2 + Math.cos(t * Math.PI * phi) * radius;
        const y1 = Math.sin(t * Math.PI * phi) * radius;
        const x2 = centerDistance / 2 + Math.cos((1 - t) * Math.PI * phi) * radius;
        const y2 = Math.sin((1 - t) * Math.PI * phi) * radius;
        
        linePositions.push(x1, y1, 0, x2, y2, 0);
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

    const vesicaPiscis = createVesicaPiscis();
    scene.add(vesicaPiscis);

    camera.position.z = size * 3;

    // Animation loop with sacred geometry principles
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate based on PHI for harmonic motion
      vesicaPiscis.rotation.z += rotationSpeed * PHI;
      
      // Energy flow effect using sacred wave patterns
      const time = Date.now() * 0.001;
      const energyPulse = (Math.sin(time * PHI) * 0.5 + 0.5) * energyFlowIntensity;
      
      vesicaPiscis.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshBasicMaterial;
          if (index < 2) { // Circles
            material.opacity = 0.3 + energyPulse * 0.2;
          } else { // Vesica
            material.opacity = 0.1 + energyPulse * 0.1;
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
      className="vesica-piscis-container"
      role="img"
      aria-label="Vesica Piscis sacred geometry visualization"
    />
  );
};