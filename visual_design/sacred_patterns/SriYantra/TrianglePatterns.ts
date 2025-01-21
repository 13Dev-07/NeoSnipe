// visual_design/sacred_patterns/SriYantra/TrianglePatterns.ts
import { vec2 } from 'gl-matrix';

export class TrianglePatterns {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number;
  private rotation: number = 0;
  private readonly PHI: number = 1.618033988749895; // Golden Ratio

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context not available');
    this.ctx = context;
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  private resizeCanvas = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private animate(time: number) {
    this.rotation += 0.001 * this.PHI;
    this.drawTriangles(this.rotation);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  private drawTriangles(rotation: number): void {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.3;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(rotation);
    this.ctx.strokeStyle = '#00FFCC';
    this.ctx.lineWidth = 1;

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(size * Math.cos(angle), size * Math.sin(angle));
      this.ctx.lineTo(size * Math.cos(angle + Math.PI / 3), size * Math.sin(angle + Math.PI / 3));
      this.ctx.closePath();
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  public dispose(): void {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.resizeCanvas);
  }
}