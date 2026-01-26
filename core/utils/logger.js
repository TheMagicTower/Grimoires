#!/usr/bin/env node
/**
 * Logger Utility
 *
 * Consistent logging format for all Grimoires components.
 * Supports both human-readable and JSON output formats.
 *
 * @version 0.3.0
 */

/**
 * Log levels
 */
const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

/**
 * Logger configuration
 */
const config = {
  prefix: 'Grimoires',
  jsonOutput: false,
  minLevel: LogLevel.INFO,
  silent: false
};

/**
 * Level priority (lower = more verbose)
 */
const levelPriority = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3
};

/**
 * Configure the logger
 * @param {Object} options - Configuration options
 */
function configure(options = {}) {
  if (options.prefix !== undefined) config.prefix = options.prefix;
  if (options.jsonOutput !== undefined) config.jsonOutput = options.jsonOutput;
  if (options.minLevel !== undefined) config.minLevel = options.minLevel;
  if (options.silent !== undefined) config.silent = options.silent;
}

/**
 * Check if a level should be logged
 * @param {string} level - Log level
 * @returns {boolean}
 */
function shouldLog(level) {
  if (config.silent) return false;
  return levelPriority[level] >= levelPriority[config.minLevel];
}

/**
 * Format a log message
 * @param {string} level - Log level
 * @param {string} message - Message
 * @param {Object} data - Additional data
 * @returns {string}
 */
function formatMessage(level, message, data = null) {
  if (config.jsonOutput) {
    const logEntry = {
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
 * @param {string} level - Log level
 * @param {string} message - Message
 * @param {Object} data - Additional data
 */
function log(level, message, data = null) {
  if (!shouldLog(level)) return;

  const formatted = formatMessage(level, message, data);

  if (level === LogLevel.ERROR) {
    console.error(formatted);
  } else {
    console.error(formatted); // Use stderr for all log output to keep stdout clean for data
  }
}

/**
 * Log debug message
 * @param {string} message - Message
 * @param {Object} data - Additional data
 */
function debug(message, data = null) {
  log(LogLevel.DEBUG, message, data);
}

/**
 * Log info message
 * @param {string} message - Message
 * @param {Object} data - Additional data
 */
function info(message, data = null) {
  log(LogLevel.INFO, message, data);
}

/**
 * Log warning message
 * @param {string} message - Message
 * @param {Object} data - Additional data
 */
function warn(message, data = null) {
  log(LogLevel.WARN, message, data);
}

/**
 * Log error message
 * @param {string} message - Message
 * @param {Object} data - Additional data
 */
function error(message, data = null) {
  log(LogLevel.ERROR, message, data);
}

/**
 * Create a child logger with a custom prefix
 * @param {string} component - Component name
 * @returns {Object} Logger instance
 */
function createLogger(component) {
  const childPrefix = config.prefix ? `${config.prefix}:${component}` : component;

  return {
    debug: (msg, data) => {
      const oldPrefix = config.prefix;
      config.prefix = childPrefix;
      debug(msg, data);
      config.prefix = oldPrefix;
    },
    info: (msg, data) => {
      const oldPrefix = config.prefix;
      config.prefix = childPrefix;
      info(msg, data);
      config.prefix = oldPrefix;
    },
    warn: (msg, data) => {
      const oldPrefix = config.prefix;
      config.prefix = childPrefix;
      warn(msg, data);
      config.prefix = oldPrefix;
    },
    error: (msg, data) => {
      const oldPrefix = config.prefix;
      config.prefix = childPrefix;
      error(msg, data);
      config.prefix = oldPrefix;
    }
  };
}

/**
 * Output JSON result (for handler output)
 * @param {Object} result - Result object
 */
function outputResult(result) {
  console.log(JSON.stringify(result, null, 2));
}

module.exports = {
  LogLevel,
  configure,
  debug,
  info,
  warn,
  error,
  createLogger,
  outputResult
};
