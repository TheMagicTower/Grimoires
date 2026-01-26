#!/usr/bin/env node
/**
 * Hooks Runtime Bridge
 *
 * Connects Claude Code events to Grimoires hook handlers.
 * Loads configuration, matches events, and executes handlers.
 *
 * @version 0.3.0
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const { match } = require('./matcher');
const { buildContext, exportToEnv } = require('./context');

// Shell escape utility for command injection prevention
const shellEscapePath = path.join(__dirname, '..', 'utils', 'shell-escape');
let shellEscape;
try {
  shellEscape = require(shellEscapePath);
} catch {
  // Fallback if utility not found
  shellEscape = {
    safeSubstitute: (template, values) => {
      let cmd = template;
      for (const [key, value] of Object.entries(values)) {
        // Basic escaping: wrap in single quotes, escape existing quotes
        const escaped = value ? "'" + String(value).replace(/'/g, "'\\''") + "'" : '';
        cmd = cmd.split(`{{${key}}}`).join(escaped);
      }
      return { command: cmd, safe: true, errors: [] };
    }
  };
}

// Logger utility for consistent logging
const loggerPath = path.join(__dirname, '..', 'utils', 'logger');
let logger;
try {
  logger = require(loggerPath).createLogger('Bridge');
} catch {
  // Fallback if logger not found
  logger = {
    info: (msg) => console.error(`[Grimoires:INFO] ${msg}`),
    warn: (msg) => console.error(`[Grimoires:WARN] ${msg}`),
    error: (msg) => console.error(`[Grimoires:ERROR] ${msg}`)
  };
}

/**
 * Default paths for configuration
 */
const DEFAULT_PATHS = {
  config: path.join(process.env.HOME || '', '.grimoires', 'core', 'hooks', 'hooks.json'),
  handlers: path.join(process.env.HOME || '', '.grimoires', 'core', 'hooks', 'handlers'),
  logs: path.join(process.env.HOME || '', '.grimoires', 'logs')
};

/**
 * Hook action types
 */
const HookAction = {
  ALLOW: 'allow',
  BLOCK: 'block',
  CONFIRM: 'confirm',
  WARN: 'warn'
};

/**
 * Hook event types
 */
const HookEvent = {
  PRE_TOOL_USE: 'PreToolUse',
  POST_TOOL_USE: 'PostToolUse',
  SESSION_START: 'SessionStart',
  SESSION_END: 'SessionEnd',
  PRE_COMPACT: 'PreCompact',
  STOP: 'Stop'
};

/**
 * HooksBridge - Main class for hook execution
 */
