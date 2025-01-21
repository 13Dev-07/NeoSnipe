declare global {
  interface Window {
    __SACRED_GEOMETRY_DEBUG__?: boolean;
  }

  interface WebGL2RenderingContext {
    readonly COMPUTE_SHADER: number;
    dispatchCompute(x: number, y: number, z: number): void;
    memoryBarrier(barriers: number): void;
    readonly SHADER_STORAGE_BARRIER_BIT: number;
  }

  interface Performance {
    memory?: {
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
    };
  }
}

export {};