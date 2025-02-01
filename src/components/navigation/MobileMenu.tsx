'use client'

import React from 'react';
import { motion, AnimatePresence } from '../motion';
import Link from 'next/link';
import { SACRED_RATIOS } from '../../shared/constants';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{ href: string; label: string; }>;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, links }) => {
  const containerVariants = {
    closed: {
      opacity: 0,
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
        mass: 0.5,
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
        mass: 0.5,
        staggerChildren: SACRED_RATIOS.PHI * 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-deep-space/80 backdrop-blur-md z-40"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-deep-space/95 border-l border-neon-teal/20 z-50 overflow-y-auto"
            variants={containerVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Links */}
            <nav className="pt-20 px-6">
              <ul className="space-y-4">
                {links.map((link) => (
                  <motion.li
                    key={link.href}
                    variants={itemVariants}
                    className="group"
                  >
                    <Link
                      href={link.href}
                      className="block py-3 text-lg font-space-grotesk text-gray-300 hover:text-neon-teal transition-colors relative overflow-hidden"
                      onClick={onClose}
                    >
                      <span className="relative z-10">{link.label}</span>
                      <motion.div
                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-teal to-cosmic-purple group-hover:w-full transition-all duration-300"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                      />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Sacred Geometry Decoration */}
            <div className="absolute bottom-0 left-0 w-full h-64 opacity-20 pointer-events-none">
              <div className="absolute inset-0 sacred-geometry-bg" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};