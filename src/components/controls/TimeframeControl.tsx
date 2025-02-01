import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { SACRED_RATIOS } from '../../shared/constants';

interface Props {
  onChange: (timeframe: string) => void;
}

export const TimeframeControl: React.FC<Props> = ({ onChange }) => {
  const timeframes = [
    { id: '1m', label: '1 Minute' },
    { id: '5m', label: '5 Minutes' },
    { id: '15m', label: '15 Minutes' },
    { id: '1h', label: '1 Hour' },
    { id: '4h', label: '4 Hours' },
    { id: '1d', label: '1 Day' }
  ];

  const handleTimeframeClick = useCallback((timeframe: string) => {
    onChange(timeframe);
  }, [onChange]);

  return (
    <motion.div
      className="bg-cosmic-purple/10 backdrop-blur-md rounded-lg p-6 border border-neon-teal/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: SACRED_RATIOS.PHI * 0.5 }}
    >
      <h3 className="text-xl font-orbitron text-neon-teal mb-4">Timeframe</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {timeframes.map((tf, index) => (
          <motion.button
            key={tf.id}
            onClick={() => handleTimeframeClick(tf.id)}
            className="px-4 py-2 rounded-md bg-cosmic-purple/20 border border-neon-teal/30
                     hover:bg-neon-teal/20 hover:border-neon-teal transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-neon-teal focus:ring-offset-2
                     focus:ring-offset-cosmic-purple"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * (SACRED_RATIOS.PHI * 0.1)
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="block text-sm font-space-grotesk text-gray-200">
              {tf.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};