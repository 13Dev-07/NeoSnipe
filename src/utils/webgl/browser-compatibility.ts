import { MemoryMonitor } from '../memory-monitor';

export class BrowserCompatibility {
  private static instance: BrowserCompatibility;
  private webGLVersion: number = 0;
  private fallbackCanvas: HTMLCanvasElement | null = null;
  private supportedExtensions: Set<string> = new Set();

  private constructor() {
    this.detectWebGLSupport();
  }

  public static getInstance(): BrowserCompatibility {
    if (!BrowserCompatibility.instance) {
      BrowserCompatibility.instance = new BrowserCompatibility();
    }
    return BrowserCompatibility.instance;
  }

  private detectWebGLSupport(): void {
    const canvas = document.createElement('canvas');
    
    // Try WebGL 2 first
    let gl = canvas.getContext('webgl2');
    if (gl) {
      this.webGLVersion = 2;
    } else {
      // Fall back to WebGL 1
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        this.webGLVersion = 1;
      }
    }

    if (gl) {
      // Store supported extensions
      const extensions = gl.getSupportedExtensions();
      if (extensions) {
        extensions.forEach(ext => this.supportedExtensions.add(ext));
      }
    }
  }

  public isWebGLAvailable(): boolean {
    return this.webGLVersion > 0;
  }

  public getWebGLVersion(): number {
    return this.webGLVersion;
  }

  public hasExtension(extension: string): boolean {
    return this.supportedExtensions.has(extension);
  }

  public createFallbackRenderer(): HTMLCanvasElement {
    if (!this.fallbackCanvas) {
      this.fallbackCanvas = document.createElement('canvas');
      const ctx = this.fallbackCanvas.getContext('2d');
      if (ctx) {
        // Implement 2D canvas fallback rendering
        this.setupFallbackRenderer(ctx);
      }
    }
    return this.fallbackCanvas;
  }

  private setupFallbackRenderer(ctx: CanvasRenderingContext2D): void {
    // Basic 2D canvas animation loop
    const animate = () => {
      if (!this.fallbackCanvas || !ctx) return;

      const width = this.fallbackCanvas.width;
      const height = this.fallbackCanvas.height;

      ctx.clearRect(0, 0, width, height);
      
      // Simple geometric patterns as fallback
      this.drawGeometricPattern(ctx, width, height);
      
      requestAnimationFrame(animate);
    };

    animate();
  }

  private drawGeometricPattern(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const time = performance.now() * 0.001;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    // Draw circular pattern
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.5)';
      ctx.stroke();
    }
  }

  public getDevicePixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  public isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  public getGPUTier(): 'high' | 'medium' | 'low' {
    // Simple GPU capability detection
    if (!this.isWebGLAvailable()) return 'low';
    
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return 'low';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'medium';

    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
    
    // Check for mobile GPUs
    if (this.isMobile()) {
      return renderer.includes('mali') || renderer.includes('adreno') ? 'medium' : 'low';
    }

    // Desktop GPU detection
    if (renderer.includes('nvidia') || renderer.includes('radeon')) return 'high';
    return 'medium';
  }
}

// Polyfill for requestAnimationFrame
const requestAnimationFramePolyfill = () => {
  let lastTime = 0;
  window.requestAnimationFrame = window.requestAnimationFrame ||
    function(callback) {
      const currentTime = Date.now();
      const timeToCall = Math.max(0, 16 - (currentTime - lastTime));
      const id = window.setTimeout(() => callback(currentTime + timeToCall), timeToCall);
      lastTime = currentTime + timeToCall;
      return id;
    };
};

// Initialize polyfills
requestAnimationFramePolyfill();