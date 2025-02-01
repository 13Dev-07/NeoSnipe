import { WebGLResourceManager } from '../../src/utils/webgl-resource-manager';
import { ShaderManager } from '../../src/utils/webgl/shader-manager';
import { mockWebGL2Context } from '../mocks/webgl';

describe('WebGL Rendering', () => {
  let gl: WebGL2RenderingContext;
  let resourceManager: WebGLResourceManager;
  let shaderManager: ShaderManager;

  beforeEach(() => {
    gl = mockWebGL2Context();
    resourceManager = new WebGLResourceManager(gl);
    shaderManager = new ShaderManager(gl);
  });

  afterEach(() => {
    resourceManager.dispose();
    shaderManager.cleanup();
  });

  describe('ResourceManager', () => {
    it('should create and manage textures correctly', () => {
      const texture = resourceManager.createTexture({
        width: 512,
        height: 512,
        format: gl.RGBA,
      });

      expect(texture).toBeDefined();
      expect(gl.isTexture(texture)).toBe(true);
    });

    it('should handle resource cleanup properly', () => {
      const texture = resourceManager.createTexture();
      const buffer = resourceManager.createBuffer({
        target: gl.ARRAY_BUFFER,
        usage: gl.STATIC_DRAW,
      });

      resourceManager.deleteResource(texture);
      expect(gl.isTexture(texture)).toBe(false);

      resourceManager.deleteResource(buffer);
      expect(gl.isBuffer(buffer)).toBe(false);
    });
  });

  describe('ShaderManager', () => {
    const validShaderConfig = {
      vertexShader: `
        #version 300 es
        in vec4 position;
        void main() {
          gl_Position = position;
        }
      `,
      fragmentShader: `
        #version 300 es
        precision highp float;
        out vec4 fragColor;
        void main() {
          fragColor = vec4(1.0);
        }
      `,
    };

    it('should compile shaders successfully', () => {
      const program = shaderManager.createProgram(validShaderConfig);
      expect(program).toBeDefined();
      expect(gl.isProgram(program)).toBe(true);
    });

    it('should detect shader compilation errors', () => {
      const invalidConfig = {
        ...validShaderConfig,
        fragmentShader: 'invalid shader code',
      };

      const program = shaderManager.createProgram(invalidConfig);
      expect(program).toBeNull();
      expect(shaderManager.getLastError()).toBeTruthy();
    });

    it('should manage program lifecycle correctly', () => {
      const program = shaderManager.createProgram(validShaderConfig);
      shaderManager.useProgram(program!);
      shaderManager.deleteProgram(program!);
      expect(gl.isProgram(program)).toBe(false);
    });
  });
});