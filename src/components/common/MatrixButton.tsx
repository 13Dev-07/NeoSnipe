import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { SACRED_RATIOS } from '../../shared/constants';

interface MatrixButtonProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const MatrixButtonComponent: React.FC<MatrixButtonProps> = ({
  onClick,
  className = '',
  children
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label="Enter the Matrix - Begin your crypto discovery journey"
      tabIndex={0}
      className={`px-16 py-5 bg-transparent border-2 border-[#00FFCC] text-[#00FFCC] rounded-lg
                  font-space-grotesk text-lg md:text-xl tracking-wider
                  relative overflow-hidden group transition-all duration-300
                  hover:bg-[#00FFCC]/10 focus:outline-none focus:ring-2 focus:ring-[#00FFCC]/50
                  ${className}`}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 0 30px rgba(0, 255, 204, 0.3)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative z-10">{children}</span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#00FFCC]/20 to-[#9674d4]/20"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: SACRED_RATIOS.PHI * 0.618 }}
      />
    </motion.button>
  );
};

export const MatrixButton = memo(MatrixButtonComponent);