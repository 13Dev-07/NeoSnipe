import { useEffect, useCallback } from 'react';
import { usePatternStore } from '../store/patterns';

export const useA11y = () => {
  // Toggle high contrast mode
  const toggleHighContrast = useCallback(() => {
    document.body.classList.toggle('high-contrast');
  }, []);
  const { currentPattern, setPattern, setEnergyFlowIntensity } = usePatternStore();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle tab key
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('user-is-tabbing');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    // Ensure all interactive elements are focusable and have proper roles
    focusableElements.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        if (!(element as HTMLElement).getAttribute('tabindex')) {
          (element as HTMLElement).setAttribute('tabindex', '0');
        }
      });
    });
  }, [focusableElements]);
};