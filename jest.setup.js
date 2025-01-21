import '@testing-library/jest-dom';

// Mock WebGL context
class WebGLRenderingContext {
  canvas = {};
  drawingBufferWidth = 0;
  drawingBufferHeight = 0;
  getExtension() { return null; }
  getParameter() { return 0; }
  getShaderPrecisionFormat() { return { precision: 0, rangeMin: 0, rangeMax: 0 }; }
}

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = function(contextType) {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return new WebGLRenderingContext();
  }
  return null;
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});