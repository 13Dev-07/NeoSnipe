import { GeometryData } from '../../types/sacred-geometry';
import { validateGeometryData, ValidationResult } from '../../types/validation';

export function validateMetatronsCubeGeometry(geometry: GeometryData): ValidationResult {
  // First perform basic geometry validation
  const baseValidation = validateGeometryData(geometry);
  if (!baseValidation.isValid) {
    return baseValidation;
  }

  const errors: string[] = [];

  // Validate specific requirements for Metatron's Cube
  const vertexCount = geometry.vertices.length / 3;
  const minExpectedVertices = 32 * 32 * 14; // 13 outer spheres + 1 center sphere
  
  if (vertexCount < minExpectedVertices) {
    errors.push(`Insufficient vertex count for Metatron's Cube. Expected at least ${minExpectedVertices}, got ${vertexCount}`);
  }

  // Validate sphere positions
  const centerFound = validateCenterSphere(geometry.vertices);
  if (!centerFound) {
    errors.push('Center sphere not found at origin');
  }

  // Validate connecting lines
  const linesValid = validateConnectingLines(geometry);
  if (!linesValid) {
    errors.push('Invalid or missing connecting lines between spheres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateCenterSphere(vertices: number[]): boolean {
  // Check if there are vertices near the origin (0,0,0)
  const epsilon = 0.0001;
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];
    
    if (Math.abs(x) < epsilon && Math.abs(y) < epsilon && Math.abs(z) < epsilon) {
      return true;
    }
  }
  return false;
}

function validateConnectingLines(geometry: GeometryData): boolean {
  if (geometry.drawMode === WebGL2RenderingContext.LINES) {
    // For line geometry, verify we have enough line segments
    const expectedLineCount = 91; // Number of connections in Metatron's Cube
    return geometry.indices.length / 2 >= expectedLineCount;
  }
  return true; // Skip validation for non-line geometries
}

export function validateGeometryOptimization(
  original: GeometryData,
  optimized: GeometryData,
  options: { allowIncrease?: boolean; epsilon?: number } = {}
): ValidationResult {
  const errors: string[] = [];

  // Verify vertex count reduction
  if (optimized.vertices.length >= original.vertices.length) {
    errors.push('Optimization did not reduce vertex count');
  }

  // Verify index integrity
  const maxIndex = Math.max(...optimized.indices);
  const vertexCount = optimized.vertices.length / 3;
  if (maxIndex >= vertexCount) {
    errors.push('Invalid vertex indices after optimization');
  }

  // Verify geometric equivalence
  if (!validateGeometricEquivalence(original, optimized)) {
    errors.push('Geometric shape changed during optimization');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

import { buildVertexConnections, compareVertexConnectivity } from './geometry-utils';

function validateGeometricEquivalence(a: GeometryData, b: GeometryData): boolean {
  // Numerical precision for vertex comparison
  const EPSILON = 1e-6;
  
  // Compare vertex counts
  if (a.vertices.length !== b.vertices.length ||
      a.indices.length !== b.indices.length) {
    return false;
  }

  // Compare vertices with epsilon tolerance
  for (let i = 0; i < a.vertices.length; i++) {
    if (Math.abs(a.vertices[i] - b.vertices[i]) > EPSILON) {
      return false;
    }
  }

  // Compare topology through vertex connectivity
  const aConnections = buildVertexConnections(a);
  const bConnections = buildVertexConnections(b);

  if (!compareVertexConnectivity(aConnections, bConnections)) {
    return false;
  }

  // Compare normals if present
  if (a.normals && b.normals) {
    for (let i = 0; i < a.normals.length; i++) {
      if (Math.abs(a.normals[i] - b.normals[i]) > EPSILON) {
        return false;
      }
    }
  }

  // Compare UVs if present
  if (a.uvs && b.uvs) {
    for (let i = 0; i < a.uvs.length; i++) {
      if (Math.abs(a.uvs[i] - b.uvs[i]) > EPSILON) {
        return false;
      }
    }
  }

  return true;
}