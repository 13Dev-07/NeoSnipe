import { SacredGeometryError } from '../types/sacred-geometry';
import { WebGLResourcePool } from './webgl/resource-pool';

interface ResourceTracker {
  buffers: Set<WebGLBuffer>;
  textures: Set<WebGLTexture>;
  framebuffers: Set<WebGLFramebuffer>;
  renderbuffers: Set<WebGLRenderbuffer>;
  shaders: Set<WebGLShader>;
  programs: Set<WebGLProgram>;
  vertexArrays: Set<WebGLVertexArrayObject>;
}

interface TextureOptions {
  format?: number;
  internalFormat?: number;
  type?: number;
  width?: number;
  height?: number;
  minFilter?: number;
  magFilter?: number;
  wrapS?: number;
  wrapT?: number;
  mipmap?: boolean;
}

interface BufferOptions {
  target: number;
  usage: number;
  data?: ArrayBuffer | ArrayBufferView | null;
}

export class WebGLResourceManager {
  private gl: WebGL2RenderingContext;
  private resources: ResourceTracker;
  private isDisposed: boolean;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.isDisposed = false;
    this.resources = {
      buffers: new Set(),
      textures: new Set(),
      framebuffers: new Set(),
      renderbuffers: new Set(),
      shaders: new Set(),
      programs: new Set(),
      vertexArrays: new Set()
    };
  }

  /**
   * Texture Management
   */
  createTexture(options: TextureOptions = {}): WebGLTexture {
    this.validateContext();
    const {
      format = this.gl.RGBA,
      internalFormat = this.gl.RGBA8,
      type = this.gl.UNSIGNED_BYTE,
      width = 1,
      height = 1,
      minFilter = this.gl.LINEAR,
      magFilter = this.gl.LINEAR,
      wrapS = this.gl.CLAMP_TO_EDGE,
      wrapT = this.gl.CLAMP_TO_EDGE,
      mipmap = false
    } = options;

    const texture = this.gl.createTexture();
    if (!texture) {
      throw new SacredGeometryError('Failed to create texture', 'resource');
    }

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      internalFormat,
      width,
      height,
      0,
      format,
      type,
      null
    );

    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, minFilter);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, magFilter);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, wrapS);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, wrapT);

    if (mipmap) {
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }

    this.resources.textures.add(texture);
    return texture;
  }

  updateTexture(
    texture: WebGLTexture,
    data: ArrayBufferView,
    width: number,
    height: number,
    options: Partial<TextureOptions> = {}
  ): void {
    this.validateContext();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      options.internalFormat || this.gl.RGBA8,
      width,
      height,
      0,
      options.format || this.gl.RGBA,
      options.type || this.gl.UNSIGNED_BYTE,
      data
    );

    if (options.mipmap) {
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }
  }

  /**
   * Buffer Management
   */
  createBuffer(options: BufferOptions): WebGLBuffer {
    this.validateContext();
    const buffer = this.gl.createBuffer();
    if (!buffer) {
      throw new SacredGeometryError('Failed to create buffer', 'resource');
    }

    this.gl.bindBuffer(options.target, buffer);
    if (options.data) {
      this.gl.bufferData(options.target, options.data, options.usage);
    }

    this.resources.buffers.add(buffer);
    return buffer;
  }

  updateBuffer(
    buffer: WebGLBuffer,
    target: number,
    data: ArrayBuffer | ArrayBufferView,
    usage: number
  ): void {
    this.validateContext();
    this.gl.bindBuffer(target, buffer);
    this.gl.bufferData(target, data, usage);
  }

  /**
   * Framebuffer Management
   */
  createFramebuffer(
    width: number,
    height: number,
    hasDepth: boolean = true
  ): { framebuffer: WebGLFramebuffer; texture: WebGLTexture; depthBuffer?: WebGLRenderbuffer } {
    this.validateContext();
    const framebuffer = this.gl.createFramebuffer();
    if (!framebuffer) {
      throw new SacredGeometryError('Failed to create framebuffer', 'resource');
    }

    const texture = this.createTexture({
      width,
      height,
      internalFormat: this.gl.RGBA8,
      format: this.gl.RGBA,
      type: this.gl.UNSIGNED_BYTE
    });

    let depthBuffer: WebGLRenderbuffer | undefined;
    if (hasDepth) {
      depthBuffer = this.gl.createRenderbuffer();
      if (!depthBuffer) {
        throw new SacredGeometryError('Failed to create depth renderbuffer', 'resource');
      }

      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthBuffer);
      this.gl.renderbufferStorage(
        this.gl.RENDERBUFFER,
        this.gl.DEPTH_COMPONENT16,
        width,
        height
      );
    }

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      texture,
      0
    );

    if (depthBuffer) {
      this.gl.framebufferRenderbuffer(
        this.gl.FRAMEBUFFER,
        this.gl.DEPTH_ATTACHMENT,
        this.gl.RENDERBUFFER,
        depthBuffer
      );
    }

    const status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
    if (status !== this.gl.FRAMEBUFFER_COMPLETE) {
      throw new SacredGeometryError(
        `Framebuffer is not complete: ${status}`,
        'resource'
      );
    }

    this.resources.framebuffers.add(framebuffer);
    if (depthBuffer) {
      this.resources.renderbuffers.add(depthBuffer);
    }

    return { framebuffer, texture, depthBuffer };
  }

  /**
   * Resource Cleanup
   */
  deleteResource(
    resource: WebGLBuffer | WebGLTexture | WebGLFramebuffer | WebGLRenderbuffer | WebGLShader | WebGLProgram | WebGLVertexArrayObject
  ): void {
    this.validateContext();
    if (resource instanceof WebGLBuffer) {
      this.gl.deleteBuffer(resource);
      this.resources.buffers.delete(resource);
    } else if (resource instanceof WebGLTexture) {
      this.gl.deleteTexture(resource);
      this.resources.textures.delete(resource);
    } else if (resource instanceof WebGLFramebuffer) {
      this.gl.deleteFramebuffer(resource);
      this.resources.framebuffers.delete(resource);
    } else if (resource instanceof WebGLRenderbuffer) {
      this.gl.deleteRenderbuffer(resource);
      this.resources.renderbuffers.delete(resource);
    } else if (resource instanceof WebGLShader) {
      this.gl.deleteShader(resource);
      this.resources.shaders.delete(resource);
    } else if (resource instanceof WebGLProgram) {
      this.gl.deleteProgram(resource);
      this.resources.programs.delete(resource);
    } else if (resource instanceof WebGLVertexArrayObject) {
      this.gl.deleteVertexArray(resource);
      this.resources.vertexArrays.delete(resource);
    }
  }

  dispose(): void {
    if (this.isDisposed) return;

    // Delete all resources
    this.resources.buffers.forEach(buffer => this.gl.deleteBuffer(buffer));
    this.resources.textures.forEach(texture => this.gl.deleteTexture(texture));
    this.resources.framebuffers.forEach(framebuffer => this.gl.deleteFramebuffer(framebuffer));
    this.resources.renderbuffers.forEach(renderbuffer => this.gl.deleteRenderbuffer(renderbuffer));
    this.resources.shaders.forEach(shader => this.gl.deleteShader(shader));
    this.resources.programs.forEach(program => this.gl.deleteProgram(program));
    this.resources.vertexArrays.forEach(vao => this.gl.deleteVertexArray(vao));

    // Clear all sets
    this.resources.buffers.clear();
    this.resources.textures.clear();
    this.resources.framebuffers.clear();
    this.resources.renderbuffers.clear();
    this.resources.shaders.clear();
    this.resources.programs.clear();
    this.resources.vertexArrays.clear();

    this.isDisposed = true;
  }

  private validateContext(): void {
    if (this.isDisposed) {
      throw new SacredGeometryError(
        'Resource manager has been disposed',
        'resource'
      );
    }

    if (this.gl.isContextLost()) {
      throw new SacredGeometryError(
        'WebGL context is lost',
        'resource'
      );
    }
  }
}

export default WebGLResourceManager;