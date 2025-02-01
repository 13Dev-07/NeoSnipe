import { WebGLContext } from '../../../types/gl-types';
import { SACRED_SHADER_INCLUDES } from '../../../utils/shader-utils';

export class WebGLRenderer {
  private gl: WebGLContext;
  private canvas: HTMLCanvasElement;
  private shaderProgram: WebGLProgram | null = null;
  private postProcessingProgram: WebGLProgram | null = null;
  private frameBuffers: WebGLFramebuffer[] = [];
  private textures: WebGLTexture[] = [];
  
  // Geometry buffers
  private vertexBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private numIndices: number = 0;
  
  // Matrices
  private projectionMatrix: Float32Array;
  private modelMatrix: Float32Array;
  private viewMatrix: Float32Array;
  private rotationMatrix: Float32Array;
  
  // Uniform locations
  private projectionLocation: WebGLUniformLocation | null = null;
  private modelViewLocation: WebGLUniformLocation | null = null;
  private timeLocation: WebGLUniformLocation | null = null;
  
  // Animation
  private startTime: number = Date.now();
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('webgl2');
    if (!context) {
      throw new Error('WebGL2 not supported');
    }
    this.gl = context;
    this.initializeRenderer();
  }

  private initializeRenderer(): void {
    const gl = this.gl;
    
    // Initialize WebGL context with MSAA and depth testing
    gl.enable(gl.SAMPLE_COVERAGE);
    gl.enable(gl.DEPTH_TEST);
    gl.sampleCoverage(1.0, false);
    
    // Setup post-processing
    this.setupPostProcessing();
    
    // Create shader programs
    this.createShaderPrograms();
    
    // Initialize buffers and attributes
    this.initializeGeometry();
    
    // Setup event handlers
    this.setupEventHandlers();
    
    // Set initial viewport
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  private createShaderPrograms(): void {
    const gl = this.gl;
    
    // Main geometry shader program
    const vertexShader = this.createShader(gl.VERTEX_SHADER, SACRED_SHADER_INCLUDES.flowerOfLife.vertex);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, SACRED_SHADER_INCLUDES.flowerOfLife.fragment);
    this.shaderProgram = this.createProgram(vertexShader, fragmentShader);
    
    // Post-processing shader program
    const postVertexShader = this.createShader(gl.VERTEX_SHADER, SACRED_SHADER_INCLUDES.postProcess.vertex);
    const postFragmentShader = this.createShader(gl.FRAGMENT_SHADER, SACRED_SHADER_INCLUDES.postProcess.fragment);
    this.postProcessingProgram = this.createProgram(postVertexShader, postFragmentShader);
    
    // Cleanup individual shaders
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(postVertexShader);
    gl.deleteShader(postFragmentShader);
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

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const gl = this.gl;
    const program = gl.createProgram();
    if (!program) {
      throw new Error('Failed to create shader program');
    }
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error('Shader program linking error: ' + info);
    }
    
    return program;
  }

  private setupPostProcessing(): void {
    const gl = this.gl;
    
    // Create framebuffers for multi-pass rendering
    this.frameBuffers = [
      this.createFramebuffer(gl.drawingBufferWidth, gl.drawingBufferHeight),
      this.createFramebuffer(gl.drawingBufferWidth, gl.drawingBufferHeight)
    ];
    
    // Create textures for post-processing effects
    this.textures = [
      this.createTexture(gl.drawingBufferWidth, gl.drawingBufferHeight),
      this.createTexture(gl.drawingBufferWidth, gl.drawingBufferHeight)
    ];
  }

  private createFramebuffer(width: number, height: number): WebGLFramebuffer {
    const gl = this.gl;
    const framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
      throw new Error('Failed to create framebuffer');
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    return framebuffer;
  }

  private createTexture(width: number, height: number): WebGLTexture {
    const gl = this.gl;
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create texture');
    }
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    return texture;
  }

  private setupEventHandlers(): void {
    let isTouch = false;
    let lastX = 0;
    let lastY = 0;

    const handleStart = (x: number, y: number) => {
      lastX = x;
      lastY = y;
    };

    const handleMove = (x: number, y: number) => {
      const deltaX = x - lastX;
      const deltaY = y - lastY;
      this.updateRotation(deltaX, deltaY);
      lastX = x;
      lastY = y;
    };

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      isTouch = true;
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (!isTouch) return;
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    });

    this.canvas.addEventListener('touchend', () => {
      isTouch = false;
    });

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      if (isTouch) return;
      handleStart(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (isTouch) return;
      handleMove(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('mouseup', () => {
      if (isTouch) return;
    });
  }

  private updateRotation(deltaX: number, deltaY: number): void {
    const rotationSpeed = 0.005;
    this.rotationMatrix = mat4.rotate(
      this.rotationMatrix,
      this.rotationMatrix,
      rotationSpeed * deltaX,
      [0, 1, 0]
    );
    this.rotationMatrix = mat4.rotate(
      this.rotationMatrix,
      this.rotationMatrix,
      rotationSpeed * deltaY,
      [1, 0, 0]
    );
    this.render();
  }

  private initializeGeometry(): void {
    const gl = this.gl;
    
    // Create vertex buffer for flower of life geometry
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.generateFlowerOfLife(), gl.STATIC_DRAW);
    
    // Create index buffer
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.generateIndices(), gl.STATIC_DRAW);
    
    // Initialize matrices
    this.projectionMatrix = mat4.perspective(mat4.create(), Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 100.0);
    this.modelMatrix = mat4.create();
    this.viewMatrix = mat4.create();
    this.rotationMatrix = mat4.create();
    
    // Set camera position
    mat4.translate(this.viewMatrix, this.viewMatrix, [0, 0, -5]);
  }

  private generateFlowerOfLife(): Float32Array {
    const vertices = [];
    const radius = 1.0;
    const centerPoints = this.calculateFlowerOfLifeCenters(radius);
    
    // Generate vertices for each circle
    centerPoints.forEach(center => {
      const circleVertices = this.generateCircle(center[0], center[1], radius / 3);
      vertices.push(...circleVertices);
    });
    
    return new Float32Array(vertices);
  }

  private calculateFlowerOfLifeCenters(radius: number): number[][] {
    const centers = [[0, 0]];
    const hexagonPoints = 6;
    const angleStep = (Math.PI * 2) / hexagonPoints;
    
    // First ring
    for (let i = 0; i < hexagonPoints; i++) {
      const angle = i * angleStep;
      centers.push([
        radius * Math.cos(angle),
        radius * Math.sin(angle)
      ]);
    }
    
    // Second ring
    for (let i = 0; i < hexagonPoints; i++) {
      const angle = i * angleStep + angleStep / 2;
      const r = radius * Math.sqrt(3);
      centers.push([
        r * Math.cos(angle),
        r * Math.sin(angle)
      ]);
    }
    
    return centers;
  }

  private generateCircle(centerX: number, centerY: number, radius: number): number[] {
    const vertices = [];
    const segments = 32;
    const angleStep = (Math.PI * 2) / segments;
    
    for (let i = 0; i <= segments; i++) {
      const angle = i * angleStep;
      vertices.push(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle),
        0.0
      );
    }
    
    return vertices;
  }

  private generateIndices(): Uint16Array {
    const indices = [];
    const verticesPerCircle = 33; // 32 segments + 1 to close the circle
    const numCircles = 19; // 1 center + 6 first ring + 12 second ring
    
    for (let circle = 0; circle < numCircles; circle++) {
      const offset = circle * verticesPerCircle;
      for (let i = 0; i < verticesPerCircle - 1; i++) {
        indices.push(offset + i, offset + i + 1);
      }
    }
    
    return new Uint16Array(indices);
  }

  public render(): void {
    const gl = this.gl;
    
    // Bind first framebuffer for initial render pass
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[0]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Main geometry rendering pass
    this.renderGeometry();
    
    // Post-processing passes
    this.applyPostProcessing();
    
    // Final render to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.renderFinal();
  }

  private renderGeometry(): void {
    const gl = this.gl;
    
    if (!this.shaderProgram || !this.vertexBuffer || !this.indexBuffer) {
      return;
    }
    
    gl.useProgram(this.shaderProgram);
    
    // Set up attribute pointers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    const positionLocation = gl.getAttribLocation(this.shaderProgram, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    
    // Update uniforms
    if (this.projectionLocation && this.modelViewLocation && this.timeLocation) {
      // Combine model and view matrices
      const modelView = mat4.create();
      mat4.multiply(modelView, this.viewMatrix, this.modelMatrix);
      mat4.multiply(modelView, modelView, this.rotationMatrix);
      
      gl.uniformMatrix4fv(this.projectionLocation, false, this.projectionMatrix);
      gl.uniformMatrix4fv(this.modelViewLocation, false, modelView);
      gl.uniform1f(this.timeLocation, (Date.now() - this.startTime) / 1000.0);
    }
    
    // Draw geometry
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.LINES, this.numIndices, gl.UNSIGNED_SHORT, 0);
  }

  private applyPostProcessing(): void {
    const gl = this.gl;
    
    if (!this.postProcessingProgram) {
      return;
    }
    
    // Bind second framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[1]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.useProgram(this.postProcessingProgram);
    
    // Set up texture from first pass
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
    
    const textureLocation = gl.getUniformLocation(this.postProcessingProgram, 'uMainTexture');
    gl.uniform1i(textureLocation, 0);
    
    // Apply post-processing effects
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private renderFinal(): void {
    const gl = this.gl;
    
    if (!this.postProcessingProgram) {
      return;
    }
    
    gl.useProgram(this.postProcessingProgram);
    
    // Bind final texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);
    
    const textureLocation = gl.getUniformLocation(this.postProcessingProgram, 'uMainTexture');
    gl.uniform1i(textureLocation, 0);
    
    // Render to screen
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // Request next frame
    this.animationFrameId = requestAnimationFrame(() => this.render());
  }

  public cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    const gl = this.gl;
    
    // Delete framebuffers
    this.frameBuffers.forEach(buffer => {
      gl.deleteFramebuffer(buffer);
    });
    
    // Delete textures
    this.textures.forEach(texture => {
      gl.deleteTexture(texture);
    });
    
    // Delete shader programs
    if (this.shaderProgram) {
      gl.deleteProgram(this.shaderProgram);
    }
    if (this.postProcessingProgram) {
      gl.deleteProgram(this.postProcessingProgram);
    }
  }
}