import { ErrorMetadata } from '../ErrorTypes';

export interface ErrorLogConfig {
  enabled: boolean;
  logToConsole: boolean;
  logToFile: boolean;
  logPath?: string;
}

export class ErrorLogger {
  private config: ErrorLogConfig;

  constructor(config: ErrorLogConfig) {
    this.config = config;
  }

  public async log(metadata: ErrorMetadata): Promise<void> {
    const logEntry = this.formatLogEntry(metadata);
    
    if (this.config.logToConsole) {
      console.error(logEntry);
    }

    if (this.config.logToFile && this.config.logPath) {
      await this.writeToFile(logEntry);
    }
  }

  private formatLogEntry(metadata: ErrorMetadata): string {
    return JSON.stringify({
      timestamp: new Date(metadata.timestamp).toISOString(),
      type: metadata.type,
      message: metadata.message,
      stackTrace: metadata.stackTrace,
      context: metadata.context
    }, null, 2);
  }

  private async writeToFile(logEntry: string): Promise<void> {
    // In a browser environment, we might want to use the File System API
    // or send to a logging endpoint instead
    try {
      // Implementation would depend on environment (Node.js vs Browser)
      // For browser, might want to use IndexedDB or send to server
      if (typeof window === 'undefined') {
        const fs = await import('fs/promises');
        await fs.appendFile(this.config.logPath!, logEntry + '\n');
      }
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
}