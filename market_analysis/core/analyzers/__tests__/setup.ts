// Mock WebGL context
const mockWebGLContext = {
    createShader: jest.fn(() => ({})),
    createProgram: jest.fn(() => ({})),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    useProgram: jest.fn(),
    getUniformLocation: jest.fn(),
    uniform1f: jest.fn(),
    uniform2f: jest.fn(),
    createBuffer: jest.fn(() => ({})),
    bindBuffer: jest.fn(),
    bufferData: jest.fn(),
    getShaderParameter: jest.fn(() => true),
    getProgramParameter: jest.fn(() => true),
    deleteShader: jest.fn(),
    deleteProgram: jest.fn(),
    deleteBuffer: jest.fn(),
    VERTEX_SHADER: 'VERTEX_SHADER',
    FRAGMENT_SHADER: 'FRAGMENT_SHADER',
    COMPUTE_SHADER: 'COMPUTE_SHADER',
    STATIC_DRAW: 'STATIC_DRAW',
    SHADER_STORAGE_BUFFER: 'SHADER_STORAGE_BUFFER',
    bindBufferBase: jest.fn(),
    dispatchCompute: jest.fn(),
    memoryBarrier: jest.fn(),
    getBufferSubData: jest.fn(),
    SHADER_STORAGE_BARRIER_BIT: 'SHADER_STORAGE_BARRIER_BIT'
};

// Mock canvas and WebGL2RenderingContext
global.HTMLCanvasElement = class {
    getContext(contextType: string) {
        if (contextType === 'webgl2' || contextType === 'webgl2-compute') {
            return mockWebGLContext;
        }
        return null;
    }
} as any;

global.WebGL2RenderingContext = mockWebGLContext.constructor as any;