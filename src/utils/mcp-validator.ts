/**
 * MCP Server Configuration Validator
 *
 * Validates MCP server JSON configuration files.
 *
 * @version 0.3.1
 */

import * as fs from 'fs';
import * as path from 'path';

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

export interface McpDirectoryResult {
  valid: boolean;
  files: McpValidationResult[];
}

/**
 * Valid field types
 */
const FIELD_TYPES: Record<string, string> = {
  command: 'string',
  args: 'array',
  env: 'object',
  description: 'string'
};

/**
 * Validate a single MCP server configuration
 * @param name - Server name
 * @param config - Server configuration
 * @returns Validation result
 */
export function validateServer(name: string, config: McpServerConfig): McpValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!config.command) {
    errors.push(`Server "${name}": missing required field "command"`);
  }

  // Validate field types
  for (const [field, expectedType] of Object.entries(FIELD_TYPES)) {
    const value = (config as unknown as Record<string, unknown>)[field];
    if (value !== undefined) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== expectedType) {
        errors.push(`Server "${name}": field "${field}" should be ${expectedType}, got ${actualType}`);
      }
    }
  }

  // Validate args array
  if (config.args && Array.isArray(config.args)) {
    for (let i = 0; i < config.args.length; i++) {
      if (typeof config.args[i] !== 'string') {
        errors.push(`Server "${name}": args[${i}] should be string`);
      }
    }
  }

  // Validate env object
  if (config.env && typeof config.env === 'object') {
    for (const [key, value] of Object.entries(config.env)) {
      if (typeof value !== 'string') {
        errors.push(`Server "${name}": env["${key}"] should be string`);
      }
    }
  }

  // Check for common issues (warnings)
  if (!config.description) {
    warnings.push(`Server "${name}": missing description field (recommended)`);
  }

  // Check command exists (if it's a simple command)
  if (config.command && !config.command.includes(' ')) {
    // Simple command like 'node' or 'npx'
    const command = config.command;
    if (!['node', 'npx', 'npm', 'python', 'python3', 'deno', 'bun'].includes(command)) {
      warnings.push(`Server "${name}": command "${command}" may not be available`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    servers: [name]
  };
}

/**
 * Validate an MCP configuration file
 * @param filePath - Path to JSON file
 * @returns Validation result
 */
export function validateFile(filePath: string): McpValidationResult {
  const result: McpValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    servers: []
  };

  // Check file exists
  if (!fs.existsSync(filePath)) {
    result.valid = false;
    result.errors.push(`File not found: ${path.basename(filePath)}`);
    return result;
  }

  // Parse JSON
  let config: McpConfig;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    config = JSON.parse(content) as McpConfig;
  } catch (error) {
    result.valid = false;
    result.errors.push(`Invalid JSON: ${(error as Error).message}`);
    return result;
  }

  // Check for mcpServers field
  if (!config.mcpServers) {
    result.valid = false;
    result.errors.push('Missing required field: mcpServers');
    return result;
  }

  // Validate each server
  for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
    result.servers.push(name);
    const serverResult = validateServer(name, serverConfig);

    if (!serverResult.valid) {
      result.valid = false;
    }

    result.errors.push(...serverResult.errors);
    result.warnings.push(...serverResult.warnings);
  }

  return result;
}

/**
 * Validate all MCP configs in a directory
 * @param dirPath - Directory path
 * @returns Validation results for all files
 */
export function validateDirectory(dirPath: string): McpDirectoryResult {
  const results: McpDirectoryResult = {
    valid: true,
    files: []
  };

  if (!fs.existsSync(dirPath)) {
    results.valid = false;
    return results;
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileResult = validateFile(filePath);
    fileResult.file = file;

    if (!fileResult.valid) {
      results.valid = false;
    }

    results.files.push(fileResult);
  }

  return results;
}

interface ColorConfig {
  reset: string;
  red: string;
  green: string;
  yellow: string;
  cyan: string;
  dim: string;
}

/**
 * Print validation report
 * @param results - Validation results
 */
export function printReport(results: McpDirectoryResult): void {
  const c: ColorConfig = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m'
  };

  console.log(`\n${c.cyan}MCP Configuration Validation${c.reset}`);
  console.log(c.dim + '─'.repeat(50) + c.reset);

  for (const file of results.files) {
    const status = file.valid ? `${c.green}✓${c.reset}` : `${c.red}✗${c.reset}`;
    console.log(`\n${status} ${file.file}`);

    if (file.servers.length > 0) {
      console.log(`  ${c.dim}Servers: ${file.servers.join(', ')}${c.reset}`);
    }

    for (const error of file.errors) {
      console.log(`  ${c.red}Error: ${error}${c.reset}`);
    }

    for (const warning of file.warnings) {
      console.log(`  ${c.yellow}Warning: ${warning}${c.reset}`);
    }
  }

  console.log('\n' + c.dim + '─'.repeat(50) + c.reset);
  if (results.valid) {
    console.log(`${c.green}All configurations valid!${c.reset}\n`);
  } else {
    console.log(`${c.red}Some configurations have errors.${c.reset}\n`);
  }
}
