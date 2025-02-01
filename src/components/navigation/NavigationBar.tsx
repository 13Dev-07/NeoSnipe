'use client'

import React, { useEffect, useState } from 'react';
import { MobileMenu } from './MobileMenu';
import { motion, useScroll, useTransform } from '../motion';
import Link from 'next/link';
import Image from 'next/image';

interface NavLink {
  href: string;
  label: string;
}

const links: NavLink[] = [
  { href: '/matrix', label: 'Discovery Matrix' },
  { href: '/patterns', label: 'Sacred Patterns' },
  { href: '/analysis', label: 'Token Analysis' },
  { href: '/flow', label: 'Energy Flow' },
];

export const NavigationBar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  
  const backgroundOpacity = useTransform(
    scrollY,
    [0, 100],
    [0, 0.8]
  );

  const logoScale = useTransform(
    scrollY,
    [0, 100],
    [1, 0.8]
  );

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', updateScroll);
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md' : ''
      }`}
      style={{
        backgroundColor: `rgba(8, 10, 46, ${backgroundOpacity.get()})`,
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div style={{ scale: logoScale }} className="relative w-40">
          <Link href="/" className="block">
            <Image
              src="/logo.svg"
              alt="NeoSnipe Logo"
              width={160}
              height={40}
              className="transform transition-transform hover:scale-105"
            />
          </Link>
        </motion.div>

        <div className="hidden md:flex items-center space-x-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative group"
            >
              <span className="text-gray-200 font-space-grotesk tracking-wider hover:text-neon-teal transition-colors">
                {link.label}
              </span>
              <motion.div
                className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-teal to-cosmic-purple group-hover:w-full transition-all duration-300"
                whileHover={{ width: '100%' }}
              />
            </Link>
          ))}
        </div>

        <button
          className="md:hidden text-white"
          aria-label="Toggle menu"
          onClick={() => setIsMobileMenuOpen(true)}
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        links={links}
      />
    </motion.nav>
  );
};