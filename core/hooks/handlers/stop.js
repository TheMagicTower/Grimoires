#!/usr/bin/env node
/**
 * Stop Handler
 *
 * Executes when Claude Code completes a response.
 * Performs final checks and validation.
 *
 * @version 0.3.0
 */

const fs = require('fs');
const path = require('path');

const SERENA_DIR = '.serena/memories';

/**
 * Response context passed via environment
 */
const RESPONSE_CONTEXT = {
  hasToolCalls: process.env.GRIMOIRES_HAS_TOOL_CALLS === 'true',
  toolCount: parseInt(process.env.GRIMOIRES_TOOL_COUNT || '0', 10),
  hasErrors: process.env.GRIMOIRES_HAS_ERRORS === 'true',
  taskId: process.env.GRIMOIRES_TASK_ID || null
};

/**
 * Main handler function
 */
async function main() {
  const result = {
    timestamp: new Date().toISOString(),
    checks: [],
    recommendations: []
  };

  try {
    // 1. Check for uncommitted changes
    const gitCheck = await checkUncommittedChanges();
    result.checks.push(gitCheck);
    if (gitCheck.hasChanges) {
      result.recommendations.push({
        type: 'git',
        message: 'You have uncommitted changes. Consider committing or stashing.'
      });
    }

    // 2. Verify task completion status
    if (RESPONSE_CONTEXT.taskId) {
      const taskCheck = await verifyTaskCompletion();
      result.checks.push(taskCheck);
    }

    // 3. Check for any failed tests
    const testCheck = await checkTestStatus();
    result.checks.push(testCheck);
    if (testCheck.hasFailures) {
      result.recommendations.push({
        type: 'test',
        message: 'Some tests are failing. Review before proceeding.'
      });
    }

    // 4. Check for TypeScript errors
    const tsCheck = await checkTypescriptStatus();
    result.checks.push(tsCheck);
    if (tsCheck.hasErrors) {
      result.recommendations.push({
        type: 'typescript',
        message: 'TypeScript errors detected. Fix before committing.'
      });
    }

    // 5. Check for lint warnings
    const lintCheck = await checkLintStatus();
    result.checks.push(lintCheck);

    // 6. Verify no debug code left
    const debugCheck = await checkDebugCode();
    result.checks.push(debugCheck);
    if (debugCheck.found) {
      result.recommendations.push({
        type: 'debug',
        message: 'Debug statements found in modified files. Clean up before commit.'
      });
    }

    // 7. Update task tracking if applicable
    if (RESPONSE_CONTEXT.taskId) {
      await updateTaskTracking(result);
    }

    console.log(JSON.stringify({
      status: result.recommendations.length > 0 ? 'warnings' : 'success',
      result
    }, null, 2));

  } catch (error) {
    console.error(JSON.stringify({
      status: 'error',
      error: error.message,
      result
    }, null, 2));
    // Don't exit with error - this is informational
  }
}

/**
 * Check for uncommitted git changes
 */
async function checkUncommittedChanges() {
  try {
    const { execSync } = require('child_process');
    const status = execSync('git status --porcelain 2>/dev/null', { encoding: 'utf-8' });
    const changes = status.trim().split('\n').filter(Boolean);

    return {
      check: 'uncommitted_changes',
      hasChanges: changes.length > 0,
      count: changes.length,
      files: changes.slice(0, 10).map(l => l.substring(3))
    };
  } catch {
    return { check: 'uncommitted_changes', skipped: true, reason: 'not_git_repo' };
  }
}

/**
 * Verify task completion
 */
async function verifyTaskCompletion() {
  const taskFile = path.join(SERENA_DIR, 'current-task.md');

  if (!fs.existsSync(taskFile)) {
    return { check: 'task_completion', skipped: true, reason: 'no_task_file' };
  }

  try {
    const content = fs.readFileSync(taskFile, 'utf-8');
    const hasCompletionMarker = /\[x\]|completed|done|finished/i.test(content);

    return {
      check: 'task_completion',
      completed: hasCompletionMarker,
      taskId: RESPONSE_CONTEXT.taskId
    };
  } catch (error) {
    return { check: 'task_completion', error: error.message };
  }
}

