import { GeometryData } from '../../types/sacred-geometry';
import { convertToTriangleStrips } from './optimizations/strip-converter';
import { WebGLStateManager } from '../webgl/state-manager';

export class GeometryOptimizer {
  private stateManager: WebGLStateManager;
  private readonly VERTEX_THRESHOLD = 10000;
  private readonly TRIANGLE_THRESHOLD = 5000;

  constructor(gl: WebGL2RenderingContext) {
    this.stateManager = new WebGLStateManager(gl);
  }

  optimizeGeometry(geometry: GeometryData): GeometryData {
    if (this.needsOptimization(geometry)) {
      return this.performOptimization(geometry);
    }
    return geometry;
  }

  private needsOptimization(geometry: GeometryData): boolean {
    return (
      geometry.vertices.length / 3 > this.VERTEX_THRESHOLD ||
      geometry.indices.length / 3 > this.TRIANGLE_THRESHOLD
    );
  }

  private performOptimization(geometry: GeometryData): GeometryData {
    // Implement vertex deduplication
    const optimizedVertices = this.deduplicateVertices(geometry.vertices);
    
    // Update indices to reference deduplicated vertices
    const optimizedIndices = this.updateIndices(geometry.indices, optimizedVertices.indexMap);
    
    // Convert to triangle strips where beneficial
    const stripified = this.convertToTriangleStrips(optimizedIndices);

    return {
      ...geometry,
      vertices: optimizedVertices.vertices,
      indices: stripified.indices,
      drawMode: stripified.useStrips ? WebGL2RenderingContext.TRIANGLE_STRIP : WebGL2RenderingContext.TRIANGLES
    };
  }

  private deduplicateVertices(vertices: number[]): { vertices: number[]; indexMap: Map<number, number> } {
    const uniqueVertices: number[] = [];
    const indexMap = new Map<number, number>();
    const vertexMap = new Map<string, number>();
    const epsilon = 1e-6; // Tolerance for floating point comparison

    // Process vertices in groups of 3 (x,y,z)
    for (let i = 0; i < vertices.length; i += 3) {
      const x = Math.round(vertices[i] / epsilon) * epsilon;
      const y = Math.round(vertices[i + 1] / epsilon) * epsilon;
      const z = Math.round(vertices[i + 2] / epsilon) * epsilon;
      const key = `${x},${y},${z}`;

      let index = vertexMap.get(key);
      if (index === undefined) {
        // New unique vertex
        index = uniqueVertices.length / 3;
        uniqueVertices.push(vertices[i], vertices[i + 1], vertices[i + 2]);
        vertexMap.set(key, index);
      }
      indexMap.set(i / 3, index);
    }
    
    return { vertices: uniqueVertices, indexMap };
  }

  private updateIndices(indices: number[], indexMap: Map<number, number>): number[] {
    // Update indices to reference new vertex positions after deduplication
    return indices.map(index => indexMap.get(index) || index);
  }

  private convertToTriangleStrips(indices: number[]): { indices: number[]; useStrips: boolean } {
    return convertToTriangleStrips(indices);
  }
}