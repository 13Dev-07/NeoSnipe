import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { SACRED_RATIOS } from '../../shared/constants';
import { TimeframeControl } from './TimeframeControl';
import { PatternSelector } from './PatternSelector';
import { VisualizationOptions } from '../visualization/VisualizationOptions';
import { AdvancedFilters } from '../filters/AdvancedFilters';

interface Props {
  onTimeframeChange: (timeframe: string) => void;
  onPatternChange: (pattern: string) => void;
  onVisualizationOptionsChange: (options: any) => void;
  onFiltersChange: (filters: Record<string, boolean>) => void;
}

export const Controls: React.FC<Props> = ({
  onTimeframeChange,
  onPatternChange,
  onVisualizationOptionsChange,
  onFiltersChange
}) => {
  const handleOptionsChange = useCallback((
    type: 'scale' | 'speed' | 'color',
    value: number | string
  ) => {
    onVisualizationOptionsChange({ [type]: value });
  }, [onVisualizationOptionsChange]);

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: SACRED_RATIOS.PHI * 0.5 }}
    >
      <div className="space-y-6">
        <TimeframeControl onChange={onTimeframeChange} />
        <PatternSelector onChange={onPatternChange} />
      </div>
      
      <div className="space-y-6">
        <VisualizationOptions
          onPatternChange={onPatternChange}
          onScaleChange={(scale) => handleOptionsChange('scale', scale)}
          onSpeedChange={(speed) => handleOptionsChange('speed', speed)}
          onColorChange={(color) => handleOptionsChange('color', color)}
          selectedPattern=""
          scale={1}
          speed={1}
          color="#00FFCC"
        />
        <AdvancedFilters onFilterChange={onFiltersChange} />
      </div>
    </motion.div>
  );
};