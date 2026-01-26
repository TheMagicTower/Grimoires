#!/usr/bin/env node
/**
 * Generate Settings Handler
 *
 * Automatically generates .claude/settings.local.json
 * based on detected project type and MCP preset.
 *
 * @version 0.3.0
 */

const fs = require('fs');
const path = require('path');

// Use common detect-project utility
const detectProjectPath = path.join(__dirname, '..', '..', 'utils', 'detect-project');
let detectProjectModule;
try {
  detectProjectModule = require(detectProjectPath);
} catch {
  // Fallback if utility not found
  detectProjectModule = null;
}

// Logger utility for consistent logging
const loggerPath = path.join(__dirname, '..', '..', 'utils', 'logger');
let logger;
try {
  const loggerModule = require(loggerPath);
  logger = loggerModule.createLogger('Settings');
} catch {
  // Fallback if logger not found
  logger = {
    info: (msg) => console.error(`[Grimoires:INFO] ${msg}`),
    warn: (msg) => console.error(`[Grimoires:WARN] ${msg}`),
    error: (msg) => console.error(`[Grimoires:ERROR] ${msg}`)
  };
}

const GRIMOIRES_HOME = process.env.GRIMOIRES_HOME || path.join(process.env.HOME || '', '.grimoires');
const TEMPLATES_DIR = path.join(GRIMOIRES_HOME, 'templates', 'settings-templates');
const OUTPUT_DIR = '.claude';
const OUTPUT_FILE = 'settings.local.json';

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 */
function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else if (Array.isArray(source[key])) {
        if (!target[key]) {
          target[key] = source[key];
        } else if (Array.isArray(target[key])) {
          // Merge arrays, avoiding duplicates
          target[key] = [...new Set([...target[key], ...source[key]])];
        }
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Detect project type from file system
 * Uses common utility if available, otherwise fallback inline
 * @returns {string} Project type: frontend, backend, fullstack, or unknown
 */
function detectProjectType() {
  // Use common utility if available
  if (detectProjectModule && detectProjectModule.detectProjectType) {
    return detectProjectModule.detectProjectType();
  }

  // Fallback inline implementation
  if (fs.existsSync('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps['next'] || deps['nuxt'] || deps['remix']) return 'fullstack';
      if (deps['react'] || deps['vue']) return 'frontend';
      if (deps['express'] || deps['fastify']) return 'backend';
    } catch {
      // Ignore parse errors
    }
  }

  if (fs.existsSync('pyproject.toml') || fs.existsSync('go.mod') || fs.existsSync('Cargo.toml')) {
    return 'backend';
  }

  return 'unknown';
}

/**
 * Load a template file
 * @param {string} name - Template name (without .json)
 * @returns {Object|null} Template data or null
 */
function loadTemplate(name) {
  const templatePath = path.join(TEMPLATES_DIR, `${name}.json`);

  if (fs.existsSync(templatePath)) {
    try {
      return JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
    } catch (e) {
      logger.error(`Error loading template ${name}: ${e.message}`);
    }
  }

  return null;
}

/**
 * Load MCP preset
 * @param {string} preset - Preset name (basic, advanced, full, testing)
 * @returns {Object|null} Preset data or null
 */
function loadMcpPreset(preset) {
  const presetPath = path.join(TEMPLATES_DIR, 'mcp-presets', `${preset}.json`);

  if (fs.existsSync(presetPath)) {
    try {
      return JSON.parse(fs.readFileSync(presetPath, 'utf-8'));
    } catch (e) {
      logger.error(`Error loading MCP preset ${preset}: ${e.message}`);
    }
  }

  return null;
}

/**
 * Replace environment variable placeholders
 * @param {Object} obj - Object to process
 * @returns {Object} Processed object
 */
function processEnvVariables(obj) {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
      // Keep as-is for template output
      result[key] = value;
    } else if (isObject(value)) {
      result[key] = processEnvVariables(value);
    } else if (Array.isArray(value)) {
      result[key] = value;
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Clean up internal template fields
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
function cleanTemplateFields(obj) {
  const internalFields = [
    '$schema',
    'description',
    'version',
    'preset',
    'required_env',
    'optional_env',
    'recommended_for',
    'familiars',
    'rules'
  ];

  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!internalFields.includes(key)) {
      if (isObject(value)) {
        result[key] = cleanTemplateFields(value);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Generate settings.local.json
 * @param {Object} options - Generation options
 * @returns {Object} Generated settings
 */
function generateSettings(options = {}) {
  const {
    type = detectProjectType(),
    mcpPreset = 'basic',
    preserveExisting = true
  } = options;

  // Load base template
  let settings = loadTemplate('base') || {
    permissions: { allow: [], deny: [] },
    mcpServers: {}
  };

  // Merge type-specific template
  const typeTemplate = loadTemplate(type);
  if (typeTemplate) {
    settings = deepMerge(settings, typeTemplate);
  }

  // Merge MCP preset
  const mcpTemplate = loadMcpPreset(mcpPreset);
  if (mcpTemplate) {
    settings = deepMerge(settings, mcpTemplate);
  }

  // Clean up internal fields
  settings = cleanTemplateFields(settings);

  // Load and merge existing settings if present
  if (preserveExisting) {
    const existingPath = path.join(OUTPUT_DIR, OUTPUT_FILE);
    if (fs.existsSync(existingPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
        // User settings take precedence
        settings = deepMerge(settings, existing);
      } catch (e) {
        logger.warn(`Error loading existing settings: ${e.message}`);
      }
    }
  }

  return settings;
}

/**
 * Write settings to file
 * @param {Object} settings - Settings to write
 * @param {Object} options - Options
 */
function writeSettings(settings, options = {}) {
  const { backup = true } = options;

  // Create .claude directory if needed
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);

  // Backup existing
  if (backup && fs.existsSync(outputPath)) {
    const backupPath = `${outputPath}.backup.${Date.now()}`;
    fs.copyFileSync(outputPath, backupPath);
  }

  // Write new settings
  fs.writeFileSync(outputPath, JSON.stringify(settings, null, 2));

  return outputPath;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const options = {
    type: null,
    mcpPreset: 'basic',
    dryRun: false,
    preserveExisting: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--type' && args[i + 1]) {
      options.type = args[++i];
    } else if (arg === '--mcp-preset' && args[i + 1]) {
      options.mcpPreset = args[++i];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--force') {
      options.preserveExisting = false;
    } else if (arg === '--help') {
      console.log(`
Generate Settings Handler

Usage: generate-settings.js [options]

Options:
  --type <type>          Project type: frontend, backend, fullstack
  --mcp-preset <preset>  MCP preset: basic, advanced, full, testing
  --dry-run              Preview without writing
  --force                Overwrite existing without merging
  --help                 Show this help

Examples:
  generate-settings.js
  generate-settings.js --type backend --mcp-preset advanced
  generate-settings.js --dry-run
`);
      process.exit(0);
    }
  }

  try {
    const detectedType = options.type || detectProjectType();
    logger.info(`Detected project type: ${detectedType}`);
    logger.info(`Using MCP preset: ${options.mcpPreset}`);

    const settings = generateSettings({
      type: detectedType,
      mcpPreset: options.mcpPreset,
      preserveExisting: options.preserveExisting
    });

    if (options.dryRun) {
      console.log(JSON.stringify(settings, null, 2));
    } else {
      const outputPath = writeSettings(settings);

      console.log(JSON.stringify({
        status: 'success',
        message: `Generated ${outputPath}`,
        path: outputPath,
        type: detectedType,
        mcpPreset: options.mcpPreset
      }));
    }
  } catch (error) {
    console.error(JSON.stringify({
      status: 'error',
      message: error.message
    }));
    process.exit(1);
  }
}

// Export for module use
module.exports = {
  detectProjectType,
  generateSettings,
  writeSettings,
  loadTemplate,
  loadMcpPreset,
  deepMerge
};

// Run if called directly
if (require.main === module) {
  main();
}
