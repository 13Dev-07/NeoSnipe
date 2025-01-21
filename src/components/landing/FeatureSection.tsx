import React from 'react';
import { motion } from 'framer-motion';
import { SACRED_RATIOS } from '../../shared/constants';

const features = [
  {
    title: 'Sacred Geometry Analysis',
    description: 'Discover tokens using ancient geometric principles combined with modern market analysis',
    icon: '⬡',
  },
  {
    title: 'Golden Ratio Patterns',
    description: 'Track market movements aligned with natural growth patterns and Fibonacci sequences',
    icon: '𝝋',
  },
  {
    title: 'Real-time Market Data',
    description: 'Stay ahead with instant updates and pattern recognition powered by sacred mathematics',
    icon: '◈',
  },
  {
    title: 'Advanced Visualization',
    description: 'See market patterns through the lens of sacred geometry and golden spirals',
    icon: '◎',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: SACRED_RATIOS.PHI * 0.2,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export const FeatureSection: React.FC = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-teal/30 to-transparent" />
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-neon-teal to-cosmic-purple mb-6">
            Powered by Sacred Mathematics
          </h2>
          <p className="text-lg md:text-xl text-gray-400 font-space-grotesk max-w-3xl mx-auto">
            Harness the power of ancient wisdom combined with cutting-edge technology
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-teal/10 to-cosmic-purple/10 rounded-lg transform group-hover:scale-105 transition-transform duration-500" />
              <div className="relative p-6 rounded-lg border border-neon-teal/20 backdrop-blur-sm">
                <div className="text-4xl mb-4 text-neon-teal group-hover:animate-pulse">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-orbitron text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 font-space-grotesk">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
