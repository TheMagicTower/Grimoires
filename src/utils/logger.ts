/**
 * Logger Utility
 *
 * Consistent logging format for all Grimoires components.
 * Supports both human-readable and JSON output formats.
 *
 * @version 0.3.1
 */

/**
 * Log levels
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
} as const;

export type LogLevelValue = typeof LogLevel[keyof typeof LogLevel];

export interface LoggerConfig {
  prefix?: string;
  jsonOutput?: boolean;
  minLevel?: LogLevelValue;
  silent?: boolean;
}

export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

interface LogEntry {
  timestamp: string;
  level: string;
  component: string;
  message: string;
  data?: unknown;
}

/**
 * Logger configuration
 */
const config: Required<LoggerConfig> = {
  prefix: 'Grimoires',
  jsonOutput: false,
  minLevel: LogLevel.INFO,
  silent: false
};

/**
 * Level priority (lower = more verbose)
 */
const levelPriority: Record<LogLevelValue, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3
};

/**
 * Configure the logger
 * @param options - Configuration options
 */
export function configure(options: LoggerConfig = {}): void {
  if (options.prefix !== undefined) config.prefix = options.prefix;
  if (options.jsonOutput !== undefined) config.jsonOutput = options.jsonOutput;
  if (options.minLevel !== undefined) config.minLevel = options.minLevel;
  if (options.silent !== undefined) config.silent = options.silent;
}

/**
 * Check if a level should be logged
 * @param level - Log level
 * @returns Whether the level should be logged
 */
function shouldLog(level: LogLevelValue): boolean {
  if (config.silent) return false;
  return levelPriority[level] >= levelPriority[config.minLevel];
}

/**
 * Format a log message
 * @param level - Log level
 * @param message - Message
 * @param data - Additional data
 * @returns Formatted message string
 */
function formatMessage(level: LogLevelValue, message: string, data: unknown = null): string {
  if (config.jsonOutput) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      component: config.prefix,
      message
    };
    if (data) logEntry.data = data;
    return JSON.stringify(logEntry);
  }

  const prefix = `[${config.prefix}:${level.toUpperCase()}]`;
  if (data) {
    return `${prefix} ${message} ${JSON.stringify(data)}`;
  }
  return `${prefix} ${message}`;
}

/**
 * Log a message
 * @param level - Log level
 * @param message - Message
 * @param data - Additional data
 */
function log(level: LogLevelValue, message: string, data: unknown = null): void {
  if (!shouldLog(level)) return;

  const formatted = formatMessage(level, message, data);

  // Use stderr for all log output to keep stdout clean for data
  console.error(formatted);
}

/**
 * Log debug message
 * @param message - Message
 * @param data - Additional data
 */
export function debug(message: string, data: unknown = null): void {
  log(LogLevel.DEBUG, message, data);
}

/**
 * Log info message
 * @param message - Message
 * @param data - Additional data
 */
export function info(message: string, data: unknown = null): void {
  log(LogLevel.INFO, message, data);
}

/**
 * Log warning message
 * @param message - Message
 * @param data - Additional data
 */
export function warn(message: string, data: unknown = null): void {
  log(LogLevel.WARN, message, data);
}

/**
 * Log error message
 * @param message - Message
 * @param data - Additional data
 */
export function error(message: string, data: unknown = null): void {
  log(LogLevel.ERROR, message, data);
}

/**
 * Create a child logger with a custom prefix
 * @param component - Component name
 * @returns Logger instance
 */
export function createLogger(component: string): Logger {
  const childPrefix = config.prefix ? `${config.prefix}:${component}` : component;

  return {
    debug: (msg: string, data?: unknown) => {
      const oldPrefix = config.prefix;
      config.prefix = childPrefix;
      debug(msg, data);
      config.prefix = oldPrefix;
    },
    info: (msg: string, data?: unknown) => {
      const oldPrefix = config.prefix;
      config.prefix = childPrefix;
      info(msg, data);
      config.prefix = oldPrefix;
    },
    warn: (msg: string, data?: unknown) => {
      const oldPrefix = config.prefix;
      config.prefix = childPrefix;
      warn(msg, data);
      config.prefix = oldPrefix;
    },
    error: (msg: string, data?: unknown) => {
      const oldPrefix = config.prefix;
      config.prefix = childPrefix;
      error(msg, data);
      config.prefix = oldPrefix;
    }
  };
}

/**
 * Output JSON result (for handler output)
 * @param result - Result object
 */
export function outputResult(result: unknown): void {
  console.log(JSON.stringify(result, null, 2));
}
