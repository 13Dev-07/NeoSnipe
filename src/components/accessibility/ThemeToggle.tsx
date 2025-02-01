import React from 'react';
import { Button, ButtonGroup, Tooltip } from '@mui/material';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useLocalStorage('accessibility-theme', 'default');

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div role="group" aria-label="Accessibility theme options">
      <ButtonGroup variant="outlined" aria-label="theme selection">
        <Tooltip title="Default theme">
          <Button
            onClick={() => handleThemeChange('default')}
            aria-pressed={theme === 'default'}
            aria-label="Use default theme"
          >
            Default
          </Button>
        </Tooltip>
        <Tooltip title="High contrast theme">
          <Button
            onClick={() => handleThemeChange('high-contrast')}
            aria-pressed={theme === 'high-contrast'}
            aria-label="Use high contrast theme"
          >
            High Contrast
          </Button>
        </Tooltip>
        <Tooltip title="Color blind friendly theme">
          <Button
            onClick={() => handleThemeChange('colorblind')}
            aria-pressed={theme === 'colorblind'}
            aria-label="Use colorblind friendly theme"
          >
            Color Blind
          </Button>
        </Tooltip>
      </ButtonGroup>
    </div>
  );
};