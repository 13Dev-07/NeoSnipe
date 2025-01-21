// visual_design/sacred_patterns/Particles/GoldenSpiralParticles.ts
import { vec2 } from 'gl-matrix';

interface Particle {
  position: vec2;
  velocity: vec2;
  size: number;
  color: string;
}

export class GoldenSpiralParticles {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationFrameId: number;
  private readonly PHI: number = 1.618033988749895; // Golden Ratio
  private readonly numParticles: number = 100;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context not available');
    this.ctx = context;
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
    this.initParticles();
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  private resizeCanvas = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private initParticles(): void {
    for (let i = 0; i < this.numParticles; i++) {
      const angle = i * Math.PI * 2 / this.PHI;
      const radius = Math.sqrt(i) * 10;
      const x = radius * Math.cos(angle) + this.canvas.width / 2;
      const y = radius * Math.sin(angle) + this.canvas.height / 2;
      this.particles.push({
        position: vec2.fromValues(x, y),
        velocity: vec2.fromValues(Math.cos(angle), Math.sin(angle)),
        size: Math.random() * 2 + 1,
        color: `hsl(${(i * 137.5) % 360}, 70%, 60%)`
      });
    }
  }

  private animate(time: number) {
    this.update();
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  private update(): void {
    for (const particle of this.particles) {
      vec2.add(particle.position, particle.position, particle.velocity);
      // Wrap around the canvas
      if (particle.position[0] < 0) particle.position[0] += this.canvas.width;
      if (particle.position[0] > this.canvas.width) particle.position[0] -= this.canvas.width;
      if (particle.position[1] < 0) particle.position[1] += this.canvas.height;
      if (particle.position[1] > this.canvas.height) particle.position[1] -= this.canvas.height;
    }
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const particle of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(particle.position[0], particle.position[1], particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();
    }
  }

  public dispose(): void {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.resizeCanvas);
  }
}