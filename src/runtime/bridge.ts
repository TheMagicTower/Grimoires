/**
 * Hooks Runtime Bridge
 *
 * Connects Claude Code events to Grimoires hook handlers.
 * Loads configuration, matches events, and executes handlers.
 *
 * @version 0.3.1
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn, execSync } from 'child_process';
import { match } from './matcher';
import { buildContext, exportToEnv, ToolContext, BuildContextOptions } from './context';
import { safeSubstitute } from '../utils/shell-escape';
import { createLogger, Logger } from '../utils/logger';

/**
 * Hook action types
 */
export const HookAction = {
  ALLOW: 'allow',
  BLOCK: 'block',
  CONFIRM: 'confirm',
  WARN: 'warn'
} as const;

export type HookActionValue = typeof HookAction[keyof typeof HookAction];

/**
 * Hook event types
 */
export const HookEvent = {
  PRE_TOOL_USE: 'PreToolUse',
  POST_TOOL_USE: 'PostToolUse',
  SESSION_START: 'SessionStart',
  SESSION_END: 'SessionEnd',
  PRE_COMPACT: 'PreCompact',
  STOP: 'Stop'
} as const;

export type HookEventType = typeof HookEvent[keyof typeof HookEvent];

/**
 * Default paths for configuration
 */
export const DEFAULT_PATHS = {
  config: path.join(process.env.HOME || '', '.grimoires', 'core', 'hooks', 'hooks.json'),
  handlers: path.join(process.env.HOME || '', '.grimoires', 'core', 'hooks', 'handlers'),
  logs: path.join(process.env.HOME || '', '.grimoires', 'logs')
};

export interface HookDefinition {
  id: string;
  matcher?: string;
  condition?: string;
  action?: HookActionValue;
  message?: string;
  handler?: string;
  command?: string;
  on_failure?: HookActionValue;
  silent?: boolean;
}

export interface HooksSettings {
  enabled: boolean;
  timeout_ms?: number;
  parallel_hooks?: boolean;
  fail_on_error?: boolean;
}

export interface HooksConfig {
  settings: HooksSettings;
  hooks: {
    [K in HookEventType]?: HookDefinition[];
  };
}

export interface HookResult {
  id: string;
  matched: boolean;
  executed: boolean;
  action: HookActionValue;
  message: string | null;
  error: string | null;
  output?: unknown;
}

export interface ExecutionResult {
  event: HookEventType | string;
  timestamp: string;
  blocked: boolean;
  confirm: boolean;
  warnings: Array<{ type: string; id: string; message: string | undefined }>;
  messages: Array<{ type: string; id?: string; message: string | undefined }>;
  executed: HookResult[];
}

interface HandlerInfo {
  path: string;
  module: unknown;
  type: string;
}

interface HandlerResult {
  action: HookActionValue;
  message?: string;
  output?: unknown;
}

interface CommandResult {
  success: boolean;
  message: string | null;
  output: string | null;
}

export interface HooksBridgeOptions {
  configPath?: string;
  handlersPath?: string;
  silent?: boolean;
}

// Initialize logger
let logger: Logger;
try {
  logger = createLogger('Bridge');
} catch {
  // Fallback if logger not found
  logger = {
    debug: (msg: string) => console.error(`[Grimoires:DEBUG] ${msg}`),
    info: (msg: string) => console.error(`[Grimoires:INFO] ${msg}`),
    warn: (msg: string) => console.error(`[Grimoires:WARN] ${msg}`),
    error: (msg: string) => console.error(`[Grimoires:ERROR] ${msg}`)
  };
}

/**
 * Sanitize path for safe logging (removes home directory)
 * @param filePath - Path to sanitize
 * @returns Sanitized path
 */
function sanitizePath(filePath: string | undefined): string {
  if (!filePath) return '<unknown>';
  const home = process.env.HOME || '';
  if (home && filePath.startsWith(home)) {
    return filePath.replace(home, '~');
  }
  return path.basename(filePath);
}

