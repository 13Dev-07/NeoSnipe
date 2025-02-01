import { ErrorHandler } from '../../core/error/ErrorHandler';
import { ErrorType } from '../../core/error/ErrorTypes';
import { ShaderConfig } from '../../types/sacred-geometry';

export interface ShaderValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ShaderManager {
  private gl: WebGL2RenderingContext;
  private programs: Map<string, WebGLProgram>;
  private computePrograms: Map<string, WebGLProgram>;
  private shaderCache: Map<string, WebGLShader>;
  private errorHandler: ErrorHandler;
  private programReferences: Map<string, number>;
  private programStates: Map<string, { vertexSource: string, fragmentSource: string }>;
  private validateShaders: boolean;

  constructor(
    gl: WebGL2RenderingContext,
    errorHandler: ErrorHandler,
    options: { validateShaders?: boolean } = {}
  ) {
    this.gl = gl;
    this.errorHandler = errorHandler;
    this.programs = new Map();
    this.computePrograms = new Map();
    this.shaderCache = new Map();
    this.programReferences = new Map();
    this.validateShaders = options.validateShaders ?? true;
  }

  public async createProgram(
    key: string,
    vertexSource: string,
    fragmentSource: string
  ): Promise<WebGLProgram | null> {
    try {
      if (this.validateShaders) {
        const vertexValidation = this.validateShaderSource(vertexSource, this.gl.VERTEX_SHADER);
        const fragmentValidation = this.validateShaderSource(fragmentSource, this.gl.FRAGMENT_SHADER);

        if (!vertexValidation.isValid || !fragmentValidation.isValid) {
          throw new Error(
            'Shader validation failed:\n' +
            vertexValidation.errors.concat(fragmentValidation.errors).join('\n')
          );
        }
      }

      const vertexShader = await this.createShader(vertexSource, this.gl.VERTEX_SHADER);
      const fragmentShader = await this.createShader(fragmentSource, this.gl.FRAGMENT_SHADER);

      if (!vertexShader || !fragmentShader) {
        throw new Error('Failed to create shaders');
      }

      const program = this.gl.createProgram();
      if (!program) {
        throw new Error('Failed to create shader program');
      }

      this.gl.attachShader(program, vertexShader);
      this.gl.attachShader(program, fragmentShader);
      this.gl.linkProgram(program);

      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        const info = this.gl.getProgramInfoLog(program);
        throw new Error(`Failed to link shader program: ${info}`);
      }

      this.programs.set(key, program);
      this.programReferences.set(key, 1);
      return program;
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        type: ErrorType.SHADER_ERROR,
        context: { key, action: 'createProgram' }
      });
      return null;
    }
  }

  private validateShaderSource(source: string, type: number): ShaderValidationResult {
    const result: ShaderValidationResult = { isValid: true, errors: [] };

    // Basic security checks
    if (source.includes('preprocessor')) {
      result.isValid = false;
      result.errors.push('Preprocessor directives are not allowed');
    }

    if (source.includes('gl_') && !source.match(/gl_(Position|FragColor|PointSize)/)) {
      result.isValid = false;
      result.errors.push('Unauthorized built-in variable usage detected');
    }

    // Check for potential infinite loops
    const loopMatches = source.match(/for\s*\([^;]*;[^;]*;[^)]*\)/g) || [];
    for (const loop of loopMatches) {
      if (!loop.includes('++') && !loop.includes('--') && !loop.includes('+=')) {
        result.isValid = false;
        result.errors.push('Potentially infinite loop detected');
      }
    }

    return result;
  }

  private async createShader(source: string, type: number): Promise<WebGLShader | null> {
    const shader = this.gl.createShader(type);
    if (!shader) {
      throw new Error('Failed to create shader');
    }

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Failed to compile shader: ${info}`);
    }

    return shader;
  }

  public useProgram(key: string): void {
    const program = this.programs.get(key);
    if (program) {
      this.gl.useProgram(program);
      const refs = this.programReferences.get(key) || 0;
      this.programReferences.set(key, refs + 1);
    }
  }

  public deleteProgram(key: string): void {
    const program = this.programs.get(key);
    if (program) {
      const refs = (this.programReferences.get(key) || 1) - 1;
      if (refs <= 0) {
        this.gl.deleteProgram(program);
        this.programs.delete(key);
        this.programReferences.delete(key);
      } else {
        this.programReferences.set(key, refs);
      }
    }
  }

  public cleanup(): void {
    this.programs.forEach((program, key) => {
      this.gl.deleteProgram(program);
    });
    this.programs.clear();
    this.programReferences.clear();

    this.shaderCache.forEach(shader => {
      this.gl.deleteShader(shader);
    });
    this.shaderCache.clear();
  }

  public getProgram(key: string): WebGLProgram | null {
    return this.programs.get(key) || null;
  }

  public getProgramCount(): number {
    return this.programs.size;
  }

  public getComputeProgram(key: string): WebGLProgram | null {
    return this.computePrograms.get(key) || null;
  }
}