import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const PHI = 1.618033988749895;

interface WebGLBackgroundProps {
  intensity?: number;
  color?: string;
  particleCount?: number;
}

export const WebGLBackground: React.FC<WebGLBackgroundProps> = ({
  intensity = 1,
  color = '#00FFCC',
  particleCount = 5000
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup with sacred geometry principles
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Import sacred geometry shaders
    const { flowerOfLifeShader } = require('../shaders/flower-of-life');
    const { sriYantraShader } = require('../shaders/sri-yantra');
    
    // Select shader based on pattern type or alternate between them
    const selectedShader = Math.random() > 0.5 ? flowerOfLifeShader : sriYantraShader;
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
        intensity: { value: intensity },
        baseColor: { value: new THREE.Color(color) }
      },
      vertexShader: selectedShader.vertexShader,
      fragmentShader: selectedShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    // Enhanced particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      sizes[i] = Math.random() * 2;
      opacities[i] = Math.random();
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particlesGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: new THREE.Color(color),
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.6
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Sacred geometry meshes
    const createSacredGeometry = () => {
      const group = new THREE.Group();
      
      // Flower of Life pattern
      for (let i = 0; i < 7; i++) {
        const radius = 5;
        const angle = (i * Math.PI * 2) / 6;
        const geometry = new THREE.TorusGeometry(radius, 0.05, 16, 100);
        const mesh = new THREE.Mesh(geometry, shaderMaterial);
        mesh.position.x = radius * Math.cos(angle);
        mesh.position.y = radius * Math.sin(angle);
        group.add(mesh);
      }

      return group;
    };

    const sacredGeometry = createSacredGeometry();
    scene.add(sacredGeometry);

    camera.position.z = 20;

    // Enhanced animation with golden ratio
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      shaderMaterial.uniforms.time.value = time;
      
      // Rotate particles based on PHI
      particlesMesh.rotation.y += 0.001 * PHI;
      particlesMesh.rotation.x += 0.0005 * PHI;
      
      // Rotate sacred geometry
      sacredGeometry.rotation.z += 0.001 * PHI;
      
      renderer.render(scene, camera);
    };
    animate();

    // Responsive handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      shaderMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [intensity, color, particleCount]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: -1,
        opacity: 0.8,
        pointerEvents: 'none'
      }} 
    />
  );
};
