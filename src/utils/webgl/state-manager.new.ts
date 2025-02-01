import { ErrorHandler } from '../../core/error/ErrorHandler';
import { ErrorType } from '../../core/error/ErrorTypes';

export interface GLState {
  blend: boolean;
  cullFace: boolean;
  depthTest: boolean;
  stencilTest: boolean;
  scissorTest: boolean;
  viewport: [number, number, number, number];
  activeTexture: number;
  blendFunc: [number, number];
  blendEquation: number;
  depthFunc: number;
  clearColor: [number, number, number, number];
  clearDepth: number;
  clearStencil: number;
}

export class StateManager {
  private gl: WebGL2RenderingContext;
  private errorHandler: ErrorHandler;
  private currentState: GLState;
  private defaultState: GLState;
  private boundBuffers: Map<number, WebGLBuffer | null>;
  private boundTextures: Map<number, WebGLTexture | null>;
  private boundFramebuffers: Map<number, WebGLFramebuffer | null>;
  private activeProgram: WebGLProgram | null;
  private stateChangeCount: number = 0;
  private cachedStates: Map<string, GLState>;

  constructor(gl: WebGL2RenderingContext, errorHandler: ErrorHandler) {
    this.gl = gl;
    this.errorHandler = errorHandler;
    this.defaultState = this.createDefaultState();
    this.currentState = { ...this.defaultState };
    this.boundBuffers = new Map();
    this.boundTextures = new Map();
    this.boundFramebuffers = new Map();
    this.activeProgram = null;
    this.cachedStates = new Map();
  }

  private createDefaultState(): GLState {
    return {
      blend: false,
      cullFace: false,
      depthTest: true,
      stencilTest: false,
      scissorTest: false,
      viewport: [0, 0, this.gl.canvas.width, this.gl.canvas.height],
      activeTexture: this.gl.TEXTURE0,
      blendFunc: [this.gl.ONE, this.gl.ZERO],
      blendEquation: this.gl.FUNC_ADD,
      depthFunc: this.gl.LESS,
      clearColor: [0, 0, 0, 1],
      clearDepth: 1,
      clearStencil: 0
    };
  }

  public saveState(key: string): void {
    this.cachedStates.set(key, { ...this.currentState });
  }

  public restoreState(key: string): void {
    const state = this.cachedStates.get(key);
    if (state) {
      this.setState(state);
    }
  }

  public setState(state: Partial<GLState>): void {
    try {
      Object.entries(state).forEach(([key, value]) => {
        if (JSON.stringify(this.currentState[key as keyof GLState]) !== JSON.stringify(value)) {
          this.applyState(key as keyof GLState, value);
          this.stateChangeCount++;
        }
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        type: ErrorType.WEBGL_ERROR,
        context: { action: 'setState', state }
      });
    }
  }

  private applyState(key: keyof GLState, value: any): void {
    switch (key) {
      case 'blend':
        this.setBlend(value);
        break;
      case 'cullFace':
        this.setCullFace(value);
        break;
      case 'depthTest':
        this.setDepthTest(value);
        break;
      case 'stencilTest':
        this.setStencilTest(value);
        break;
      case 'scissorTest':
        this.setScissorTest(value);
        break;
      case 'viewport':
        this.setViewport(value);
        break;
      case 'activeTexture':
        this.setActiveTexture(value);
        break;
      case 'blendFunc':
        this.setBlendFunc(value[0], value[1]);
        break;
      case 'blendEquation':
        this.setBlendEquation(value);
        break;
      case 'depthFunc':
        this.setDepthFunc(value);
        break;
      case 'clearColor':
        this.setClearColor(value);
        break;
      case 'clearDepth':
        this.setClearDepth(value);
        break;
      case 'clearStencil':
        this.setClearStencil(value);
        break;
    }
  }

  public bindBuffer(target: number, buffer: WebGLBuffer | null): void {
    if (this.boundBuffers.get(target) !== buffer) {
      this.gl.bindBuffer(target, buffer);
      this.boundBuffers.set(target, buffer);
      this.stateChangeCount++;
    }
  }

  public bindTexture(target: number, texture: WebGLTexture | null): void {
    if (this.boundTextures.get(target) !== texture) {
      this.gl.bindTexture(target, texture);
      this.boundTextures.set(target, texture);
      this.stateChangeCount++;
    }
  }

