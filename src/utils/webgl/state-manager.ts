import { ShaderManager } from './shader-manager';
import { mat4, vec3 } from 'gl-matrix';

interface GLState {
  program: WebGLProgram | null;
  vertexArray: WebGLVertexArrayObject | null;
  viewport: [number, number, number, number];
  depthTest: boolean;
  blending: boolean;
  cullFace: boolean;
  frontFace: number;
  depthMask: boolean;
  depthFunc: number;
  blendFunc: [number, number];
  clearColor: [number, number, number, number];
}

export class WebGLStateManager {
  private gl: WebGL2RenderingContext;
  private shaderManager: ShaderManager;
  private currentState: GLState;
  private stateStack: GLState[];
  private boundTextures: Map<number, WebGLTexture>;
  private boundBuffers: Map<number, WebGLBuffer>;
  private activeAttributes: Set<number>;
  private resourceRegistry: Set<WebGLObject>;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.shaderManager = new ShaderManager(gl);
    this.stateStack = [];
    this.boundTextures = new Map();
    this.boundBuffers = new Map();
    this.activeAttributes = new Set();
    this.resourceRegistry = new Set();

    this.currentState = {
      program: null,
      vertexArray: null,
      viewport: [0, 0, gl.canvas.width, gl.canvas.height],
      depthTest: true,
      blending: false,
      cullFace: false,
      frontFace: gl.CCW,
      depthMask: true,
      depthFunc: gl.LESS,
      blendFunc: [gl.ONE, gl.ONE_MINUS_SRC_ALPHA],
      clearColor: [0, 0, 0, 1]
    };

    this.applyState(this.currentState);
  }

  public pushState(): void {
    this.stateStack.push({ ...this.currentState });
  }

  public popState(): void {
    const state = this.stateStack.pop();
    if (state) {
      this.applyState(state);
      this.currentState = state;
    }
  }

  public useProgram(program: WebGLProgram): void {
    if (this.currentState.program !== program) {
      this.gl.useProgram(program);
      this.currentState.program = program;
    }
  }

  public bindVertexArray(vao: WebGLVertexArrayObject | null): void {
    if (this.currentState.vertexArray !== vao) {
      this.gl.bindVertexArray(vao);
      this.currentState.vertexArray = vao;
    }
  }

  public setViewport(x: number, y: number, width: number, height: number): void {
    const viewport: [number, number, number, number] = [x, y, width, height];
    if (!this.arraysEqual(this.currentState.viewport, viewport)) {
      this.gl.viewport(x, y, width, height);
      this.currentState.viewport = viewport;
    }
  }

  public setDepthTest(enable: boolean): void {
    if (this.currentState.depthTest !== enable) {
      if (enable) {
        this.gl.enable(this.gl.DEPTH_TEST);
      } else {
        this.gl.disable(this.gl.DEPTH_TEST);
      }
      this.currentState.depthTest = enable;
    }
  }

  public setBlending(enable: boolean): void {
    if (this.currentState.blending !== enable) {
      if (enable) {
        this.gl.enable(this.gl.BLEND);
      } else {
        this.gl.disable(this.gl.BLEND);
      }
      this.currentState.blending = enable;
    }
  }

  public setBlendFunc(src: number, dst: number): void {
    const func: [number, number] = [src, dst];
    if (!this.arraysEqual(this.currentState.blendFunc, func)) {
      this.gl.blendFunc(src, dst);
      this.currentState.blendFunc = func;
    }
  }

  public setCullFace(enable: boolean): void {
    if (this.currentState.cullFace !== enable) {
      if (enable) {
        this.gl.enable(this.gl.CULL_FACE);
      } else {
        this.gl.disable(this.gl.CULL_FACE);
      }
      this.currentState.cullFace = enable;
    }
  }

  public bindTexture(target: number, texture: WebGLTexture | null): void {
    if (this.boundTextures.get(target) !== texture) {
      this.gl.bindTexture(target, texture);
      if (texture) {
        this.boundTextures.set(target, texture);
      } else {
        this.boundTextures.delete(target);
      }
    }
  }

  public bindBuffer(target: number, buffer: WebGLBuffer | null): void {
    if (this.boundBuffers.get(target) !== buffer) {
      this.gl.bindBuffer(target, buffer);
      if (buffer) {
        this.boundBuffers.set(target, buffer);
      } else {
        this.boundBuffers.delete(target);
      }
    }
  }

  public enableVertexAttribArray(location: number): void {
    if (!this.activeAttributes.has(location)) {
      this.gl.enableVertexAttribArray(location);
      this.activeAttributes.add(location);
    }
  }

  public disableVertexAttribArray(location: number): void {
    if (this.activeAttributes.has(location)) {
      this.gl.disableVertexAttribArray(location);
      this.activeAttributes.delete(location);
    }
  }

  public registerResource(resource: WebGLObject): void {
    this.resourceRegistry.add(resource);
  }

  public cleanup(): void {
    // Clean up all registered resources
    for (const resource of this.resourceRegistry) {
      if (resource instanceof WebGLBuffer) {
        this.gl.deleteBuffer(resource);
      } else if (resource instanceof WebGLTexture) {
        this.gl.deleteTexture(resource);
      } else if (resource instanceof WebGLFramebuffer) {
        this.gl.deleteFramebuffer(resource);
      } else if (resource instanceof WebGLRenderbuffer) {
        this.gl.deleteRenderbuffer(resource);
      } else if (resource instanceof WebGLShader) {
        this.gl.deleteShader(resource);
      } else if (resource instanceof WebGLProgram) {
        this.gl.deleteProgram(resource);
      }
    }

    this.resourceRegistry.clear();
    this.boundTextures.clear();
    this.boundBuffers.clear();
    this.activeAttributes.clear();
    this.stateStack = [];
    this.shaderManager.cleanup();
  }

  public getShaderManager(): ShaderManager {
    return this.shaderManager;
  }

  private applyState(state: GLState): void {
    this.useProgram(state.program);
    this.bindVertexArray(state.vertexArray);
    this.setViewport(...state.viewport);
    this.setDepthTest(state.depthTest);
    this.setBlending(state.blending);
    this.setCullFace(state.cullFace);
    this.gl.frontFace(state.frontFace);
    this.gl.depthMask(state.depthMask);
    this.gl.depthFunc(state.depthFunc);
    this.setBlendFunc(...state.blendFunc);
    this.gl.clearColor(...state.clearColor);
  }

  private arraysEqual(a: any[], b: any[]): boolean {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
}