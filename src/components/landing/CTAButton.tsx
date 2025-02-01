import React from 'react';
import { motion } from 'framer-motion';
import { useGoldenRatio } from '@/hooks/useGoldenRatio';
import { PHI } from '@/utils/sacred-constants.js';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'golden' | 'cosmic';
  size?: 'phi' | 'standard';
}

const useButtonAnimation = () => {
  const { scale, transition } = useGoldenRatio();
  return {
    scale,
    transition: {
      ...transition,
      type: 'spring',
      stiffness: 161.8, // Golden ratio-based stiffness
      damping: 10,
    }
  };
};

export const CTAButton: React.FC<Props> = ({
  children,
  variant = 'golden',
  size = 'phi',
  className = '',
  ...props
}) => {
  const animation = useButtonAnimation();
  
  const baseClasses = `
    sacred-button relative group flex items-center justify-center
    font-orbitron font-semibold tracking-wider
    overflow-hidden transition-all duration-300
    hover:shadow-lg focus:outline-none focus:ring-2
    focus:ring-amber-500/50 disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const sizeClasses = {
    phi: 'px-6 py-3 text-[1.618rem]',
    standard: 'px-4 py-2 text-base',
  };

  const variantClasses = {
    golden: 'bg-amber-600/10 text-amber-500 border-2 border-amber-500 hover:bg-amber-500/20',
    cosmic: 'bg-slate-800/10 text-slate-200 border-2 border-slate-200 hover:bg-slate-700/20',
  };

  // Animation and styling configuration is handled by the useButtonAnimation hook

  return (
    <motion.button
      className={\`\${baseClasses} \${sizeClasses[size]} \${variantClasses[variant]} \${className}\`}
      whileHover={{ scale: animation.scale.up }}
      whileTap={{ scale: animation.scale.down }}
      transition={animation.transition}
      {...props}
    >
      <div className="sacred-glow absolute inset-0 pointer-events-none">
        <motion.div
          className="w-full h-full bg-gradient-to-r from-amber-500/20 to-transparent"
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: PHI * 2,
            ease: "linear",
            repeat: Infinity,
          }}
        />
      </div>
      {children}
    </motion.button>
  );
};

export default CTAButton;