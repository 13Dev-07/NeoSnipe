import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SACRED_RATIOS } from '../../shared/constants';

interface Props {
  onPatternChange: (pattern: string) => void;
  onScaleChange: (scale: number) => void;
  onSpeedChange: (speed: number) => void;
  onColorChange: (color: string) => void;
  selectedPattern: string;
  scale: number;
  speed: number;
  color: string;
}

export const VisualizationOptions: React.FC<Props> = ({
  onPatternChange,
  onScaleChange,
  onSpeedChange,
  onColorChange,
  selectedPattern,
  scale,
  speed,
  color
}) => {
  const patterns = useMemo(() => [
    { id: 'flower-of-life', name: 'Flower of Life' },
    { id: 'sri-yantra', name: 'Sri Yantra' },
    { id: 'metatrons-cube', name: 'Metatron\'s Cube' },
    { id: 'vesica-piscis', name: 'Vesica Piscis' }
  ], []);

  const handlePatternChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onPatternChange(e.target.value);
  }, [onPatternChange]);

  const handleScaleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onScaleChange(parseFloat(e.target.value));
  }, [onScaleChange]);

  const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSpeedChange(parseFloat(e.target.value));
  }, [onSpeedChange]);

  return (
    <motion.div
      className="bg-cosmic-purple/10 backdrop-blur-md rounded-lg p-6 border border-neon-teal/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: SACRED_RATIOS.PHI * 0.5 }}
    >
      <h3 className="text-xl font-orbitron text-neon-teal mb-4">Visualization Options</h3>
      
      <div className="space-y-4">
        {/* Pattern Selection */}
        <div className="form-group">
          <label htmlFor="pattern" className="block text-gray-300 mb-2 font-space-grotesk">
            Sacred Pattern
          </label>
          <select
            id="pattern"
            value={selectedPattern}
            onChange={handlePatternChange}
            className="w-full bg-cosmic-purple/20 border border-neon-teal/30 rounded-md p-2 text-gray-200
                     focus:border-neon-teal focus:ring-1 focus:ring-neon-teal outline-none"
            aria-label="Select sacred geometry pattern"
          >
            {patterns.map(pattern => (
              <option key={pattern.id} value={pattern.id}>
                {pattern.name}
              </option>
            ))}
          </select>
        </div>

        {/* Scale Control */}
        <div className="form-group">
          <label htmlFor="scale" className="block text-gray-300 mb-2 font-space-grotesk">
            Pattern Scale
          </label>
          <input
            type="range"
            id="scale"
            min="0.1"
            max="2"
            step="0.1"
            value={scale}
            onChange={handleScaleChange}
            className="w-full appearance-none bg-cosmic-purple/20 rounded-md h-2
                     focus:outline-none focus:ring-2 focus:ring-neon-teal"
            aria-label="Adjust pattern scale"
          />
        </div>

        {/* Animation Speed */}
        <div className="form-group">
          <label htmlFor="speed" className="block text-gray-300 mb-2 font-space-grotesk">
            Animation Speed
          </label>
          <input
            type="range"
            id="speed"
            min="0"
            max="2"
            step="0.1"
            value={speed}
            onChange={handleSpeedChange}
            className="w-full appearance-none bg-cosmic-purple/20 rounded-md h-2
                     focus:outline-none focus:ring-2 focus:ring-neon-teal"
            aria-label="Adjust animation speed"
          />
        </div>

        {/* Color Selection */}
        <div className="form-group">
          <label htmlFor="color" className="block text-gray-300 mb-2 font-space-grotesk">
            Pattern Color
          </label>
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-full h-10 bg-cosmic-purple/20 border border-neon-teal/30 rounded-md p-1
                     focus:border-neon-teal focus:ring-1 focus:ring-neon-teal outline-none"
            aria-label="Select pattern color"
          />
        </div>
      </div>
    </motion.div>
  );
};