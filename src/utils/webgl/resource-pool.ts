export interface PoolConfig {
  initialSize?: number;
  maxSize?: number;
  growthFactor?: number;
}

export class WebGLResourcePool {
  private gl: WebGL2RenderingContext;
  private buffers: Set<WebGLBuffer>;
  private available: Set<WebGLBuffer>;
  private maxSize: number;
  private growthFactor: number;

  constructor(gl: WebGL2RenderingContext, config: PoolConfig = {}) {
    this.gl = gl;
    this.buffers = new Set();
    this.available = new Set();
    this.maxSize = config.maxSize || 1000;
    this.growthFactor = config.growthFactor || 1.5;

    this.initialize(config.initialSize || 10);
  }

  private initialize(size: number): void {
    for (let i = 0; i < size; i++) {
      const buffer = this.gl.createBuffer();
      if (buffer) {
        this.buffers.add(buffer);
        this.available.add(buffer);
      }
    }
  }

  public acquire(): WebGLBuffer | null {
    if (this.available.size === 0) {
      this.grow();
    }

    const buffer = this.available.values().next().value;
    if (buffer) {
      this.available.delete(buffer);
    }
    return buffer;
  }

  public release(buffer: WebGLBuffer): void {
    if (this.buffers.has(buffer)) {
      this.available.add(buffer);
    }
  }

  private grow(): void {
    const currentSize = this.buffers.size;
    const growthSize = Math.min(
      Math.floor(currentSize * this.growthFactor) - currentSize,
      this.maxSize - currentSize
    );

    for (let i = 0; i < growthSize; i++) {
      const buffer = this.gl.createBuffer();
      if (buffer) {
        this.buffers.add(buffer);
        this.available.add(buffer);
      }
    }
  }

  public cleanup(): void {
    for (const buffer of this.buffers) {
      this.gl.deleteBuffer(buffer);
    }
    this.buffers.clear();
    this.available.clear();
  }

  public getUtilization(): number {
    return (this.buffers.size - this.available.size) / this.buffers.size;
  }
}