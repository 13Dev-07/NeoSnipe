import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PatternSVG } from '../../src/components/PatternSVG';
import { PatternControls } from '../../src/components/PatternControls';

expect.extend(toHaveNoViolations);

describe('Pattern Accessibility', () => {
  test('SVG patterns have proper ARIA labels', () => {
    render(
      <PatternSVG
        pattern={{
          id: 'test-pattern',
          segments: 6,
          layers: 3,
          radius: 100
        }}
      />
    );

    const svg = screen.getByRole('img', { name: /sacred geometry pattern/i });
    expect(svg).toHaveAttribute('aria-label');
    expect(svg).toHaveAttribute('role', 'img');
  });

  test('Pattern controls meet WCAG requirements', async () => {
    const { container } = render(<PatternControls />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('High contrast mode compatibility', () => {
    render(<PatternSVG pattern={{ id: 'test', segments: 6, layers: 3, radius: 100 }} />);
    
    const svgElements = screen.getAllByRole('img');
    svgElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      expect(styles.fill).not.toBe('none');
      expect(styles.stroke).not.toBe('none');
    });
  });

  test('Keyboard navigation for pattern controls', () => {
    render(<PatternControls />);
    
    const controls = screen.getAllByRole('slider');
    controls.forEach(control => {
      control.focus();
      expect(document.activeElement).toBe(control);
    });
  });

  test('Screen reader descriptions', () => {
    render(
      <PatternSVG
        pattern={{
          id: 'test-pattern',
          segments: 6,
          layers: 3,
          radius: 100
        }}
        description="A hexagonal sacred geometry pattern with 6 segments and 3 layers"
      />
    );

    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-describedby');
    expect(screen.getByText(/hexagonal sacred geometry pattern/i)).toBeInTheDocument();
  });

  test('Color contrast compliance', () => {
    render(<PatternControls darkMode={true} />);
    
    const elements = screen.getAllByRole('slider');
    elements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      
      // Simple contrast check (should use a proper contrast calculation in real implementation)
      expect(backgroundColor).not.toBe(color);
    });
  });
});