#!/usr/bin/env node
/**
 * Pre-Tool-Use Handler
 *
 * Executes before a tool is used.
 * Validates, blocks, or requests confirmation for specific operations.
 *
 * @version 0.3.0
 */

const fs = require('fs');
const path = require('path');

/**
 * Tool use context passed via stdin or environment
 */
const TOOL_CONTEXT = {
  tool: process.env.GRIMOIRES_TOOL || '',
  command: process.env.GRIMOIRES_COMMAND || '',
  path: process.env.GRIMOIRES_PATH || '',
  content: process.env.GRIMOIRES_CONTENT || ''
};

/**
 * Rule definitions for pre-tool-use checks
 */
const RULES = {
  // Block patterns - these operations are not allowed
  block: [
    {
      id: 'block-force-push',
      match: (ctx) => ctx.tool === 'Bash' && /git\s+push\s+.*--force/.test(ctx.command),
      message: 'Force push is blocked. This operation can destroy history.'
    },
    {
      id: 'block-hard-reset',
      match: (ctx) => ctx.tool === 'Bash' && /git\s+reset\s+--hard/.test(ctx.command),
      message: 'Hard reset is blocked. Use with explicit user confirmation.'
    },
    {
      id: 'block-clean-force',
      match: (ctx) => ctx.tool === 'Bash' && /git\s+clean\s+-[fd]/.test(ctx.command),
      message: 'Git clean with force is blocked. This removes untracked files permanently.'
    },
    {
      id: 'block-rm-rf-root',
      match: (ctx) => ctx.tool === 'Bash' && /rm\s+-rf\s+[\/~]/.test(ctx.command),
      message: 'Removing root or home directories is blocked.'
    },
    {
      id: 'block-dev-server-blocking',
      match: (ctx) => ctx.tool === 'Bash' && /npm\s+run\s+dev|yarn\s+dev|pnpm\s+dev|bun\s+dev/.test(ctx.command) && !ctx.command.includes('&'),
      message: 'Dev server should run in background (&) or in tmux to avoid blocking.'
    }
  ],

  // Confirm patterns - require user confirmation
  confirm: [
    {
      id: 'confirm-push',
      match: (ctx) => ctx.tool === 'Bash' && /git\s+push/.test(ctx.command) && !/--force/.test(ctx.command),
      message: 'About to push to remote. Continue?'
    },
    {
      id: 'confirm-delete-branch',
      match: (ctx) => ctx.tool === 'Bash' && /git\s+branch\s+-[dD]/.test(ctx.command),
      message: 'About to delete a git branch. Continue?'
    },
    {
      id: 'confirm-drop-table',
      match: (ctx) => ctx.tool === 'Bash' && /DROP\s+TABLE/i.test(ctx.command),
      message: 'SQL DROP TABLE detected. This is irreversible. Continue?'
    },
    {
      id: 'confirm-env-modify',
      match: (ctx) => (ctx.tool === 'Write' || ctx.tool === 'Edit') && /\.env/.test(ctx.path),
      message: 'Modifying environment file. Ensure no secrets are hardcoded.'
    },
    {
      id: 'confirm-credentials',
      match: (ctx) => (ctx.tool === 'Write' || ctx.tool === 'Edit') && /credentials|secrets?|password/i.test(ctx.path),
      message: 'Modifying credentials-related file. Verify no sensitive data is exposed.'
    }
  ],

  // Warn patterns - show warning but allow
  warn: [
    {
      id: 'warn-todo-in-code',
      match: (ctx) => ctx.tool === 'Write' && /TODO|FIXME|HACK|XXX/.test(ctx.content),
      message: 'Code contains TODO/FIXME comments. Remember to address before committing.'
    },
    {
      id: 'warn-console-log',
      match: (ctx) => ctx.tool === 'Write' && /\.(ts|tsx|js|jsx)$/.test(ctx.path) && /console\.(log|debug|warn)/.test(ctx.content),
      message: 'Console statements detected. Remove before production.'
    },
    {
      id: 'warn-any-type',
      match: (ctx) => ctx.tool === 'Write' && /\.tsx?$/.test(ctx.path) && /:\s*any\b/.test(ctx.content),
      message: 'TypeScript "any" type detected. Consider using proper types.'
    },
    {
      id: 'warn-large-file',
      match: (ctx) => ctx.tool === 'Write' && ctx.content && ctx.content.split('\n').length > 300,
      message: 'File exceeds 300 lines. Consider splitting into smaller modules.'
    }
  ]
};

