import { WebGLContext } from '../../../types/gl-types';
import { SACRED_SHADER_INCLUDES } from '../../../utils/shader-utils';
import { mat4 } from 'gl-matrix';

export class TrianglePatterns {
  private gl: WebGLContext;
  private canvas: HTMLCanvasElement;
  private shaderProgram: WebGLProgram | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private numIndices: number = 0;

  // Transformation matrices
  private projectionMatrix: Float32Array;
  private modelMatrix: Float32Array;
  private viewMatrix: Float32Array;
  
  // Uniform locations
  private projectionLocation: WebGLUniformLocation | null = null;
  private modelViewLocation: WebGLUniformLocation | null = null;
  private energyFlowLocation: WebGLUniformLocation | null = null;
  
  // Animation state
  private startTime: number = Date.now();
  private animationFrameId: number | null = null;
  private energyFlow: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('webgl2');
    if (!context) {
      throw new Error('WebGL2 not supported');
    }
    this.gl = context;
    this.initialize();
  }

  private initialize(): void {
    const gl = this.gl;
    
    // Enable depth testing and blending
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Create shader program
    this.createShaderProgram();
    
    // Initialize geometry
    this.initializeGeometry();
    
    // Set up matrices
    this.setupMatrices();
    
    // Start animation
    this.animate();
  }

  private createShaderProgram(): void {
    const gl = this.gl;
    
    const vertexShader = this.createShader(gl.VERTEX_SHADER, SACRED_SHADER_INCLUDES.sriYantra.vertex);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, SACRED_SHADER_INCLUDES.sriYantra.fragment);
    
    const program = gl.createProgram();
    if (!program) {
      throw new Error('Failed to create shader program');
    }
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw new Error('Shader program linking error: ' + info);
    }
    
    this.shaderProgram = program;
    
    // Get uniform locations
    this.projectionLocation = gl.getUniformLocation(program, 'uProjection');
    this.modelViewLocation = gl.getUniformLocation(program, 'uModelView');
    this.energyFlowLocation = gl.getUniformLocation(program, 'uEnergyFlow');
    
    // Cleanup
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  }

  private createShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error('Failed to create shader');
    }
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('Shader compilation error: ' + info);
    }
    
    return shader;
  }

  private initializeGeometry(): void {
    const gl = this.gl;
    
    // Generate Sri Yantra geometry
    const { vertices, indices } = this.generateSriYantraGeometry();
    
    // Create and populate vertex buffer
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    // Create and populate index buffer
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    this.numIndices = indices.length;
  }

  private generateSriYantraGeometry(): { vertices: number[]; indices: number[] } {
    const vertices: number[] = [];
    const indices: number[] = [];
    let indexOffset = 0;
    
    // Generate nine interlocking triangles
    for (let i = 0; i < 9; i++) {
      const angle = (Math.PI * 2 * i) / 9;
      const radius = 0.8;
      
      // Calculate triangle points
      const centerX = Math.cos(angle) * radius * 0.2;
      const centerY = Math.sin(angle) * radius * 0.2;
      
      for (let j = 0; j < 3; j++) {
        const triangleAngle = angle + (Math.PI * 2 * j) / 3;
        vertices.push(
          centerX + Math.cos(triangleAngle) * radius,
          centerY + Math.sin(triangleAngle) * radius,
          0.0
        );
      }
      
      // Add indices for triangle
      indices.push(
        indexOffset,
        indexOffset + 1,
        indexOffset + 2
      );
      indexOffset += 3;
    }
    
    return { vertices, indices };
  }

  private setupMatrices(): void {
    // Initialize projection matrix
    this.projectionMatrix = mat4.perspective(
      mat4.create(),
      Math.PI / 4,
      this.canvas.width / this.canvas.height,
      0.1,
      100.0
    );
    
    // Initialize model matrix
    this.modelMatrix = mat4.create();
    
    // Initialize view matrix and set camera position
    this.viewMatrix = mat4.create();
    mat4.translate(this.viewMatrix, this.viewMatrix, [0, 0, -3]);
  }

  private render(): void {
    const gl = this.gl;
    
    if (!this.shaderProgram) {
      return;
    }
    
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.useProgram(this.shaderProgram);
    
    // Update and set uniforms
    const modelView = mat4.create();
    mat4.multiply(modelView, this.viewMatrix, this.modelMatrix);
    
    if (this.projectionLocation && this.modelViewLocation && this.energyFlowLocation) {
      gl.uniformMatrix4fv(this.projectionLocation, false, this.projectionMatrix);
      gl.uniformMatrix4fv(this.modelViewLocation, false, modelView);
      gl.uniform1f(this.energyFlowLocation, this.energyFlow);
    }
    
    // Set up vertex attributes
    if (this.vertexBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      const positionLocation = gl.getAttribLocation(this.shaderProgram, 'position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    }
    
    // Draw triangles
    if (this.indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    }
  }

  private animate(): void {
    // Update energy flow
    const time = (Date.now() - this.startTime) / 1000;
    this.energyFlow = (Math.sin(time) + 1) / 2;
    
    // Render frame
    this.render();
    
    // Request next frame
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  public cleanup(): void {
    // Stop animation
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    const gl = this.gl;
    
    // Delete buffers
    if (this.vertexBuffer) {
      gl.deleteBuffer(this.vertexBuffer);
    }
    if (this.indexBuffer) {
      gl.deleteBuffer(this.indexBuffer);
    }
    
    // Delete shader program
    if (this.shaderProgram) {
      gl.deleteProgram(this.shaderProgram);
    }
  }
}