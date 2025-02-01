'use client'

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from '../motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { SACRED_RATIOS } from '../../shared/constants';
import { CTAButton } from './CTAButton';
import { ErrorBoundary } from '../error-boundary/ErrorBoundary';

const DynamicMetatronsCube = dynamic(
  () => import('./MetatronsCube').then(mod => mod.MetatronsCube),
  {
    ssr: false,
    loading: () => <div className="w-full h-full animate-pulse bg-gray-800/50" />
  }
);

const goldenRatio = SACRED_RATIOS.PHI;

type Props = {
  children?: never;
};

const HeroSectionBase: React.FC<Props> = () => {
  // Memoize event handler to prevent unnecessary re-renders
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Handle enter/space key press for accessibility
      console.log('Matrix button activated via keyboard');
    }
  }, []);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const titleRef = useRef<HTMLHeadingElement>(null);

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
    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [handleMouseMove, handleKeyPress]);

  // Memoize complex calculations and static JSX
  const titleAnimation = useMemo(() => ({
    initial: { opacity: 0, y: 50 },
    animate: { 
      opacity: 1,
      y: 0,
      textShadow: [
        "0 0 20px rgba(0,255,204,0.3)",
        "0 0 40px rgba(0,255,204,0.2)",
        "0 0 20px rgba(0,255,204,0.3)"
      ]
    },
    transition: { 
      duration: goldenRatio,
      ease: [0.618, 0, 0.382, 1]
    }
  }), []);

  const subtitleAnimation = useMemo(() => ({
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1,
      scale: 1,
      transition: { 
        delay: goldenRatio * 0.382,
        duration: goldenRatio * 0.618,
        ease: [0.34, 1.56, 0.64, 1]
      }
    }
  }), []);

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
      aria-labelledby="hero-title"
      aria-describedby="hero-description"
      aria-live="polite"
    >
      {backgroundElements}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4">
          <motion.div className="flex flex-col items-center justify-center" style={{ perspective: 1000 }}>
            <motion.div style={{ rotateX, rotateY }} className="flex flex-col items-center">
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

              <motion.h1
                ref={titleRef}
                id="hero-title"
                {...titleAnimation}
                className="text-6xl md:text-8xl font-orbitron font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] via-[#00FFCC] to-[#FFD700] filter drop-shadow-[0_0_15px_rgba(0,255,204,0.5)]"
              >NEOSNIPE</motion.h1>
              
              <motion.h2 
                id="hero-description"
                className="text-xl md:text-2xl font-space-grotesk mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cosmic-purple to-neon-teal tracking-wider text-center max-w-2xl mx-auto"
                variants={subtitleAnimation}
                initial="initial"
                animate="animate"
                tabIndex={0}
              >
                Discover Tokens Through Sacred Geometry
              </motion.h2>

              <motion.p
                className="text-lg text-gray-400 font-space-grotesk mb-12 tracking-wide text-center max-w-2xl mx-auto"
                variants={subtitleAnimation}
                initial="initial"
                animate="animate"
              >
                Where Mathematics Meets Market Movement
              </motion.p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <CTAButton
                  size="lg"
                  variant="primary"
                  geometricShape="hexagon"
                  onClick={() => {
                    // Handle primary CTA click
                    console.log('Primary CTA clicked');
                  }}
                >
                  Enter the Matrix
                </CTAButton>

                <CTAButton
                  size="lg"
                  variant="secondary"
                  geometricShape="octagon"
                  onClick={() => {
                    // Handle secondary CTA click
                    console.log('Secondary CTA clicked');
                  }}
                >
                  Explore Patterns
                </CTAButton>
              </div>
              
              {/* Matrix Button removed in favor of CTAButton */}
            </motion.div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00FFCC]/50 to-transparent" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00FFCC]/50 to-transparent" />
    </section>
  );
};

export const HeroSection = React.memo(HeroSectionBase);