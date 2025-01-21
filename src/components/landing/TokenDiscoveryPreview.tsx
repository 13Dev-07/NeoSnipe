import React from 'react';
import { motion } from 'framer-motion';
import { SACRED_RATIOS } from '../../shared/constants';

export const TokenDiscoveryPreview: React.FC = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-radial from-cosmic-purple/20 via-transparent to-transparent opacity-30" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-teal/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: SACRED_RATIOS.PHI * 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-neon-teal to-cosmic-purple mb-6">
              Discover the Hidden Patterns
            </h2>
            <p className="text-lg text-gray-400 font-space-grotesk mb-8">
              Our advanced pattern recognition system uses sacred geometry principles to identify optimal trading opportunities. Watch as golden ratios and Fibonacci sequences reveal themselves in market movements.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: SACRED_RATIOS.PHI * 0.3 }}
              className="space-y-4"
            >
              {/* Feature List */}
              {[
                'Real-time pattern recognition',
                'Sacred geometry overlays',
                'Golden ratio price levels',
                'Fibonacci time sequences',
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-teal" />
                  <span className="text-gray-300 font-space-grotesk">{feature}</span>
                </div>
              ))}
            </motion.div>

            <motion.button
              className="mt-8 px-8 py-4 bg-transparent border-2 border-neon-teal text-neon-teal rounded-lg
                         font-space-grotesk text-lg tracking-wider relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">Try Demo</span>
              <div className="absolute inset-0 bg-neon-teal/10 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </motion.button>
          </motion.div>

          {/* Visualization Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: SACRED_RATIOS.PHI * 0.5 }}
            className="relative aspect-square max-w-2xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-teal/20 to-cosmic-purple/20 rounded-lg" />
            <div className="absolute inset-0 backdrop-blur-sm rounded-lg border border-neon-teal/20">
              {/* Market Visualization Component would go here */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-neon-teal text-opacity-50 font-orbitron">
                  Market Visualization
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-neon-teal/20 rounded-full filter blur-xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-cosmic-purple/20 rounded-full filter blur-xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
