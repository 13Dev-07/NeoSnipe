import { ShaderConfig, SacredGeometryError } from '../types/sacred-geometry';

export class ShaderCompilationUtils {
  /**
   * Shader Validation Settings
   */
  private static readonly VALIDATION_SETTINGS = {
    REQUIRED_PRECISION: 'highp',
    MAX_UNIFORM_COUNT: 16,
    MAX_VARYING_COUNT: 8,
    REQUIRED_EXTENSIONS: ['GL_OES_standard_derivatives']
  };

  /**
   * Compiles and validates a complete shader program
   */
  static createValidatedProgram(
    gl: WebGL2RenderingContext,
    config: ShaderConfig,
    debug: boolean = false
  ): WebGLProgram {
    try {
      // Pre-compilation validation
      this.validateShaderConfig(config);

      // Compile shaders with validation
      const vertexShader = this.compileAndValidateShader(
        gl,
        config.vertexShader,
        gl.VERTEX_SHADER,
        debug
      );

      const fragmentShader = this.compileAndValidateShader(
        gl,
        config.fragmentShader,
        gl.FRAGMENT_SHADER,
        debug
      );

      // Link and validate program
      const program = this.linkAndValidateProgram(
        gl,
        vertexShader,
        fragmentShader,
        debug
      );

      // Post-linking validation
      this.validateProgramAttributes(gl, program, config);
      this.validateProgramUniforms(gl, program, config);

      // Cleanup
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
   * Validates shader configuration before compilation
   */
  private static validateShaderConfig(config: ShaderConfig): void {
    if (!config.vertexShader || !config.fragmentShader) {
      throw new SacredGeometryError(
        'Shader configuration must include both vertex and fragment shaders',
        'shader'
      );
    }

    // Validate precision declarations
    if (!this.validatePrecisionStatements(config.vertexShader) ||
        !this.validatePrecisionStatements(config.fragmentShader)) {
      throw new SacredGeometryError(
        `Shaders must declare ${this.VALIDATION_SETTINGS.REQUIRED_PRECISION} precision`,
        'shader'
      );
    }

    // Validate uniform declarations
    this.validateUniformDeclarations(config);
  }

  /**
   * Compiles and validates individual shader
   */
  private static compileAndValidateShader(
    gl: WebGL2RenderingContext,
    source: string,
    type: number,
    debug: boolean
  ): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) {
      throw new SacredGeometryError('Failed to create shader object', 'shader');
    }

    // Add debug information if needed
    const processedSource = debug ? this.addDebugInfo(source) : source;
    
    gl.shaderSource(shader, processedSource);
    gl.compileShader(shader);

    // Check compilation status
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);

      // Enhanced error reporting in debug mode
      if (debug) {
        this.logShaderError(source, info);
      }

      throw new SacredGeometryError(
        `Shader compilation failed: ${info}`,
        'shader'
      );
    }

    // Validate shader source
    this.validateShaderSource(gl, shader, type);

    return shader;
  }

  /**
   * Links and validates shader program
   */
  private static linkAndValidateProgram(
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
    debug: boolean
  ): WebGLProgram {
    const program = gl.createProgram();
    if (!program) {
      throw new SacredGeometryError('Failed to create program object', 'shader');
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Pre-link validation
    this.validateProgramPreLink(gl, program);

    gl.linkProgram(program);

    // Check linking status
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

    // Post-link validation
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new SacredGeometryError(
        `Program validation failed: ${info}`,
        'shader'
      );
    }

    return program;
  }

  /**
   * Validates shader source code
   */
  private static validateShaderSource(
    gl: WebGL2RenderingContext,
    shader: WebGLShader,
    type: number
  ): void {
    const source = gl.getShaderSource(shader);
    if (!source) {
      throw new SacredGeometryError('Failed to get shader source', 'shader');
    }

    // Check for required extensions
    this.VALIDATION_SETTINGS.REQUIRED_EXTENSIONS.forEach(ext => {
      if (!gl.getExtension(ext)) {
        throw new SacredGeometryError(
          `Required extension ${ext} not supported`,
          'shader'
        );
      }
    });

    // Validate based on shader type
    if (type === gl.VERTEX_SHADER) {
      this.validateVertexShaderSource(source);
    } else {
      this.validateFragmentShaderSource(source);
    }
  }

  /**
   * Validates program attributes
   */
  private static validateProgramAttributes(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    config: ShaderConfig
  ): void {
    const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttributes; i++) {
      const info = gl.getActiveAttrib(program, i);
      if (!info) continue;

      if (!this.isValidAttributeName(info.name)) {
        throw new SacredGeometryError(
          `Invalid attribute name: ${info.name}`,
          'shader'
        );
      }
    }
  }

  /**
   * Validates program uniforms
   */
  private static validateProgramUniforms(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    config: ShaderConfig
  ): void {
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    if (numUniforms > this.VALIDATION_SETTINGS.MAX_UNIFORM_COUNT) {
      throw new SacredGeometryError(
        `Too many uniforms: ${numUniforms}`,
        'shader'
      );
    }

    // Validate each uniform
    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      if (!info) continue;

      if (!config.uniforms[info.name]) {
        throw new SacredGeometryError(
          `Undeclared uniform in shader: ${info.name}`,
          'shader'
        );
      }
    }
  }

  /**
   * Debug utilities
   */
  private static addDebugInfo(source: string): string {
    const lines = source.split('\n');
    return lines.map((line, index) => 
      `#line ${index + 1}\n${line}`
    ).join('\n');
  }

  private static logShaderError(source: string, error: string | null): void {
    console.error('Shader compilation error:');
    console.error('Source:');
    source.split('\n').forEach((line, index) => {
      console.error(`${(index + 1).toString().padStart(4)}: ${line}`);
    });
    console.error('Error:', error);
  }

  /**
   * Validation helpers
   */
  private static validatePrecisionStatements(source: string): boolean {
    return source.includes(`precision ${this.VALIDATION_SETTINGS.REQUIRED_PRECISION} float`);
  }

  private static validateUniformDeclarations(config: ShaderConfig): void {
    const uniformCount = Object.keys(config.uniforms).length;
    if (uniformCount > this.VALIDATION_SETTINGS.MAX_UNIFORM_COUNT) {
      throw new SacredGeometryError(
        `Too many uniform declarations: ${uniformCount}`,
        'shader'
      );
    }
  }

  private static isValidAttributeName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }

  private static validateVertexShaderSource(source: string): void {
    // Add vertex shader specific validations
    if (!source.includes('gl_Position')) {
      throw new SacredGeometryError(
        'Vertex shader must write to gl_Position',
        'shader'
      );
    }
  }

  private static validateFragmentShaderSource(source: string): void {
    // Add fragment shader specific validations
    if (!source.includes('out vec4') && !source.includes('gl_FragColor')) {
      throw new SacredGeometryError(
        'Fragment shader must declare output color',
        'shader'
      );
    }
  }

  private static validateProgramPreLink(
    gl: WebGL2RenderingContext,
    program: WebGLProgram
  ): void {
    // Check for transform feedback varyings
    const varyingCount = gl.getProgramParameter(
      program,
      gl.TRANSFORM_FEEDBACK_VARYINGS
    );
    if (varyingCount > this.VALIDATION_SETTINGS.MAX_VARYING_COUNT) {
      throw new SacredGeometryError(
        `Too many transform feedback varyings: ${varyingCount}`,
        'shader'
      );
    }
  }
}

export default ShaderCompilationUtils;