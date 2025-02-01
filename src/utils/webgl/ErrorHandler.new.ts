import { webGLPerformanceMonitor } from '../performance/WebGLPerformanceMonitor';

export class WebGLError extends Error {
  constructor(
    message: string,
    public readonly gl?: WebGLRenderingContext,
    public readonly source?: string
  ) {
    super(message);
    this.name = 'WebGLError';

    // Log error metrics
    if (webGLPerformanceMonitor) {
      webGLPerformanceMonitor.recordMetric('error', 0, {
        type: this.name,
        message: this.message,
        source: this.source
      });
    }
  }
}

export interface ErrorHandlerOptions {
  enableLogging?: boolean;
  onError?: (error: WebGLError) => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

export class ErrorHandler {
  private options: Required<ErrorHandlerOptions>;
  private gl: WebGLRenderingContext;
  private errorStack: WebGLError[] = [];
  private readonly MAX_ERROR_STACK = 50;

  constructor(gl: WebGLRenderingContext, options: ErrorHandlerOptions = {}) {
    this.gl = gl;
    this.options = {
      enableLogging: true,
      onError: () => {},
      onContextLost: () => {},
      onContextRestored: () => {},
      ...options
    };

    this.setupContextLossHandling();
  }

  private setupContextLossHandling(): void {
    const canvas = this.gl.canvas as HTMLCanvasElement;

    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.handleContextLost();
    }, false);

    canvas.addEventListener('webglcontextrestored', () => {
      this.handleContextRestored();
    }, false);
  }

  private handleContextLost(): void {
    const error = new WebGLError('WebGL context lost', this.gl);
    this.handleError(error);
    this.options.onContextLost();
  }

  private handleContextRestored(): void {
    // Log context restoration
    if (this.options.enableLogging) {
      console.log('WebGL context restored');
    }

    this.options.onContextRestored();
  }

  public handleError(error: WebGLError): void {
    // Add error to stack
    this.errorStack.push(error);
    if (this.errorStack.length > this.MAX_ERROR_STACK) {
      this.errorStack.shift();
    }

    // Log error if enabled
    if (this.options.enableLogging) {
      console.error('WebGL Error:', error.message);
      if (error.source) {
        console.error('Source:', error.source);
      }
    }

    // Call error callback
    this.options.onError(error);
  }

  public validateProgram(program: WebGLProgram): void {
    const gl = this.gl;

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      throw new WebGLError(
        `Invalid program: ${gl.getProgramInfoLog(program)}`,
        gl,
        'program validation'
      );
    }
  }

  public getLastError(): WebGLError | undefined {
    return this.errorStack[this.errorStack.length - 1];
  }

  public clearErrors(): void {
    this.errorStack = [];
  }

  public getErrorStack(): readonly WebGLError[] {
    return [...this.errorStack];
  }

  public isContextLost(): boolean {
    return this.gl.isContextLost();
  }

  public checkFramebufferStatus(target: number = this.gl.FRAMEBUFFER): void {
    const gl = this.gl;
    const status = gl.checkFramebufferStatus(target);

    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      let message: string;

      switch (status) {
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
          message = 'Framebuffer incomplete attachment';
          break;
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
          message = 'Framebuffer missing attachment';
          break;
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
          message = 'Framebuffer dimensions not supported';
          break;
        case gl.FRAMEBUFFER_UNSUPPORTED:
          message = 'Framebuffer format not supported';
          break;
        default:
          message = `Framebuffer error: ${status}`;
      }

      throw new WebGLError(message, gl, 'framebuffer validation');
    }
  }
}