// visual_design/sacred_patterns/SriYantra/SriYantraAnimation.ts
import { vec2 } from 'gl-matrix';

export class SriYantraAnimation {
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
    this.drawSriYantra(this.rotation);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  private drawSriYantra(rotation: number): void {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.4;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(rotation);
    this.ctx.strokeStyle = '#9674d4';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    // Example: Drawing a simple Sri Yantra pattern with nested triangles
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const x = size * Math.cos(angle);
      const y = size * Math.sin(angle);
      this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.restore();
  }

  public dispose(): void {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.resizeCanvas);
  }
}