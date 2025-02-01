/**
 * User preferences configuration
 */
export interface UserPreferences {
  /** Display preferences */
  display: DisplayPreferences;
  /** Pattern preferences */
  pattern: PatternPreferences;
  /** Animation preferences */
  animation: AnimationPreferences;
  /** Accessibility preferences */
  accessibility: AccessibilityPreferences;
}

/**
 * Display-related preferences
 */
export interface DisplayPreferences {
  /** Dark mode enabled */
  darkMode: boolean;
  /** High contrast mode enabled */
  highContrast: boolean;
  /** UI scale factor */
  uiScale: number;
  /** Preferred color scheme */
  colorScheme: 'light' | 'dark' | 'system';
  /** Animation reduced motion preference */
  reducedMotion: boolean;
}

/**
 * Pattern creation preferences
 */
export interface PatternPreferences {
  /** Default number of segments */
  defaultSegments: number;
  /** Default number of layers */
  defaultLayers: number;
  /** Default pattern radius */
  defaultRadius: number;
  /** Default color scheme */
  defaultColorScheme: {
    primary: string;
    secondary: string;
    background: string;
    accent?: string;
  };
  /** Auto-generate on parameter change */
  autoGenerate: boolean;
  /** Show advanced controls */
  showAdvancedControls: boolean;
}

/**
 * Animation preferences
 */
export interface AnimationPreferences {
  /** Default animation duration */
  defaultDuration: number;
  /** Default animation type */
  defaultType: 'rotate' | 'pulse' | 'wave' | 'morph';
  /** Default easing function */
  defaultEasing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  /** Auto-play animations */
  autoPlay: boolean;
  /** Loop animations by default */
  defaultLoop: boolean;
}

/**
 * Accessibility preferences
 */
export interface AccessibilityPreferences {
  /** Screen reader optimized */
  screenReaderOptimized: boolean;
  /** Keyboard navigation enhanced */
  enhancedKeyboardNav: boolean;
  /** Focus indicator style */
  focusIndicatorStyle: 'outline' | 'border' | 'glow';
  /** Audio feedback enabled */
  audioFeedback: boolean;
  /** Animation speed factor */
  animationSpeedFactor: number;
}

/**
 * Storage configuration for preferences
 */
export interface StorageConfig {
  /** Storage type */
  type: 'local' | 'session' | 'remote';
  /** Encryption enabled */
  encrypted: boolean;
  /** Sync enabled */
  sync: boolean;
  /** Cache duration in milliseconds */
  cacheDuration?: number;
}