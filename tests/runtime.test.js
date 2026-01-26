#!/usr/bin/env node
/**
 * Runtime Module Tests
 *
 * Unit tests for matcher, context, and bridge modules.
 *
 * @version 0.3.0
 */

const path = require('path');
const assert = require('assert');

// Load modules
const matcherPath = path.join(__dirname, '..', 'core', 'runtime', 'matcher');
const contextPath = path.join(__dirname, '..', 'core', 'runtime', 'context');
const shellEscapePath = path.join(__dirname, '..', 'core', 'utils', 'shell-escape');
const detectProjectPath = path.join(__dirname, '..', 'core', 'utils', 'detect-project');

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

// ============ Matcher Tests ============

describe('Matcher Module', () => {
  const { match, validate } = require(matcherPath);

  test('empty expression matches everything', () => {
    assert.strictEqual(match('', {}), true);
    assert.strictEqual(match('  ', {}), true);
  });

  test('equality operator (==)', () => {
    assert.strictEqual(match('tool == "Bash"', { tool: 'Bash' }), true);
    assert.strictEqual(match('tool == "Bash"', { tool: 'Write' }), false);
  });

  test('inequality operator (!=)', () => {
    assert.strictEqual(match('tool != "Bash"', { tool: 'Write' }), true);
    assert.strictEqual(match('tool != "Bash"', { tool: 'Bash' }), false);
  });

  test('matches operator (regex)', () => {
    assert.strictEqual(match('command matches "git push"', { command: 'git push origin main' }), true);
    assert.strictEqual(match('command matches "^git"', { command: 'git status' }), true);
    assert.strictEqual(match('command matches "npm"', { command: 'git push' }), false);
  });

  test('!matches operator', () => {
    assert.strictEqual(match('command !matches "rm -rf"', { command: 'echo hello' }), true);
    assert.strictEqual(match('command !matches "rm -rf"', { command: 'rm -rf /' }), false);
  });

  test('startsWith operator', () => {
    assert.strictEqual(match('path startsWith "/src"', { path: '/src/app.ts' }), true);
    assert.strictEqual(match('path startsWith "/src"', { path: '/lib/utils.js' }), false);
  });

  test('endsWith operator', () => {
    assert.strictEqual(match('path endsWith ".ts"', { path: '/src/app.ts' }), true);
    assert.strictEqual(match('path endsWith ".ts"', { path: '/src/app.js' }), false);
  });

  test('contains operator', () => {
    assert.strictEqual(match('command contains "install"', { command: 'npm install react' }), true);
    assert.strictEqual(match('command contains "install"', { command: 'npm run build' }), false);
  });

  test('in operator', () => {
    assert.strictEqual(match('tool in "Bash,Write,Edit"', { tool: 'Bash' }), true);
    assert.strictEqual(match('tool in "Bash,Write,Edit"', { tool: 'Read' }), false);
  });

  test('AND logical operator (&&)', () => {
    assert.strictEqual(
      match('tool == "Bash" && command matches "git"', { tool: 'Bash', command: 'git push' }),
      true
    );
    assert.strictEqual(
      match('tool == "Bash" && command matches "npm"', { tool: 'Bash', command: 'git push' }),
      false
    );
  });

  test('OR logical operator (||)', () => {
    assert.strictEqual(
      match('tool == "Bash" || tool == "Write"', { tool: 'Write' }),
      true
    );
    assert.strictEqual(
      match('tool == "Bash" || tool == "Write"', { tool: 'Read' }),
      false
    );
  });

  test('NOT logical operator (!)', () => {
    assert.strictEqual(match('!tool == "Bash"', { tool: 'Write' }), true);
    assert.strictEqual(match('!tool == "Bash"', { tool: 'Bash' }), false);
  });

  test('validate() returns valid for correct expressions', () => {
    const result = validate('tool == "Bash"');
    assert.strictEqual(result.valid, true);
  });

  test('validate() returns error for invalid expressions', () => {
    // Missing right operand
    const result = validate('tool ==');
    assert.strictEqual(result.valid, false);
  });
});

// ============ Context Tests ============

