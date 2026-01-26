#!/usr/bin/env node
/**
 * Pre-Compact Handler
 *
 * Executes before Claude Code context compaction.
 * Saves important state that might be lost during compaction.
 *
 * @version 0.3.0
 */

const fs = require('fs');
const path = require('path');

const SERENA_DIR = '.serena/memories';
const COMPACT_BACKUP_DIR = '.grimoires/compact-backups';

/**
 * Main handler function
 */
async function main() {
  const result = {
    timestamp: new Date().toISOString(),
    backups: []
  };

  try {
    // Ensure backup directory exists
    if (!fs.existsSync(COMPACT_BACKUP_DIR)) {
      fs.mkdirSync(COMPACT_BACKUP_DIR, { recursive: true });
    }

    // 1. Backup current task state
    const taskBackup = await backupCurrentTask();
    result.backups.push(taskBackup);

    // 2. Save important context summary
    const contextBackup = await saveContextSummary();
    result.backups.push(contextBackup);

    // 3. Preserve architectural decisions
    const archBackup = await backupArchitectureDecisions();
    result.backups.push(archBackup);

    // 4. Save pending changes summary
    const changesBackup = await savePendingChanges();
    result.backups.push(changesBackup);

    // 5. Create restoration manifest
    const manifest = await createRestorationManifest(result.backups);
    result.manifest = manifest;

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
 * Backup current task information
 */
async function backupCurrentTask() {
  const taskFile = path.join(SERENA_DIR, 'current-task.md');
  const backupId = `task-${Date.now()}`;
  const backupFile = path.join(COMPACT_BACKUP_DIR, `${backupId}.md`);

  if (!fs.existsSync(taskFile)) {
    return { type: 'task', backed_up: false, reason: 'no_task_file' };
  }

  try {
    const content = fs.readFileSync(taskFile, 'utf-8');

    // Add pre-compact marker
    const markedContent = `<!-- Pre-Compact Backup: ${new Date().toISOString()} -->\n\n${content}`;
    fs.writeFileSync(backupFile, markedContent);

    return { type: 'task', backed_up: true, file: backupFile };
  } catch (error) {
    return { type: 'task', backed_up: false, error: error.message };
  }
}

/**
 * Save context summary for restoration
 */
async function saveContextSummary() {
  const summaryFile = path.join(COMPACT_BACKUP_DIR, `context-${Date.now()}.json`);

  const summary = {
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    project: await getProjectSummary(),
    recentFiles: await getRecentlyModifiedFiles(),
    gitStatus: await getGitStatus()
  };

  try {
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    return { type: 'context', backed_up: true, file: summaryFile };
  } catch (error) {
    return { type: 'context', backed_up: false, error: error.message };
  }
}

/**
 * Get project summary
 */
async function getProjectSummary() {
  const summary = { name: null, type: null };

  if (fs.existsSync('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      summary.name = pkg.name;
      summary.description = pkg.description;
    } catch {
      // Ignore
    }
  }

  if (fs.existsSync('grimoire.yaml')) {
    summary.hasGrimoire = true;
  }

  return summary;
}

/**
 * Get recently modified files
 */
async function getRecentlyModifiedFiles() {
  try {
    const { execSync } = require('child_process');
    const result = execSync('git diff --name-only HEAD~5 2>/dev/null || true', { encoding: 'utf-8' });
    return result.trim().split('\n').filter(Boolean).slice(0, 20);
  } catch {
    return [];
  }
}

/**
 * Get git status summary
 */
async function getGitStatus() {
  try {
    const { execSync } = require('child_process');
    const branch = execSync('git branch --show-current 2>/dev/null || echo "unknown"', { encoding: 'utf-8' }).trim();
    const status = execSync('git status --porcelain 2>/dev/null | head -10 || true', { encoding: 'utf-8' }).trim();
    return { branch, changes: status.split('\n').filter(Boolean) };
  } catch {
    return { branch: 'unknown', changes: [] };
  }
}

/**
 * Backup architecture decisions
 */
async function backupArchitectureDecisions() {
  const adrFile = path.join(SERENA_DIR, 'architecture-decisions.md');
  const backupFile = path.join(COMPACT_BACKUP_DIR, `adr-${Date.now()}.md`);

  if (!fs.existsSync(adrFile)) {
    return { type: 'architecture', backed_up: false, reason: 'no_adr_file' };
  }

  try {
    const content = fs.readFileSync(adrFile, 'utf-8');
    fs.writeFileSync(backupFile, content);
    return { type: 'architecture', backed_up: true, file: backupFile };
  } catch (error) {
    return { type: 'architecture', backed_up: false, error: error.message };
  }
}

/**
 * Save pending changes summary
 */
async function savePendingChanges() {
  const changesFile = path.join(COMPACT_BACKUP_DIR, `changes-${Date.now()}.md`);

  try {
    const { execSync } = require('child_process');
    const diff = execSync('git diff --stat 2>/dev/null || true', { encoding: 'utf-8' });
    const staged = execSync('git diff --cached --stat 2>/dev/null || true', { encoding: 'utf-8' });

    const content = `# Pending Changes\n\n## Unstaged\n\`\`\`\n${diff}\n\`\`\`\n\n## Staged\n\`\`\`\n${staged}\n\`\`\`\n`;
    fs.writeFileSync(changesFile, content);

    return { type: 'changes', backed_up: true, file: changesFile };
  } catch (error) {
    return { type: 'changes', backed_up: false, error: error.message };
  }
}

/**
 * Create restoration manifest
 */
async function createRestorationManifest(backups) {
  const manifestFile = path.join(COMPACT_BACKUP_DIR, 'manifest.json');

  const manifest = {
    created: new Date().toISOString(),
    backups: backups.filter(b => b.backed_up),
    instructions: [
      'To restore context after compaction:',
      '1. Read the most recent task backup',
      '2. Review context summary for project state',
      '3. Check architecture decisions for important constraints',
      '4. Review pending changes if any uncommitted work'
    ]
  };

  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  return { file: manifestFile, count: manifest.backups.length };
}

// Run main
main();
