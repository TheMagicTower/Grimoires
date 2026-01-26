#!/usr/bin/env node
/**
 * Shell Escape Utility
 *
 * Safely escapes strings for use in shell commands.
 * Prevents command injection attacks.
 *
 * @version 0.3.0
 */

/**
 * Characters that need escaping in shell
 * Note: Using non-global regex for test() to avoid lastIndex state issues
 */
const SHELL_METACHARACTERS = /[|&;<>()$`\\\"' \t\n*?[\]#~=%!{}]/;

/**
 * Escape a string for safe use in shell commands
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeShellArg(str) {
  if (str === null || str === undefined) {
    return '';
  }

  const s = String(str);

  // If empty, return empty quotes
  if (s === '') {
    return "''";
  }

  // If no special characters, return as-is
  if (!SHELL_METACHARACTERS.test(s)) {
    return s;
  }

  // Use single quotes and escape any single quotes within
  return "'" + s.replace(/'/g, "'\\''") + "'";
}

/**
 * Escape multiple arguments
 * @param {...string} args - Arguments to escape
 * @returns {string} Space-separated escaped arguments
 */
function escapeShellArgs(...args) {
  return args.map(escapeShellArg).join(' ');
}

/**
 * Validate a command template is safe
 * @param {string} template - Command template with placeholders
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateCommandTemplate(template) {
  const errors = [];

  // Check for dangerous patterns
  const dangerousPatterns = [
    { pattern: /\$\(/, message: 'Command substitution $() is not allowed' },
    { pattern: /`/, message: 'Backtick command substitution is not allowed' },
    { pattern: /\|.*\{\{/, message: 'Pipe before placeholder is dangerous' },
    { pattern: /\{\{.*\}\}.*\|/, message: 'Pipe after placeholder is dangerous' },
    { pattern: /;\s*\{\{/, message: 'Semicolon before placeholder is dangerous' },
    { pattern: /\{\{.*\}\}.*;\s*\w/, message: 'Semicolon after placeholder with command is dangerous' },
    { pattern: />\s*\{\{/, message: 'Redirect to placeholder is dangerous' },
    { pattern: /\{\{.*\}\}.*>/, message: 'Redirect after placeholder is dangerous' }
  ];

  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(template)) {
      errors.push(message);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Safely substitute placeholders in a command template
 * @param {string} template - Command template
 * @param {Object} values - Values to substitute
 * @param {Object} options - Options
 * @returns {{ command: string, safe: boolean, errors: string[] }}
 */
function safeSubstitute(template, values, options = {}) {
  const { validateTemplate = true } = options;
  const errors = [];

  // Validate template first
  if (validateTemplate) {
    const validation = validateCommandTemplate(template);
    if (!validation.valid) {
      return {
        command: null,
        safe: false,
        errors: validation.errors
      };
    }
  }

  let command = template;

  // Replace placeholders with escaped values
  for (const [key, value] of Object.entries(values)) {
    const placeholder = `{{${key}}}`;
    const escapedValue = escapeShellArg(value);
    command = command.split(placeholder).join(escapedValue);
  }

  // Check for any remaining unsubstituted placeholders
  const remaining = command.match(/\{\{[^}]+\}\}/g);
  if (remaining) {
    errors.push(`Unsubstituted placeholders: ${remaining.join(', ')}`);
  }

  return {
    command,
    safe: errors.length === 0,
    errors
  };
}

/**
 * Check if a command is potentially dangerous
 * @param {string} command - Command to check
 * @returns {{ safe: boolean, warnings: string[] }}
 */
function checkCommandSafety(command) {
  const warnings = [];

  const dangerousCommands = [
    { pattern: /rm\s+-rf\s+[\/~]/, warning: 'Removing root or home directory' },
    { pattern: /rm\s+-rf\s+\*/, warning: 'Removing with wildcard' },
    { pattern: />\s*\/dev\/sd/, warning: 'Writing to block device' },
    { pattern: /mkfs\./, warning: 'Formatting filesystem' },
    { pattern: /dd\s+.*of=\/dev/, warning: 'DD to device' },
    { pattern: /chmod\s+777/, warning: 'Setting world-writable permissions' },
    { pattern: /curl.*\|\s*(ba)?sh/, warning: 'Piping curl to shell' },
    { pattern: /wget.*\|\s*(ba)?sh/, warning: 'Piping wget to shell' },
    { pattern: /eval\s/, warning: 'Using eval' },
    { pattern: /\$\([^)]*\)/, warning: 'Command substitution detected' }
  ];

  for (const { pattern, warning } of dangerousCommands) {
    if (pattern.test(command)) {
      warnings.push(warning);
    }
  }

  return {
    safe: warnings.length === 0,
    warnings
  };
}

module.exports = {
  escapeShellArg,
  escapeShellArgs,
  validateCommandTemplate,
  safeSubstitute,
  checkCommandSafety,
  SHELL_METACHARACTERS
};
