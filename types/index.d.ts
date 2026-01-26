/**
 * Grimoires Type Definitions
 *
 * TypeScript declarations for Grimoires core modules.
 *
 * @version 0.3.0
 */

// ============ Hook Types ============

export type HookAction = 'allow' | 'block' | 'confirm' | 'warn';

export type HookEventType =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'SessionStart'
  | 'SessionEnd'
  | 'PreCompact'
  | 'Stop';

export interface HookDefinition {
  id: string;
  matcher?: string;
  condition?: string;
  action?: HookAction;
  message?: string;
  handler?: string;
  command?: string;
  on_failure?: HookAction;
  silent?: boolean;
}

export interface HooksConfig {
  settings: {
    enabled: boolean;
    timeout_ms?: number;
    parallel_hooks?: boolean;
    fail_on_error?: boolean;
  };
  hooks: {
    [K in HookEventType]?: HookDefinition[];
  };
}

export interface HookResult {
  id: string;
  matched: boolean;
  executed: boolean;
  action: HookAction;
  message: string | null;
  error: string | null;
  output?: unknown;
}

export interface ExecutionResult {
  event: HookEventType;
  timestamp: string;
  blocked: boolean;
  confirm: boolean;
  warnings: Array<{ type: string; id: string; message: string }>;
  messages: Array<{ type: string; id: string; message: string }>;
  executed: HookResult[];
}

// ============ Context Types ============

export type ContextSource = 'stdin' | 'env' | 'args' | 'test';

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

// ============ Matcher Types ============

export type MatcherOperator =
  | '=='
  | '!='
  | 'matches'
  | '!matches'
  | 'startsWith'
  | 'endsWith'
  | 'contains'
  | 'in';

export interface MatcherValidationResult {
  valid: boolean;
  error?: string;
}

// ============ Project Detection Types ============

export type ProjectType = 'frontend' | 'backend' | 'fullstack' | 'unknown';

export interface ProjectInfo {
  name: string;
  type: ProjectType;
  framework: string | null;
  language: string | null;
  packageManager: string | null;
  testFramework: string | null;
  linter: string | null;
  formatter: string | null;
  hasDocker: boolean;
  hasCI: string | null;
  description: string;
  version: string;
}

// ============ Shell Escape Types ============

export interface SafeSubstituteResult {
  command: string | null;
  safe: boolean;
  errors: string[];
}

export interface CommandSafetyResult {
  safe: boolean;
  warnings: string[];
}

export interface TemplateValidationResult {
  valid: boolean;
  errors: string[];
}

// ============ Environment Validation Types ============

export interface EnvVariable {
  name: string;
  required?: boolean;
  pattern?: string;
  default?: string;
  description: string;
  services?: string[];
  docs?: string;
  category: string;
}

export interface EnvGroup {
  description: string;
  variables: string[];
}

export interface EnvSchema {
  version: string;
  variables: EnvVariable[];
  groups: Record<string, EnvGroup>;
  categories: Record<string, { name: string; description: string }>;
}

export interface EnvValidationResult {
  valid: boolean;
  missing: Array<{
    name: string;
    description: string;
    default?: string;
    docs?: string;
  }>;
  invalid: Array<{
    name: string;
    pattern: string;
    hint: string;
  }>;
  warnings: Array<{
    name: string;
    description: string;
    services?: string[];
    docs?: string;
  }>;
  suggestions: Array<{
    variable: string;
    action: string;
    command: string;
    docs?: string;
  }>;
  configured: Array<{
    name: string;
    masked: string;
    services?: string[];
  }>;
}

// ============ MCP Validation Types ============

export interface McpServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  description?: string;
}

export interface McpConfig {
  mcpServers: Record<string, McpServerConfig>;
  [key: string]: unknown;
}

export interface McpValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  servers: string[];
  file?: string;
}

// ============ Logger Types ============

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

export interface LoggerConfig {
  prefix?: string;
  jsonOutput?: boolean;
  minLevel?: LogLevel;
  silent?: boolean;
}

