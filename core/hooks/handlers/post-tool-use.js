#!/usr/bin/env node
/**
 * Post-Tool-Use Handler
 *
 * Executes after a tool is used.
 * Runs formatters, linters, type checkers, and other post-processing.
 *
 * @version 0.3.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Error logging configuration
 */
const LOG_DIR = path.join(process.env.HOME || '', '.grimoires', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'post-tool-use.log');

/**
 * Tool use context passed via environment
 */
const TOOL_CONTEXT = {
  tool: process.env.GRIMOIRES_TOOL || '',
  path: process.env.GRIMOIRES_PATH || '',
  exitCode: parseInt(process.env.GRIMOIRES_EXIT_CODE || '0', 10),
  success: process.env.GRIMOIRES_SUCCESS === 'true'
};

/**
 * Project detection cache
 */
let projectConfig = null;

/**
 * Main handler function
 */
async function main() {
  const result = {
    timestamp: new Date().toISOString(),
    tool: TOOL_CONTEXT.tool,
    path: TOOL_CONTEXT.path,
    actions: [],
    warnings: []
  };

  try {
    // Only process file write/edit operations
    if (!['Write', 'Edit'].includes(TOOL_CONTEXT.tool)) {
      console.log(JSON.stringify({ status: 'skipped', reason: 'not_file_operation' }));
      return;
    }

    if (!TOOL_CONTEXT.path || !fs.existsSync(TOOL_CONTEXT.path)) {
      console.log(JSON.stringify({ status: 'skipped', reason: 'file_not_found' }));
      return;
    }

    // Detect project configuration
    projectConfig = await detectProjectConfig();

    const ext = path.extname(TOOL_CONTEXT.path);
    const isJsTs = ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
    const isCss = ['.css', '.scss', '.less'].includes(ext);

    // 1. Run Prettier if available
    if (isJsTs || isCss || ['.json', '.md', '.yaml', '.yml'].includes(ext)) {
      const prettierResult = await runPrettier();
      result.actions.push(prettierResult);
    }

    // 2. Run ESLint for JS/TS files
    if (isJsTs && projectConfig.hasEslint) {
      const lintResult = await runEslint();
      result.actions.push(lintResult);
      if (lintResult.warnings) {
        result.warnings.push(...lintResult.warnings);
      }
    }

    // 3. Run TypeScript check for TS files
    if (['.ts', '.tsx'].includes(ext) && projectConfig.hasTypescript) {
      const tsResult = await runTypecheck();
      result.actions.push(tsResult);
      if (tsResult.errors) {
        result.warnings.push(...tsResult.errors);
      }
    }

    // 4. Check for console.log statements
    if (isJsTs) {
      const consoleCheck = await checkConsoleStatements();
      if (consoleCheck.found) {
        result.warnings.push(consoleCheck);
      }
    }

    // 5. Run related tests if in src/
    if (isJsTs && TOOL_CONTEXT.path.includes('/src/') && projectConfig.hasJest) {
      const testResult = await runRelatedTests();
      result.actions.push(testResult);
    }

    // 6. Check file size limits
    const sizeCheck = checkFileSize();
    if (sizeCheck.warning) {
      result.warnings.push(sizeCheck);
    }

    console.log(JSON.stringify({
      status: 'success',
      result
    }, null, 2));

  } catch (error) {
    // Log error for debugging but don't block the operation
    logError(error, result);

    console.error(JSON.stringify({
      status: 'error',
      error: error.message,
      result
    }, null, 2));
    // Don't exit with error - post-processing failure shouldn't block operations
  }
}

/**
 * Log errors to file for debugging
 * @param {Error} error - The error that occurred
 * @param {Object} context - Additional context information
 */
function logError(error, context) {
  try {
    // Ensure log directory exists
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack
      },
      context: {
        tool: context.tool,
        path: context.path,
        actions: context.actions
      }
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(LOG_FILE, logLine);

    // Rotate log if too large (> 1MB)
    const stats = fs.statSync(LOG_FILE);
    if (stats.size > 1024 * 1024) {
      const backupFile = LOG_FILE + '.old';
      if (fs.existsSync(backupFile)) {
        fs.unlinkSync(backupFile);
      }
      fs.renameSync(LOG_FILE, backupFile);
    }
  } catch (logError) {
    // Silently fail if logging fails - don't disrupt the main flow
  }
}

/**
 * Detect project configuration
 */
