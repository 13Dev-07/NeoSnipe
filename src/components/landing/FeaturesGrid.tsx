'use client'

import React from 'react';
import { motion } from '../motion';
import { useSacredGeometry } from '../sacred-geometry/SacredGeometryProvider';
import Image from 'next/image';
import { SACRED_RATIOS } from '../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

interface Feature {
  title: string;
  description: string;
  icon: string;
  details: string[];
  geometryType: 'flower' | 'harmonic' | 'protection';
}

const features: Feature[] = [
  {
    title: "Pattern Recognition",
    description: "Discover market movements through sacred geometry",
    icon: "/icons/pattern-recognition.svg",
    details: [
      "FlowerOfLife scanner visualization",
      "Real-time pattern morphing",
      "Energy flow indicators"
    ],
    geometryType: "flower"
  },
  {
    title: "Geometric Analysis",
    description: "Analyze tokens using harmonic resonance",
    icon: "/icons/geometric-analysis.svg",
    details: [
      "Live harmonic resonance display",
      "Market pattern visualization",
      "Sacred ratio indicators"
    ],
    geometryType: "harmonic"
  },
  {
    title: "MEV Protection",
    description: "Shield transactions with geometric patterns",
    icon: "/icons/mev-protection.svg",
    details: [
      "Transaction flow visualization",
      "Security pattern display",
      "Energy field protection"
    ],
    geometryType: "protection"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: PHI * 0.2,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: PHI * 0.3,
      ease: [0.165, 0.84, 0.44, 1]
    }
  }
};

export const FeaturesGrid: React.FC = () => {
  const { flowerAnimation, isInitialized } = useSacredGeometry();

  return (
    <section className="relative py-24 bg-deep-space overflow-hidden">
      {/* Sacred Geometry Background */}
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="relative group"
              onMouseEnter={() => {
                if (isInitialized && flowerAnimation) {
                  flowerAnimation.transformPattern({
                    type: feature.geometryType,
                    intensity: PHI,
                    duration: 1000
                  });
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-teal/10 to-cosmic-purple/10 rounded-lg transform group-hover:scale-105 transition-transform duration-500" />
              <div className="relative p-8 rounded-lg border border-neon-teal/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={48}
                    height={48}
                    className="text-neon-teal group-hover:animate-pulse"
                  />
                  <motion.div
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-teal/20 to-cosmic-purple/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: PHI * 2,
                      ease: "linear",
                      repeat: Infinity
                    }}
                  />
                </div>
                
                <h3 className="text-2xl font-orbitron text-white mb-4 group-hover:text-neon-teal transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 font-space-grotesk mb-6">
                  {feature.description}
                </p>
                
                <ul className="space-y-3">
                  {feature.details.map((detail, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center text-sm text-gray-300 font-space-grotesk"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <span className="mr-2 text-neon-teal">⬡</span>
                      {detail}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};