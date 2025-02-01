import { WebGLContextError } from '../errors/webgl-error';

interface SecurityOptions {
  antialias?: boolean;
  preserveDrawingBuffer?: boolean;
  failIfMajorPerformanceCaveat?: boolean;
  powerPreference?: 'default' | 'high-performance' | 'low-power';
}

export class ContextSecurity {
  private static instance: ContextSecurity;
  private activeContexts: Set<WebGL2RenderingContext>;
  private contextLostHandlers: Map<WebGL2RenderingContext, (event: Event) => void>;

  private constructor() {
    this.activeContexts = new Set();
    this.contextLostHandlers = new Map();
  }

  static getInstance(): ContextSecurity {
    if (!ContextSecurity.instance) {
      ContextSecurity.instance = new ContextSecurity();
    }
    return ContextSecurity.instance;
  }

  createSecureContext(canvas: HTMLCanvasElement, options: SecurityOptions = {}): WebGL2RenderingContext {
    const contextAttributes: WebGLContextAttributes = {
      alpha: true,
      antialias: options.antialias ?? true,
      depth: true,
      failIfMajorPerformanceCaveat: options.failIfMajorPerformanceCaveat ?? true,
      powerPreference: options.powerPreference ?? 'default',
      premultipliedAlpha: false,
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
      stencil: false,
    };

    const gl = canvas.getContext('webgl2', contextAttributes);
    if (!gl) {
      throw new WebGLContextError();
    }

    // Enable security features
    this.setupContextSecurity(gl);
    
    // Add context lost handling
    this.setupContextLostHandling(canvas, gl);

    this.activeContexts.add(gl);
    return gl;
  }

  private setupContextSecurity(gl: WebGL2RenderingContext): void {
    // Enable security extensions if available
    const securityExtensions = [
      'WEBGL_debug_renderer_info',
      'WEBGL_lose_context'
    ];

    securityExtensions.forEach(ext => {
      try {
        gl.getExtension(ext);
      } catch (e) {
        console.warn(`Security extension ${ext} not available`);
      }
    });

    // Set secure defaults
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  private setupContextLostHandling(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext): void {
    const handleContextLost = (event: Event): void => {
      event.preventDefault();
      this.handleContextLost(gl);
    };

    const handleContextRestored = (): void => {
      this.handleContextRestored(gl);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    this.contextLostHandlers.set(gl, handleContextLost);
  }

  private handleContextLost(gl: WebGL2RenderingContext): void {
    this.activeContexts.delete(gl);
    // Notify the application about context loss
    window.dispatchEvent(new CustomEvent('webglcontextlost', { detail: { gl } }));
  }

  private handleContextRestored(gl: WebGL2RenderingContext): void {
    this.setupContextSecurity(gl);
    this.activeContexts.add(gl);
    // Notify the application about context restoration
    window.dispatchEvent(new CustomEvent('webglcontextrestored', { detail: { gl } }));
  }

  releaseContext(gl: WebGL2RenderingContext): void {
    const handler = this.contextLostHandlers.get(gl);
    if (handler) {
      gl.canvas.removeEventListener('webglcontextlost', handler);
      this.contextLostHandlers.delete(gl);
    }
    this.activeContexts.delete(gl);

    // Force context loss if possible
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) {
      ext.loseContext();
    }
  }

  isContextActive(gl: WebGL2RenderingContext): boolean {
    return this.activeContexts.has(gl);
  }

  validateContext(gl: WebGL2RenderingContext): void {
    if (!this.isContextActive(gl)) {
      throw new WebGLContextError('Context is not active or has been lost');
    }
  }
}

export default ContextSecurity.getInstance();