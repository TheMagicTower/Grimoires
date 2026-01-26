#!/usr/bin/env node
/**
 * Context Management
 *
 * Manages tool context for hook execution.
 * Handles stdin input, environment variables, and context normalization.
 *
 * @version 0.3.0
 */

const fs = require('fs');
const path = require('path');

/**
 * Context sources in order of priority
 */
const CONTEXT_SOURCES = {
  STDIN: 'stdin',
  ENV: 'env',
  ARGS: 'args'
};

/**
 * Build context from various sources
 * @param {Object} options - Options for context building
 * @returns {Promise<Object>} - The built context
 */
async function buildContext(options = {}) {
  const context = {
    timestamp: new Date().toISOString(),
    source: null,
    tool: null,
    command: null,
    path: null,
    content: null,
    exitCode: null,
    success: null,
    cwd: process.cwd(),
    env: {}
  };

  // Try stdin first (for piped input)
  if (options.stdin !== false) {
    const stdinContext = await readStdinContext();
    if (stdinContext) {
      Object.assign(context, stdinContext);
      context.source = CONTEXT_SOURCES.STDIN;
    }
  }

  // Override with environment variables
  const envContext = readEnvContext();
  if (envContext.tool) {
    Object.assign(context, envContext);
    context.source = context.source || CONTEXT_SOURCES.ENV;
  }

  // Override with command line arguments
  if (options.args) {
    const argsContext = parseArgsContext(options.args);
    Object.assign(context, argsContext);
    context.source = context.source || CONTEXT_SOURCES.ARGS;
  }

  // Normalize context
  normalizeContext(context);

  return context;
}

/**
 * Default stdin timeout (configurable via GRIMOIRES_STDIN_TIMEOUT env var)
 */
const DEFAULT_STDIN_TIMEOUT = parseInt(process.env.GRIMOIRES_STDIN_TIMEOUT, 10) || 5000;

/**
 * Read context from stdin (JSON format)
 * @param {Object} options - Options for reading stdin
 * @param {number} options.timeout - Timeout in ms (default: 5000, configurable via GRIMOIRES_STDIN_TIMEOUT)
 * @returns {Promise<Object|null>}
 */
async function readStdinContext(options = {}) {
  const timeoutMs = options.timeout || DEFAULT_STDIN_TIMEOUT;

  return new Promise((resolve) => {
    // Check if stdin is a TTY (interactive terminal)
    if (process.stdin.isTTY) {
      resolve(null);
      return;
    }

    let data = '';
    let resolved = false;

    const safeResolve = (value) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        resolve(value);
      }
    };

    const timeoutId = setTimeout(() => {
      // If we have some data, try to parse it before timing out
      if (data.trim()) {
        try {
          const parsed = JSON.parse(data);
          safeResolve(parsed);
          return;
        } catch {
          // Fall through to null
        }
      }
      safeResolve(null);
    }, timeoutMs);

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        safeResolve(parsed);
      } catch {
        safeResolve(null);
      }
    });

    process.stdin.on('error', () => {
      safeResolve(null);
    });

    // Resume stdin to start receiving data
    process.stdin.resume();
  });
}

/**
 * Read context from environment variables
 * @returns {Object}
 */
function readEnvContext() {
  const prefix = 'GRIMOIRES_';
  const context = {};

  // Map environment variables to context fields
  const mapping = {
    TOOL: 'tool',
    COMMAND: 'command',
    PATH: 'path',
    CONTENT: 'content',
    EXIT_CODE: 'exitCode',
    SUCCESS: 'success',
    SESSION_ID: 'sessionId'
  };

  for (const [envKey, contextKey] of Object.entries(mapping)) {
    const value = process.env[prefix + envKey];
    if (value !== undefined) {
      if (contextKey === 'exitCode') {
        context[contextKey] = parseInt(value, 10);
      } else if (contextKey === 'success') {
        context[contextKey] = value === 'true';
      } else {
        context[contextKey] = value;
      }
    }
  }

  return context;
}

/**
 * Parse context from command line arguments
 * @param {string[]} args - Command line arguments
 * @returns {Object}
 */
function parseArgsContext(args) {
  const context = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];

      if (value && !value.startsWith('--')) {
        // Handle special keys
        if (key === 'exit-code') {
          context.exitCode = parseInt(value, 10);
        } else if (key === 'success') {
          context.success = value === 'true';
        } else if (key === 'params') {
          try {
            context.params = JSON.parse(value);
          } catch {
            context.params = value;
          }
        } else {
          context[key] = value;
        }
        i++; // Skip the value
      }
    } else if (i === 0 && !arg.startsWith('-')) {
      // First positional argument is typically the tool name
      context.tool = arg;
    }
  }

  return context;
}

/**
 * Normalize context values
 * @param {Object} context - Context to normalize
 */
function normalizeContext(context) {
  // Ensure string values are trimmed
  for (const key of ['tool', 'command', 'path']) {
    if (typeof context[key] === 'string') {
      context[key] = context[key].trim();
    }
  }

  // Resolve relative paths
  if (context.path && !path.isAbsolute(context.path)) {
    context.path = path.resolve(context.cwd, context.path);
  }

  // Normalize tool names
  if (context.tool) {
    // Capitalize first letter for consistency
    context.tool = context.tool.charAt(0).toUpperCase() + context.tool.slice(1).toLowerCase();
    // Handle common aliases
    const aliases = {
      'Bash': 'Bash',
      'Shell': 'Bash',
      'Write': 'Write',
      'Edit': 'Edit',
      'Read': 'Read'
    };
    if (aliases[context.tool]) {
      context.tool = aliases[context.tool];
    }
  }
}

/**
 * Create a minimal context for testing
 * @param {Object} overrides - Values to override
 * @returns {Object}
 */
function createTestContext(overrides = {}) {
  return {
    timestamp: new Date().toISOString(),
    source: 'test',
    tool: 'Bash',
    command: 'echo "test"',
    path: null,
    content: null,
    exitCode: 0,
    success: true,
    cwd: process.cwd(),
    ...overrides
  };
}

/**
 * Serialize context for passing to handlers
 * @param {Object} context - Context to serialize
 * @returns {string}
 */
function serializeContext(context) {
  return JSON.stringify(context, null, 2);
}

/**
 * Set environment variables from context
 * @param {Object} context - Context to export
 */
function exportToEnv(context) {
  const prefix = 'GRIMOIRES_';

  const mapping = {
    tool: 'TOOL',
    command: 'COMMAND',
    path: 'PATH',
    content: 'CONTENT',
    exitCode: 'EXIT_CODE',
    success: 'SUCCESS',
    sessionId: 'SESSION_ID'
  };

  for (const [contextKey, envKey] of Object.entries(mapping)) {
    if (context[contextKey] !== undefined && context[contextKey] !== null) {
      process.env[prefix + envKey] = String(context[contextKey]);
    }
  }
}

module.exports = {
  buildContext,
  readStdinContext,
  readEnvContext,
  parseArgsContext,
  normalizeContext,
  createTestContext,
  serializeContext,
  exportToEnv,
  CONTEXT_SOURCES
};