/**
 * Main handler function
 */
async function main() {
  const result = {
    timestamp: new Date().toISOString(),
    tool: TOOL_CONTEXT.tool,
    action: 'allow',
    messages: []
  };

  try {
    // Check block rules
    for (const rule of RULES.block) {
      if (rule.match(TOOL_CONTEXT)) {
        result.action = 'block';
        result.messages.push({ type: 'block', id: rule.id, message: rule.message });
        console.log(JSON.stringify({ status: 'blocked', result }, null, 2));
        process.exit(1);
      }
    }

    // Check confirm rules
    for (const rule of RULES.confirm) {
      if (rule.match(TOOL_CONTEXT)) {
        result.action = 'confirm';
        result.messages.push({ type: 'confirm', id: rule.id, message: rule.message });
      }
    }

    // Check warn rules
    for (const rule of RULES.warn) {
      if (rule.match(TOOL_CONTEXT)) {
        result.messages.push({ type: 'warn', id: rule.id, message: rule.message });
      }
    }

    // Additional security checks
    const securityCheck = await performSecurityCheck(TOOL_CONTEXT);
    if (securityCheck.issues.length > 0) {
      result.messages.push(...securityCheck.issues);
      if (securityCheck.block) {
        result.action = 'block';
      }
    }

    console.log(JSON.stringify({
      status: result.action === 'allow' ? 'success' : result.action,
      result
    }, null, 2));

    if (result.action === 'block') {
      process.exit(1);
    }

  } catch (error) {
    console.error(JSON.stringify({
      status: 'error',
      error: error.message,
      result
    }, null, 2));
    process.exit(1);
  }
}

/**
 * Perform security checks on content
 */
async function performSecurityCheck(ctx) {
  const issues = [];
  let block = false;

  // Check for hardcoded secrets
  const secretPatterns = [
    { pattern: /['"]sk-[a-zA-Z0-9]{20,}['"]/, name: 'OpenAI API Key' },
    { pattern: /['"][a-zA-Z0-9]{32,}['"].*(?:key|token|secret)/i, name: 'Possible API Key' },
    { pattern: /(?:password|passwd|pwd)\s*[=:]\s*['"][^'"]+['"]/i, name: 'Hardcoded Password' },
    { pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/, name: 'Private Key' },
    { pattern: /['"]ghp_[a-zA-Z0-9]{36}['"]/, name: 'GitHub Token' },
    { pattern: /['"]xox[baprs]-[a-zA-Z0-9-]+['"]/, name: 'Slack Token' }
  ];

  if (ctx.tool === 'Write' && ctx.content) {
    for (const { pattern, name } of secretPatterns) {
      if (pattern.test(ctx.content)) {
        issues.push({
          type: 'security',
          id: 'secret-detected',
          message: `Possible ${name} detected in content. Do not commit secrets!`
        });
        block = true;
      }
    }
  }

  // Check for SQL injection patterns
  if (ctx.tool === 'Write' && ctx.content) {
    const sqlInjectionPatterns = [
      /\$\{[^}]+\}.*(?:SELECT|INSERT|UPDATE|DELETE|DROP)/i,
      /`.*\$\{[^}]+\}.*`.*(?:query|execute)/i
    ];

    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(ctx.content)) {
        issues.push({
          type: 'security',
          id: 'sql-injection',
          message: 'Potential SQL injection: string interpolation in SQL query detected.'
        });
      }
    }
  }

  return { issues, block };
}

// Run main
main();