/**
 * HooksBridge - Main class for hook execution
 */
export class HooksBridge {
  private configPath: string;
  private handlersPath: string;
  private silent: boolean;
  private config: HooksConfig | null;
  private handlers: Map<string, HandlerInfo>;

  /**
   * @param options - Bridge configuration
   */
  constructor(options: HooksBridgeOptions = {}) {
    this.configPath = options.configPath || process.env.GRIMOIRES_HOOKS_CONFIG || DEFAULT_PATHS.config;
    this.handlersPath = options.handlersPath || path.dirname(this.configPath);
    this.silent = options.silent || false;
    this.config = null;
    this.handlers = new Map();

    this.loadConfig();
  }

  /**
   * Load hooks configuration
   */
  private loadConfig(): void {
    try {
      if (!fs.existsSync(this.configPath)) {
        this.log('warn', `Config not found: ${sanitizePath(this.configPath)}`);
        this.config = { hooks: {}, settings: { enabled: false } };
        return;
      }

      const content = fs.readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(content) as HooksConfig;

      if (!this.config.settings?.enabled) {
        this.log('info', 'Hooks are disabled in configuration');
      }

      this.loadHandlers();
    } catch (error) {
      this.log('error', `Failed to load config: ${(error as Error).message}`);
      this.config = { hooks: {}, settings: { enabled: false } };
    }
  }

  /**
   * Load handler modules
   */
  private loadHandlers(): void {
    if (!this.config?.hooks) return;

    for (const [, hooks] of Object.entries(this.config.hooks)) {
      for (const hook of hooks as HookDefinition[]) {
        if (hook.handler) {
          const handlerPath = path.resolve(this.handlersPath, hook.handler);
          if (fs.existsSync(handlerPath)) {
            try {
              this.handlers.set(hook.id, {
                path: handlerPath,
                module: null, // Lazy load
                type: 'file'
              });
            } catch (error) {
              this.log('error', `Failed to register handler ${hook.id}: ${(error as Error).message}`);
            }
          } else {
            this.log('warn', `Handler not found: ${sanitizePath(handlerPath)}`);
          }
        }
      }
    }

    this.log('info', `Loaded ${this.handlers.size} handlers`);
  }

  /**
   * Execute hooks for an event
   * @param event - Event type (PreToolUse, PostToolUse, etc.)
   * @param context - Tool context
   * @returns Execution result
   */
  async executeHooks(event: HookEventType | string, context: ToolContext): Promise<ExecutionResult> {
    const result: ExecutionResult = {
      event,
      timestamp: new Date().toISOString(),
      blocked: false,
      confirm: false,
      warnings: [],
      messages: [],
      executed: []
    };

    if (!this.config?.settings?.enabled) {
      result.messages.push({ type: 'info', message: 'Hooks disabled' });
      return result;
    }

    const hooks = (this.config.hooks as Record<string, HookDefinition[]>)[event] || [];
    if (hooks.length === 0) {
      return result;
    }

    const timeout = this.config.settings?.timeout_ms || 30000;
    const parallel = this.config.settings?.parallel_hooks || false;

    if (parallel) {
      await this.executeParallel(hooks, context, result, timeout);
    } else {
      await this.executeSequential(hooks, context, result, timeout);
    }

    return result;
  }

  /**
   * Execute hooks sequentially
   */
  private async executeSequential(
    hooks: HookDefinition[],
    context: ToolContext,
    result: ExecutionResult,
    timeout: number
  ): Promise<void> {
    for (const hook of hooks) {
      if (result.blocked) break; // Stop on block

      const hookResult = await this.executeHook(hook, context, timeout);
      result.executed.push(hookResult);

      this.processHookResult(hook, hookResult, result);
    }
  }

