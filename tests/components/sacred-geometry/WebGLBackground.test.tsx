import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { OptimizedWebGLBackground } from '../../../src/components/sacred-geometry/OptimizedWebGLBackground';
import { WebGLPerformanceMonitor } from '../../../src/utils/webgl/performance-monitor';
import { WebGLContextLossHandler } from '../../../src/utils/webgl/context-loss-handler';

// Mock THREE.js
jest.mock('three', () => ({
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    setClearColor: jest.fn(),
    render: jest.fn(),
    getContext: jest.fn(),
    dispose: jest.fn(),
    domElement: document.createElement('canvas')
  })),
  ShaderMaterial: jest.fn(),
  InstancedBufferGeometry: jest.fn(),
  PlaneGeometry: jest.fn(),
  InstancedBufferAttribute: jest.fn(),
  Mesh: jest.fn(),
  Color: jest.fn(),
  Vector2: jest.fn()
}));

// Mock performance monitor
jest.mock('../../../src/utils/webgl/performance-monitor', () => ({
  WebGLPerformanceMonitor: {
    getInstance: jest.fn(() => ({
      startMonitoring: jest.fn(),
      stopMonitoring: jest.fn(),
      beginFrame: jest.fn(),
      endFrame: jest.fn()
    }))
  }
}));

describe('OptimizedWebGLBackground', () => {
  beforeEach(() => {
    // Setup window.requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 0));
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<OptimizedWebGLBackground />);
    expect(container.querySelector('.webgl-container')).toBeTruthy();
  });

  it('initializes performance monitoring', () => {
    render(<OptimizedWebGLBackground />);
    expect(WebGLPerformanceMonitor.getInstance).toHaveBeenCalled();
  });

  it('handles props correctly', () => {
    const props = {
      intensity: 2,
      color: '#FF0000',
      particleCount: 1000
    };
    
    const { rerender } = render(<OptimizedWebGLBackground {...props} />);
    expect(THREE.ShaderMaterial).toHaveBeenCalledWith(
      expect.objectContaining({
        uniforms: expect.objectContaining({
          intensity: { value: 2 },
          baseColor: expect.any(Object)
        })
      })
    );
    
    // Test prop updates
    const newProps = { ...props, intensity: 3 };
    rerender(<OptimizedWebGLBackground {...newProps} />);
    expect(THREE.ShaderMaterial).toHaveBeenCalledWith(
      expect.objectContaining({
        uniforms: expect.objectContaining({
          intensity: { value: 3 }
        })
      })
    );
  });

  it('cleans up resources on unmount', () => {
    const mockDispose = jest.fn();
    const mockRemoveChild = jest.fn();
    const mockStopMonitoring = jest.fn();
    
    // Mock DOM methods
    Element.prototype.removeChild = mockRemoveChild;
    
    // Mock THREE.js dispose methods
    THREE.WebGLRenderer.mockImplementation(() => ({
      setSize: jest.fn(),
      setClearColor: jest.fn(),
      render: jest.fn(),
      getContext: jest.fn(),
      dispose: mockDispose,
      domElement: document.createElement('canvas')
    }));

    // Mock performance monitor
    WebGLPerformanceMonitor.getInstance.mockReturnValue({
      startMonitoring: jest.fn(),
      stopMonitoring: mockStopMonitoring,
      beginFrame: jest.fn(),
      endFrame: jest.fn()
    });

    const { unmount } = render(<OptimizedWebGLBackground />);
    unmount();

    expect(mockDispose).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
    expect(mockStopMonitoring).toHaveBeenCalled();
  });

  // Add more test cases for specific functionality
});

// Performance benchmarks
describe('WebGLBackground Performance', () => {
  it('measures render performance', async () => {
    const perfMock = {
      startMonitoring: jest.fn(),
      getMetrics: jest.fn(() => ({
        frameTime: 16,
        drawCalls: 10,
        triangleCount: 1000
      }))
    };
    
    WebGLPerformanceMonitor.getInstance.mockReturnValue(perfMock);
    
    render(<OptimizedWebGLBackground />);
    
    // Simulate multiple frames
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(perfMock.startMonitoring).toHaveBeenCalled();
    
    const metrics = perfMock.getMetrics();
    expect(metrics.frameTime).toBeLessThanOrEqual(16.67); // 60fps target
    expect(metrics.drawCalls).toBeLessThanOrEqual(10);
    expect(metrics.triangleCount).toBeLessThanOrEqual(1000);

    // Verify memory cleanup
    const { unmount } = render(<OptimizedWebGLBackground />);
    unmount();
    expect(perfMock.getMetrics().memoryUsage).toBeLessThan(metrics.memoryUsage);
  });
});