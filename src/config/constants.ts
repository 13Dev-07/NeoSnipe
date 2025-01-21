export const PERFORMANCE = {
  FRAME_BUDGET: 16.67, // 60 FPS (1000ms / 60)
  ANIMATION_FRAME_BUDGET: 8.33, // 120 FPS for animations
  IDLE_CALLBACK_TIMEOUT: 1000,
  LONG_TASK_THRESHOLD: 50,
  INTERACTION_BUDGET: 100,
} as const;

export const ERRORS = {
  WEBGL_NOT_SUPPORTED: 'WebGL is not supported in your browser',
  WEBGL_CONTEXT_LOST: 'WebGL context was lost. Please reload the page',
  MEMORY_WARNING: 'High memory usage detected',
  PERFORMANCE_WARNING: 'Performance degradation detected',
} as const;

export const API = {
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100,
  },
  TIMEOUT: 10000, // 10 seconds
} as const;

export const CACHE = {
  TTL: {
    TOKEN_DATA: 60 * 1000, // 1 minute
    MARKET_DATA: 5 * 60 * 1000, // 5 minutes
    STATIC_ASSETS: 24 * 60 * 60 * 1000, // 24 hours
  },
  MAX_SIZE: {
    MEMORY: 100 * 1024 * 1024, // 100MB
    STORAGE: 50 * 1024 * 1024, // 50MB
  },
} as const;