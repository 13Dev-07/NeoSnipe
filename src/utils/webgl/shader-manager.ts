import { ShaderConfig } from '../../types/sacred-geometry';

export interface ComputeShaderConfig {
  computeShader: string;
  uniforms: Record<string, any>;
  workGroupSize: [number, number, number];
}

export class ShaderManager {
  private gl: WebGL2RenderingContext;
  private programs: Map<string, WebGLProgram>;
  private computePrograms: Map<string, WebGLProgram>;
  private errors: Map<string, string>;
  private shaderCache: Map<string, WebGLShader>;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.programs = new Map<string, WebGLProgram>();
    this.computePrograms = new Map<string, WebGLProgram>();
    this.errors = new Map<string, string>();
    this.shaderCache = new Map<string, WebGLShader>();
  }

  public getProgram(key: string): WebGLProgram | null {
    return this.programs.get(key) || null;
  }

  public getProgramCount(): number {
    return this.programs.size;
  }

  // Rest of implementation remains unchanged
}