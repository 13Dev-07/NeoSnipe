import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSection } from '../HeroSection';
import { act } from 'react-dom/test-utils';

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const DynamicComponent = () => <div data-testid="mock-metatrons-cube" />;
    return DynamicComponent;
  },
}));

describe('HeroSection', () => {
  beforeEach(() => {
    // Mock window.innerWidth/Height
    Object.defineProperty(window, 'innerWidth', { value: 1920 });
    Object.defineProperty(window, 'innerHeight', { value: 1080 });
  });

  it('renders without crashing', () => {
    render(<HeroSection />);
    expect(screen.getByText('NEOSNIPE')).toBeInTheDocument();
    expect(screen.getByText('Discover tokens through sacred geometry')).toBeInTheDocument();
  });

  it('handles mouse movement correctly', () => {
    render(<HeroSection />);
    
    act(() => {
      fireEvent.mouseMove(window, { clientX: 960, clientY: 540 });
    });

    // Add assertions for mouse movement effects
  });

  it('animates elements on mount', () => {
    render(<HeroSection />);
    const logo = screen.getByAltText('NeoSnipe Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('width', '192');
    expect(logo).toHaveAttribute('height', '192');
  });

  it('has correct accessibility attributes', () => {
    render(<HeroSection />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label');
  });
});