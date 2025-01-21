import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { MetatronsCube } from './MetatronsCube';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { SACRED_RATIOS } from '../../shared/constants';
import { MatrixButton } from '../common/MatrixButton';
import { ErrorBoundary } from '../error-boundary/ErrorBoundary';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import heavy components
const DynamicMetatronsCube = dynamic(() => import('./MetatronsCube').then(mod => mod.MetatronsCube), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-gray-800/50" />
});

const goldenRatio = SACRED_RATIOS.PHI;

export const HeroSection: React.FC = React.memo(() => {
  const controls = useAnimation();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Transform mouse movement into rotation
  const rotateX = useTransform(mouseY, [-500, 500], [15, -15]);
  const rotateY = useTransform(mouseX, [-500, 500], [-15, 15]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX - innerWidth / 2);
    mouseY.set(clientY - innerHeight / 2);
  }, [mouseX, mouseY]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const backgroundElements = useMemo(() => (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-radial from-[#06071b] via-[#0a0d2c] to-[#06071b] opacity-80" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      <div className="absolute inset-0">
        <ErrorBoundary>
          <DynamicMetatronsCube />
        </ErrorBoundary>
      </div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/30 rounded-full filter blur-3xl animate-pulse-slower" />
    </div>
  ), []);

  return (
    <section 
      className="relative w-full min-h-screen"
      role="banner"
      aria-labelledby="hero-title">
      {backgroundElements}

      {/* Content Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4">
          <motion.div
            className="flex flex-col items-center justify-center"
            style={{ perspective: 1000 }}
          >
            <motion.div
              style={{ rotateX, rotateY }}
              className="flex flex-col items-center"
            >
              {/* Logo */}
              <motion.div
                className="w-48 h-48 mb-12"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                <Image 
                  src="/logo.svg" 
                  alt="NeoSnipe Logo"
                  width={192}
                  height={192}
                  priority
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {/* Title */}
              <motion.h1 
                ref={titleRef}
                className="text-6xl md:text-8xl font-orbitron font-bold mb-8 text-center
                           bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] via-[#00FFCC] to-[#FFD700]
                           filter drop-shadow-[0_0_15px_rgba(0,255,204,0.5)]"
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  textShadow: [
                    "0 0 20px rgba(0,255,204,0.3)",
                    "0 0 40px rgba(0,255,204,0.2)",
                    "0 0 20px rgba(0,255,204,0.3)",
                  ]
                }}
                transition={{ 
                  duration: goldenRatio,
                  ease: [0.618, 0, 0.382, 1],
                }}
              >
                NEOSNIPE
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p 
                className="text-xl md:text-2xl font-space-grotesk mb-6
                           text-transparent bg-clip-text bg-gradient-to-r from-[#9674d4] to-[#00FFCC]
                           tracking-wider text-center max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  delay: goldenRatio * 0.382,
                  duration: goldenRatio * 0.618
                }}
              >
                Discover tokens through sacred geometry
              </motion.p>

              {/* Subtext */}
              <motion.p
                className="text-lg text-gray-400 font-space-grotesk mb-12
                           tracking-wide text-center max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: goldenRatio * 0.618,
                  duration: goldenRatio * 0.382
                }}
              >
                Harness the power of ancient wisdom combined with cutting-edge technology
              </motion.p>
              
              {/* CTA Button */}
              <MatrixButton>Enter the Matrix</MatrixButton>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00FFCC]/50 to-transparent" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00FFCC]/50 to-transparent" />
    </section>
  );
};
