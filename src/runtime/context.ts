/**
 * Context Management
 *
 * Manages tool context for hook execution.
 * Handles stdin input, environment variables, and context normalization.
 *
 * @version 0.3.1
 */

import * as path from 'path';

/**
 * Context sources in order of priority
 */
export const CONTEXT_SOURCES = {
  STDIN: 'stdin',
  ENV: 'env',
  ARGS: 'args',
  TEST: 'test'
} as const;

export type ContextSource = typeof CONTEXT_SOURCES[keyof typeof CONTEXT_SOURCES];

export interface ToolContext {
  timestamp: string;
  source: ContextSource | null;
  tool: string | null;
  command: string | null;
  path: string | null;
  content: string | null;
  exitCode: number | null;
  success: boolean | null;
  cwd: string;
  sessionId?: string;
  params?: Record<string, unknown>;
  env?: Record<string, string>;
}

export interface BuildContextOptions {
  stdin?: boolean;
  args?: string[];
  timeout?: number;
}

export interface ReadStdinOptions {
  timeout?: number;
}

/**
 * Default stdin timeout (configurable via GRIMOIRES_STDIN_TIMEOUT env var)
 */
const DEFAULT_STDIN_TIMEOUT = parseInt(process.env.GRIMOIRES_STDIN_TIMEOUT || '', 10) || 5000;

/**
 * Build context from various sources
 * @param options - Options for context building
 * @returns The built context
 */
export async function buildContext(options: BuildContextOptions = {}): Promise<ToolContext> {
  const context: ToolContext = {
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
    const stdinContext = await readStdinContext({ timeout: options.timeout });
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
 * Read context from stdin (JSON format)
 * @param options - Options for reading stdin
 * @returns Parsed context or null
 */
export async function readStdinContext(options: ReadStdinOptions = {}): Promise<Partial<ToolContext> | null> {
  const timeoutMs = options.timeout || DEFAULT_STDIN_TIMEOUT;

  return new Promise((resolve) => {
    // Check if stdin is a TTY (interactive terminal)
    if (process.stdin.isTTY) {
      resolve(null);
      return;
    }

    let data = '';
    let resolved = false;

    const safeResolve = (value: Partial<ToolContext> | null): void => {
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
          const parsed = JSON.parse(data) as Partial<ToolContext>;
          safeResolve(parsed);
          return;
        } catch {
          // Fall through to null
        }
      }
      safeResolve(null);
    }, timeoutMs);

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk: string) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      try {
        const parsed = JSON.parse(data) as Partial<ToolContext>;
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
 * @returns Partial context from environment
 */
export function readEnvContext(): Partial<ToolContext> {
  const prefix = 'GRIMOIRES_';
  const context: Partial<ToolContext> = {};

  // Map environment variables to context fields
  const mapping: Record<string, keyof ToolContext> = {
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
        (context as Record<string, unknown>)[contextKey] = parseInt(value, 10);
      } else if (contextKey === 'success') {
        (context as Record<string, unknown>)[contextKey] = value === 'true';
      } else {
        (context as Record<string, unknown>)[contextKey] = value;
      }
    }
  }

  return context;
}

/**
 * Parse context from command line arguments
 * @param args - Command line arguments
 * @returns Partial context from arguments
 */
export function parseArgsContext(args: string[]): Partial<ToolContext> {
  const context: Partial<ToolContext> & { params?: unknown } = {};

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
            context.params = JSON.parse(value) as Record<string, unknown>;
          } catch {
            context.params = { raw: value };
          }
        } else {
          (context as unknown as Record<string, unknown>)[key] = value;
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
 * @param context - Context to normalize (mutated in place)
 */
export function normalizeContext(context: ToolContext): void {
  // Ensure string values are trimmed
  for (const key of ['tool', 'command', 'path'] as const) {
    if (typeof context[key] === 'string') {
      (context as unknown as Record<string, unknown>)[key] = (context[key] as string).trim();
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
    const aliases: Record<string, string> = {
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
 * @param overrides - Values to override
 * @returns Test context
 */
export function createTestContext(overrides: Partial<ToolContext> = {}): ToolContext {
  return {
    timestamp: new Date().toISOString(),
    source: CONTEXT_SOURCES.TEST,
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
 * @param context - Context to serialize
 * @returns JSON string
 */
export function serializeContext(context: ToolContext): string {
  return JSON.stringify(context, null, 2);
}

/**
 * Set environment variables from context
 * @param context - Context to export
 */
export function exportToEnv(context: ToolContext): void {
  const prefix = 'GRIMOIRES_';

  const mapping: Record<keyof ToolContext, string> = {
    tool: 'TOOL',
    command: 'COMMAND',
    path: 'PATH',
    content: 'CONTENT',
    exitCode: 'EXIT_CODE',
    success: 'SUCCESS',
    sessionId: 'SESSION_ID',
    timestamp: 'TIMESTAMP',
    source: 'SOURCE',
    cwd: 'CWD',
    params: 'PARAMS',
    env: 'ENV'
  };

  for (const [contextKey, envKey] of Object.entries(mapping)) {
    const value = context[contextKey as keyof ToolContext];
    if (value !== undefined && value !== null) {
      process.env[prefix + envKey] = String(value);
    }
  }
}
