import { WebGLError } from '../../types/errors/webgl-errors';

export class GeometryValidationError extends WebGLError {
  constructor(message: string, public details?: Record<string, any>) {
    super(`Geometry validation failed: ${message}`);
    this.name = 'GeometryValidationError';
  }
}

export class OptimizationError extends WebGLError {
  constructor(message: string, public metrics?: Record<string, number>) {
    super(`Optimization failed: ${message}`);
    this.name = 'OptimizationError';
  }
}

export class PatternGenerationError extends WebGLError {
  constructor(message: string, public patternType: string) {
    super(`Pattern generation failed for ${patternType}: ${message}`);
    this.name = 'PatternGenerationError';
  }
}