  public bindFramebuffer(target: number, framebuffer: WebGLFramebuffer | null): void {
    if (this.boundFramebuffers.get(target) !== framebuffer) {
      this.gl.bindFramebuffer(target, framebuffer);
      this.boundFramebuffers.set(target, framebuffer);
      this.stateChangeCount++;
    }
  }

  public useProgram(program: WebGLProgram | null): void {
    if (this.activeProgram !== program) {
      this.gl.useProgram(program);
      this.activeProgram = program;
      this.stateChangeCount++;
    }
  }

  public resetToDefault(): void {
    this.setState(this.defaultState);
  }

  public getStateChangeCount(): number {
    return this.stateChangeCount;
  }

  public resetStateChangeCount(): void {
    this.stateChangeCount = 0;
  }

  private setBlend(enable: boolean): void {
    if (this.currentState.blend !== enable) {
      if (enable) {
        this.gl.enable(this.gl.BLEND);
      } else {
        this.gl.disable(this.gl.BLEND);
      }
      this.currentState.blend = enable;
    }
  }

  private setCullFace(enable: boolean): void {
    if (this.currentState.cullFace !== enable) {
      if (enable) {
        this.gl.enable(this.gl.CULL_FACE);
      } else {
        this.gl.disable(this.gl.CULL_FACE);
      }
      this.currentState.cullFace = enable;
    }
  }

  private setDepthTest(enable: boolean): void {
    if (this.currentState.depthTest !== enable) {
      if (enable) {
        this.gl.enable(this.gl.DEPTH_TEST);
      } else {
        this.gl.disable(this.gl.DEPTH_TEST);
      }
      this.currentState.depthTest = enable;
    }
  }

  private setStencilTest(enable: boolean): void {
    if (this.currentState.stencilTest !== enable) {
      if (enable) {
        this.gl.enable(this.gl.STENCIL_TEST);
      } else {
        this.gl.disable(this.gl.STENCIL_TEST);
      }
      this.currentState.stencilTest = enable;
    }
  }

  private setScissorTest(enable: boolean): void {
    if (this.currentState.scissorTest !== enable) {
      if (enable) {
        this.gl.enable(this.gl.SCISSOR_TEST);
      } else {
        this.gl.disable(this.gl.SCISSOR_TEST);
      }
      this.currentState.scissorTest = enable;
    }
  }

  private setViewport(viewport: [number, number, number, number]): void {
    if (!this.arraysEqual(this.currentState.viewport, viewport)) {
      this.gl.viewport(...viewport);
      this.currentState.viewport = [...viewport];
    }
  }

  private setActiveTexture(unit: number): void {
    if (this.currentState.activeTexture !== unit) {
      this.gl.activeTexture(unit);
      this.currentState.activeTexture = unit;
    }
  }

  private setBlendFunc(sfactor: number, dfactor: number): void {
    if (!this.arraysEqual(this.currentState.blendFunc, [sfactor, dfactor])) {
      this.gl.blendFunc(sfactor, dfactor);
      this.currentState.blendFunc = [sfactor, dfactor];
    }
  }

  private setBlendEquation(mode: number): void {
    if (this.currentState.blendEquation !== mode) {
      this.gl.blendEquation(mode);
      this.currentState.blendEquation = mode;
    }
  }

  private setDepthFunc(func: number): void {
    if (this.currentState.depthFunc !== func) {
      this.gl.depthFunc(func);
      this.currentState.depthFunc = func;
    }
  }

  private setClearColor(color: [number, number, number, number]): void {
    if (!this.arraysEqual(this.currentState.clearColor, color)) {
      this.gl.clearColor(...color);
      this.currentState.clearColor = [...color];
    }
  }

  private setClearDepth(depth: number): void {
    if (this.currentState.clearDepth !== depth) {
      this.gl.clearDepth(depth);
      this.currentState.clearDepth = depth;
    }
  }

  private setClearStencil(s: number): void {
    if (this.currentState.clearStencil !== s) {
      this.gl.clearStencil(s);
      this.currentState.clearStencil = s;
    }
  }

  private arraysEqual(a: any[], b: any[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }
}