  /**
   * Execute hooks in parallel
   */
  private async executeParallel(
    hooks: HookDefinition[],
    context: ToolContext,
    result: ExecutionResult,
    timeout: number
  ): Promise<void> {
    const promises = hooks.map(hook => this.executeHook(hook, context, timeout));
    const hookResults = await Promise.all(promises);

    for (let i = 0; i < hooks.length; i++) {
      result.executed.push(hookResults[i]);
      this.processHookResult(hooks[i], hookResults[i], result);
    }
  }

  /**
   * Execute a single hook
   * @param hook - Hook definition
   * @param context - Tool context
   * @param timeout - Timeout in ms
   * @returns Hook result
   */
  private async executeHook(hook: HookDefinition, context: ToolContext, timeout: number): Promise<HookResult> {
    const hookResult: HookResult = {
      id: hook.id,
      matched: false,
      executed: false,
      action: HookAction.ALLOW,
      message: null,
      error: null
    };

    try {
      // Check matcher
      if (hook.matcher) {
        hookResult.matched = match(hook.matcher, context as unknown as Record<string, unknown>);
        if (!hookResult.matched) {
          return hookResult;
        }
      } else {
        hookResult.matched = true;
      }

      // Check condition if present
      if (hook.condition) {
        const conditionMet = this.evaluateCondition(hook.condition);
        if (!conditionMet) {
          hookResult.matched = false;
          return hookResult;
        }
      }

      // Execute based on hook type
      if (hook.handler) {
        // File-based handler
        const handlerResult = await this.executeHandler(hook, context, timeout);
        hookResult.executed = true;
        hookResult.action = handlerResult.action || HookAction.ALLOW;
        hookResult.message = handlerResult.message || null;
        hookResult.output = handlerResult.output;
      } else if (hook.command) {
        // Command-based hook
        const cmdResult = await this.executeCommand(hook, context, timeout);
        hookResult.executed = true;
        hookResult.action = cmdResult.success ? HookAction.ALLOW : (hook.on_failure || HookAction.WARN);
        hookResult.message = cmdResult.message;
        hookResult.output = cmdResult.output;
      } else if (hook.action) {
        // Simple action hook
        hookResult.executed = true;
        hookResult.action = hook.action;
        hookResult.message = hook.message || null;
      }

    } catch (error) {
      hookResult.error = (error as Error).message;
      hookResult.action = this.config?.settings?.fail_on_error ? HookAction.BLOCK : HookAction.WARN;
      hookResult.message = `Hook error: ${(error as Error).message}`;
    }

    return hookResult;
  }

  /**
   * Execute a file-based handler
   */
  private async executeHandler(hook: HookDefinition, context: ToolContext, timeout: number): Promise<HandlerResult> {
    const handler = this.handlers.get(hook.id);
    if (!handler) {
      return { action: HookAction.WARN, message: `Handler not found: ${hook.id}` };
    }

    return new Promise((resolve) => {
      // Export context to environment
      exportToEnv(context);

      const child = spawn('node', [handler.path], {
        env: {
          ...process.env,
          GRIMOIRES_CONTEXT: JSON.stringify(context)
        },
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        resolve({
          action: HookAction.WARN,
          message: 'Handler timed out',
          output: stdout
        });
      }, timeout);

      child.on('close', (code: number | null) => {
        clearTimeout(timeoutId);

        try {
          // Try to parse JSON output
          const output = JSON.parse(stdout) as { result?: { action?: HookActionValue; messages?: Array<{ message?: string }> }; message?: string };
          resolve({
            action: code === 0 ? (output.result?.action || HookAction.ALLOW) : HookAction.WARN,
            message: output.result?.messages?.[0]?.message || output.message,
            output: output
          });
        } catch {
          resolve({
            action: code === 0 ? HookAction.ALLOW : HookAction.WARN,
            message: stderr || stdout,
            output: stdout
          });
        }
      });

      child.on('error', (error: Error) => {
        clearTimeout(timeoutId);
        resolve({
          action: HookAction.WARN,
          message: `Handler error: ${error.message}`,
          output: undefined
        });
      });
    });
  }

