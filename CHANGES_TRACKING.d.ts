/**
 * @fileoverview Type definitions tracking system changes and updates
 */

declare namespace ChangeTracking {
  /**
   * Represents development progress metrics
   */
  interface DevelopmentMetrics {
    /** Current progress percentage */
    progressPercentage: number;
    /** Number of completed tasks */
    completedTasks: number;
    /** Number of pending tasks */
    pendingTasks: number;
    /** Recent changes count */
    recentChanges: number;
    /** Documentation coverage */
    documentationCoverage: number;
  }

  /**
   * Development tracking configuration
   */
  interface DevelopmentConfig {
    /** Enable metrics tracking */
    enableMetrics: boolean;
    /** Documentation requirements */
    documentationRequirements: string[];
    /** Change tracking settings */
    changeTracking: TrackingConfig;
  }

  /**
   * Represents the summary of steps and progress
   */
  interface StepsSummary {
    /** Timestamp of the summary */
    timestamp: string;
    /** List of completed items */
    completed: string[];
    /** Upcoming tasks */
    nextSteps: string[];
    /** Current blockers */
    blockers?: string[];
    /** Overall progress percentage */
    progressPercentage: number;
  }

  /**
   * Configuration for step tracking
   */
  interface StepsConfig {
    /** Enable automatic progress calculation */
    autoCalculateProgress: boolean;
    /** Required steps for completion */
    requiredSteps: string[];
    /** Optional steps */
    optionalSteps?: string[];
  }

  /**
   * Represents an iteration in the development process
   */
  interface IterationEntry {
    /** Unique identifier for the iteration */
    iterationId: string;
    /** Timestamp when iteration started */
    startTime: string;
    /** Timestamp when iteration completed */
    endTime?: string;
    /** List of tasks completed in this iteration */
    completedTasks: string[];
    /** Next steps identified during this iteration */
    nextSteps: string[];
    /** Any blocking issues identified */
    blockers?: string[];
  }

  /**
   * Represents a single change entry in the system
   */
  interface ChangeEntry {
    /** Timestamp of the change */
    timestamp: string;
    /** Description of what was changed */
    description: string;
    /** Files affected by the change */
    affectedFiles: string[];
    /** Type of change made */
    changeType: 'feature' | 'bugfix' | 'documentation' | 'refactor';
  }

  /**
   * Configuration for change tracking
   */
  interface TrackingConfig {
    /** Enable detailed logging */
    enableDetailedLogging: boolean;
    /** Patterns to ignore in change tracking */
    ignorePatterns: string[];
    /** Required reviewers for changes */
    requiredReviewers: string[];
  }

  /**
   * System for managing change history
   */
  interface IterationTracker {
    /** Start a new iteration */
    startIteration(): IterationEntry;
    /** Complete current iteration */
    completeIteration(iterationId: string, summary: string): void;
    /** Add completed task to iteration */
    addCompletedTask(iterationId: string, task: string): void;
    /** Add next step to iteration */
    addNextStep(iterationId: string, step: string): void;
    /** Get all iterations */
    getIterations(): IterationEntry[];
  }

  interface StepsTracker {
    /** Add new step */
    addStep(step: string): void;
    /** Mark step as completed */
    completeStep(step: string): void;
    /** Get current summary */
    getCurrentSummary(): StepsSummary;
    /** Export progress report */
    exportProgressReport(): string;
  }

  interface ChangeTracker {
    /** Add a new change entry */
    addChange(change: ChangeEntry): void;
    /** Get history of changes */
    getChangeHistory(): ChangeEntry[];
    /** Get changes by type */
    getChangesByType(type: ChangeEntry['changeType']): ChangeEntry[];
  }
}

export = ChangeTracking;