class HooksBridge {
  /**
   * @param {Object} options - Bridge configuration
   * @param {string} options.configPath - Path to hooks.json
   * @param {string} options.handlersPath - Path to handlers directory
   * @param {boolean} options.silent - Suppress non-error output
   */
  constructor(options = {}) {
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
  loadConfig() {
    try {
      if (!fs.existsSync(this.configPath)) {
        this.log('warn', `Config not found: ${this.configPath}`);
        this.config = { hooks: {}, settings: { enabled: false } };
        return;
      }

      const content = fs.readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(content);

      if (!this.config.settings?.enabled) {
        this.log('info', 'Hooks are disabled in configuration');
      }

      this.loadHandlers();
    } catch (error) {
      this.log('error', `Failed to load config: ${error.message}`);
      this.config = { hooks: {}, settings: { enabled: false } };
    }
  }

  /**
   * Load handler modules
   */
  loadHandlers() {
    if (!this.config.hooks) return;

    for (const [event, hooks] of Object.entries(this.config.hooks)) {
      for (const hook of hooks) {
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
              this.log('error', `Failed to register handler ${hook.id}: ${error.message}`);
            }
          } else {
            this.log('warn', `Handler not found: ${handlerPath}`);
          }
        }
      }
    }

    this.log('info', `Loaded ${this.handlers.size} handlers`);
  }

  /**
   * Execute hooks for an event
   * @param {string} event - Event type (PreToolUse, PostToolUse, etc.)
   * @param {Object} context - Tool context
   * @returns {Promise<Object>} - Execution result
   */
  async executeHooks(event, context) {
    const result = {
      event,
      timestamp: new Date().toISOString(),
      blocked: false,
      confirm: false,
      warnings: [],
      messages: [],
      executed: []
    };

    if (!this.config.settings?.enabled) {
      result.messages.push({ type: 'info', message: 'Hooks disabled' });
      return result;
    }

    const hooks = this.config.hooks[event] || [];
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
  async executeSequential(hooks, context, result, timeout) {
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
  async executeParallel(hooks, context, result, timeout) {
    const promises = hooks.map(hook => this.executeHook(hook, context, timeout));
    const hookResults = await Promise.all(promises);

    for (let i = 0; i < hooks.length; i++) {
      result.executed.push(hookResults[i]);
      this.processHookResult(hooks[i], hookResults[i], result);
    }
  }

  /**
   * Execute a single hook
   * @param {Object} hook - Hook definition
   * @param {Object} context - Tool context
   * @param {number} timeout - Timeout in ms
   * @returns {Promise<Object>}
   */
  async executeHook(hook, context, timeout) {
    const hookResult = {
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
        hookResult.matched = match(hook.matcher, context);
        if (!hookResult.matched) {
          return hookResult;
        }
      } else {
        hookResult.matched = true;
      }

      // Check condition if present
      if (hook.condition) {
        const conditionMet = this.evaluateCondition(hook.condition, context);
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
        hookResult.message = handlerResult.message;
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
        hookResult.message = hook.message;
      }

    } catch (error) {
      hookResult.error = error.message;
      hookResult.action = this.config.settings?.fail_on_error ? HookAction.BLOCK : HookAction.WARN;
      hookResult.message = `Hook error: ${error.message}`;
    }

    return hookResult;
  }

  /**
   * Execute a file-based handler
   */
  async executeHandler(hook, context, timeout) {
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

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
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

      child.on('close', (code) => {
        clearTimeout(timeoutId);

        try {
          // Try to parse JSON output
          const output = JSON.parse(stdout);
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

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        resolve({
          action: HookAction.WARN,
          message: `Handler error: ${error.message}`,
          output: null
        });
      });
    });
  }

  /**
   * Execute a command-based hook
   */
  async executeCommand(hook, context, timeout) {
    return new Promise((resolve) => {
      try {
        // Safely substitute placeholders in command
        const values = {
          path: context.path || '',
          tool: context.tool || '',
          command: context.command || ''
        };

        const { command, safe, errors } = shellEscape.safeSubstitute(hook.command, values);

        if (!safe || errors.length > 0) {
          resolve({
            success: false,
            message: `Unsafe command template: ${errors.join(', ')}`,
            output: null
          });
          return;
        }

        const output = execSync(command, {
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
        resolve({
          success: false,
          message: error.message,
          output: error.stdout || error.stderr
        });
      }
    });
  }

  /**
   * Evaluate a condition expression
   */
  evaluateCondition(condition, context) {
    // Simple condition evaluator
    const checks = {
      file_exists: (arg) => fs.existsSync(arg),
      has_dependency: (arg) => this.hasDependency(arg),
      env_set: (arg) => !!process.env[arg]
    };

    // Parse condition: func(arg) && func(arg)
    const parts = condition.split('&&').map(p => p.trim());

    for (const part of parts) {
      const match = part.match(/(\w+)\(['"]([^'"]+)['"]\)/);
      if (match) {
        const [, func, arg] = match;
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
  hasDependency(name) {
    try {
      const pkgPath = path.join(process.cwd(), 'package.json');
      if (!fs.existsSync(pkgPath)) return false;

      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      return !!(pkg.dependencies?.[name] || pkg.devDependencies?.[name]);
    } catch {
      return false;
    }
  }

  /**
   * Process hook result and update aggregate result
   */
  processHookResult(hook, hookResult, result) {
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
  log(level, message) {
    if (this.silent && level !== 'error') return;

    if (logger && logger[level]) {
      logger[level](message);
    } else {
      const prefix = {
        info: 'INFO',
        warn: 'WARN',
        error: 'ERROR'
      }[level] || 'LOG';
      console.error(`[Grimoires:${prefix}] ${message}`);
    }
  }
}

/**
 * Quick execution function for CLI usage
 */
async function executeEvent(event, contextOrOptions = {}) {
  const bridge = new HooksBridge({ silent: true });

  const context = contextOrOptions.tool
    ? contextOrOptions
    : await buildContext(contextOrOptions);

  return bridge.executeHooks(event, context);
}

module.exports = {
  HooksBridge,
  executeEvent,
  HookAction,
  HookEvent,
  DEFAULT_PATHS
};
