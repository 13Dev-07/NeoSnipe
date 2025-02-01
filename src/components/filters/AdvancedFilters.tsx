import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SACRED_RATIOS } from '../../shared/constants';

interface FilterOption {
  id: string;
  label: string;
  description: string;
}

interface Props {
  onFilterChange: (filters: Record<string, boolean>) => void;
  defaultFilters?: Record<string, boolean>;
}

export const AdvancedFilters: React.FC<Props> = ({ 
  onFilterChange,
  defaultFilters = {}
}) => {
  const [activeFilters, setActiveFilters] = useState(defaultFilters);

  const filterOptions = useMemo<FilterOption[]>(() => [
    {
      id: 'golden-ratio',
      label: 'Golden Ratio Patterns',
      description: 'Detect price movements following the golden ratio (1.618)'
    },
    {
      id: 'fibonacci',
      label: 'Fibonacci Sequences',
      description: 'Identify Fibonacci retracement and extension levels'
    },
    {
      id: 'sacred-geometry',
      label: 'Sacred Geometry',
      description: 'Find patterns matching sacred geometry formations'
    },
    {
      id: 'harmonic-patterns',
      label: 'Harmonic Patterns',
      description: 'Detect harmonic price patterns like Gartley and Butterfly'
    }
  ], []);

  const handleFilterToggle = useCallback((filterId: string) => {
    setActiveFilters(prev => {
      const newFilters = {
        ...prev,
        [filterId]: !prev[filterId]
      };
      onFilterChange(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  return (
    <motion.div
      className="bg-cosmic-purple/10 backdrop-blur-md rounded-lg p-6 border border-neon-teal/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: SACRED_RATIOS.PHI * 0.5 }}
    >
      <h3 className="text-xl font-orbitron text-neon-teal mb-4">Advanced Filters</h3>
      
      <div className="space-y-4">
        {filterOptions.map(filter => (
          <motion.div
            key={filter.id}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: SACRED_RATIOS.PHI * 0.2 }}
          >
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={activeFilters[filter.id] || false}
                onChange={() => handleFilterToggle(filter.id)}
                className="form-checkbox h-5 w-5 text-neon-teal rounded border-neon-teal/50
                         focus:ring-neon-teal focus:ring-offset-cosmic-purple focus:ring-offset-2"
                aria-label={filter.label}
              />
              <div className="flex-1">
                <span className="block text-gray-200 font-space-grotesk group-hover:text-neon-teal transition-colors">
                  {filter.label}
                </span>
                <span className="block text-sm text-gray-400 mt-1">
                  {filter.description}
                </span>
              </div>
            </label>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};