  /**
   * Execute a command-based hook
   */
  private async executeCommand(hook: HookDefinition, context: ToolContext, timeout: number): Promise<CommandResult> {
    return new Promise((resolve) => {
      try {
        // Safely substitute placeholders in command
        const values = {
          path: context.path || '',
          tool: context.tool || '',
          command: context.command || ''
        };

        const { command, safe, errors } = safeSubstitute(hook.command!, values);

        if (!safe || errors.length > 0) {
          resolve({
            success: false,
            message: `Unsafe command template: ${errors.join(', ')}`,
            output: null
          });
          return;
        }

        const output = execSync(command!, {
          encoding: 'utf-8',
          timeout,
          stdio: hook.silent ? ['pipe', 'pipe', 'pipe'] : undefined
        });

        resolve({
          success: true,
          message: hook.silent ? null : `Executed: ${hook.id}`,
          output: output.trim()
        });
      } catch (error) {
        const execError = error as { message: string; stdout?: string; stderr?: string };
        resolve({
          success: false,
          message: execError.message,
          output: execError.stdout || execError.stderr || null
        });
      }
    });
  }

  /**
   * Evaluate a condition expression
   */
  private evaluateCondition(condition: string): boolean {
    type CheckFunction = (arg: string) => boolean;

    // Simple condition evaluator
    const checks: Record<string, CheckFunction> = {
      file_exists: (arg: string) => fs.existsSync(arg),
      has_dependency: (arg: string) => this.hasDependency(arg),
      env_set: (arg: string) => !!process.env[arg]
    };

    // Parse condition: func(arg) && func(arg)
    const parts = condition.split('&&').map(p => p.trim());

    for (const part of parts) {
      const matchResult = part.match(/(\w+)\(['"]([^'"]+)['"]\)/);
      if (matchResult) {
        const [, func, arg] = matchResult;
        if (checks[func] && !checks[func](arg)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if a dependency exists in package.json
   */
  private hasDependency(name: string): boolean {
    try {
      const pkgPath = path.join(process.cwd(), 'package.json');
      if (!fs.existsSync(pkgPath)) return false;

      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      return !!(pkg.dependencies?.[name] || pkg.devDependencies?.[name]);
    } catch {
      return false;
    }
  }

  /**
   * Process hook result and update aggregate result
   */
  private processHookResult(hook: HookDefinition, hookResult: HookResult, result: ExecutionResult): void {
    if (!hookResult.matched) return;

    switch (hookResult.action) {
      case HookAction.BLOCK:
        result.blocked = true;
        result.messages.push({
          type: 'block',
          id: hook.id,
          message: hookResult.message || hook.message
        });
        break;

      case HookAction.CONFIRM:
        result.confirm = true;
        result.messages.push({
          type: 'confirm',
          id: hook.id,
          message: hookResult.message || hook.message
        });
        break;

      case HookAction.WARN:
        result.warnings.push({
          type: 'warn',
          id: hook.id,
          message: hookResult.message || hook.message
        });
        break;

      case HookAction.ALLOW:
      default:
        // No action needed
        break;
    }
  }

  /**
   * Log message using logger utility
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    if (this.silent && level !== 'error') return;

    if (logger && logger[level]) {
      logger[level](message);
    } else {
      const prefix: Record<string, string> = {
        debug: 'DEBUG',
        info: 'INFO',
        warn: 'WARN',
        error: 'ERROR'
      };
      console.error(`[Grimoires:${prefix[level] || 'LOG'}] ${message}`);
    }
  }
}

/**
 * Quick execution function for CLI usage
 */
export async function executeEvent(
  event: HookEventType | string,
  contextOrOptions: Partial<ToolContext> | BuildContextOptions = {}
): Promise<ExecutionResult> {
  const bridge = new HooksBridge({ silent: true });

  const context = (contextOrOptions as ToolContext).tool
    ? contextOrOptions as ToolContext
    : await buildContext(contextOrOptions as BuildContextOptions);

  return bridge.executeHooks(event, context);
}
