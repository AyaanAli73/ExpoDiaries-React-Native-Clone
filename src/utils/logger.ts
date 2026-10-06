type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const prefix = `[ExpoDiaries][${timestamp}][${level.toUpperCase()}]`;

    if (level === 'error') {
      console.error(`${prefix} ${message}`, context || '');
    } else if (level === 'warn') {
      console.warn(`${prefix} ${message}`, context || '');
    } else {
      console.log(`${prefix} ${message}`, context || '');
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }
}

export const logger = new Logger();
