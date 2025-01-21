/**
 * WebGL Resource Manager configuration
 */
export interface WebGLResourceManagerConfig {
  /** Canvas element ID */
  canvasId: string;
  /** WebGL context attributes */
  contextAttributes?: WebGLContextAttributes;
  /** Resource loading options */
  loadingOptions: ResourceLoadingOptions;
}

/**
 * Resource loading options
 */
export interface ResourceLoadingOptions {
  /** Whether to load resources asynchronously */
  async: boolean;
  /** Timeout duration in milliseconds */
  timeout: number;
  /** Retry attempts for failed loads */
  retryAttempts: number;
  /** Delay between retries in milliseconds */
  retryDelay: number;
}

/**
 * Shader program configuration
 */
export interface ShaderProgramConfig {
  /** Vertex shader source */
  vertexSource: string;
  /** Fragment shader source */
  fragmentSource: string;
  /** Attribute locations */
  attributes: string[];
  /** Uniform locations */
  uniforms: string[];
}

/**
 * Texture configuration
 */
export interface TextureConfig {
  /** Texture unit */
  unit: number;
  /** Texture format */
  format: number;
  /** Texture type */
  type: number;
  /** Texture filtering options */
  filtering: TextureFiltering;
}

/**
 * Texture filtering options
 */
export interface TextureFiltering {
  /** Minification filter */
  min: number;
  /** Magnification filter */
  mag: number;
  /** Whether to generate mipmaps */
  generateMipmaps: boolean;
}