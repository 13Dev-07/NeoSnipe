// Re-export all styling related exports
export * from './theme'
export * from './fonts'

// Export sacred geometry constants
export const SACRED_GEOMETRY = {
  GOLDEN_RATIO: 1.618034,
  SILVER_RATIO: 2.414214,
  BASE_SPACING: 8,
} as const;

// Export color palette
export const SACRED_COLORS = {
  COSMIC_BLACK: '#0A0A0F',
  NEON_TEAL: '#00FFCC',
  COSMIC_PURPLE: '#663399',
  SACRED_GOLD: '#FFD700',
  ENERGY_BLUE: '#00A3FF',
  VOID_GRAY: '#1A1A2E',
} as const;