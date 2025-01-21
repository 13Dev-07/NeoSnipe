// Create a new file: SacredGeometrySystem.ts

import WebGLRenderer from './WebGLRenderer';

export class SacredGeometrySystem {
  private renderers: WebGLRenderer[] = [];

  addVisualization(canvasId: string, pattern: string): void {
    const renderer = new WebGLRenderer(canvasId);
    renderer.setPattern(pattern);
    this.renderers.push(renderer);
  }

  animate(): void {
    const animateFrame = (time: number) => {
      this.renderers.forEach(renderer => renderer.render(time));
      requestAnimationFrame(animateFrame);
    };
    requestAnimationFrame(animateFrame);
  }
}

// Usage in main application
const system = new SacredGeometrySystem();
system.addVisualization('canvas1', 'flowerOfLife');
system.addVisualization('canvas2', 'metatronsCube');
system.animate();
