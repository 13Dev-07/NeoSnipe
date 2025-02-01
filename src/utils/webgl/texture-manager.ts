export interface TextureConfig {
  width: number;
  height: number;
  format: number;
  type: number;
  minFilter?: number;
  magFilter?: number;
  generateMipmaps?: boolean;
}

export class TextureManager {
  private gl: WebGL2RenderingContext;
  private textures: Map<string, WebGLTexture>;
  private textureConfigs: Map<string, TextureConfig>;
  private maxTextureSize: number;
  private totalTextureMemory: number;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.textures = new Map();
    this.textureConfigs = new Map();
    this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    this.totalTextureMemory = 0;
  }

  createTexture(key: string, config: TextureConfig): WebGLTexture | null {
    if (this.textures.has(key)) {
      console.warn(`Texture with key ${key} already exists. Use updateTexture instead.`);
      return this.textures.get(key) || null;
    }

    if (!this.validateTextureConfig(config)) {
      return null;
    }

    const texture = this.gl.createTexture();
    if (!texture) {
      console.error('Failed to create WebGL texture');
      return null;
    }

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    
    // Configure texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, 
      config.minFilter || this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER,
      config.magFilter || this.gl.LINEAR);

    // Allocate texture storage
    this.gl.texStorage2D(
      this.gl.TEXTURE_2D,
      config.generateMipmaps ? Math.log2(Math.max(config.width, config.height)) + 1 : 1,
      config.format,
      config.width,
      config.height
    );

    if (config.generateMipmaps) {
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }

    this.textures.set(key, texture);
    this.textureConfigs.set(key, config);
    this.updateTextureMemoryUsage(config, true);

    return texture;
  }

  updateTexture(key: string, data: ArrayBufferView, width?: number, height?: number): boolean {
    const texture = this.textures.get(key);
    const config = this.textureConfigs.get(key);

    if (!texture || !config) {
      console.error(`Texture ${key} not found`);
      return false;
    }

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texSubImage2D(
      this.gl.TEXTURE_2D,
      0,
      0,
      0,
      width || config.width,
      height || config.height,
      config.format,
      config.type,
      data
    );

    if (config.generateMipmaps) {
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }

    return true;
  }

  deleteTexture(key: string): void {
    const texture = this.textures.get(key);
    const config = this.textureConfigs.get(key);

    if (texture) {
      this.gl.deleteTexture(texture);
      this.textures.delete(key);
      if (config) {
        this.updateTextureMemoryUsage(config, false);
        this.textureConfigs.delete(key);
      }
    }
  }

  cleanup(): void {
    this.textures.forEach((texture, key) => {
      this.deleteTexture(key);
    });
    this.textures.clear();
    this.textureConfigs.clear();
    this.totalTextureMemory = 0;
  }

  private validateTextureConfig(config: TextureConfig): boolean {
    if (config.width > this.maxTextureSize || config.height > this.maxTextureSize) {
      console.error(`Texture dimensions exceed maximum size of ${this.maxTextureSize}`);
      return false;
    }

    if (!this.isPowerOf2(config.width) || !this.isPowerOf2(config.height)) {
      console.warn('Texture dimensions should be power of 2 for best compatibility');
    }

    return true;
  }

  private isPowerOf2(value: number): boolean {
    return (value & (value - 1)) === 0;
  }

  private updateTextureMemoryUsage(config: TextureConfig, isAddition: boolean): void {
    const bytesPerPixel = this.getBytesPerPixel(config.format, config.type);
    const mipMapLevels = config.generateMipmaps ? 
      Math.log2(Math.max(config.width, config.height)) + 1 : 1;
    
    let size = 0;
    for (let i = 0; i < mipMapLevels; i++) {
      const levelSize = Math.max(1, config.width >> i) * Math.max(1, config.height >> i);
      size += levelSize * bytesPerPixel;
    }

    this.totalTextureMemory += isAddition ? size : -size;
  }

  private getBytesPerPixel(format: number, type: number): number {
    // Calculate bytes per pixel based on format and type
    // This is a simplified version
    return 4; // Assuming RGBA8 format
  }

  getTotalTextureMemory(): number {
    return this.totalTextureMemory;
  }
}