import { useEffect } from 'react';

export const useA11y = (focusableElements: string[] = ['button', 'a', '[role="button"]']) => {
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