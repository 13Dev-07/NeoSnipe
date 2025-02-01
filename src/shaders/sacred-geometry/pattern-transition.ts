import { WebGLProgram, WebGLShader } from 'three';
import { ShaderManager } from '../../utils/webgl/shader-manager';
import { WebGLResourcePool } from '../../utils/webgl/resource-pool';
import { WebGLPerformanceMonitor } from '../../utils/webgl/performance-monitor';

export class PatternTransitionManager {
  private gl: WebGL2RenderingContext;
  private shaderManager: ShaderManager;
  private resourcePool: WebGLResourcePool;
  private performanceMonitor: WebGLPerformanceMonitor;
  
  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.shaderManager = new ShaderManager(gl);
    this.resourcePool = new WebGLResourcePool(gl);
    this.performanceMonitor = WebGLPerformanceMonitor.getInstance(gl);
  }

  public async transition(
    fromPattern: string,
    toPattern: string,
    duration: number = 1000,
    easing: (t: number) => number = (t) => t
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const animate = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress < 1) {
          this.renderTransition(fromPattern, toPattern, easing(progress));
          requestAnimationFrame(animate);
        } else {
          this.renderTransition(fromPattern, toPattern, 1);
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  private renderTransition(fromPattern: string, toPattern: string, progress: number): void {
    // Start frame monitoring
    this.performanceMonitor.beginFrame();
    
    // Set up transition uniforms
    const uniforms = {
      u_transition: progress,
      u_time: performance.now() / 1000,
      u_resolution: [this.gl.canvas.width, this.gl.canvas.height]
    };

    // Render from pattern with fadeout
    this.renderPattern(fromPattern, { ...uniforms, u_transition: 1 - progress });
    
    // Render to pattern with fadein
    this.renderPattern(toPattern, { ...uniforms, u_transition: progress });
    
    // End frame monitoring
    this.performanceMonitor.endFrame();
  }

  private renderPattern(pattern: string, uniforms: Record<string, any>): void {
    // Get shader program from cache or create new one
    const program = this.shaderManager.createProgram({
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(pattern),
      uniforms
    });

    if (program) {
      this.performanceMonitor.recordShaderSwitch();
      this.gl.useProgram(program);
      
      // Set uniforms
      this.setUniforms(program, uniforms);
      
      // Draw
      this.draw();
    }
  }

  private getVertexShader(): string {
    return `#version 300 es
    in vec4 a_position;
    void main() {
      gl_Position = a_position;
    }`;
  }

  private getFragmentShader(pattern: string): string {
    // Load and return appropriate fragment shader based on pattern name
    return require(`./${pattern}.glsl`);
  }

  private setUniforms(program: WebGLProgram, uniforms: Record<string, any>): void {
    Object.entries(uniforms).forEach(([name, value]) => {
      const location = this.gl.getUniformLocation(program, name);
      if (location !== null) {
        if (Array.isArray(value)) {
          if (value.length === 2) {
            this.gl.uniform2fv(location, value);
          } else if (value.length === 3) {
            this.gl.uniform3fv(location, value);
          } else if (value.length === 4) {
            this.gl.uniform4fv(location, value);
          }
        } else if (typeof value === 'number') {
          this.gl.uniform1f(location, value);
        }
      }
    });
  }

  private draw(): void {
    // Use instanced rendering for better performance
    this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, 6, 1);
    this.performanceMonitor.recordDrawCall(2); // 2 triangles per quad
  }

  public cleanup(): void {
    this.resourcePool.cleanup();
    this.shaderManager.cleanup();
  }
}