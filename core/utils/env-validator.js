#!/usr/bin/env node
/**
 * Environment Variable Validator
 *
 * Validates and reports on environment variables needed for Grimoires.
 *
 * @version 0.3.0
 */

const fs = require('fs');
const path = require('path');

const GRIMOIRES_HOME = process.env.GRIMOIRES_HOME || path.join(process.env.HOME || '', '.grimoires');
const SCHEMA_PATH = path.join(GRIMOIRES_HOME, 'core', 'config', 'env-schema.yaml');

// Simple YAML parser for our schema format
function parseYaml(content) {
  const result = {
    version: '',
    variables: [],
    groups: {},
    categories: {}
  };

  let currentSection = null;
  let currentItem = null;
  let currentGroup = null;
  let currentCategory = null;
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed === '') continue;

    // Top-level keys
    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      if (trimmed.startsWith('version:')) {
        result.version = trimmed.split(':')[1].trim().replace(/"/g, '');
      } else if (trimmed === 'variables:') {
        currentSection = 'variables';
      } else if (trimmed === 'groups:') {
        currentSection = 'groups';
      } else if (trimmed === 'categories:') {
        currentSection = 'categories';
      }
      continue;
    }

    // Variables section
    if (currentSection === 'variables') {
      if (line.match(/^\s{2}-\s+name:/)) {
        if (currentItem) {
          result.variables.push(currentItem);
        }
        currentItem = {
          name: trimmed.split(':')[1].trim()
        };
      } else if (currentItem && trimmed.includes(':')) {
        const colonIdx = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIdx).trim();
        let value = trimmed.substring(colonIdx + 1).trim();

        // Handle quoted strings
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }

        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(v => v.trim());
        }

        // Handle booleans
        if (value === 'true') value = true;
        if (value === 'false') value = false;

        currentItem[key] = value;
      }
    }

    // Groups section
    if (currentSection === 'groups') {
      if (line.match(/^\s{2}\w+:$/)) {
        currentGroup = trimmed.replace(':', '');
        result.groups[currentGroup] = {
          description: '',
          variables: []
        };
      } else if (currentGroup && trimmed.includes(':')) {
        const colonIdx = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIdx).trim();
        let value = trimmed.substring(colonIdx + 1).trim();

        if (key === 'description') {
          value = value.replace(/"/g, '');
        } else if (key === 'variables') {
          value = value.slice(1, -1).split(',').map(v => v.trim());
        }

        result.groups[currentGroup][key] = value;
      }
    }

    // Categories section
    if (currentSection === 'categories') {
      if (line.match(/^\s{2}\w+:$/)) {
        currentCategory = trimmed.replace(':', '');
        result.categories[currentCategory] = {};
      } else if (currentCategory && trimmed.includes(':')) {
        const colonIdx = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIdx).trim();
        let value = trimmed.substring(colonIdx + 1).trim().replace(/"/g, '');
        result.categories[currentCategory][key] = value;
      }
    }
  }

  // Push last item
  if (currentItem) {
    result.variables.push(currentItem);
  }

  return result;
}

/**
 * Load environment schema
 * @returns {Object} Parsed schema
 */
function loadSchema() {
  // Check local schema first
  const localPath = path.join(process.cwd(), '.grimoires', 'env-schema.yaml');
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

  const content = fs.readFileSync(schemaPath, 'utf-8');
  return parseYaml(content);
}

/**
 * Validate environment variables
 * @param {Object} options - Validation options
 * @returns {Object} Validation results
 */
function validate(options = {}) {
  const { group = 'minimal', strict = false } = options;
  const schema = loadSchema();

  const results = {
    valid: true,
    missing: [],
    invalid: [],
    warnings: [],
    suggestions: [],
    configured: []
  };

  // Get variables for the requested group
  const groupDef = schema.groups[group];
  let variableNames;

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
      } catch (e) {
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
 * @param {string} value - Value to mask
 * @returns {string} Masked value
 */
function maskValue(value) {
  if (!value || value.length < 8) return '****';
  return value.substring(0, 4) + '****' + value.substring(value.length - 4);
}

/**
 * Print validation report
 * @param {Object} results - Validation results
 * @param {Object} options - Print options
 */
function printReport(results, options = {}) {
  const { color = true } = options;

  // ANSI colors
  const c = color ? {
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
 * @param {Object} results - Validation results
 * @returns {string} JSON string
 */
function getJsonReport(results) {
  return JSON.stringify(results, null, 2);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  const options = {
    group: 'minimal',
    strict: false,
    json: false,
    noColor: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--group' && args[i + 1]) {
      options.group = args[++i];
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--no-color') {
      options.noColor = true;
    } else if (arg === '--help') {
      console.log(`
Environment Variable Validator

Usage: env-validator.js [options]

Options:
  --group <name>   Variable group to check (minimal, basic, full)
  --strict         Include optional variables in validation
  --json           Output as JSON
  --no-color       Disable colored output
  --help           Show this help

Groups:
  minimal    Core Grimoires settings only
  basic      Core + Codex + Gemini
  frontend   Core + Codex + Gemini + Stitch
  backend    Core + Codex + Gemini + GitHub
  full       All variables

Examples:
  env-validator.js
  env-validator.js --group full --strict
  env-validator.js --json
`);
      process.exit(0);
    }
  }

  const results = validate({
    group: options.group,
    strict: options.strict
  });

  if (options.json) {
    console.log(getJsonReport(results));
  } else {
    printReport(results, { color: !options.noColor });
  }

  process.exit(results.valid ? 0 : 1);
}

// Export for module use
module.exports = {
  loadSchema,
  validate,
  printReport,
  getJsonReport,
  maskValue
};

// Run if called directly
if (require.main === module) {
  main();
}
