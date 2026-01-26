/**
 * Environment Variable Validator
 *
 * Validates and reports on environment variables needed for Grimoires.
 *
 * @version 0.3.1
 */

import * as fs from 'fs';
import * as path from 'path';

const GRIMOIRES_HOME = process.env.GRIMOIRES_HOME || path.join(process.env.HOME || '', '.grimoires');
const SCHEMA_PATH = path.join(GRIMOIRES_HOME, 'core', 'config', 'env-schema.json');

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

export interface ValidateOptions {
  group?: string;
  strict?: boolean;
}

export interface PrintReportOptions {
  color?: boolean;
}

/**
 * Load environment schema from JSON file
 * @returns Parsed schema
 */
export function loadSchema(): EnvSchema {
  // Check local schema first (JSON format)
  const localPath = path.join(process.cwd(), '.grimoires', 'env-schema.json');
  const schemaPath = fs.existsSync(localPath) ? localPath : SCHEMA_PATH;

  if (!fs.existsSync(schemaPath)) {
    // Return minimal default schema
    return {
      version: '0.3.0',
      variables: [
        {
          name: 'GRIMOIRES_HOME',
          required: false,
          default: '$HOME/.grimoires',
          description: 'Grimoires installation directory',
          category: 'core'
        }
      ],
      groups: {
        minimal: {
          description: 'Basic functionality',
          variables: ['GRIMOIRES_HOME']
        }
      },
      categories: {}
    };
  }

  try {
    const content = fs.readFileSync(schemaPath, 'utf-8');
    return JSON.parse(content) as EnvSchema;
  } catch (error) {
    console.error(`[Grimoires:ERROR] Failed to parse schema: ${(error as Error).message}`);
    return {
      version: '0.3.0',
      variables: [],
      groups: { minimal: { description: 'Default', variables: [] } },
      categories: {}
    };
  }
}

/**
 * Validate environment variables
 * @param options - Validation options
 * @returns Validation results
 */
export function validate(options: ValidateOptions = {}): EnvValidationResult {
  const { group = 'minimal', strict = false } = options;
  const schema = loadSchema();

  const results: EnvValidationResult = {
    valid: true,
    missing: [],
    invalid: [],
    warnings: [],
    suggestions: [],
    configured: []
  };

  // Get variables for the requested group
  const groupDef = schema.groups[group];
  let variableNames: string[];

  if (!groupDef) {
    variableNames = schema.variables.map(v => v.name);
  } else if (groupDef.variables.includes('all')) {
    variableNames = schema.variables.map(v => v.name);
  } else {
    variableNames = groupDef.variables;
  }

  const variables = schema.variables.filter(v => variableNames.includes(v.name));

  for (const varDef of variables) {
    const value = process.env[varDef.name];

    if (!value) {
      if (varDef.required) {
        results.valid = false;
        results.missing.push({
          name: varDef.name,
          description: varDef.description,
          default: varDef.default,
          docs: varDef.docs
        });
      } else if (strict) {
        results.warnings.push({
          name: varDef.name,
          description: varDef.description,
          services: varDef.services,
          docs: varDef.docs
        });
      }
      continue;
    }

    // Pattern validation
    if (varDef.pattern) {
      try {
        const regex = new RegExp(varDef.pattern);
        if (!regex.test(value)) {
          results.invalid.push({
            name: varDef.name,
            pattern: varDef.pattern,
            hint: `Value doesn't match expected format`
          });
          results.valid = false;
          continue;
        }
      } catch {
        // Invalid regex, skip validation
      }
    }

    // Variable is configured correctly
    results.configured.push({
      name: varDef.name,
      masked: maskValue(value),
      services: varDef.services
    });
  }

  // Generate suggestions
  const allMissing = [...results.missing, ...results.warnings];
  for (const item of allMissing) {
    if (item.docs) {
      results.suggestions.push({
        variable: item.name,
        action: `Set ${item.name}`,
        command: `export ${item.name}="your-key-here"`,
        docs: item.docs
      });
    }
  }

  return results;
}

/**
 * Mask sensitive values for display
 * @param value - Value to mask
 * @returns Masked value
 */
export function maskValue(value: string): string {
  if (!value || value.length < 8) return '****';
  return value.substring(0, 4) + '****' + value.substring(value.length - 4);
}

interface ColorConfig {
  reset: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  cyan: string;
  dim: string;
}

/**
 * Print validation report
 * @param results - Validation results
 * @param options - Print options
 */
export function printReport(results: EnvValidationResult, options: PrintReportOptions = {}): void {
  const { color = true } = options;

  // ANSI colors
  const c: ColorConfig = color ? {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m'
  } : {
    reset: '', red: '', green: '', yellow: '', blue: '', cyan: '', dim: ''
  };

  console.log('\n' + c.cyan + 'Environment Variables Report' + c.reset);
  console.log(c.dim + '─'.repeat(50) + c.reset);

  // Configured variables
  if (results.configured.length > 0) {
    console.log('\n' + c.green + 'Configured:' + c.reset);
    for (const item of results.configured) {
      const services = item.services ? ` (${item.services.join(', ')})` : '';
      console.log(`  ${c.green}✓${c.reset} ${item.name}: ${item.masked}${c.dim}${services}${c.reset}`);
    }
  }

  // Missing required
  if (results.missing.length > 0) {
    console.log('\n' + c.red + 'Missing (Required):' + c.reset);
    for (const item of results.missing) {
      console.log(`  ${c.red}✗${c.reset} ${item.name}`);
      console.log(`    ${c.dim}${item.description}${c.reset}`);
      if (item.default) {
        console.log(`    ${c.dim}Default: ${item.default}${c.reset}`);
      }
    }
  }

  // Invalid format
  if (results.invalid.length > 0) {
    console.log('\n' + c.red + 'Invalid Format:' + c.reset);
    for (const item of results.invalid) {
      console.log(`  ${c.red}!${c.reset} ${item.name}: ${item.hint}`);
    }
  }

  // Warnings (optional missing)
  if (results.warnings.length > 0) {
    console.log('\n' + c.yellow + 'Optional (Not Set):' + c.reset);
    for (const item of results.warnings) {
      const services = item.services ? ` → ${item.services.join(', ')}` : '';
      console.log(`  ${c.yellow}○${c.reset} ${item.name}${c.dim}${services}${c.reset}`);
    }
  }

  // Suggestions
  if (results.suggestions.length > 0 && (results.missing.length > 0 || results.warnings.length > 0)) {
    console.log('\n' + c.blue + 'Setup Commands:' + c.reset);
    for (const s of results.suggestions.slice(0, 5)) {
      console.log(`  ${c.dim}#${c.reset} ${s.variable}`);
      console.log(`  ${c.cyan}${s.command}${c.reset}`);
      if (s.docs) {
        console.log(`  ${c.dim}→ ${s.docs}${c.reset}`);
      }
      console.log('');
    }
  }

  // Summary
  console.log(c.dim + '─'.repeat(50) + c.reset);
  if (results.valid && results.warnings.length === 0) {
    console.log(c.green + 'All environment variables are configured!' + c.reset);
  } else if (results.valid) {
    console.log(c.yellow + 'Some optional variables are not configured.' + c.reset);
  } else {
    console.log(c.red + 'Some required variables are missing or invalid.' + c.reset);
  }
  console.log('');
}

/**
 * Get JSON report
 * @param results - Validation results
 * @returns JSON string
 */
export function getJsonReport(results: EnvValidationResult): string {
  return JSON.stringify(results, null, 2);
}
