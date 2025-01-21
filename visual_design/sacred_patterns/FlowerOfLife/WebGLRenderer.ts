import { vec2, mat4 } from 'gl-matrix';

// Types
interface ShaderProgram {
  program: WebGLProgram;
  uniforms: { [key: string]: WebGLUniformLocation };
  attributes: { [key: string]: number };
}

interface RenderTarget {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
  depthBuffer?: WebGLRenderbuffer;
}

interface PerformanceMetrics {
  frameTime: number;
  drawCalls: number;
  triangleCount: number;
}

// Shader constants
const mainVertexShader = `#version 300 es
  precision highp float;
  
  in vec3 position;
  in vec3 normal;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float time;
  
  out vec3 vNormal;
  out vec3 vPosition;
  
  void main() {
    vNormal = normal;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const mainFragmentShader = `#version 300 es
  precision highp float;
  
  in vec3 vNormal;
  in vec3 vPosition;
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 interactionPoint;
  
  out vec4 fragColor;
  
  void main() {
    vec3 color = vec3(0.5) + 0.5 * normalize(vNormal);
    float interaction = distance(vec2(vPosition.xy), interactionPoint);
    interaction = 1.0 - smoothstep(0.0, 0.5, interaction);
    
    fragColor = vec4(color * (0.8 + 0.2 * interaction), 1.0);
  }
`;

const postProcessVertexShader = `#version 300 es
  precision highp float;
  in vec2 position;
  out vec2 vUv;
  
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const postProcessFragmentShader = `#version 300 es
  precision highp float;
  in vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform float time;
  out vec4 fragColor;
  
  void main() {
    vec4 color = texture(tDiffuse, vUv);
    float vignette = length(vUv - 0.5) * 0.5;
    color.rgb *= 1.0 - vignette;
    color.rgb *= 0.9 + 0.1 * sin(time * 0.001);
    fragColor = color;
  }
`;

export class WebGLRenderer {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private program!: ShaderProgram;
  private postProcessProgram!: ShaderProgram;
  private frameCount: number = 0;
  private lastFPSUpdate: number = 0;
  private fps: number = 0;
  private isDisposed: boolean = false;
  
  private postProcessBuffer!: RenderTarget;
  private positionBuffer!: WebGLBuffer;
  private normalBuffer!: WebGLBuffer;
  private interactionPoint: [number, number] = [0, 0];
  
  private performanceMetrics: PerformanceMetrics = {
    frameTime: 0,
    drawCalls: 0,
    triangleCount: 0
  };

