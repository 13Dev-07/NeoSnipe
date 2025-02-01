import React from 'react';
import { render, screen } from '@testing-library/react';
import MetatronsCube from '../../../components/sacred-geometry/MetatronsCube';
import { useWebGLContext } from '../../../hooks/useWebGLContext';
import { useSacredGeometry } from '../../../components/sacred-geometry/SacredGeometryProvider';

// Mock the custom hooks
jest.mock('../../../hooks/useWebGLContext');
jest.mock('../../../components/sacred-geometry/SacredGeometryProvider');

describe('MetatronsCube', () => {
  const mockGL = {
    canvas: { width: 800, height: 600 },
    viewport: jest.fn(),
    clear: jest.fn(),
    createBuffer: jest.fn(),
    bindBuffer: jest.fn(),
    bufferData: jest.fn(),
    deleteBuffer: jest.fn(),
    drawElements: jest.fn()
  };

  beforeEach(() => {
    // Setup mocks
    (useWebGLContext as jest.Mock).mockReturnValue({
      gl: mockGL,
      isContextLost: false
    });

    (useSacredGeometry as jest.Mock).mockReturnValue({
      scale: 1.0
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <MetatronsCube
        size={2}
        color={[1, 1, 1, 1]}
        rotation={0}
      />
    );

    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('initializes WebGL resources correctly', () => {
    render(
      <MetatronsCube
        size={2}
        color={[1, 1, 1, 1]}
        rotation={0}
      />
    );

    expect(mockGL.createBuffer).toHaveBeenCalledTimes(2);
    expect(mockGL.bindBuffer).toHaveBeenCalledTimes(2);
    expect(mockGL.bufferData).toHaveBeenCalledTimes(2);
  });

  it('handles context loss gracefully', () => {
    (useWebGLContext as jest.Mock).mockReturnValue({
      gl: mockGL,
      isContextLost: true
    });

    render(
      <MetatronsCube
        size={2}
        color={[1, 1, 1, 1]}
        rotation={0}
      />
    );

    const canvas = screen.getByRole('presentation');
    expect(canvas).toHaveStyle({ display: 'none' });
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = render(
      <MetatronsCube
        size={2}
        color={[1, 1, 1, 1]}
        rotation={0}
      />
    );

    unmount();
    expect(mockGL.deleteBuffer).toHaveBeenCalledTimes(2);
  });

  it('memoizes geometry calculations correctly', () => {
    const { rerender } = render(
      <MetatronsCube
        size={2}
        color={[1, 1, 1, 1]}
        rotation={0}
      />
    );

    const initialCalls = mockGL.bufferData.mock.calls.length;

    // Rerender with same props
    rerender(
      <MetatronsCube
        size={2}
        color={[1, 1, 1, 1]}
        rotation={0}
      />
    );

    // Buffer data should not be called again due to memoization
    expect(mockGL.bufferData.mock.calls.length).toBe(initialCalls);
  });
});