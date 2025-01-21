// Shared performance configuration values
module.exports = {
  // Core Web Vitals thresholds
  webVitals: {
    LCP: 2500, // Largest Contentful Paint (ms)
    FID: 100,  // First Input Delay (ms)
    CLS: 0.1,  // Cumulative Layout Shift (score)
    FCP: 1800, // First Contentful Paint (ms)
    TTI: 3800  // Time to Interactive (ms)
  },

  // WebGL performance settings
  webgl: {
    targetFPS: 60,
    minFPS: 30,
    pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
    powerPreference: 'high-performance',
    antialias: true,
    adaptiveQuality: true,
  },

  // Animation performance settings
  animation: {
    throttleRAF: true,
    useWillChange: true,
    motionReduced: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  },

  // Resource hints
  resourceHints: {
    preconnect: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ],
    prefetch: [
      '/market',
      '/token-discovery'
    ],
    preload: [
      '/fonts/SpaceGrotesk-Medium.woff2'
    ]
  }
};