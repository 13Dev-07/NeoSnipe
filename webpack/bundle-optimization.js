// Webpack bundle optimization configuration
const path = require('path');

module.exports = function withBundleOptimizations(nextConfig) {
  return Object.assign({}, nextConfig, {
    webpack: (config, { dev, isServer, ...options }) => {
      // Call the original webpack function if it exists
      if (typeof nextConfig.webpack === 'function') {
        config = nextConfig.webpack(config, { dev, isServer, ...options });
      }

      // Enhance module resolution
      config.resolve = {
        ...config.resolve,
        extensions: [...(config.resolve?.extensions || []), '.ts', '.tsx', '.js', '.jsx', '.json', '.glsl'],
        alias: {
          ...config.resolve?.alias,
          '@': path.resolve(__dirname, '../src')
        }
      };

      // Add handling for TypeScript files
      config.module.rules.push({
        test: /\.(ts)$/,
        include: /src/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: 'tsconfig.json'
            }
          }
        ]
      });

      // Optimize bundle size in production
      if (!dev && !isServer) {
        Object.assign(config.resolve.alias, {
          'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
          'react': 'preact/compat',
          'react-dom/test-utils': 'preact/test-utils',
          'react-dom': 'preact/compat'
        });
      }

      return config;
    }
  });
};