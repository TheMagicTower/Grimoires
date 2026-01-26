#!/usr/bin/env node
/**
 * E2E Tests for Hooks System
 *
 * Integration tests for the complete hooks workflow.
 *
 * @version 0.3.0
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const assert = require('assert');

const GRIMOIRES_ROOT = path.join(__dirname, '..', '..');
const HOOKS_CLI = path.join(GRIMOIRES_ROOT, 'bin', 'grimoires-hooks');
const TEST_CONFIG_DIR = path.join(__dirname, 'fixtures');
const TEST_CONFIG_PATH = path.join(TEST_CONFIG_DIR, 'test-hooks.json');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    testsFailed++;
  }
}

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}

function setup() {
  // Create test fixtures directory
  if (!fs.existsSync(TEST_CONFIG_DIR)) {
    fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
  }

  // Create test hooks configuration
  const testConfig = {
    settings: {
      enabled: true,
      timeout_ms: 5000,
      parallel_hooks: false
    },
    hooks: {
      PreToolUse: [
        {
          id: 'block-rm-rf',
          matcher: 'tool == "Bash" && command matches "rm -rf"',
          action: 'block',
          message: 'Dangerous command blocked'
        },
        {
          id: 'warn-git-push',
          matcher: 'tool == "Bash" && command contains "git push"',
          action: 'warn',
          message: 'Git push detected'
        },
        {
          id: 'allow-safe-commands',
          matcher: 'tool == "Bash"',
          action: 'allow'
        }
      ],
      PostToolUse: [
        {
          id: 'log-writes',
          matcher: 'tool == "Write"',
          action: 'allow'
        }
      ]
    }
  };

  fs.writeFileSync(TEST_CONFIG_PATH, JSON.stringify(testConfig, null, 2));
}

function cleanup() {
  if (fs.existsSync(TEST_CONFIG_DIR)) {
    fs.rmSync(TEST_CONFIG_DIR, { recursive: true });
  }
}

function runHooksCLI(args, input = null) {
  const fullArgs = [...args, '--config', TEST_CONFIG_PATH];

  // Quote arguments that contain spaces or special characters
  const quotedArgs = fullArgs.map(arg => {
    if (arg.includes(' ') || arg.includes('/')) {
      return `'${arg.replace(/'/g, "'\\''")}'`;
    }
    return arg;
  });

  try {
    const result = execSync(`node ${HOOKS_CLI} ${quotedArgs.join(' ')}`, {
      encoding: 'utf-8',
      input: input,
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { exitCode: 0, stdout: result, stderr: '' };
  } catch (error) {
    return {
      exitCode: error.status || 1,
      stdout: error.stdout || '',
      stderr: error.stderr || ''
    };
  }
}

// ============ Main ============

async function main() {
  console.log('Setting up test fixtures...');
  setup();

  try {
    // CLI Basic Tests
    describe('CLI Basic Tests', () => {
      test('--help shows usage information', () => {
        const result = runHooksCLI(['--help']);
        assert.strictEqual(result.exitCode, 0);
        assert.ok(result.stdout.includes('Grimoires Hooks CLI'));
        assert.ok(result.stdout.includes('pre-tool-use'));
      });

      test('missing event returns error', () => {
        const result = runHooksCLI([]);
        assert.strictEqual(result.exitCode, 3);
      });

      test('invalid event returns error', () => {
        const result = runHooksCLI(['invalid-event']);
        assert.strictEqual(result.exitCode, 3);
      });
    });

    // PreToolUse Hook Tests
    describe('PreToolUse Hook Tests', () => {
      test('blocks dangerous rm -rf command', () => {
        const result = runHooksCLI([
          'pre-tool-use',
          '--tool', 'Bash',
          '--command', 'rm -rf /'
        ]);
        assert.strictEqual(result.exitCode, 1, 'Should exit with code 1 (blocked)');
        assert.ok(result.stdout.includes('BLOCKED'), 'Should show BLOCKED message');
      });

      test('warns on git push command', () => {
        const result = runHooksCLI([
          'pre-tool-use',
          '--tool', 'Bash',
          '--command', 'git push origin main'
        ]);
        assert.strictEqual(result.exitCode, 0, 'Should exit with code 0 (allowed with warning)');
        assert.ok(result.stdout.includes('WARNING'), 'Should show WARNING message');
      });

      test('allows safe commands', () => {
        const result = runHooksCLI([
          'pre-tool-use',
          '--tool', 'Bash',
          '--command', 'echo hello'
        ]);
        assert.strictEqual(result.exitCode, 0, 'Should exit with code 0 (allowed)');
      });

      test('allows non-Bash tools', () => {
        const result = runHooksCLI([
          'pre-tool-use',
          '--tool', 'Read',
          '--path', '/some/file.txt'
        ]);
        assert.strictEqual(result.exitCode, 0, 'Should exit with code 0');
      });
    });

    // PostToolUse Hook Tests
    describe('PostToolUse Hook Tests', () => {
      test('processes Write tool events', () => {
        const result = runHooksCLI([
          'post-tool-use',
          '--tool', 'Write',
          '--path', '/src/app.ts',
          '--success', 'true'
        ]);
        assert.strictEqual(result.exitCode, 0);
      });

      test('handles exit codes', () => {
        const result = runHooksCLI([
          'post-tool-use',
          '--tool', 'Bash',
          '--command', 'npm test',
          '--exit-code', '1',
          '--success', 'false'
        ]);
        assert.strictEqual(result.exitCode, 0);
      });
    });

    // JSON Output Tests
    describe('JSON Output Tests', () => {
      test('--json flag outputs valid JSON', () => {
        const result = runHooksCLI([
          'pre-tool-use',
          '--tool', 'Bash',
          '--command', 'echo test',
          '--json'
        ]);
        assert.strictEqual(result.exitCode, 0);

        const json = JSON.parse(result.stdout);
        assert.ok(json.event, 'Should have event field');
        assert.ok(json.timestamp, 'Should have timestamp field');
        assert.ok(Array.isArray(json.executed), 'Should have executed array');
      });

      test('blocked result includes message in JSON', () => {
        const result = runHooksCLI([
          'pre-tool-use',
          '--tool', 'Bash',
          '--command', 'rm -rf /',
          '--json'
        ]);
        assert.strictEqual(result.exitCode, 1);

        const json = JSON.parse(result.stdout);
        assert.strictEqual(json.blocked, true);
        assert.ok(json.messages.length > 0);
      });
    });

    // Stdin Input Tests
    describe('Stdin Input Tests', () => {
      test('accepts JSON input via stdin', () => {
        const input = JSON.stringify({ tool: 'Bash', command: 'echo hello' });
        const result = runHooksCLI(['pre-tool-use'], input);
        assert.strictEqual(result.exitCode, 0);
      });
    });

    // Event Mapping Tests
    describe('Event Mapping Tests', () => {
      test('supports kebab-case events', () => {
        const result = runHooksCLI(['pre-tool-use', '--tool', 'Read', '--path', '/test']);
        assert.strictEqual(result.exitCode, 0);
      });

      test('supports PascalCase events', () => {
        const result = runHooksCLI(['PreToolUse', '--tool', 'Read', '--path', '/test']);
        assert.strictEqual(result.exitCode, 0);
      });

      test('session-start event works', () => {
        const result = runHooksCLI(['session-start']);
        assert.strictEqual(result.exitCode, 0);
      });

      test('session-end event works', () => {
        const result = runHooksCLI(['session-end']);
        assert.strictEqual(result.exitCode, 0);
      });
    });

  } finally {
    console.log('\nCleaning up test fixtures...');
    cleanup();
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`E2E Tests: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('─'.repeat(50));

  process.exit(testsFailed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Test runner error:', error);
  cleanup();
  process.exit(1);
});
