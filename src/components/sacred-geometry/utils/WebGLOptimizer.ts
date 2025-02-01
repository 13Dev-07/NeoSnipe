import * as THREE from 'three';
import { SACRED_RATIOS } from '../../../shared/constants';
import { SacredGeometryCalculator } from './SacredGeometryCalculator';

const PHI = SACRED_RATIOS.PHI;

/**
 * WebGL Rendering Optimizer
 * Implements advanced optimization techniques for sacred geometry visualization
 * using golden ratio based resource management and GPU optimization.
 */
export class WebGLOptimizer {
  private static readonly BATCH_SIZE = 144; // Fibonacci number for optimal batching
  private static readonly LOD_LEVELS = 5; // Sacred number of LOD levels
  
  /**
   * Creates an optimized geometry for efficient rendering
   * @param geometry Original geometry
   * @returns Optimized geometry
   */
  static optimizeGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
    // Merge vertices using sacred distance threshold
    geometry.mergeVertices(1 / PHI);
    
    // Compute vertex normals for efficient lighting
    geometry.computeVertexNormals();
    
    // Create bounding sphere using golden ratio
    geometry.computeBoundingSphere();
    
    // Create index buffer if needed
    if (!geometry.index) {
      this.createIndexBuffer(geometry);
    }
    
    return geometry;
  }

  /**
   * Creates optimized material with sacred number based properties
   * @param material Original material
   * @returns Optimized material
   */
  static optimizeMaterial(material: THREE.Material): THREE.Material {
    // Enable geometry instancing
    if (material instanceof THREE.MeshBasicMaterial ||
        material instanceof THREE.MeshPhongMaterial) {
      material.wireframe = false;
    }
    
    // Use vertex colors when possible
    if ('vertexColors' in material) {
      material.vertexColors = true;
    }
    
    // Optimize transparency
    if (material.transparent) {
      material.depthWrite = false;
      material.blending = THREE.AdditiveBlending;
    }
    
    return material;
  }

  /**
   * Creates LOD (Level of Detail) versions of geometry
   * @param geometry Base geometry
   * @returns Array of LOD geometries
   */
  static createLODGeometries(geometry: THREE.BufferGeometry): THREE.BufferGeometry[] {
    const lods: THREE.BufferGeometry[] = [];
    
    for (let i = 0; i < this.LOD_LEVELS; i++) {
      // Calculate reduction ratio using golden ratio powers
      const ratio = Math.pow(1 / PHI, i);
      const simplified = this.simplifyGeometry(geometry, ratio);
      lods.push(simplified);
    }
    
    return lods;
  }

  /**
   * Simplifies geometry while preserving sacred proportions
   * @param geometry Geometry to simplify
   * @param ratio Simplification ratio
   * @returns Simplified geometry
   */
  private static simplifyGeometry(
    geometry: THREE.BufferGeometry,
    ratio: number
  ): THREE.BufferGeometry {
    const positions = geometry.getAttribute('position');
    const vertexCount = Math.floor(positions.count * ratio);
    
    const simplified = new THREE.BufferGeometry();
    const newPositions = new Float32Array(vertexCount * 3);
    
    // Sample vertices using Fibonacci distribution
    const fibonacci = SacredGeometryCalculator.fibonacciSequence(vertexCount);
    
    for (let i = 0; i < vertexCount; i++) {
      const sourceIndex = Math.floor(fibonacci[i] % positions.count) * 3;
      const targetIndex = i * 3;
      
      newPositions[targetIndex] = positions.array[sourceIndex];
      newPositions[targetIndex + 1] = positions.array[sourceIndex + 1];
      newPositions[targetIndex + 2] = positions.array[sourceIndex + 2];
    }
    
    simplified.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
    return simplified;
  }

  /**
   * Creates an optimized index buffer
   * @param geometry Geometry to optimize
   */
  private static createIndexBuffer(geometry: THREE.BufferGeometry): void {
    const positions = geometry.getAttribute('position');
    const indices: number[] = [];
    
    // Create triangle indices using sacred number patterns
    for (let i = 0; i < positions.count; i += 3) {
      const vertexOrder = this.calculateSacredVertexOrder(i);
      indices.push(...vertexOrder);
    }
    
    geometry.setIndex(indices);
  }

  /**
   * Calculates vertex order using sacred number relationships
   * @param baseIndex Starting vertex index
   * @returns Array of vertex indices in sacred order
   */
  private static calculateSacredVertexOrder(baseIndex: number): number[] {
    return [
      baseIndex,
      baseIndex + Math.floor(PHI),
      baseIndex + Math.floor(PHI * PHI)
    ].map(i => i % 3 + baseIndex);
  }

  /**
   * Sets up optimized WebGL renderer
   * @param renderer Three.js renderer
   */
  static optimizeRenderer(renderer: THREE.WebGLRenderer): void {
    // Enable performance optimizations
    renderer.autoClear = false;
    renderer.sortObjects = false;
    
    // Configure pixel ratio using golden ratio
    const pixelRatio = Math.min(window.devicePixelRatio, PHI);
    renderer.setPixelRatio(pixelRatio);
    
    // Enable optimized WebGL features
    const gl = renderer.getContext();
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    // Configure texture anisotropy
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    renderer.capabilities.anisotropy = Math.min(maxAnisotropy, 8); // Fibonacci number
  }

  /**
   * Creates instanced geometries for repeating patterns
   * @param geometry Base geometry
   * @param count Number of instances
   * @param transformFn Function to transform each instance
   * @returns Instanced geometry
   */
  static createInstancedGeometry(
    geometry: THREE.BufferGeometry,
    count: number,
    transformFn: (index: number) => THREE.Matrix4
  ): THREE.InstancedBufferGeometry {
    const instanced = new THREE.InstancedBufferGeometry();
    
    // Copy attributes from base geometry
    Object.keys(geometry.attributes).forEach(key => {
      instanced.setAttribute(key, geometry.attributes[key]);
    });
    
    if (geometry.index) {
      instanced.setIndex(geometry.index);
    }
    
    // Create instance matrices using sacred transformations
    const matrices = new Float32Array(count * 16);
    for (let i = 0; i < count; i++) {
      const matrix = transformFn(i);
      matrix.toArray(matrices, i * 16);
    }
    
    const instanceBuffer = new THREE.InstancedBufferAttribute(matrices, 16);
    instanced.setAttribute('instanceMatrix', instanceBuffer);
    
    return instanced;
  }

  /**
   * Batches multiple geometries for efficient rendering
   * @param geometries Array of geometries to batch
   * @returns Merged geometry
   */
  static batchGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    // Group geometries into Fibonacci-sized batches
    const batches: THREE.BufferGeometry[][] = [];
    for (let i = 0; i < geometries.length; i += this.BATCH_SIZE) {
      batches.push(geometries.slice(i, i + this.BATCH_SIZE));
    }
    
    // Merge each batch using BufferGeometryUtils
    const mergedBatches = batches.map(batch => {
      const merged = THREE.BufferGeometryUtils.mergeBufferGeometries(batch);
      this.optimizeGeometry(merged);
      return merged;
    });
    
    // Merge all batches
    return THREE.BufferGeometryUtils.mergeBufferGeometries(mergedBatches);
  }

  /**
   * Creates worker for parallel geometry processing
   * @param workerFunction Function to run in worker
   * @returns Web Worker instance
   */
  static createGeometryWorker(workerFunction: string): Worker {
    const blob = new Blob([workerFunction], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  }
}