async function detectProjectConfig() {
  return {
    hasPrettier: fs.existsSync('node_modules/.bin/prettier') ||
                 (fs.existsSync('package.json') && hasDevDependency('prettier')),
    hasEslint: fs.existsSync('.eslintrc') ||
               fs.existsSync('.eslintrc.js') ||
               fs.existsSync('.eslintrc.json') ||
               fs.existsSync('eslint.config.js'),
    hasTypescript: fs.existsSync('tsconfig.json'),
    hasJest: fs.existsSync('jest.config.js') ||
             fs.existsSync('jest.config.ts') ||
             (fs.existsSync('package.json') && hasDevDependency('jest')),
    packageManager: detectPackageManager()
  };
}

/**
 * Check if package has a dev dependency
 */
function hasDevDependency(name) {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    return !!(pkg.devDependencies?.[name] || pkg.dependencies?.[name]);
  } catch {
    return false;
  }
}

/**
 * Detect package manager
 */
function detectPackageManager() {
  if (fs.existsSync('bun.lockb')) return 'bun';
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('yarn.lock')) return 'yarn';
  return 'npm';
}

/**
 * Run Prettier on the file
 */
async function runPrettier() {
  if (!projectConfig.hasPrettier) {
    return { action: 'prettier', skipped: true, reason: 'not_installed' };
  }

  try {
    const pm = projectConfig.packageManager;
    const cmd = `${pm === 'npm' ? 'npx' : pm} prettier --write "${TOOL_CONTEXT.path}" 2>&1`;
    execSync(cmd, { stdio: 'pipe', encoding: 'utf-8' });
    return { action: 'prettier', success: true };
  } catch (error) {
    return { action: 'prettier', success: false, error: error.message };
  }
}

/**
 * Run ESLint on the file
 */
async function runEslint() {
  try {
    const pm = projectConfig.packageManager;
    const cmd = `${pm === 'npm' ? 'npx' : pm} eslint "${TOOL_CONTEXT.path}" --fix 2>&1`;
    const output = execSync(cmd, { stdio: 'pipe', encoding: 'utf-8' });

    const warnings = [];
    if (output.includes('warning')) {
      warnings.push({ type: 'eslint', message: 'ESLint warnings found', output: output.substring(0, 500) });
    }

    return { action: 'eslint', success: true, warnings };
  } catch (error) {
    // ESLint exits with 1 if there are errors
    const output = error.stdout || error.message;
    const errors = [];

    if (output.includes('error')) {
      errors.push({ type: 'eslint', message: 'ESLint errors found', output: output.substring(0, 500) });
    }

    return { action: 'eslint', success: false, errors };
  }
}

/**
 * Run TypeScript type check
 */
async function runTypecheck() {
  try {
    const pm = projectConfig.packageManager;
    const cmd = `${pm === 'npm' ? 'npx' : pm} tsc --noEmit 2>&1`;
    execSync(cmd, { stdio: 'pipe', encoding: 'utf-8' });
    return { action: 'typecheck', success: true };
  } catch (error) {
    const output = error.stdout || error.message;
    const errors = [];

    // Parse TypeScript errors
    const errorLines = output.split('\n').filter(l => l.includes('error TS'));
    if (errorLines.length > 0) {
      errors.push({
        type: 'typescript',
        message: `${errorLines.length} TypeScript errors`,
        details: errorLines.slice(0, 5).join('\n')
      });
    }

    return { action: 'typecheck', success: false, errors };
  }
}

/**
 * Check for console.log statements
 */
async function checkConsoleStatements() {
  try {
    const content = fs.readFileSync(TOOL_CONTEXT.path, 'utf-8');
    const matches = content.match(/console\.(log|debug|warn|info)\(/g);

    if (matches && matches.length > 0) {
      return {
        found: true,
        type: 'console',
        message: `Found ${matches.length} console statement(s) - remove before commit`,
        count: matches.length
      };
    }
    return { found: false };
  } catch {
    return { found: false };
  }
}

/**
 * Run related tests
 */
async function runRelatedTests() {
  try {
    const pm = projectConfig.packageManager;
    const cmd = `${pm === 'npm' ? 'npx' : pm} jest --findRelatedTests "${TOOL_CONTEXT.path}" --passWithNoTests 2>&1`;
    const output = execSync(cmd, { stdio: 'pipe', encoding: 'utf-8', timeout: 60000 });

    const passed = output.includes('passed') || output.includes('No tests found');
    return { action: 'test', success: passed, output: output.substring(0, 200) };
  } catch (error) {
    return { action: 'test', success: false, error: 'Tests failed or timed out' };
  }
}

/**
 * Check file size limits
 */
function checkFileSize() {
  try {
    const content = fs.readFileSync(TOOL_CONTEXT.path, 'utf-8');
    const lines = content.split('\n').length;

    if (lines > 300) {
      return {
        warning: true,
        type: 'file_size',
        message: `File has ${lines} lines (limit: 300). Consider splitting.`,
        lines
      };
    }
    return { warning: false, lines };
  } catch {
    return { warning: false };
  }
}

// Run main
main();