/**
 * Check test status
 */
async function checkTestStatus() {
  // Check if we can quickly verify test status
  if (!fs.existsSync('package.json')) {
    return { check: 'tests', skipped: true, reason: 'not_node_project' };
  }

  try {
    const { execSync } = require('child_process');
    // Quick test run with fail-fast
    execSync('npm test -- --passWithNoTests --bail 2>&1', {
      encoding: 'utf-8',
      timeout: 30000,
      stdio: 'pipe'
    });

    return { check: 'tests', hasFailures: false };
  } catch (error) {
    const output = error.stdout || error.message;
    const hasFailures = output.includes('FAIL') || output.includes('failed');

    return {
      check: 'tests',
      hasFailures,
      output: output.substring(0, 200)
    };
  }
}

/**
 * Check TypeScript status
 */
async function checkTypescriptStatus() {
  if (!fs.existsSync('tsconfig.json')) {
    return { check: 'typescript', skipped: true, reason: 'not_typescript' };
  }

  try {
    const { execSync } = require('child_process');
    execSync('npx tsc --noEmit 2>&1', {
      encoding: 'utf-8',
      timeout: 60000,
      stdio: 'pipe'
    });

    return { check: 'typescript', hasErrors: false };
  } catch (error) {
    const output = error.stdout || error.message;
    const errorCount = (output.match(/error TS/g) || []).length;

    return {
      check: 'typescript',
      hasErrors: errorCount > 0,
      errorCount
    };
  }
}

/**
 * Check lint status
 */
async function checkLintStatus() {
  const hasEslint = fs.existsSync('.eslintrc') ||
                    fs.existsSync('.eslintrc.js') ||
                    fs.existsSync('.eslintrc.json');

  if (!hasEslint) {
    return { check: 'lint', skipped: true, reason: 'no_eslint' };
  }

  try {
    const { execSync } = require('child_process');
    execSync('npx eslint . --ext .ts,.tsx,.js,.jsx --quiet 2>&1', {
      encoding: 'utf-8',
      timeout: 60000,
      stdio: 'pipe'
    });

    return { check: 'lint', hasWarnings: false };
  } catch (error) {
    return {
      check: 'lint',
      hasWarnings: true,
      output: (error.stdout || '').substring(0, 200)
    };
  }
}

/**
 * Check for debug code in modified files
 */
async function checkDebugCode() {
  const debugPatterns = [
    /console\.(log|debug)\(/,
    /debugger;/,
    /\/\/\s*TODO/i,
    /\/\/\s*FIXME/i,
    /\/\/\s*HACK/i,
    /\.only\(/  // test.only, describe.only
  ];

  try {
    const { execSync } = require('child_process');
    const modifiedFiles = execSync('git diff --name-only HEAD 2>/dev/null', { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(f => /\.(ts|tsx|js|jsx)$/.test(f));

    const found = [];
    for (const file of modifiedFiles) {
      if (!fs.existsSync(file)) continue;

      const content = fs.readFileSync(file, 'utf-8');
      for (const pattern of debugPatterns) {
        if (pattern.test(content)) {
          found.push({ file, pattern: pattern.toString() });
          break;
        }
      }
    }

    return {
      check: 'debug_code',
      found: found.length > 0,
      files: found.map(f => f.file)
    };
  } catch {
    return { check: 'debug_code', skipped: true, reason: 'error' };
  }
}

/**
 * Update task tracking
 */
async function updateTaskTracking(result) {
  const taskFile = path.join(SERENA_DIR, 'current-task.md');

  if (!fs.existsSync(taskFile)) return;

  try {
    let content = fs.readFileSync(taskFile, 'utf-8');

    // Add response completion marker
    const marker = `\n\n### Response Completed: ${new Date().toISOString()}\n`;
    const summary = result.recommendations.length > 0
      ? `- ${result.recommendations.length} recommendations\n`
      : '- All checks passed\n';

    content += marker + summary;
    fs.writeFileSync(taskFile, content);
  } catch {
    // Ignore update errors
  }
}

// Run main
main();
