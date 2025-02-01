import { ShaderManager } from './shader-manager';
import { WebGLStateSnapshot } from '../../types/sacred-geometry/state';
import { createDefaultGLState } from './gl-state';

interface GLState extends WebGLStateSnapshot {
  // Additional internal state properties can be added here
}

export class StateManager {
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
    this.currentState = this.createDefaultState();
  }

  private createDefaultState(): GLState {
    return createDefaultGLState(this.gl);
  }

  // Rest of the original implementation remains unchanged...
}