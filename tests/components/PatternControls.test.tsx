import { render, fireEvent, screen } from '@testing-library/react';
import { PatternControls } from '../../src/components/PatternControls';
import { act } from 'react-dom/test-utils';

describe('PatternControls', () => {
  beforeEach(() => {
    // Reset any mocks and clear any side effects
    jest.clearAllMocks();
  });

  test('renders all pattern control elements', () => {
    render(<PatternControls />);
    
    expect(screen.getByLabelText('Number of Segments')).toBeInTheDocument();
    expect(screen.getByLabelText('Number of Layers')).toBeInTheDocument();
    expect(screen.getByLabelText('Pattern Radius')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
  });

  test('updates pattern parameters on slider change', () => {
    const onUpdateMock = jest.fn();
    render(<PatternControls onUpdate={onUpdateMock} />);
    
    const segmentSlider = screen.getByLabelText('Number of Segments');
    
    fireEvent.change(segmentSlider, { target: { value: '8' } });
    
    expect(onUpdateMock).toHaveBeenCalledWith(expect.objectContaining({
      segments: 8
    }));
  });

  test('generates new pattern on button click', () => {
    const onGenerateMock = jest.fn();
    render(<PatternControls onGenerate={onGenerateMock} />);
    
    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);
    
    expect(onGenerateMock).toHaveBeenCalled();
  });

  test('validates input ranges', () => {
    render(<PatternControls />);
    
    const segmentSlider = screen.getByLabelText('Number of Segments');
    const layerSlider = screen.getByLabelText('Number of Layers');
    
    // Test min/max constraints
    fireEvent.change(segmentSlider, { target: { value: '2' } });
    expect(segmentSlider).toHaveValue('3'); // Minimum value
    
    fireEvent.change(layerSlider, { target: { value: '11' } });
    expect(layerSlider).toHaveValue('10'); // Maximum value
  });

  test('supports keyboard navigation', () => {
    render(<PatternControls />);
    
    const segmentSlider = screen.getByLabelText('Number of Segments');
    segmentSlider.focus();
    
    // Test keyboard interactions
    fireEvent.keyDown(segmentSlider, { key: 'ArrowRight' });
    expect(segmentSlider).toHaveValue('4');
    
    fireEvent.keyDown(segmentSlider, { key: 'ArrowLeft' });
    expect(segmentSlider).toHaveValue('3');
  });

  test('updates preview in real-time', async () => {
    const onUpdateMock = jest.fn();
    render(<PatternControls onUpdate={onUpdateMock} />);
    
    const segmentSlider = screen.getByLabelText('Number of Segments');
    
    // Test real-time updates
    await act(async () => {
      fireEvent.change(segmentSlider, { target: { value: '6' } });
    });
    
    expect(onUpdateMock).toHaveBeenCalledTimes(1);
  });
});