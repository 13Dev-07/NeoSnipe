import { WebGLResourceManager } from '../../src/utils/webgl-resource-manager';
import { ShaderCompiler } from '../../src/utils/shader-compilation';

describe('WebGL Shader Tests', () => {
  let gl: WebGL2RenderingContext;
  let resourceManager: WebGLResourceManager;
  let shaderCompiler: ShaderCompiler;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl2');
    resourceManager = new WebGLResourceManager(gl);
    shaderCompiler = new ShaderCompiler(gl);
  });

  test('compiles vertex shader successfully', () => {
    const vertexShader = `
      attribute vec4 position;
      void main() {
        gl_Position = position;
      }
    `;

    const shader = shaderCompiler.compileShader(vertexShader, gl.VERTEX_SHADER);
    expect(shader).toBeTruthy();
    expect(gl.getShaderParameter(shader, gl.COMPILE_STATUS)).toBe(true);
  });

  test('links shader program successfully', () => {
    const vertexShader = `
      attribute vec4 position;
      void main() {
        gl_Position = position;
      }
    `;

    const fragmentShader = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    `;

    const program = shaderCompiler.createProgram(vertexShader, fragmentShader);
    expect(program).toBeTruthy();
    expect(gl.getProgramParameter(program, gl.LINK_STATUS)).toBe(true);
  });

  test('handles shader compilation errors', () => {
    const invalidShader = `
      invalid shader code
    `;

    expect(() => {
      shaderCompiler.compileShader(invalidShader, gl.VERTEX_SHADER);
    }).toThrow();
  });

  test('manages shader resources properly', () => {
    const program = resourceManager.createShaderProgram('test', {
      vertexShader: `
        attribute vec4 position;
        void main() {
          gl_Position = position;
        }
      `,
      fragmentShader: `
        precision mediump float;
        void main() {
          gl_FragColor = vec4(1.0);
        }
      `
    });

    expect(program).toBeTruthy();
    expect(resourceManager.getShaderProgram('test')).toBe(program);

    resourceManager.deleteShaderProgram('test');
    expect(resourceManager.getShaderProgram('test')).toBeNull();
  });

  test('caches compiled shaders', () => {
    const shader1 = shaderCompiler.compileShader(`
      attribute vec4 position;
      void main() {
        gl_Position = position;
      }
    `, gl.VERTEX_SHADER);

    const shader2 = shaderCompiler.compileShader(`
      attribute vec4 position;
      void main() {
        gl_Position = position;
      }
    `, gl.VERTEX_SHADER);

    expect(shader1).toBe(shader2);
  });
});