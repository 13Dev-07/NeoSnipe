export class WebGLContextLossHandler {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private onLost: () => void;
  private onRestored: () => void;
  private extensionLoseContext: WEBGL_lose_context | null;
  private isContextLost: boolean = false;
  private restoreAttempts: number = 0;
  private readonly MAX_RESTORE_ATTEMPTS = 3;
  private readonly RESTORE_DELAY = 1000; // 1 second

  constructor(
    canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    onLost: () => void,
    onRestored: () => void
  ) {
    this.canvas = canvas;
    this.gl = gl;
    this.onLost = onLost;
    this.onRestored = onRestored;
    this.extensionLoseContext = gl.getExtension('WEBGL_lose_context');

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('webglcontextlost', this.handleContextLost);
    this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored);
  }

  private handleContextLost = (event: Event): void => {
    event.preventDefault();
    this.isContextLost = true;
    this.onLost();

    if (this.restoreAttempts < this.MAX_RESTORE_ATTEMPTS) {
      setTimeout(() => this.attemptRestore(), this.RESTORE_DELAY);
    } else {
      console.error('Maximum WebGL context restore attempts reached');
    }
  };

  private handleContextRestored = (): void => {
    this.isContextLost = false;
    this.restoreAttempts = 0;
    this.onRestored();
  };

  private attemptRestore(): void {
    if (!this.isContextLost) return;

    this.restoreAttempts++;
    
    if (this.extensionLoseContext) {
      this.extensionLoseContext.restoreContext();
    }
  }

  public cleanup(): void {
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);
  }

  public forceContextLoss(): void {
    if (this.extensionLoseContext) {
      this.extensionLoseContext.loseContext();
    }
  }

  public isLost(): boolean {
    return this.isContextLost;
  }
}