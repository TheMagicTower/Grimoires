#!/usr/bin/env node
/**
 * Session End Handler
 *
 * Executes when a Claude Code session ends.
 * Saves session state and cleans up resources.
 *
 * @version 0.3.0
 */

const fs = require('fs');
const path = require('path');

const SERENA_DIR = '.serena/memories';
const SESSION_LOG_DIR = '.grimoires/sessions';

/**
 * Main handler function
 */
async function main() {
  const result = {
    timestamp: new Date().toISOString(),
    actions: []
  };

  try {
    // Ensure directories exist
    ensureDirectories();

    // 1. Save session summary
    const sessionSummary = await saveSessionSummary();
    result.actions.push({ action: 'save_session', ...sessionSummary });

    // 2. Update current task status
    const taskUpdate = await updateCurrentTask();
    result.actions.push({ action: 'update_task', ...taskUpdate });

    // 3. Save learned patterns
    const patterns = await saveLearnedPatterns();
    result.actions.push({ action: 'save_patterns', ...patterns });

    // 4. Clean up temporary files
    const cleanup = await cleanupTempFiles();
    result.actions.push({ action: 'cleanup', ...cleanup });

    console.log(JSON.stringify({
      status: 'success',
      result
    }, null, 2));

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
 * Ensure required directories exist
 */
function ensureDirectories() {
  if (!fs.existsSync(SERENA_DIR)) {
    fs.mkdirSync(SERENA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SESSION_LOG_DIR)) {
    fs.mkdirSync(SESSION_LOG_DIR, { recursive: true });
  }
}

/**
 * Save session summary to log
 */
async function saveSessionSummary() {
  const sessionId = `session-${Date.now()}`;
  const logFile = path.join(SESSION_LOG_DIR, `${sessionId}.json`);

  const summary = {
    id: sessionId,
    startTime: process.env.GRIMOIRES_SESSION_START || null,
    endTime: new Date().toISOString(),
    cwd: process.cwd(),
    metrics: {
      filesModified: await countModifiedFiles(),
      commandsRun: parseInt(process.env.GRIMOIRES_COMMAND_COUNT || '0', 10)
    }
  };

  fs.writeFileSync(logFile, JSON.stringify(summary, null, 2));

  return { sessionId, logFile, success: true };
}

/**
 * Count recently modified files
 */
async function countModifiedFiles() {
  try {
    const { execSync } = require('child_process');
    const result = execSync('git diff --name-only HEAD 2>/dev/null | wc -l', { encoding: 'utf-8' });
    return parseInt(result.trim(), 10);
  } catch {
    return 0;
  }
}

/**
 * Update current task status in Serena memories
 */
async function updateCurrentTask() {
  const taskFile = path.join(SERENA_DIR, 'current-task.md');

  if (!fs.existsSync(taskFile)) {
    return { updated: false, reason: 'no_task_file' };
  }

  try {
    let content = fs.readFileSync(taskFile, 'utf-8');

    // Add session end marker
    const endMarker = `\n\n---\n**Session Ended**: ${new Date().toISOString()}\n`;
    content += endMarker;

    fs.writeFileSync(taskFile, content);
    return { updated: true, file: taskFile };
  } catch (error) {
    return { updated: false, error: error.message };
  }
}

/**
 * Save any learned patterns from this session
 */
async function saveLearnedPatterns() {
  const patternsFile = path.join(SERENA_DIR, 'learned-patterns.md');

  // Check for new patterns from environment
  const newPatterns = process.env.GRIMOIRES_NEW_PATTERNS;
  if (!newPatterns) {
    return { saved: false, reason: 'no_new_patterns' };
  }

  try {
    let content = '';
    if (fs.existsSync(patternsFile)) {
      content = fs.readFileSync(patternsFile, 'utf-8');
    } else {
      content = '# Learned Patterns\n\n';
    }

    content += `\n## Session ${new Date().toISOString()}\n\n${newPatterns}\n`;
    fs.writeFileSync(patternsFile, content);

    return { saved: true, file: patternsFile };
  } catch (error) {
    return { saved: false, error: error.message };
  }
}

/**
 * Clean up temporary files
 */
async function cleanupTempFiles() {
  const tempPatterns = [
    '.grimoires/cache/*.tmp',
    '.grimoires/sessions/*.tmp'
  ];

  let cleaned = 0;

  for (const pattern of tempPatterns) {
    const dir = path.dirname(pattern);
    const ext = path.extname(pattern);

    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith(ext.replace('*', ''))) {
          try {
            fs.unlinkSync(path.join(dir, file));
            cleaned++;
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  }

  return { cleaned, patterns: tempPatterns };
}

// Run main
main();