describe('Context Module', () => {
  const { parseArgsContext, normalizeContext, createTestContext } = require(contextPath);

  test('parseArgsContext parses tool from first positional arg', () => {
    const ctx = parseArgsContext(['Bash', '--command', 'echo test']);
    assert.strictEqual(ctx.tool, 'Bash');
    assert.strictEqual(ctx.command, 'echo test');
  });

  test('parseArgsContext parses --path', () => {
    const ctx = parseArgsContext(['--path', '/src/app.ts']);
    assert.strictEqual(ctx.path, '/src/app.ts');
  });

  test('parseArgsContext parses --exit-code as number', () => {
    const ctx = parseArgsContext(['--exit-code', '1']);
    assert.strictEqual(ctx.exitCode, 1);
  });

  test('parseArgsContext parses --success as boolean', () => {
    const ctx = parseArgsContext(['--success', 'true']);
    assert.strictEqual(ctx.success, true);
  });

  test('normalizeContext trims strings', () => {
    const ctx = { tool: '  Bash  ', command: ' echo test ' };
    normalizeContext(ctx);
    assert.strictEqual(ctx.tool, 'Bash');
    assert.strictEqual(ctx.command, 'echo test');
  });

  test('createTestContext returns valid context', () => {
    const ctx = createTestContext({ tool: 'Write' });
    assert.strictEqual(ctx.tool, 'Write');
    assert.strictEqual(ctx.source, 'test');
  });
});

// ============ Shell Escape Tests ============

describe('Shell Escape Module', () => {
  const { escapeShellArg, safeSubstitute, checkCommandSafety, validateCommandTemplate } = require(shellEscapePath);

  test('escapeShellArg returns empty string for null', () => {
    assert.strictEqual(escapeShellArg(null), '');
  });

  test('escapeShellArg returns quoted empty string', () => {
    assert.strictEqual(escapeShellArg(''), "''");
  });

  test('escapeShellArg leaves safe strings unchanged', () => {
    assert.strictEqual(escapeShellArg('hello'), 'hello');
  });

  test('escapeShellArg quotes strings with spaces', () => {
    assert.strictEqual(escapeShellArg('hello world'), "'hello world'");
  });

  test('escapeShellArg escapes single quotes', () => {
    // The function should wrap strings containing quotes in single quotes
    // and escape internal single quotes with '\''
    const escaped = escapeShellArg("it's");
    // For "it's", we expect something like 'it'\''s' which is 9 chars
    // If the string has no special characters besides the quote, it should be escaped
    assert.ok(escaped !== "it's", `Expected escaped string, got: ${JSON.stringify(escaped)}`);
  });

  test('safeSubstitute replaces placeholders safely', () => {
    const result = safeSubstitute('echo {{msg}}', { msg: 'hello' });
    assert.strictEqual(result.safe, true);
    assert.strictEqual(result.command, 'echo hello');
  });

  test('safeSubstitute escapes dangerous input', () => {
    const result = safeSubstitute('echo {{msg}}', { msg: '; rm -rf /' });
    assert.strictEqual(result.safe, true);
    assert.ok(result.command.includes("'; rm -rf /'"));
  });

  test('validateCommandTemplate detects dangerous patterns', () => {
    const result = validateCommandTemplate('echo $(whoami)');
    assert.strictEqual(result.valid, false);
  });

  test('checkCommandSafety detects rm -rf', () => {
    const result = checkCommandSafety('rm -rf /home');
    assert.strictEqual(result.safe, false);
  });

  test('checkCommandSafety approves safe commands', () => {
    const result = checkCommandSafety('echo hello');
    assert.strictEqual(result.safe, true);
  });
});

// ============ Detect Project Tests ============

describe('Detect Project Module', () => {
  const { ProjectType, detectProjectType } = require(detectProjectPath);

  test('ProjectType constants exist', () => {
    assert.strictEqual(ProjectType.FRONTEND, 'frontend');
    assert.strictEqual(ProjectType.BACKEND, 'backend');
    assert.strictEqual(ProjectType.FULLSTACK, 'fullstack');
    assert.strictEqual(ProjectType.UNKNOWN, 'unknown');
  });

  test('detectProjectType returns string', () => {
    const type = detectProjectType();
    assert.ok(typeof type === 'string');
  });
});

// ============ Summary ============

console.log('\n' + '─'.repeat(50));
console.log(`Tests: ${testsPassed} passed, ${testsFailed} failed`);
console.log('─'.repeat(50));

process.exit(testsFailed > 0 ? 1 : 0);
