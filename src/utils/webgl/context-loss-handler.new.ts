import { ErrorHandler } from '../../core/error/ErrorHandler';
import { ErrorType } from '../../core/error/ErrorTypes';
import { ShaderManager } from './shader-manager.new';
import { ResourceManager } from './resource-manager.new';
import { StateManager } from './state-manager.new';

export interface ContextLossConfig {
  maxRestoreAttempts: number;
  restoreDelay: number;
  onContextLost?: () => void;
  onContextRestored?: () => void;
  onRestoreFailed?: () => void;
}

export class WebGLContextLossHandler {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private config: ContextLossConfig;
  private errorHandler: ErrorHandler;
  private shaderManager: ShaderManager;
  private resourceManager: ResourceManager;
  private stateManager: StateManager;
  private isContextLost: boolean = false;
  private restoreAttempts: number = 0;
  private resourceStates: Map<string, any> = new Map();
  private boundListeners: boolean = false;

  constructor(
    gl: WebGL2RenderingContext,
    errorHandler: ErrorHandler,
    shaderManager: ShaderManager,
    resourceManager: ResourceManager,
    stateManager: StateManager,
    config?: Partial<ContextLossConfig>
  ) {
    this.gl = gl;
    this.canvas = gl.canvas as HTMLCanvasElement;
    this.errorHandler = errorHandler;
    this.shaderManager = shaderManager;
    this.resourceManager = resourceManager;
    this.stateManager = stateManager;
    this.config = {
      maxRestoreAttempts: 3,
      restoreDelay: 1000,
      ...config
    };
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (this.boundListeners) return;

    this.canvas.addEventListener('webglcontextlost', this.handleContextLost.bind(this));
    this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored.bind(this));
    this.boundListeners = true;
  }

  private captureResourceStates(): void {
    // Capture current state of resources before context loss
    try {
      this.resourceStates.set('shaderPrograms', this.shaderManager.getProgramStates());
      this.resourceStates.set('buffers', this.resourceManager.getBufferStates());
      this.resourceStates.set('textures', this.resourceManager.getTextureStates());
      this.resourceStates.set('glState', this.stateManager.getCurrentState());
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        type: ErrorType.CONTEXT_LOSS,
        context: { action: 'captureResourceStates' }
      });
    }
  }

  private async handleContextLost(event: Event): Promise<void> {
    event.preventDefault();
    this.isContextLost = true;

    try {
      // Capture states before fully losing context
      this.captureResourceStates();

      if (this.config.onContextLost) {
        this.config.onContextLost();
      }

      await this.errorHandler.handleError(
        new Error('WebGL context lost'),
        {
          type: ErrorType.CONTEXT_LOSS,
          context: { 
            attempts: this.restoreAttempts,
            maxAttempts: this.config.maxRestoreAttempts
          }
        }
      );

      // Attempt to restore context
      this.attemptRestore();
    } catch (error) {
      console.error('Error during context loss handling:', error);
    }
  }

  private async attemptRestore(): Promise<void> {
    if (this.restoreAttempts >= this.config.maxRestoreAttempts) {
      if (this.config.onRestoreFailed) {
        this.config.onRestoreFailed();
      }
      await this.errorHandler.handleError(
        new Error('Failed to restore WebGL context after maximum attempts'),
        { type: ErrorType.CONTEXT_LOSS }
      );
      return;
    }

    this.restoreAttempts++;
    setTimeout(() => {
      if (this.isContextLost) {
        // Force a new context creation attempt
        const attrs = this.gl.getContextAttributes();
        this.gl = this.canvas.getContext('webgl2', attrs) as WebGL2RenderingContext;
      }
    }, this.config.restoreDelay);
  }

  private async handleContextRestored(event: Event): Promise<void> {
    this.isContextLost = false;
    this.restoreAttempts = 0;

    try {
      // Restore all resources and state
      await this.restoreResources();
      
      if (this.config.onContextRestored) {
        this.config.onContextRestored();
      }
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        type: ErrorType.CONTEXT_LOSS,
        context: { action: 'handleContextRestored' }
      });
    }
  }

  private async restoreResources(): Promise<void> {
    try {
      // Restore in correct order: shaders -> buffers -> textures -> state
      await this.shaderManager.restorePrograms(this.resourceStates.get('shaderPrograms'));
      await this.resourceManager.restoreBuffers(this.resourceStates.get('buffers'));
      await this.resourceManager.restoreTextures(this.resourceStates.get('textures'));
      this.stateManager.setState(this.resourceStates.get('glState'));
    } catch (error) {
      throw new Error(`Failed to restore WebGL resources: ${error.message}`);
    }
  }

  public cleanup(): void {
    if (this.boundListeners) {
      this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
      this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);
      this.boundListeners = false;
    }
  }

  public isContextCurrentlyLost(): boolean {
    return this.isContextLost;
  }

  public getRestoreAttempts(): number {
    return this.restoreAttempts;
  }
}