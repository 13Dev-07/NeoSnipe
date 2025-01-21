import { vec2, vec3, mat4 } from 'gl-matrix';
import { 
  GeometryData, 
  SacredGeometryConfig, 
  UniversalConstants,
  EnergyFieldConfig 
} from '../types/sacred-geometry';

const { PHI, PI_PHI, SQRT_PHI } = UniversalConstants;

// Core Geometric Calculations
export class GeometryHelpers {
  /**
   * Generates vertices for a perfect circle using golden ratio spacing
   */
  static createCircle(radius: number, segments: number): Float32Array {
    const vertices: number[] = [];
    const goldenAngle = PI_PHI;
    
    for (let i = 0; i < segments; i++) {
      const angle = goldenAngle * i;
      vertices.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      );
    }
    
    return new Float32Array(vertices);
  }

  /**
   * Creates a vesica piscis from two intersecting circles
   */
  static createVesicaPiscis(radius: number, segments: number): GeometryData {
    const vertices: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    
    // First circle
    const circle1 = this.createCircle(radius, segments);
    // Second circle, offset by radius
    const circle2 = this.createCircle(radius, segments);
    
    for (let i = 0; i < circle1.length; i += 3) {
      vertices.push(circle1[i], circle1[i + 1], circle1[i + 2]);
      vertices.push(circle2[i] + radius, circle2[i + 1], circle2[i + 2]);
      
      normals.push(0, 0, 1);
      normals.push(0, 0, 1);
    }
    
    // Generate indices for triangulation
    for (let i = 0; i < segments - 2; i++) {
      indices.push(0, i + 1, i + 2);
    }
    
    return {
      vertices: new Float32Array(vertices),
      normals: new Float32Array(normals),
      indices: new Uint16Array(indices)
    };
  }

  /**
   * Generates a sacred spiral based on the golden ratio
   */
  static createGoldenSpiral(turns: number, pointsPerTurn: number): Float32Array {
    const points: number[] = [];
    const totalPoints = turns * pointsPerTurn;
    
    for (let i = 0; i < totalPoints; i++) {
      const theta = (i / pointsPerTurn) * PI_PHI * 2;
      const radius = Math.pow(PHI, theta / PI_PHI);
      points.push(
        Math.cos(theta) * radius,
        Math.sin(theta) * radius,
        0
      );
    }
    
    return new Float32Array(points);
  }

  /**
   * Creates vertices for platonic solids
   */
  static createPlatonicSolid(type: 'tetrahedron' | 'cube' | 'octahedron' | 'dodecahedron' | 'icosahedron'): GeometryData {
    switch (type) {
      case 'tetrahedron':
        return this.createTetrahedron();
      case 'cube':
        return this.createCube();
      // ... implement other platonic solids
      default:
        throw new Error(`Unsupported platonic solid type: ${type}`);
    }
  }

  /**
   * Generates a sacred grid based on the flower of life pattern
   */
  static createSacredGrid(rings: number, radius: number): GeometryData {
    const vertices: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    
    // Center point
    vertices.push(0, 0, 0);
    normals.push(0, 0, 1);
    
    // Generate rings
    for (let ring = 1; ring <= rings; ring++) {
      const pointsInRing = 6 * ring;
      for (let point = 0; point < pointsInRing; point++) {
        const angle = (point / pointsInRing) * Math.PI * 2;
        const r = ring * radius * SQRT_PHI;
        vertices.push(
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          0
        );
        normals.push(0, 0, 1);
      }
    }
    
    return {
      vertices: new Float32Array(vertices),
      normals: new Float32Array(normals),
      indices: this.generateIndices(vertices)
    };
  }

  /**
   * Calculates energy field vectors for geometry
   */
  static calculateEnergyField(geometry: GeometryData, config: EnergyFieldConfig): Float32Array {
    const energyField: number[] = [];
    const vertices = geometry.vertices;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const pos = vec3.fromValues(vertices[i], vertices[i + 1], vertices[i + 2]);
      const energy = this.calculateEnergyVector(pos, config);
      energyField.push(...energy);
    }
    
    return new Float32Array(energyField);
  }

  /**
   * Generates smooth normals for geometry
   */
  static calculateSmoothNormals(geometry: GeometryData): Float32Array {
    const normals: number[] = [];
    const vertices = geometry.vertices;
    const indices = geometry.indices;
    
    if (!indices) {
      throw new Error('Indices are required for smooth normal calculation');
    }
    
    // Initialize normals array
    for (let i = 0; i < vertices.length; i++) {
      normals[i] = 0;
    }
    
    // Calculate normals for each face
    for (let i = 0; i < indices.length; i += 3) {
      const v1 = this.getVertex(vertices, indices[i]);
      const v2 = this.getVertex(vertices, indices[i + 1]);
      const v3 = this.getVertex(vertices, indices[i + 2]);
      
      const normal = this.calculateFaceNormal(v1, v2, v3);
      
      // Add normal to all vertices of the face
      this.addNormal(normals, indices[i], normal);
      this.addNormal(normals, indices[i + 1], normal);
      this.addNormal(normals, indices[i + 2], normal);
    }
    
    // Normalize all normals
    for (let i = 0; i < normals.length; i += 3) {
      const normal = vec3.fromValues(normals[i], normals[i + 1], normals[i + 2]);
      vec3.normalize(normal, normal);
      normals[i] = normal[0];
      normals[i + 1] = normal[1];
      normals[i + 2] = normal[2];
    }
    
    return new Float32Array(normals);
  }

  // Private helper methods
  private static calculateEnergyVector(position: vec3, config: EnergyFieldConfig): number[] {
    const energy = vec3.create();
    const center = vec3.fromValues(0, 0, 0);
    
    switch (config.flowPattern) {
      case 'spiral':
        // Calculate spiral energy field
        const distance = vec3.distance(position, center);
        const angle = Math.atan2(position[1], position[0]);
        const spiralForce = Math.exp(-distance / config.intensity);
        vec3.set(
          energy,
          Math.cos(angle + distance) * spiralForce,
          Math.sin(angle + distance) * spiralForce,
          0
        );
        break;
      // Add other energy patterns...
    }
    
    return [energy[0], energy[1], energy[2]];
  }

  private static getVertex(vertices: Float32Array, index: number): vec3 {
    return vec3.fromValues(
      vertices[index * 3],
      vertices[index * 3 + 1],
      vertices[index * 3 + 2]
    );
  }

  private static calculateFaceNormal(v1: vec3, v2: vec3, v3: vec3): vec3 {
    const edge1 = vec3.subtract(vec3.create(), v2, v1);
    const edge2 = vec3.subtract(vec3.create(), v3, v1);
    const normal = vec3.cross(vec3.create(), edge1, edge2);
    return vec3.normalize(normal, normal);
  }

  private static addNormal(normals: number[], index: number, normal: vec3): void {
    normals[index * 3] += normal[0];
    normals[index * 3 + 1] += normal[1];
    normals[index * 3 + 2] += normal[2];
  }

  private static generateIndices(vertices: number[]): Uint16Array {
    // Implement triangulation algorithm
    // This is a placeholder - implement proper triangulation
    const indices: number[] = [];
    for (let i = 0; i < vertices.length / 3 - 2; i++) {
      indices.push(0, i + 1, i + 2);
    }
    return new Uint16Array(indices);
  }
}

export default GeometryHelpers;