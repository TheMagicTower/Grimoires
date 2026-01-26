/**
 * Grimoires - Claude Code Integration Toolkit
 *
 * Main entry point for the Grimoires library.
 *
 * @version 0.3.1
 */

// Runtime modules
export {
  HooksBridge,
  executeEvent,
  HookAction,
  HookEvent,
  DEFAULT_PATHS,
  type HookActionValue,
  type HookEventType,
  type HookDefinition,
  type HooksSettings,
  type HooksConfig,
  type HookResult,
  type ExecutionResult,
  type HooksBridgeOptions
} from './runtime/bridge';

export {
  match,
  validate,
  Tokenizer,
  Parser,
  Evaluator,
  TokenType,
  type Token,
  type TokenTypeValue,
  type MatcherOperator,
  type LogicalOperator,
  type ASTNode,
  type ComparisonNode,
  type AndNode,
  type OrNode,
  type NotNode,
  type MatcherValidationResult
} from './runtime/matcher';

export {
  buildContext,
  readStdinContext,
  readEnvContext,
  parseArgsContext,
  normalizeContext,
  createTestContext,
  serializeContext,
  exportToEnv,
  CONTEXT_SOURCES,
  type ContextSource,
  type ToolContext,
  type BuildContextOptions,
  type ReadStdinOptions
} from './runtime/context';

// Utility modules
export {
  escapeShellArg,
  escapeShellArgs,
  validateCommandTemplate,
  safeSubstitute,
  checkCommandSafety,
  SHELL_METACHARACTERS,
  type SafeSubstituteResult,
  type CommandSafetyResult,
  type TemplateValidationResult,
  type SafeSubstituteOptions
} from './utils/shell-escape';

export {
  LogLevel,
  configure,
  debug,
  info,
  warn,
  error,
  createLogger,
  outputResult,
  type LogLevelValue,
  type LoggerConfig,
  type Logger
} from './utils/logger';

export {
  ProjectType,
  detectProjectType,
  detectProjectInfo,
  getDirectoryStructure,
  type ProjectTypeValue,
  type ProjectInfo,
  type PackageJson
} from './utils/detect-project';

export {
  loadSchema,
  validate as validateEnv,
  maskValue,
  printReport as printEnvReport,
  getJsonReport,
  type EnvVariable,
  type EnvGroup,
  type EnvSchema,
  type EnvValidationResult,
  type ValidateOptions,
  type PrintReportOptions
} from './utils/env-validator';

export {
  validateServer,
  validateFile,
  validateDirectory,
  printReport as printMcpReport,
  type McpServerConfig,
  type McpConfig,
  type McpValidationResult,
  type McpDirectoryResult
} from './utils/mcp-validator';
