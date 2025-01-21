import { SACRED_RATIOS } from '../shared/constants';

interface Vec2 {
  x: number;
  y: number;
}

interface Particle {
  position: Vec2;
  velocity: Vec2;
  life: number;
  maxLife: number;
  size: number;
  color: [number, number, number, number];
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private readonly phi = SACRED_RATIOS.PHI;
  private readonly maxParticles = 1000;
  private mousePosition: Vec2 = { x: 0, y: 0 };

  constructor(private gl: WebGL2RenderingContext) {
    this.initParticleBuffer();
  }

  private initParticleBuffer(): void {
    for (let i = 0; i < this.maxParticles; i++) {
      const angle = i * this.phi * Math.PI * 2;
      const radius = Math.sqrt(i) * 0.1;
      const position = {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      };
      
      this.particles.push({
        position,
        velocity: { x: 0, y: 0 },
        life: Math.random() * 3 + 2,
        maxLife: 5,
        size: Math.random() * 2 + 1,
        color: [0, 1, 0.8, 1], // Neon teal
      });
    }
  }

  public update(deltaTime: number): void {
    this.particles.forEach(particle => {
      particle.life -= deltaTime;

      if (particle.life <= 0) {
        this.resetParticle(particle);
      }

      const vertices = this.getMetatronVertices();
      let attractionX = 0;
      let attractionY = 0;

      vertices.forEach(vertex => {
        const dx = vertex.x - particle.position.x;
        const dy = vertex.y - particle.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0.01) {
          const force = 0.0001 / (dist * dist);
          attractionX += dx * force;
          attractionY += dy * force;
        }
      });

      // Mouse influence
      const mouseDx = this.mousePosition.x - particle.position.x;
      const mouseDy = this.mousePosition.y - particle.position.y;
      const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
      
      if (mouseDist > 0.01) {
        const mouseForce = 0.0002 / (mouseDist * mouseDist);
        attractionX += mouseDx * mouseForce;
        attractionY += mouseDy * mouseForce;
      }

      // Update velocity and position
      particle.velocity.x = particle.velocity.x * 0.98 + attractionX;
      particle.velocity.y = particle.velocity.y * 0.98 + attractionY;
      particle.position.x += particle.velocity.x;
      particle.position.y += particle.velocity.y;

      // Update color based on velocity
      const speed = Math.sqrt(
        particle.velocity.x * particle.velocity.x + 
        particle.velocity.y * particle.velocity.y
      );
      particle.color = [
        0,
        1,
        0.8 + Math.min(speed * 2, 0.2),
        (particle.life / particle.maxLife) * 0.8 + 0.2
      ];
    });
  }

  private resetParticle(particle: Particle): void {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 2;
    
    particle.position = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
    
    particle.velocity = { x: 0, y: 0 };
    particle.life = particle.maxLife;
  }

  private getMetatronVertices(): Vec2[] {
    const vertices: Vec2[] = [];
    const centerRadius = 1;

    // Add center point
    vertices.push({ x: 0, y: 0 });

    // Add outer vertices
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      vertices.push({
        x: Math.cos(angle) * centerRadius,
        y: Math.sin(angle) * centerRadius
      });
    }

    // Add inner vertices using golden ratio
    const innerRadius = centerRadius / this.phi;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 + Math.PI / 6;
      vertices.push({
        x: Math.cos(angle) * innerRadius,
        y: Math.sin(angle) * innerRadius
      });
    }

    return vertices;
  }

  public setMousePosition(x: number, y: number): void {
    this.mousePosition = { x, y };
  }

  public getParticles(): Particle[] {
    return this.particles;
  }
}
