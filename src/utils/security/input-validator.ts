import { ValidationError } from '../errors/validation-error';
import { SacredPattern, PatternConfig } from '../../types/sacred-geometry';

export class InputValidator {
  private static instance: InputValidator;
  private readonly ALLOWED_PATTERNS: Set<string>;
  
  private constructor() {
    this.ALLOWED_PATTERNS = new Set(['metatrons-cube', 'vesica-piscis', 'flower-of-life']);
  }

  static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator();
    }
    return InputValidator.instance;
  }

  validatePattern(pattern: string): asserts pattern is SacredPattern {
    if (!this.ALLOWED_PATTERNS.has(pattern)) {
      throw new ValidationError(`Invalid pattern: ${pattern}`);
    }
  }

  validatePatternConfig(config: Partial<PatternConfig>): void {
    // Validate intensity
    if (config.intensity !== undefined) {
      if (typeof config.intensity !== 'number' || config.intensity < 0 || config.intensity > 2) {
        throw new ValidationError('Intensity must be a number between 0 and 2');
      }
    }

    // Validate rotation
    if (config.rotation !== undefined) {
      if (!['static', 'continuous', 'oscillating'].includes(config.rotation)) {
        throw new ValidationError('Invalid rotation type');
      }
    }

    // Validate energyFlow
    if (config.energyFlow !== undefined) {
      if (!['balanced', 'spiral', 'radial', 'linear'].includes(config.energyFlow)) {
        throw new ValidationError('Invalid energy flow type');
      }
    }

    // Validate color
    if (config.color !== undefined) {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (typeof config.color !== 'string' || !colorRegex.test(config.color)) {
        throw new ValidationError('Invalid color format: must be a hex color code');
      }
    }

    // Validate duration
    if (config.duration !== undefined) {
      if (typeof config.duration !== 'number' || config.duration <= 0) {
        throw new ValidationError('Duration must be a positive number');
      }
    }
  }

  validateWebGLContext(gl: WebGL2RenderingContext | null): void {
    if (!gl) {
      throw new Error('WebGL2 not supported');
    }

    // Check required WebGL2 features
    const requiredExtensions = [
      'EXT_color_buffer_float',
      'OES_texture_float_linear'
    ];

    for (const ext of requiredExtensions) {
      if (!gl.getExtension(ext)) {
        throw new Error(`Required WebGL extension not supported: ${ext}`);
      }
    }

    // Verify maximum texture size
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (maxTextureSize < 2048) {
      throw new Error('Insufficient maximum texture size');
    }

    // Check compute shader support if needed
    const computeShaderExt = gl.getExtension('WEBGL_compute_shader');
    if (!computeShaderExt) {
      console.warn('Compute shaders not supported - falling back to fragment shader implementation');
    }
  }

  validateShaderCode(code: string): void {
    // Check for potential security issues in shader code
    const blacklistedKeywords = [
      'while',
      'for',
      'do',
      'switch',
      'goto',
      'continue',
      'break'
    ];

    for (const keyword of blacklistedKeywords) {
      if (code.includes(keyword)) {
        throw new ValidationError(`Shader code contains potentially unsafe keyword: ${keyword}`);
      }
    }

    // Check for reasonable shader length
    if (code.length > 10000) {
      throw new ValidationError('Shader code exceeds maximum allowed length');
    }

    // Basic syntax validation
    try {
      new Function(code);
    } catch (e) {
      throw new ValidationError(`Invalid shader code syntax: ${e.message}`);
    }
  }

  sanitizeNumericInput(value: number, min: number, max: number): number {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError('Invalid numeric input');
    }
    return Math.max(min, Math.min(max, value));
  }

  validateResourcePath(path: string): void {
    // Prevent path traversal
    if (path.includes('..') || path.startsWith('/')) {
      throw new ValidationError('Invalid resource path');
    }

    // Check allowed file extensions
    const allowedExtensions = ['.glsl', '.vert', '.frag', '.comp'];
    const hasValidExtension = allowedExtensions.some(ext => path.endsWith(ext));
    if (!hasValidExtension) {
      throw new ValidationError('Invalid file extension');
    }
  }
}

export default InputValidator.getInstance();