export class WebGLError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebGLError';
  }
}

export class ShaderCompilationError extends WebGLError {
  constructor(message: string, public shaderType: number, public source: string) {
    super(`Shader compilation failed: ${message}`);
    this.name = 'ShaderCompilationError';
  }
}

export class ProgramLinkError extends WebGLError {
  constructor(message: string) {
    super(`Program linking failed: ${message}`);
    this.name = 'ProgramLinkError';
  }
}

export class TextureError extends WebGLError {
  constructor(message: string) {
    super(`Texture error: ${message}`);
    this.name = 'TextureError';
  }
}

export class BufferError extends WebGLError {
  constructor(message: string) {
    super(`Buffer error: ${message}`);
    this.name = 'BufferError';
  }
}

export class ContextLostError extends WebGLError {
  constructor(message: string) {
    super(`WebGL context lost: ${message}`);
    this.name = 'ContextLostError';
  }
}

export class ResourceLimitError extends WebGLError {
  constructor(message: string, public resourceType: string, public limit: number) {
    super(`Resource limit exceeded: ${message}`);
    this.name = 'ResourceLimitError';
  }
}

export class ValidationError extends WebGLError {
  constructor(message: string, public validationType: string) {
    super(`Validation failed: ${message}`);
    this.name = 'ValidationError';
  }
}

export class UnsupportedFeatureError extends WebGLError {
  constructor(message: string, public feature: string) {
    super(`Unsupported feature: ${message}`);
    this.name = 'UnsupportedFeatureError';
  }
}

export class PerformanceError extends WebGLError {
  constructor(message: string, public metrics: Record<string, number>) {
    super(`Performance warning: ${message}`);
    this.name = 'PerformanceError';
  }
}