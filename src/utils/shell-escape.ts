/**
 * Shell Escape Utility
 *
 * Safely escapes strings for use in shell commands.
 * Prevents command injection attacks.
 *
 * @version 0.3.1
 */

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

interface DangerousPattern {
  pattern: RegExp;
  message: string;
}

interface DangerousCommand {
  pattern: RegExp;
  warning: string;
}

/**
 * Characters that need escaping in shell
 * Note: Using non-global regex for test() to avoid lastIndex state issues
 */
export const SHELL_METACHARACTERS = /[|&;<>()$`\\"' \t\n*?[\]#~=%!{}]/;

/**
 * Escape a string for safe use in shell commands
 * @param str - String to escape
 * @returns Escaped string
 */
export function escapeShellArg(str: string | null | undefined): string {
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
 * @param args - Arguments to escape
 * @returns Space-separated escaped arguments
 */
export function escapeShellArgs(...args: string[]): string {
  return args.map(escapeShellArg).join(' ');
}

/**
 * Validate a command template is safe
 * @param template - Command template with placeholders
 * @returns Validation result
 */
export function validateCommandTemplate(template: string): TemplateValidationResult {
  const errors: string[] = [];

  // Check for dangerous patterns
  const dangerousPatterns: DangerousPattern[] = [
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

export interface SafeSubstituteOptions {
  validateTemplate?: boolean;
}

/**
 * Safely substitute placeholders in a command template
 * @param template - Command template
 * @param values - Values to substitute
 * @param options - Options
 * @returns Substitution result
 */
export function safeSubstitute(
  template: string,
  values: Record<string, string>,
  options: SafeSubstituteOptions = {}
): SafeSubstituteResult {
  const { validateTemplate = true } = options;
  const errors: string[] = [];

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
 * @param command - Command to check
 * @returns Safety check result
 */
export function checkCommandSafety(command: string): CommandSafetyResult {
  const warnings: string[] = [];

  const dangerousCommands: DangerousCommand[] = [
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
