import { GeometryData } from '../../types/sacred-geometry';

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface OptimizedGeometry extends GeometryData {
  originalToOptimizedMap: Map<number, number>;
}

export class GeometryOptimizer {
  private static readonly VERTEX_POSITION_EPSILON = 0.0001;

  optimizeGeometry(geometry: GeometryData): OptimizedGeometry {
    const { positions, indices = [], normals, uvs } = geometry;
    
    // Step 1: Identify duplicate vertices
    const uniqueVertices = new Map<string, number>();
    const optimizedPositions: number[] = [];
    const optimizedNormals: number[] = normals ? [] : undefined;
    const optimizedUvs: number[] = uvs ? [] : undefined;
    const originalToOptimizedMap = new Map<number, number>();
    const optimizedIndices: number[] = [];

    // Process each vertex
    for (let i = 0; i < positions.length; i += 3) {
      const vertexKey = this.getVertexKey(
        positions.slice(i, i + 3),
        normals?.slice(i, i + 3),
        uvs?.slice(i * 2 / 3, i * 2 / 3 + 2)
      );

      if (!uniqueVertices.has(vertexKey)) {
        const newIndex = optimizedPositions.length / 3;
        uniqueVertices.set(vertexKey, newIndex);
        
        // Add vertex data
        optimizedPositions.push(...positions.slice(i, i + 3));
        if (normals) {
          optimizedNormals.push(...normals.slice(i, i + 3));
        }
        if (uvs) {
          optimizedUvs.push(...uvs.slice(i * 2 / 3, i * 2 / 3 + 2));
        }
      }
      
      originalToOptimizedMap.set(i / 3, uniqueVertices.get(vertexKey));
    }

    // Update indices
    if (indices.length > 0) {
      for (const index of indices) {
        optimizedIndices.push(originalToOptimizedMap.get(index));
      }
    } else {
      // If no indices provided, generate them
      for (let i = 0; i < positions.length / 3; i++) {
        optimizedIndices.push(originalToOptimizedMap.get(i));
      }
    }

    return {
      positions: optimizedPositions,
      indices: optimizedIndices,
      normals: optimizedNormals,
      uvs: optimizedUvs,
      originalToOptimizedMap
    };
  }

  private getVertexKey(position: number[], normal?: number[], uv?: number[]): string {
    const components = [
      ...position.map(x => Math.round(x / this.VERTEX_POSITION_EPSILON)),
      ...(normal || []).map(x => Math.round(x / this.VERTEX_POSITION_EPSILON)),
      ...(uv || []).map(x => Math.round(x / this.VERTEX_POSITION_EPSILON))
    ];
    return components.join(',');
  }
}

export default GeometryOptimizer;