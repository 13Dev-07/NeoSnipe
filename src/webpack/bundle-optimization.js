module.exports = function optimizeBundles(config, { dev, isServer }) {
  // Add WebGL shader support
  config.module.rules.push(require('./glsl-loader'));

  // Optimize bundle size in production
  if (!dev && !isServer) {
    Object.assign(config.resolve.alias, {
      'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
      'react': 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
    });
  }

  // Enable source maps in development
  if (dev) {
    config.devtool = 'eval-source-map';
  }

  return config;
};