// ============ Module Exports ============

declare module 'grimoires/core/runtime/bridge' {
  export class HooksBridge {
    constructor(options?: {
      configPath?: string;
      handlersPath?: string;
      silent?: boolean;
    });
    executeHooks(event: HookEventType, context: ToolContext): Promise<ExecutionResult>;
  }

  export function executeEvent(
    event: HookEventType,
    contextOrOptions?: Partial<ToolContext> | BuildContextOptions
  ): Promise<ExecutionResult>;

  export const HookAction: Record<string, HookAction>;
  export const HookEvent: Record<string, HookEventType>;
  export const DEFAULT_PATHS: {
    config: string;
    handlers: string;
    logs: string;
  };
}

declare module 'grimoires/core/runtime/context' {
  export function buildContext(options?: BuildContextOptions): Promise<ToolContext>;
  export function readStdinContext(options?: { timeout?: number }): Promise<ToolContext | null>;
  export function readEnvContext(): Partial<ToolContext>;
  export function parseArgsContext(args: string[]): Partial<ToolContext>;
  export function normalizeContext(context: ToolContext): void;
  export function createTestContext(overrides?: Partial<ToolContext>): ToolContext;
  export function serializeContext(context: ToolContext): string;
  export function exportToEnv(context: ToolContext): void;
  export const CONTEXT_SOURCES: Record<string, ContextSource>;
}

declare module 'grimoires/core/runtime/matcher' {
  export function match(expression: string, context: Record<string, unknown>): boolean;
  export function validate(expression: string): MatcherValidationResult;
  export class Tokenizer {
    constructor(input: string);
    tokenize(): Array<{ type: string; value: string | null }>;
  }
  export class Parser {
    constructor(tokens: Array<{ type: string; value: string | null }>);
    parse(): unknown;
  }
  export class Evaluator {
    constructor(context: Record<string, unknown>);
    evaluate(ast: unknown): boolean;
  }
}

declare module 'grimoires/core/utils/shell-escape' {
  export function escapeShellArg(str: string | null | undefined): string;
  export function escapeShellArgs(...args: string[]): string;
  export function validateCommandTemplate(template: string): TemplateValidationResult;
  export function safeSubstitute(
    template: string,
    values: Record<string, string>,
    options?: { validateTemplate?: boolean }
  ): SafeSubstituteResult;
  export function checkCommandSafety(command: string): CommandSafetyResult;
  export const SHELL_METACHARACTERS: RegExp;
}

declare module 'grimoires/core/utils/detect-project' {
  export const ProjectType: Record<string, ProjectType>;
  export function detectProjectType(cwd?: string): ProjectType;
  export function detectProjectInfo(cwd?: string): ProjectInfo;
  export function getDirectoryStructure(dir?: string, depth?: number, maxDepth?: number): string;
}

declare module 'grimoires/core/utils/env-validator' {
  export function loadSchema(): EnvSchema;
  export function validate(options?: { group?: string; strict?: boolean }): EnvValidationResult;
  export function printReport(results: EnvValidationResult, options?: { color?: boolean }): void;
  export function getJsonReport(results: EnvValidationResult): string;
  export function maskValue(value: string): string;
}

declare module 'grimoires/core/utils/mcp-validator' {
  export function validateServer(name: string, config: McpServerConfig): McpValidationResult;
  export function validateFile(filePath: string): McpValidationResult;
  export function validateDirectory(dirPath: string): { valid: boolean; files: McpValidationResult[] };
  export function printReport(results: { valid: boolean; files: McpValidationResult[] }): void;
}

declare module 'grimoires/core/utils/logger' {
  export const LogLevel: Record<string, LogLevel>;
  export function configure(options: LoggerConfig): void;
  export function debug(message: string, data?: unknown): void;
  export function info(message: string, data?: unknown): void;
  export function warn(message: string, data?: unknown): void;
  export function error(message: string, data?: unknown): void;
  export function createLogger(component: string): Logger;
  export function outputResult(result: unknown): void;
}
