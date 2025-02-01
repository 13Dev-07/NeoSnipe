import { GeometryData } from '../../types/sacred-geometry';
import { Vector3 } from '../../types/geometry';
import { mat4, vec3 } from 'gl-matrix';
import { GeometryOptimizer } from './geometry-optimizer';

export class MetatronsCube {
  private readonly SPHERE_SEGMENTS = 32;
  private readonly CIRCLE_SEGMENTS = 64;
  private readonly CENTER_SPHERE_RADIUS = 1.0;
  private readonly OUTER_SPHERE_RADIUS = 0.5;
  private readonly OUTER_SPHERE_COUNT = 13;
  private readonly optimizer: GeometryOptimizer;

  constructor(gl: WebGL2RenderingContext) {
    this.optimizer = new GeometryOptimizer(gl);
  }

  generateGeometry(): GeometryData {
    // Generate base geometries
    const centerSphere = this.generateSphereGeometry(vec3.fromValues(0, 0, 0), this.CENTER_SPHERE_RADIUS);
    const outerSpheres = this.generateOuterSpheres();
    const connectingLines = this.generateConnectingLines();

    // Validate individual components
    const validation = validateGeometryData(centerSphere);
    if (!validation.isValid) {
      throw new Error(`Invalid center sphere geometry: ${validation.errors.join(', ')}`);
    }

    for (const sphere of outerSpheres) {
      const sphereValidation = validateGeometryData(sphere);
      if (!sphereValidation.isValid) {
        throw new Error(`Invalid outer sphere geometry: ${sphereValidation.errors.join(', ')}`);
      }
    }

    const linesValidation = validateGeometryData(connectingLines);
    if (!linesValidation.isValid) {
      throw new Error(`Invalid connecting lines geometry: ${linesValidation.errors.join(', ')}`);
    }

    // Combine all geometries
    const combinedGeometry = this.combineGeometries([centerSphere, ...outerSpheres, connectingLines]);

    // Validate combined geometry
    const combinedValidation = validateMetatronsCubeGeometry(combinedGeometry);
    if (!combinedValidation.isValid) {
      throw new Error(`Invalid Metatron's Cube geometry: ${combinedValidation.errors.join(', ')}`);
    }

    // Optimize the combined geometry
    const optimizedGeometry = this.optimizer.optimizeGeometry(combinedGeometry);

    // Validate optimization
    const optimizationValidation = validateGeometryOptimization(combinedGeometry, optimizedGeometry);
    if (!optimizationValidation.isValid) {
      throw new Error(`Invalid geometry optimization: ${optimizationValidation.errors.join(', ')}`);
    }

    return optimizedGeometry;
  }

  private generateSphereGeometry(position: vec3, radius: number): GeometryData {
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    // Generate vertices for a UV sphere
    for (let lat = 0; lat <= this.SPHERE_SEGMENTS; lat++) {
      const theta = (lat * Math.PI) / this.SPHERE_SEGMENTS;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let long = 0; long <= this.SPHERE_SEGMENTS; long++) {
        const phi = (long * 2 * Math.PI) / this.SPHERE_SEGMENTS;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        vertices.push(x * radius + position[0]);
        vertices.push(y * radius + position[1]);
        vertices.push(z * radius + position[2]);

        normals.push(x);
        normals.push(y);
        normals.push(z);

        uvs.push(long / this.SPHERE_SEGMENTS);
        uvs.push(lat / this.SPHERE_SEGMENTS);
      }
    }

    // Generate indices
    for (let lat = 0; lat < this.SPHERE_SEGMENTS; lat++) {
      for (let long = 0; long < this.SPHERE_SEGMENTS; long++) {
        const first = lat * (this.SPHERE_SEGMENTS + 1) + long;
        const second = first + this.SPHERE_SEGMENTS + 1;

        indices.push(first);
        indices.push(second);
        indices.push(first + 1);

        indices.push(second);
        indices.push(second + 1);
        indices.push(first + 1);
      }
    }

    return {
      vertices,
      indices,
      normals,
      uvs,
      drawMode: WebGL2RenderingContext.TRIANGLES
    };
  }

  private generateOuterSpheres(): GeometryData[] {
    const spheres: GeometryData[] = [];
    const positions = this.calculateOuterSpherePositions();

    for (const position of positions) {
      spheres.push(this.generateSphereGeometry(position, this.OUTER_SPHERE_RADIUS));
    }

    return spheres;
  }

  private calculateOuterSpherePositions(): vec3[] {
    const positions: vec3[] = [];
    const baseRadius = this.CENTER_SPHERE_RADIUS * 2;

    // Generate positions in Fibonacci spiral around center
    const phi = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = 2 * Math.PI / phi;

    for (let i = 0; i < this.OUTER_SPHERE_COUNT; i++) {
      const angle = angleIncrement * i;
      const radius = baseRadius;
      const height = baseRadius * Math.sin(angle);

      const x = radius * Math.cos(angle);
      const y = height;
      const z = radius * Math.sin(angle);

      positions.push(vec3.fromValues(x, y, z));
    }

    return positions;
  }

  private generateConnectingLines(): GeometryData {
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    const positions = [vec3.fromValues(0, 0, 0), ...this.calculateOuterSpherePositions()];

    // Generate connecting lines between all spheres
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const start = positions[i];
        const end = positions[j];

        // Add line vertices
        vertices.push(...start);
        vertices.push(...end);

        // Add line indices
        const baseIndex = vertices.length / 3 - 2;
        indices.push(baseIndex, baseIndex + 1);

        // Add dummy normals and UVs for consistency
        normals.push(0, 1, 0, 0, 1, 0);
        uvs.push(0, 0, 1, 1);
      }
    }

    return {
      vertices,
      indices,
      normals,
      uvs,
      drawMode: WebGL2RenderingContext.LINES
    };
  }

  private combineGeometries(geometries: GeometryData[]): GeometryData {
    const combined: GeometryData = {
      vertices: [],
      indices: [],
      normals: [],
      uvs: [],
      drawMode: WebGL2RenderingContext.TRIANGLES
    };

    let vertexOffset = 0;

    for (const geometry of geometries) {
      // Add vertices
      combined.vertices.push(...geometry.vertices);

      // Add indices with offset
      const offsetIndices = geometry.indices.map(index => index + vertexOffset);
      combined.indices.push(...offsetIndices);

      // Add normals and UVs
      combined.normals.push(...geometry.normals);
      combined.uvs.push(...geometry.uvs);

      vertexOffset += geometry.vertices.length / 3;
    }

    return combined;
  }
}