  private modelViewMatrix: mat4 = mat4.create();
  private projectionMatrix: mat4 = mat4.create();

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas with id ${canvasId} not found`);
    }

    const gl = this.canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false
    });

    if (!gl) {
      throw new Error('WebGL2 not supported');
    }

    this.gl = gl;
    this.initializeGL();
    this.createPrograms();
    this.initBuffers();
    this.setupPostProcessing();
    this.bindEvents();
  }
  private initializeGL(): void {
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.resize();
  }

  private createPrograms(): void {
    try {
      // Main rendering program
      const vertexShader = this.compileShader(mainVertexShader, this.gl.VERTEX_SHADER);
      const fragmentShader = this.compileShader(mainFragmentShader, this.gl.FRAGMENT_SHADER);
      this.program = this.createShaderProgram(vertexShader, fragmentShader);

      // Post-processing program
      const postVertexShader = this.compileShader(postProcessVertexShader, this.gl.VERTEX_SHADER);
      const postFragmentShader = this.compileShader(postProcessFragmentShader, this.gl.FRAGMENT_SHADER);
      this.postProcessProgram = this.createShaderProgram(postVertexShader, postFragmentShader);
    } catch (error) {
      console.error('Error creating shader programs:', error);
      throw error;
    }
  }

  private compileShader(source: string, type: number): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) {
      throw new Error('Failed to create shader');
    }

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compilation error: ${error}`);
    }

    return shader;
  }

  private createShaderProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): ShaderProgram {
    const program = this.gl.createProgram();
    if (!program) {
      throw new Error('Failed to create shader program');
    }

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program);
      throw new Error(`Failed to link shader program: ${error}`);
    }

    // Get uniforms and attributes
    const uniforms: { [key: string]: WebGLUniformLocation } = {};
    const attributes: { [key: string]: number } = {};

    // Get active uniforms
    const numUniforms = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) {
      const info = this.gl.getActiveUniform(program, i);
      if (info) {
        const location = this.gl.getUniformLocation(program, info.name);
        if (location) {
          uniforms[info.name] = location;
        }
      }
    }

    // Get active attributes
    const numAttributes = this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttributes; i++) {
      const info = this.gl.getActiveAttrib(program, i);
      if (info) {
        attributes[info.name] = this.gl.getAttribLocation(program, info.name);
      }
    }

    // Clean up shaders
    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);

    return { program, uniforms, attributes };
  }

  private setupPostProcessing(): void {
    const { width, height } = this.canvas;
    
    // Create framebuffer
    const framebuffer = this.gl.createFramebuffer();
    const texture = this.gl.createTexture();
    const depthBuffer = this.gl.createRenderbuffer();

    if (!framebuffer || !texture || !depthBuffer) {
      throw new Error('Failed to create post-processing resources');
    }

    // Setup texture
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D, 0, this.gl.RGBA,
      width, height, 0,
      this.gl.RGBA, this.gl.UNSIGNED_BYTE, null
    );
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    // Setup depth buffer
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthBuffer);
    this.gl.renderbufferStorage(
      this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16,
      width, height
    );

    // Setup framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D, texture, 0
    );
    this.gl.framebufferRenderbuffer(
      this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT,
      this.gl.RENDERBUFFER, depthBuffer
    );

    // Check framebuffer status
    const status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
    if (status !== this.gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Framebuffer is not complete: ${status}`);
    }

    // Reset bindings
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);

    this.postProcessBuffer = { framebuffer, texture, depthBuffer };
  }
  private initBuffers(): void {
    // Create position buffer
    this.positionBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    const positions = new Float32Array([
      -1, -1, 0,
       1, -1, 0,
      -1,  1, 0,
       1,  1, 0
    ]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    // Create normal buffer
    this.normalBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    const normals = new Float32Array([
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1
    ]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, normals, this.gl.STATIC_DRAW);
  }

  public startAnimation(): void {
    if (this.isDisposed) return;

    let lastTime = 0;
    const animate = (time: number) => {
      if (this.isDisposed) return;

      const deltaTime = time - lastTime;
      lastTime = time;

      // Update FPS counter
      this.frameCount++;
      if (time - this.lastFPSUpdate >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastFPSUpdate = time;
      }

      this.render(time);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  public render(time: number): void {
    const startTime = performance.now();
    this.performanceMetrics.drawCalls = 0;

    // Update matrices
    mat4.perspective(
      this.projectionMatrix,
      Math.PI / 4,
      this.canvas.width / this.canvas.height,
      0.1,
      100.0
    );
    mat4.identity(this.modelViewMatrix);
    mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, 0, -5]);
    mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, time * 0.001, [0, 1, 0]);

    // First Pass: Render to framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.postProcessBuffer.framebuffer);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Use main program
    this.gl.useProgram(this.program.program);
    this.setMainUniforms(time);
    this.bindMainAttributes();
    this.drawScene();
    this.performanceMetrics.drawCalls++;

    // Second Pass: Post-processing
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.useProgram(this.postProcessProgram.program);
    this.setPostProcessUniforms(time);
    this.bindPostProcessAttributes();
    this.drawPostProcess();
    this.performanceMetrics.drawCalls++;

    this.performanceMetrics.frameTime = performance.now() - startTime;
  }

  private setMainUniforms(time: number): void {
    const { uniforms } = this.program;
    this.gl.uniformMatrix4fv(uniforms['projectionMatrix'], false, this.projectionMatrix);
    this.gl.uniformMatrix4fv(uniforms['modelViewMatrix'], false, this.modelViewMatrix);
    this.gl.uniform1f(uniforms['time'], time * 0.001);
    this.gl.uniform2f(uniforms['resolution'], this.canvas.width, this.canvas.height);
    this.gl.uniform2f(uniforms['interactionPoint'], ...this.interactionPoint);
  }

  private setPostProcessUniforms(time: number): void {
    const { uniforms } = this.postProcessProgram;
    this.gl.uniform1i(uniforms['tDiffuse'], 0);
    this.gl.uniform1f(uniforms['time'], time * 0.001);
  }

  private bindMainAttributes(): void {
    const { attributes } = this.program;
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.vertexAttribPointer(attributes['position'], 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(attributes['position']);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    this.gl.vertexAttribPointer(attributes['normal'], 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(attributes['normal']);
  }

  private bindPostProcessAttributes(): void {
    const { attributes } = this.postProcessProgram;
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.vertexAttribPointer(attributes['position'], 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(attributes['position']);
  }

  private drawScene(): void {
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  private drawPostProcess(): void {
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.postProcessBuffer.texture);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  public updateInteraction(x: number, y: number): void {
    const rect = this.canvas.getBoundingClientRect();
    this.interactionPoint = [
      (x - rect.left) / rect.width,
      1 - (y - rect.top) / rect.height
    ];
  }

  private resize(): void {
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;

    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      this.gl.viewport(0, 0, displayWidth, displayHeight);
    }
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.handleResize);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('touchmove', this.handleTouch);
  }

  private handleResize = (): void => {
    this.resize();
    this.setupPostProcessing();
  };

  private handleMouseMove = (event: MouseEvent): void => {
    this.updateInteraction(event.clientX, event.clientY);
  };

  private handleTouch = (event: TouchEvent): void => {
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) {
      this.updateInteraction(touch.clientX, touch.clientY);
    }
  };

  public dispose(): void {
    this.isDisposed = true;

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('touchmove', this.handleTouch);

    // Delete WebGL resources
    this.gl.deleteProgram(this.program.program);
    this.gl.deleteProgram(this.postProcessProgram.program);
    this.gl.deleteBuffer(this.positionBuffer);
    this.gl.deleteBuffer(this.normalBuffer);
    this.gl.deleteFramebuffer(this.postProcessBuffer.framebuffer);
    this.gl.deleteTexture(this.postProcessBuffer.texture);
    if (this.postProcessBuffer.depthBuffer) {
      this.gl.deleteRenderbuffer(this.postProcessBuffer.depthBuffer);
    }

    // Lose WebGL context
    const ext = this.gl.getExtension('WEBGL_lose_context');
    if (ext) {
      ext.loseContext();
    }
  }

  public getFPS(): number {
    return this.fps;
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }
}