import { render, fireEvent, screen } from '@testing-library/react';
import { ColorPicker } from '../../src/components/ColorPicker';
import { act } from 'react-dom/test-utils';

describe('ColorPicker', () => {
  const defaultProps = {
    initialColor: '#000000',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with initial color', () => {
    render(<ColorPicker {...defaultProps} />);
    
    const colorInput = screen.getByLabelText('Color');
    expect(colorInput).toHaveValue('#000000');
  });

  test('opens color picker on click', () => {
    render(<ColorPicker {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('updates color on change', async () => {
    render(<ColorPicker {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    const colorInput = screen.getByLabelText('Color');
    
    await act(async () => {
      fireEvent.change(colorInput, { target: { value: '#FF0000' } });
    });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('#FF0000');
  });

  test('closes picker on outside click', () => {
    render(<ColorPicker {...defaultProps} />);
    
    // Open picker
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    // Click outside
    fireEvent.click(document.body);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('supports keyboard navigation', () => {
    render(<ColorPicker {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    
    // Open with Enter
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Close with Escape
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('maintains focus management', () => {
    render(<ColorPicker {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    trigger.focus();
    
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(document.activeElement).toEqual(screen.getByLabelText('Color'));
    
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(document.activeElement).toEqual(trigger);
  });
});