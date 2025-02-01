import { WebGLError } from '../webgl/WebGLErrorHandler';

export class WebGLSecurityManager {
  private static instance: WebGLSecurityManager;
  private blockedDomains: Set<string>;
  private maxTextureSize: number;
  private maxViewportDimensions: [number, number];

  private constructor() {
    this.blockedDomains = new Set();
    this.maxTextureSize = 4096; // Default max texture size
    this.maxViewportDimensions = [4096, 4096]; // Default max viewport dimensions
  }

  public static getInstance(): WebGLSecurityManager {
    if (!WebGLSecurityManager.instance) {
      WebGLSecurityManager.instance = new WebGLSecurityManager();
    }
    return WebGLSecurityManager.instance;
  }

  public validateContext(gl: WebGLRenderingContext): void {
    // Check for context creation
    if (!gl) {
      throw new WebGLError('WebGL context creation failed');
    }

    // Validate context parameters
    this.validateContextParameters(gl);

    // Check for required extensions
    this.validateRequiredExtensions(gl);

    // Set secure context attributes
    this.setSecureContextAttributes(gl);
  }

  private validateContextParameters(gl: WebGLRenderingContext): void {
    // Check viewport limits
    const maxViewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    if (!maxViewport || 
        maxViewport[0] > this.maxViewportDimensions[0] || 
        maxViewport[1] > this.maxViewportDimensions[1]) {
      throw new WebGLError('Viewport dimensions exceed security limits');
    }

    // Check texture size limits
    const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (!maxTexture || maxTexture > this.maxTextureSize) {
      throw new WebGLError('Texture dimensions exceed security limits');
    }
  }

  private validateRequiredExtensions(gl: WebGLRenderingContext): void {
    const requiredExtensions = [
      'OES_standard_derivatives',
      'EXT_shader_texture_lod'
    ];

    for (const ext of requiredExtensions) {
      if (!gl.getExtension(ext)) {
        throw new WebGLError(`Required WebGL extension ${ext} not supported`);
      }
    }
  }

  private setSecureContextAttributes(gl: WebGLRenderingContext): void {
    // Enable security-related features
    gl.enable(gl.SCISSOR_TEST);
    gl.enable(gl.CULL_FACE);

    // Set secure defaults
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  }

  public validateShaderSource(source: string): boolean {
    // Check for potentially harmful constructs
    const disallowedConstructs = [
      'while[\\s]*\\(',    // Infinite loops
      'for[\\s]*\\(',      // Potentially infinite loops
      'discard[\\s]*;',    // Early fragment discard
      'gl_FragDepth',      // Depth buffer manipulation
      'texture2DLodEXT'    // Excessive texture lookups
    ];

    const regex = new RegExp(disallowedConstructs.join('|'), 'g');
    if (regex.test(source)) {
      throw new WebGLError('Shader source contains potentially harmful constructs');
    }

    return true;
  }

  public validateTextureSource(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Check against blocked domains
      if (this.blockedDomains.has(parsedUrl.hostname)) {
        throw new WebGLError('Texture source domain is blocked');
      }

      // Only allow specific protocols
      if (!['https:', 'data:'].includes(parsedUrl.protocol)) {
        throw new WebGLError('Unsupported texture source protocol');
      }

      return true;
    } catch (error) {
      throw new WebGLError('Invalid texture source URL');
    }
  }

  public setMaxTextureSize(size: number): void {
    this.maxTextureSize = Math.min(size, 8192); // Cap at reasonable maximum
  }

  public setMaxViewportDimensions(width: number, height: number): void {
    this.maxViewportDimensions = [
      Math.min(width, 8192),
      Math.min(height, 8192)
    ];
  }

  public blockDomain(domain: string): void {
    this.blockedDomains.add(domain);
  }

  public unblockDomain(domain: string): void {
    this.blockedDomains.delete(domain);
  }
}

// Export singleton instance
export const webGLSecurityManager = WebGLSecurityManager.getInstance();