import { ShaderConfig } from '../../types/sacred-geometry';

export interface ComputeShaderConfig {
  source: string;
  workGroupSize: [number, number, number];
  uniforms: Record<string, any>;
}

export class ShaderManager {
  private gl: WebGL2RenderingContext;
  private programs: Map<string, WebGLProgram>;
  private computePrograms: Map<string, WebGLProgram>;
  private errors: Map<string, string>;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.programs = new Map();
    this.computePrograms = new Map();
    this.errors = new Map();
  }

  public createProgram(config: ShaderConfig): WebGLProgram | null {
    const key = this.generateProgramKey(config);
    if (this.programs.has(key)) {
      return this.programs.get(key)!;
    }

    try {
      const program = this.compileProgram(config);
      if (program) {
        this.programs.set(key, program);
        return program;
      }
    } catch (error) {
      this.errors.set(key, (error as Error).message);
      console.error('Shader compilation error:', error);
    }
    return null;
  }

  public createComputeProgram(config: ComputeShaderConfig): WebGLProgram | null {
    if (!this.gl.getExtension('WEBGL_compute_shader')) {
      throw new Error('Compute shaders not supported');
    }

    const key = this.generateComputeProgramKey(config);
    if (this.computePrograms.has(key)) {
      return this.computePrograms.get(key)!;
    }

    try {
      const program = this.compileComputeProgram(config);
      if (program) {
        this.computePrograms.set(key, program);
        return program;
      }
    } catch (error) {
      this.errors.set(key, (error as Error).message);
      console.error('Compute shader compilation error:', error);
    }
    return null;
  }

  public useProgram(program: WebGLProgram): void {
    this.gl.useProgram(program);
  }

  public dispatchCompute(program: WebGLProgram, x: number, y: number, z: number): void {
    this.gl.useProgram(program);
    (this.gl as any).dispatchCompute(x, y, z);
    (this.gl as any).memoryBarrier((this.gl as any).SHADER_STORAGE_BARRIER_BIT);
  }

  public deleteProgram(program: WebGLProgram): void {
    this.gl.deleteProgram(program);
    for (const [key, value] of this.programs.entries()) {
      if (value === program) {
        this.programs.delete(key);
        break;
      }
    }
    for (const [key, value] of this.computePrograms.entries()) {
      if (value === program) {
        this.computePrograms.delete(key);
        break;
      }
    }
  }

  public cleanup(): void {
    for (const program of this.programs.values()) {
      this.gl.deleteProgram(program);
    }
    for (const program of this.computePrograms.values()) {
      this.gl.deleteProgram(program);
    }
    this.programs.clear();
    this.computePrograms.clear();
    this.errors.clear();
  }

  public getLastError(): string | null {
    return this.errors.size > 0 ? Array.from(this.errors.values())[this.errors.size - 1] : null;
  }

  private generateProgramKey(config: ShaderConfig): string {
    return `${config.vertexShader.length}-${config.fragmentShader.length}-${Object.keys(config.uniforms).join(',')}`;
  }

  private generateComputeProgramKey(config: ComputeShaderConfig): string {
    return `compute-${config.source.length}-${config.workGroupSize.join(',')}-${Object.keys(config.uniforms).join(',')}`;
  }

  private compileProgram(config: ShaderConfig): WebGLProgram | null {
    const vertexShader = this.compileShader(config.vertexShader, this.gl.VERTEX_SHADER);
    const fragmentShader = this.compileShader(config.fragmentShader, this.gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
      return null;
    }

    const program = this.gl.createProgram();
    if (!program) {
      this.gl.deleteShader(vertexShader);
      this.gl.deleteShader(fragmentShader);
      return null;
    }

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Program linking error: ${error}`);
    }

    return program;
  }

  private compileComputeProgram(config: ComputeShaderConfig): WebGLProgram | null {
    const computeShader = this.compileShader(config.source, (this.gl as any).COMPUTE_SHADER);
    if (!computeShader) {
      return null;
    }

    const program = this.gl.createProgram();
    if (!program) {
      this.gl.deleteShader(computeShader);
      return null;
    }

    this.gl.attachShader(program, computeShader);
    this.gl.linkProgram(program);

    this.gl.deleteShader(computeShader);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Compute program linking error: ${error}`);
    }

    return program;
  }

  private compileShader(source: string, type: number): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (!shader) {
      throw new Error('Failed to create shader');
    }

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compilation error: ${error}`);
    }

    return shader;
  }
}