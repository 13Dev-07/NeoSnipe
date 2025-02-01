export class WebGLError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebGLError';
  }
}

export const handleWebGLError = (error: Error, context: WebGLRenderingContext) => {
  console.error('WebGL Error:', error);
  
  if (context.isContextLost()) {
    console.warn('WebGL context lost - attempting to restore...');
    return new WebGLError('WebGL context lost');
  }

  return new WebGLError(`WebGL Error: ${error.message}`);
};

export const setupContextLossHandler = (
  canvas: HTMLCanvasElement,
  onContextLost: () => void,
  onContextRestored: () => void
) => {
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    onContextLost();
  }, false);

  canvas.addEventListener('webglcontextrestored', () => {
    onContextRestored();
  }, false);
};

export const checkWebGLCapabilities = (gl: WebGLRenderingContext): void => {
  if (!gl) {
    throw new WebGLError('WebGL is not supported in this browser');
  }

  // Check for required extensions
  const requiredExtensions = [
    'OES_standard_derivatives',
    'EXT_shader_texture_lod'
  ];

  for (const extension of requiredExtensions) {
    if (!gl.getExtension(extension)) {
      throw new WebGLError(`Required WebGL extension ${extension} is not supported`);
    }
  }

  // Check maximum texture size
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  if (maxTextureSize < 2048) {
    throw new WebGLError('Device does not support required texture resolution');
  }
};

export const validateShader = (
  gl: WebGLRenderingContext,
  shader: WebGLShader,
  source: string
): void => {
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    throw new WebGLError(`Shader compilation failed: ${info}\nSource: ${source}`);
  }
};

export const validateProgram = (
  gl: WebGLRenderingContext,
  program: WebGLProgram
): void => {
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    throw new WebGLError(`Program linking failed: ${info}`);
  }
};