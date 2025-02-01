// @ts-check
/** @type {import('next').NextConfig} */
const config = {
  experimental: false,
  transpilePackages: ['@mui/material', '@mui/system', '@mui/icons-material'],
  output: 'standalone',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: false,
  optimizeFonts: true,
  images: {
    domains: ['localhost'],
  },
  poweredByHeader: false,
  compress: true,
}

// Use shorter dist directory path
config.distDir = 'dist';
module.exports = config;