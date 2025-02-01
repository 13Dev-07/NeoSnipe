import React from 'react';
import { render, screen } from '@testing-library/react';
import TorusEnergyFlow from '../../../components/sacred-geometry/TorusEnergyFlow';
import { useWebGLContext } from '../../../hooks/useWebGLContext';
import { useSacredGeometry } from '../../../components/sacred-geometry/SacredGeometryProvider';

// Mock the custom hooks
jest.mock('../../../hooks/useWebGLContext');
jest.mock('../../../components/sacred-geometry/SacredGeometryProvider');

describe('TorusEnergyFlow', () => {
  const mockGL = {
    canvas: { width: 800, height: 600 },
    viewport: jest.fn(),
    clear: jest.fn(),
    enable: jest.fn(),
    blendFunc: jest.fn(),
    createBuffer: jest.fn(),
    bindBuffer: jest.fn(),
    bufferData: jest.fn(),
    deleteBuffer: jest.fn(),
    drawElementsInstanced: jest.fn()
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
      <TorusEnergyFlow
        radius={1}
        tubeRadius={0.3}
        segments={32}
        rotation={0}
        color={[1, 1, 1, 1]}
      />
    );

    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('initializes WebGL resources correctly', () => {
    render(
      <TorusEnergyFlow
        radius={1}
        tubeRadius={0.3}
        segments={32}
        rotation={0}
        color={[1, 1, 1, 1]}
      />
    );

    expect(mockGL.enable).toHaveBeenCalledWith(mockGL.DEPTH_TEST);
    expect(mockGL.enable).toHaveBeenCalledWith(mockGL.BLEND);
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
      <TorusEnergyFlow
        radius={1}
        tubeRadius={0.3}
        segments={32}
        rotation={0}
        color={[1, 1, 1, 1]}
      />
    );

    const canvas = screen.getByRole('presentation');
    expect(canvas).toHaveStyle({ display: 'none' });
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = render(
      <TorusEnergyFlow
        radius={1}
        tubeRadius={0.3}
        segments={32}
        rotation={0}
        color={[1, 1, 1, 1]}
      />
    );

    unmount();
    expect(mockGL.deleteBuffer).toHaveBeenCalledTimes(2);
  });
});