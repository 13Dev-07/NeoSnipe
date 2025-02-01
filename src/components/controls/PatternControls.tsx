import React, { useCallback, useEffect } from 'react';
import { useA11y } from '../../hooks/useA11y';
import { A11yAnnouncer } from '../accessibility/A11yAnnouncer';
import { usePatternStore } from '../../store/patterns';
import { SacredPattern } from '../../types/sacred-geometry';

interface PatternControlsProps {
  className?: string;
}

export const PatternControls: React.FC<PatternControlsProps> = ({ className }) => {
  // Add keyboard accessibility
  const { toggleHighContrast } = useA11y();
  const { 
    currentPattern, 
    energyFlowIntensity,
    setPattern,
    setEnergyFlowIntensity
  } = usePatternStore();

  const patterns: SacredPattern[] = [
    'metatrons-cube',
    'vesica-piscis',
    'flower-of-life'
  ];

  const handlePatternChange = useCallback((pattern: SacredPattern) => {
    setPattern(pattern);
  }, [setPattern]);

  const handleIntensityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEnergyFlowIntensity(parseFloat(e.target.value));
  }, [setEnergyFlowIntensity]);

  return (
    <div 
      className={`pattern-controls animate-slide-up ${className}`}
      role="region"
      aria-label="Sacred Geometry Pattern Controls"
    >
      <A11yAnnouncer pattern={currentPattern} intensity={energyFlowIntensity} />
      <div className="flex flex-col space-y-4">
        <div className="high-contrast-toggle">
          <button
            onClick={toggleHighContrast}
            className="btn btn-ghost w-full mb-2"
            aria-label="Toggle high contrast mode"
          >
            High Contrast Mode (Alt + H)
          </button>
        </div>
        <div className="pattern-selector" role="radiogroup" aria-label="Select Pattern">
          {patterns.map((pattern) => (
            <button
              key={pattern}
              className={`btn ${currentPattern === pattern ? 'btn-active' : 'btn-ghost'} w-full mb-2`}
              onClick={() => handlePatternChange(pattern)}
              aria-pressed={currentPattern === pattern}
              role="radio"
              aria-checked={currentPattern === pattern}
            >
              <span className="capitalize">{pattern.replace('-', ' ')}</span>
            </button>
          ))}
        </div>

        <div className="intensity-control" role="group" aria-label="Energy Flow Intensity">
          <label 
            htmlFor="intensity-slider"
            className="block mb-2 text-sm font-medium"
          >
            Energy Flow Intensity
          </label>
          <input
            id="intensity-slider"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={energyFlowIntensity}
            onChange={handleIntensityChange}
            className="w-full"
            aria-valuemin={0}
            aria-valuemax={2}
            aria-valuenow={energyFlowIntensity}
          />
          <div className="flex justify-between text-xs mt-1">
            <span>Min</span>
            <span>Max</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternControls;