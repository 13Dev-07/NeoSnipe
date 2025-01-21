import { ShaderConfig, SacredGeometryError } from '../types/sacred-geometry';

export class ShaderUtils {
  /**
   * Shader Type Constants
   */
  private static readonly SHADER_TYPES = {
    VERTEX: WebGL2RenderingContext.VERTEX_SHADER,
    FRAGMENT: WebGL2RenderingContext.FRAGMENT_SHADER
  };

  /**
   * Sacred Geometry Shader Includes
   */
  private static readonly SACRED_SHADER_INCLUDES = {
    constants: `
      #define PHI 1.618033988749895
      #define PI 3.141592653589793
      #define PI_PHI 5.083203692315245
      #define SQRT_PHI 1.272019649514069
    `,
    
    harmonicFunctions: `
      float goldenNoise(vec2 pos, float seed) {
        return fract(sin(dot(pos * PHI, vec2(12.9898, 78.233))) * 43758.5453123 + seed);
      }
      
      float sacredPulse(float time, float frequency) {
        return 0.5 * (1.0 + sin(time * frequency * PI_PHI));
      }
      
      vec2 spiralFlow(vec2 pos, float time) {
        float angle = length(pos) * PHI + time;
        return vec2(cos(angle), sin(angle)) * length(pos);
      }
    `,
    
    energyFields: `
      vec3 calculateEnergyField(vec3 position, float time) {
        float energy = sacredPulse(time, PHI);
        vec3 field = normalize(position) * energy;
        return field;
      }
    `
  };

  /**
   * Creates and compiles a shader program
   */
  static createShaderProgram(
    gl: WebGL2RenderingContext,
    config: ShaderConfig,
    debugMode: boolean = false
  ): WebGLProgram {
    try {
      const vertexShader = this.compileShader(
        gl,
        this.processShaderSource(config.vertexShader, config.defines),
        this.SHADER_TYPES.VERTEX,
        debugMode
      );

      const fragmentShader = this.compileShader(
        gl,
        this.processShaderSource(config.fragmentShader, config.defines),
        this.SHADER_TYPES.FRAGMENT,
        debugMode
      );

      const program = this.linkProgram(gl, vertexShader, fragmentShader, debugMode);
      
      // Clean up individual shaders
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      return program;
    } catch (error) {
      throw new SacredGeometryError(
        `Shader program creation failed: ${error.message}`,
        'shader'
      );
    }
  }

  /**
   * Handles uniform updates for shader programs
   */
  static updateUniforms(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    uniforms: ShaderConfig['uniforms']
  ): void {
    for (const [name, uniform] of Object.entries(uniforms)) {
      const location = gl.getUniformLocation(program, name);
      if (location === null) {
        if (uniform.required) {
          throw new SacredGeometryError(
            `Required uniform '${name}' not found in shader program`,
            'shader'
          );
        }
        continue;
      }

      this.setUniform(gl, location, uniform.type, uniform.value);
    }
  }

  /**
   * Creates a shader from source
   */
  private static compileShader(
    gl: WebGL2RenderingContext,
    source: string,
    type: number,
    debug: boolean
  ): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) {
      throw new SacredGeometryError('Failed to create shader', 'shader');
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      
      if (debug) {
        console.error('Shader compilation error:', info);
        console.error('Shader source:', this.formatShaderSource(source));
      }
      
      throw new SacredGeometryError(
        `Shader compilation failed: ${info}`,
        'shader'
      );
    }

    return shader;
  }

  /**
   * Links compiled shaders into a program
   */
  private static linkProgram(
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
    debug: boolean
  ): WebGLProgram {
    const program = gl.createProgram();
    if (!program) {
      throw new SacredGeometryError('Failed to create shader program', 'shader');
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      
      if (debug) {
        console.error('Program linking error:', info);
      }
      
      throw new SacredGeometryError(
        `Program linking failed: ${info}`,
        'shader'
      );
    }

    return program;
  }

  /**
   * Sets uniform values based on their type
   */
  private static setUniform(
    gl: WebGL2RenderingContext,
    location: WebGLUniformLocation,
    type: string,
    value: any
  ): void {
    switch (type) {
      case 'float':
        gl.uniform1f(location, value);
        break;
      case 'vec2':
        gl.uniform2fv(location, value);
        break;
      case 'vec3':
        gl.uniform3fv(location, value);
        break;
      case 'vec4':
        gl.uniform4fv(location, value);
        break;
      case 'mat4':
        gl.uniformMatrix4fv(location, false, value);
        break;
      case 'sampler2D':
        gl.uniform1i(location, value);
        break;
      default:
        throw new SacredGeometryError(
          `Unsupported uniform type: ${type}`,
          'shader'
        );
    }
  }

  /**
   * Processes shader source code with includes and defines
   */
  private static processShaderSource(
    source: string,
    defines?: { [key: string]: boolean | number | string }
  ): string {
    let processedSource = '#version 300 es\nprecision highp float;\n\n';
    
    // Add defines
    if (defines) {
      for (const [key, value] of Object.entries(defines)) {
        processedSource += `#define ${key} ${value}\n`;
      }
    }
    
    // Add sacred geometry constants and functions
    processedSource += this.SACRED_SHADER_INCLUDES.constants + '\n';
    processedSource += this.SACRED_SHADER_INCLUDES.harmonicFunctions + '\n';
    processedSource += this.SACRED_SHADER_INCLUDES.energyFields + '\n';
    
    // Add main shader source
    processedSource += source;
    
    return processedSource;
  }

  /**
   * Formats shader source for debug output
   */
  private static formatShaderSource(source: string): string {
    return source.split('\n')
      .map((line, index) => `${(index + 1).toString().padStart(4)}: ${line}`)
      .join('\n');
  }

  /**
   * Validates shader program for required attributes and uniforms
   */
  static validateProgram(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    requiredAttributes: string[],
    requiredUniforms: string[]
  ): void {
    // Validate attributes
    for (const attribute of requiredAttributes) {
      if (gl.getAttribLocation(program, attribute) === -1) {
        throw new SacredGeometryError(
          `Required attribute '${attribute}' not found in shader program`,
          'shader'
        );
      }
    }

    // Validate uniforms
    for (const uniform of requiredUniforms) {
      if (gl.getUniformLocation(program, uniform) === null) {
        throw new SacredGeometryError(
          `Required uniform '${uniform}' not found in shader program`,
          'shader'
        );
      }
    }
  }
}

export default ShaderUtils;