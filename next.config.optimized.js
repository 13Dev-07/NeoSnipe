/** @type {import('next').NextConfig} */

const path = require('path');
const webpack = require('webpack');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Use SWC for minification (faster than Terser)
  
  // Compiler options to improve build performance
  compiler: {
    // Enable SWC compiler features
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // Image optimization settings
  images: {
    domains: ['secure.domain.com'], // Restrict image domains for security
    deviceSizes: [640, 768, 1024, 1280, 1600], // Optimize image sizes
    imageSizes: [16, 32, 48, 64, 96], // Optimize thumbnail sizes
    minimumCacheTTL: 60, // Cache optimized images
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: ['@components', '@utils'],
    scrollRestoration: true,
    typedRoutes: true,
    webpackBuildWorker: true,
  },

  // Production build optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production
  compress: true, // Enable compression

  // Custom webpack configuration
  webpack: (config, { dev, isServer }) => {
    // GLSL shader loader configuration
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    });

    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 100000,
        cacheGroups: {
          default: false,
          vendors: false,
          // WebGL-specific chunks
          webgl: {
            name: 'webgl',
            test: /[\\/]src[\\/](shaders|webgl)[\\/]/,
            chunks: 'all',
            enforce: true,
            priority: 20,
          },
          // Sacred geometry components
          sacredGeometry: {
            name: 'sacred-geometry',
            test: /[\\/]components[\\/]sacred-geometry[\\/]/,
            chunks: 'all',
            enforce: true,
            priority: 10,
          },
          // Core components bundle
          components: {
            name: 'components',
            test: /[\\/]components[\\/]/,
            chunks: 'all',
            enforce: true,
            priority: 5,
          },
        },
      },
      runtimeChunk: {
        name: 'runtime',
      },
    };

    // Add performance hints
    config.performance = {
      hints: dev ? false : 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };

    // Optimize WebGL assets in production
    if (!dev) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.WEBGL_DEBUG': JSON.stringify(false),
        })
      );
    }

    // Server-specific optimizations
    if (isServer) {
      config.externals = [...config.externals, 
        'canvas', // Exclude canvas on server
        'bufferutil',
        'utf-8-validate',
      ];
    }

    return config;
  },

  // Server-side rendering optimizations
  serverRuntimeConfig: {
    // Runtime server config
  },
  publicRuntimeConfig: {
    // Public runtime config
  },

  // Output configuration
  output: 'standalone', // Optimize for container deployments

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirect configuration
  async redirects() {
    return [];
  },

  // Path rewrites
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

module.exports = nextConfig;