export class WebGLError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebGLError';
  }

  static createShaderError(gl: WebGL2RenderingContext, shader: WebGLShader): WebGLError {
    const log = gl.getShaderInfoLog(shader);
    return new WebGLError(`Shader compilation failed: ${log}`);
  }

  static createProgramError(gl: WebGL2RenderingContext, program: WebGLProgram): WebGLError {
    const log = gl.getProgramInfoLog(program);
    return new WebGLError(`Program linking failed: ${log}`);
  }

  static createContextLostError(): WebGLError {
    return new WebGLError('WebGL context lost');
  }

  static createResourceError(resource: string): WebGLError {
    return new WebGLError(`Failed to create WebGL resource: ${resource}`);
  }
}

export class WebGLContextError extends WebGLError {
  constructor(message: string = 'WebGL2 context creation failed') {
    super(message);
    this.name = 'WebGLContextError';
  }
}

export class WebGLResourceError extends WebGLError {
  constructor(message: string) {
    super(message);
    this.name = 'WebGLResourceError';
  }
}

export class WebGLShaderError extends WebGLError {
  constructor(message: string) {
    super(message);
    this.name = 'WebGLShaderError';
  }
}

export class WebGLProgramError extends WebGLError {
  constructor(message: string) {
    super(message);
    this.name = 'WebGLProgramError';
  }
}