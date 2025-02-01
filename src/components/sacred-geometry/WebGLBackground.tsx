'use client'

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { MetatronsCube } from './patterns/MetatronsCube';
import { VesicaPiscis } from './patterns/VesicaPiscis';
import { PerformanceMonitor } from '@/utils/performance-monitor';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import flowerOfLifeShader from '@/shaders/flower-of-life';
import sriYantraShader from '@/shaders/sri-yantra';

import { SACRED_RATIOS } from '../../shared/constants';
const PHI = SACRED_RATIOS.PHI;

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
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [isWebGL2Available, setIsWebGL2Available] = useState(true);

  const performanceMonitor = useMemo(() => new PerformanceMonitor(), []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    try {
      // Scene setup with WebGL2 support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      
      if (!gl) {
        setIsWebGL2Available(false);
        console.warn('WebGL2 not available, falling back to WebGL1');
      }

      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      cameraRef.current = camera;
      
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        precision: 'highp'
      });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Select shader for sacred geometry
    
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

    // Sacred geometry meshes with instancing and pattern integration
    const createSacredGeometry = () => {
      const group = new THREE.Group();
      
      // Initialize instanced geometry for better performance
      const instanceCount = 7;
      const radius = 5;
      const baseGeometry = new THREE.TorusGeometry(radius, 0.05, 16, 100);
      const instancedGeometry = new THREE.InstancedBufferGeometry().copy(baseGeometry);
      
      const offsets = new Float32Array(instanceCount * 3);
      const scales = new Float32Array(instanceCount);
      const rotations = new Float32Array(instanceCount);
      
      for (let i = 0; i < instanceCount; i++) {
        const angle = (i * Math.PI * 2) / 6;
        offsets[i * 3] = radius * Math.cos(angle);
        offsets[i * 3 + 1] = radius * Math.sin(angle);
        offsets[i * 3 + 2] = 0;
        scales[i] = 1.0;
        rotations[i] = angle;
      }
      
      instancedGeometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3));
      instancedGeometry.setAttribute('scale', new THREE.InstancedBufferAttribute(scales, 1));
      instancedGeometry.setAttribute('rotation', new THREE.InstancedBufferAttribute(rotations, 1));

      // Create instanced material with custom shader
      const instancedMaterial = new THREE.ShaderMaterial({
        uniforms: {
          ...shaderMaterial.uniforms,
          time: { value: 0.0 }
        },
        vertexShader: `
          attribute vec3 offset;
          attribute float scale;
          attribute float rotation;
          uniform float time;
          
          void main() {
            vec3 transformed = position;
            transformed *= scale;
            
            float c = cos(rotation + time * 0.1);
            float s = sin(rotation + time * 0.1);
            mat2 rot = mat2(c, -s, s, c);
            transformed.xy = rot * transformed.xy;
            
            transformed += offset;
            
            vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: shaderMaterial.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending
      });
      
      const instancedMesh = new THREE.Mesh(instancedGeometry, instancedMaterial);
      group.add(instancedMesh);
      
      // Add Metatron's Cube and Vesica Piscis components
      const metatronsCube = new MetatronsCube({
        size: radius * 1.5,
        color,
        rotationSpeed: 0.001 * PHI,
        energyFlowIntensity: intensity
      });
      
      const vesicaPiscis = new VesicaPiscis({
        size: radius * 1.2,
        color,
        rotationSpeed: 0.001 * PHI,
        energyFlowIntensity: intensity
      });
      
      group.add(metatronsCube);
      group.add(vesicaPiscis);
      
      return group;
    };

    const sacredGeometry = createSacredGeometry();
    scene.add(sacredGeometry);

    camera.position.z = 20;

    // Enhanced animation with performance monitoring and adaptive quality
    let time = 0;
    let lastTime = performance.now();
    const animate = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      time += deltaTime * 0.001;

      requestAnimationFrame(animate);
      
      performanceMonitor.update(deltaTime);
      
      // Adaptive quality based on performance
      if (performanceMonitor.shouldReduceQuality()) {
        renderer.setPixelRatio(Math.max(1, window.devicePixelRatio * 0.75));
        particleCount = Math.floor(particleCount * 0.8);
      }

      shaderMaterial.uniforms.time.value = time;
      
      // Update particle system with optimized transformations
      particlesMesh.rotation.y += 0.001 * PHI * deltaTime;
      particlesMesh.rotation.x += 0.0005 * PHI * deltaTime;
      
      // Update sacred geometry with smooth transitions
      sacredGeometry.rotation.z += 0.001 * PHI * deltaTime;
      sacredGeometry.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          child.material.uniforms.time.value = time;
        }
      });
      
      if (sceneRef.current && cameraRef.current) {
        renderer.render(scene, cameraRef.current);
      }
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
      className="webgl-container"
      role="img"
      aria-label={`Sacred geometry visualization with ${particleCount} particles`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          camera.position.x -= 1;
        } else if (e.key === 'ArrowRight') {
          camera.position.x += 1;
        } else if (e.key === 'ArrowUp') {
          camera.position.z -= 1;
        } else if (e.key === 'ArrowDown') {
          camera.position.z += 1;
        }
      }}
      aria-description="Interactive 3D visualization of sacred geometry patterns. Use arrow keys to navigate around the visualization."
    />
  );
};
