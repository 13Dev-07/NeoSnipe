export function mockWebGL2Context(): WebGL2RenderingContext {
  const gl = {
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,
    ARRAY_BUFFER: 34962,
    ELEMENT_ARRAY_BUFFER: 34963,
    STATIC_DRAW: 35044,
    DYNAMIC_DRAW: 35048,
    RGBA: 6408,
    TEXTURE_2D: 3553,
    TEXTURE0: 33984,
    DEPTH_TEST: 2929,
    LEQUAL: 515,
    BLEND: 3042,
    ONE: 1,
    ONE_MINUS_SRC_ALPHA: 771,

    createShader: jest.fn((type) => ({
      type,
      source: '',
      compiled: false,
    })),

    shaderSource: jest.fn((shader, source) => {
      shader.source = source;
    }),

    compileShader: jest.fn((shader) => {
      shader.compiled = true;
    }),

    createProgram: jest.fn(() => ({
      shaders: [],
      linked: false,
      uniforms: new Map(),
    })),

    attachShader: jest.fn((program, shader) => {
      program.shaders.push(shader);
    }),

    linkProgram: jest.fn((program) => {
      program.linked = true;
    }),

    createTexture: jest.fn(() => ({
      width: 0,
      height: 0,
      format: 0,
    })),

    createBuffer: jest.fn(() => ({
      data: null,
      target: 0,
      usage: 0,
    })),

    enable: jest.fn(),
    disable: jest.fn(),
    blendFunc: jest.fn(),
    depthFunc: jest.fn(),
    viewport: jest.fn(),
    useProgram: jest.fn(),

    getShaderParameter: jest.fn((shader, pname) => {
      if (pname === gl.COMPILE_STATUS) {
        return shader.compiled;
      }
      return null;
    }),

    getProgramParameter: jest.fn((program, pname) => {
      if (pname === gl.LINK_STATUS) {
        return program.linked;
      }
      return null;
    }),

    getShaderInfoLog: jest.fn(() => ''),
    getProgramInfoLog: jest.fn(() => ''),

    deleteShader: jest.fn(),
    deleteProgram: jest.fn(),
    deleteTexture: jest.fn(),
    deleteBuffer: jest.fn(),

    isTexture: jest.fn((texture) => texture && !texture.deleted),
    isBuffer: jest.fn((buffer) => buffer && !buffer.deleted),
    isProgram: jest.fn((program) => program && !program.deleted),
    isShader: jest.fn((shader) => shader && !shader.deleted),

    bindTexture: jest.fn(),
    bindBuffer: jest.fn(),
    
    texImage2D: jest.fn(),
    bufferData: jest.fn(),
    
    getUniformLocation: jest.fn((program, name) => {
      if (!program.uniforms.has(name)) {
        program.uniforms.set(name, { type: 'unknown', value: null });
      }
      return program.uniforms.get(name);
    }),

    uniform1f: jest.fn((location, value) => {
      if (location) location.value = value;
    }),
    uniform2f: jest.fn(),
    uniform3f: jest.fn(),
    uniform4f: jest.fn(),
    uniform1i: jest.fn(),
    uniformMatrix4fv: jest.fn(),
  };

  return gl as unknown as WebGL2RenderingContext;
}