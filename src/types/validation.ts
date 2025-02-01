import { GeometryData, Vector3 } from './geometry';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateGeometryData(geometry: GeometryData): ValidationResult {
  const errors: string[] = [];

  // Check for required properties
  if (!geometry.vertices || !geometry.vertices.length) {
    errors.push('Geometry vertices are missing or empty');
  }

  if (!geometry.indices || !geometry.indices.length) {
    errors.push('Geometry indices are missing or empty');
  }

  // Validate vertices format
  if (geometry.vertices.length % 3 !== 0) {
    errors.push('Vertices array length must be a multiple of 3');
  }

  // Validate indices
  const vertexCount = geometry.vertices.length / 3;
  const invalidIndex = geometry.indices.find(index => index >= vertexCount || index < 0);
  if (invalidIndex !== undefined) {
    errors.push(`Invalid vertex index: ${invalidIndex}`);
  }

  // Validate normals if present
  if (geometry.normals) {
    if (geometry.normals.length !== geometry.vertices.length) {
      errors.push('Normals array length must match vertices array length');
    }
  }

  // Validate UVs if present
  if (geometry.uvs) {
    if (geometry.uvs.length !== (geometry.vertices.length / 3) * 2) {
      errors.push('UVs array length must be 2/3 of vertices array length');
    }
  }

  // Validate draw mode
  const validDrawModes = [
    WebGL2RenderingContext.TRIANGLES,
    WebGL2RenderingContext.LINES,
    WebGL2RenderingContext.POINTS,
    WebGL2RenderingContext.TRIANGLE_STRIP
  ];

  if (geometry.drawMode && !validDrawModes.includes(geometry.drawMode)) {
    errors.push('Invalid draw mode specified');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateVector3(vec: Vector3): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(vec) || vec.length !== 3) {
    errors.push('Vector3 must be an array of length 3');
  } else if (!vec.every(n => typeof n === 'number' && !isNaN(n))) {
    errors.push('Vector3 must contain only valid numbers');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateTextureSize(width: number, height: number, maxSize: number): ValidationResult {
  const errors: string[] = [];

  if (!Number.isInteger(width) || width <= 0) {
    errors.push('Width must be a positive integer');
  }

  if (!Number.isInteger(height) || height <= 0) {
    errors.push('Height must be a positive integer');
  }

  if (width > maxSize || height > maxSize) {
    errors.push(`Texture dimensions cannot exceed ${maxSize}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function isPowerOf2(value: number): boolean {
  return value > 0 && (value & (value - 1)) === 0;
}

export function validateShaderProgram(gl: WebGL2RenderingContext, program: WebGLProgram): ValidationResult {
  const errors: string[] = [];
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    errors.push(`Program linking failed: ${info}`);
  }

  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    errors.push(`Program validation failed: ${info}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}