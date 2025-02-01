import { 
  UserPreferences, 
  StorageConfig,
  DisplayPreferences,
  PatternPreferences,
  AnimationPreferences,
  AccessibilityPreferences 
} from '../types/preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  display: {
    darkMode: false,
    highContrast: false,
    uiScale: 1,
    colorScheme: 'system',
    reducedMotion: false
  },
  pattern: {
    defaultSegments: 6,
    defaultLayers: 3,
    defaultRadius: 100,
    defaultColorScheme: {
      primary: '#1a73e8',
      secondary: '#ea4335',
      background: '#ffffff',
      accent: '#fbbc04'
    },
    autoGenerate: true,
    showAdvancedControls: false
  },
  animation: {
    defaultDuration: 1000,
    defaultType: 'rotate',
    defaultEasing: 'ease-in-out',
    autoPlay: true,
    defaultLoop: true
  },
  accessibility: {
    screenReaderOptimized: false,
    enhancedKeyboardNav: true,
    focusIndicatorStyle: 'outline',
    audioFeedback: false,
    animationSpeedFactor: 1
  }
};

export class PreferencesManager {
  private preferences: UserPreferences;
  private storageConfig: StorageConfig;
  private observers: Map<string, Set<(prefs: any) => void>>;

  constructor(storageConfig: StorageConfig) {
    this.storageConfig = storageConfig;
    this.observers = new Map();
    this.preferences = this.loadPreferences();
  }

  /**
   * Load preferences from storage
   */
  private loadPreferences(): UserPreferences {
    try {
      const stored = this.getFromStorage();
      return stored ? this.mergeWithDefaults(stored) : { ...DEFAULT_PREFERENCES };
    } catch (error) {
      console.error('Error loading preferences:', error);
      return { ...DEFAULT_PREFERENCES };
    }
  }

  /**
   * Get preferences from storage based on configuration
   */
  private getFromStorage(): Partial<UserPreferences> | null {
    const key = 'sacred-geometry-preferences';
    
    switch (this.storageConfig.type) {
      case 'local':
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      
      case 'session':
        const sessionStored = sessionStorage.getItem(key);
        return sessionStored ? JSON.parse(sessionStored) : null;
      
      case 'remote':
        // Implement remote storage fetching
        return null;
      
      default:
        return null;
    }
  }

  /**
   * Merge stored preferences with defaults
   */
  private mergeWithDefaults(stored: Partial<UserPreferences>): UserPreferences {
    return {
      display: { ...DEFAULT_PREFERENCES.display, ...stored.display },
      pattern: { ...DEFAULT_PREFERENCES.pattern, ...stored.pattern },
      animation: { ...DEFAULT_PREFERENCES.animation, ...stored.animation },
      accessibility: { ...DEFAULT_PREFERENCES.accessibility, ...stored.accessibility }
    };
  }

  /**
   * Save preferences to storage
   */
  private async savePreferences(): Promise<void> {
    const key = 'sacred-geometry-preferences';
    const value = JSON.stringify(this.preferences);

    try {
      switch (this.storageConfig.type) {
        case 'local':
          localStorage.setItem(key, value);
          break;
        
        case 'session':
          sessionStorage.setItem(key, value);
          break;
        
        case 'remote':
          // Implement remote storage saving
          break;
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Update display preferences
   */
  public updateDisplayPreferences(updates: Partial<DisplayPreferences>): void {
    this.preferences.display = { ...this.preferences.display, ...updates };
    this.savePreferences();
    this.notifyObservers('display', this.preferences.display);
  }

  /**
   * Update pattern preferences
   */
  public updatePatternPreferences(updates: Partial<PatternPreferences>): void {
    this.preferences.pattern = { ...this.preferences.pattern, ...updates };
    this.savePreferences();
    this.notifyObservers('pattern', this.preferences.pattern);
  }

  /**
   * Update animation preferences
   */
  public updateAnimationPreferences(updates: Partial<AnimationPreferences>): void {
    this.preferences.animation = { ...this.preferences.animation, ...updates };
    this.savePreferences();
    this.notifyObservers('animation', this.preferences.animation);
  }

  /**
   * Update accessibility preferences
   */
  public updateAccessibilityPreferences(updates: Partial<AccessibilityPreferences>): void {
    this.preferences.accessibility = { ...this.preferences.accessibility, ...updates };
    this.savePreferences();
    this.notifyObservers('accessibility', this.preferences.accessibility);
  }

  /**
   * Get current preferences
   */
  public getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  /**
   * Reset preferences to defaults
   */
  public resetPreferences(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.savePreferences();
    this.notifyAllObservers();
  }

  /**
   * Subscribe to preference changes
   */
  public subscribe(category: keyof UserPreferences, callback: (prefs: any) => void): () => void {
    if (!this.observers.has(category)) {
      this.observers.set(category, new Set());
    }
    
    this.observers.get(category).add(callback);
    
    return () => {
      this.observers.get(category)?.delete(callback);
    };
  }

  /**
   * Notify observers of changes
   */
  private notifyObservers(category: keyof UserPreferences, value: any): void {
    this.observers.get(category)?.forEach(callback => callback(value));
  }

  /**
   * Notify all observers of changes
   */
  private notifyAllObservers(): void {
    for (const [category, observers] of this.observers.entries()) {
      observers.forEach(callback => callback(this.preferences[category]));
    }
  }
}

// Export singleton instance
export const preferences = new PreferencesManager({
  type: 'local',
  encrypted: false,
  sync: true
});