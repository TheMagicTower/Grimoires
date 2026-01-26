#!/usr/bin/env node
/**
 * Session Start Handler
 *
 * Executes when a Claude Code session begins.
 * Loads previous context and prepares the environment.
 *
 * @version 0.3.0
 */

const fs = require('fs');
const path = require('path');

const SERENA_DIR = '.serena/memories';
const GRIMOIRE_CONFIG = 'grimoire.yaml';

/**
 * Main handler function
 */
async function main() {
  const context = {
    timestamp: new Date().toISOString(),
    project: {},
    memory: {},
    environment: {}
  };

  try {
    // 1. Load Serena memories (previous context)
    context.memory = await loadSerenaMemories();

    // 2. Detect project type and configuration
    context.project = await detectProjectContext();

    // 3. Load grimoire configuration
    context.grimoire = await loadGrimoireConfig();

    // 4. Detect environment
    context.environment = detectEnvironment();

    // 5. Output context for Claude
    console.log(JSON.stringify({
      status: 'success',
      context
    }, null, 2));

  } catch (error) {
    console.error(JSON.stringify({
      status: 'error',
      error: error.message,
      context
    }, null, 2));
    process.exit(1);
  }
}

/**
 * Load memories from Serena MCP
 */
async function loadSerenaMemories() {
  const memories = {};
  const memoryFiles = [
    'project-context.md',
    'architecture-decisions.md',
    'current-task.md',
    'learned-patterns.md'
  ];

  for (const file of memoryFiles) {
    const filePath = path.join(SERENA_DIR, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const key = file.replace('.md', '').replace(/-/g, '_');
      memories[key] = {
        loaded: true,
        summary: extractSummary(content),
        lastModified: fs.statSync(filePath).mtime.toISOString()
      };
    }
  }

  return memories;
}

/**
 * Extract summary from markdown content
 */
function extractSummary(content) {
  const lines = content.split('\n').filter(l => l.trim());
  const summaryLines = lines.slice(0, 5);
  return summaryLines.join('\n');
}

/**
 * Detect project type and package manager
 */
async function detectProjectContext() {
  const project = {
    type: 'unknown',
    framework: null,
    packageManager: null,
    language: null
  };

  // Detect package manager
  if (fs.existsSync('bun.lockb')) {
    project.packageManager = 'bun';
  } else if (fs.existsSync('pnpm-lock.yaml')) {
    project.packageManager = 'pnpm';
  } else if (fs.existsSync('yarn.lock')) {
    project.packageManager = 'yarn';
  } else if (fs.existsSync('package-lock.json')) {
    project.packageManager = 'npm';
  }

  // Detect from package.json
  if (fs.existsSync('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      // Detect framework
      if (deps['next']) {
        project.framework = 'nextjs';
        project.type = 'fullstack';
      } else if (deps['nuxt']) {
        project.framework = 'nuxt';
        project.type = 'fullstack';
      } else if (deps['react']) {
        project.framework = 'react';
        project.type = 'frontend';
      } else if (deps['vue']) {
        project.framework = 'vue';
        project.type = 'frontend';
      } else if (deps['svelte']) {
        project.framework = 'svelte';
        project.type = 'frontend';
      } else if (deps['express'] || deps['fastify'] || deps['nestjs']) {
        project.framework = deps['express'] ? 'express' : (deps['fastify'] ? 'fastify' : 'nestjs');
        project.type = 'backend';
      }

      // Detect language
      if (deps['typescript'] || fs.existsSync('tsconfig.json')) {
        project.language = 'typescript';
      } else {
        project.language = 'javascript';
      }

    } catch (e) {
      // Ignore parse errors
    }
  }

  // Check for Python projects
  if (fs.existsSync('pyproject.toml') || fs.existsSync('requirements.txt')) {
    project.language = 'python';
    project.type = project.type || 'backend';
  }

  // Check for Go projects
  if (fs.existsSync('go.mod')) {
    project.language = 'go';
    project.type = project.type || 'backend';
  }

  // Check for Rust projects
  if (fs.existsSync('Cargo.toml')) {
    project.language = 'rust';
    project.type = project.type || 'backend';
  }

  return project;
}

/**
 * Load grimoire.yaml configuration
 */
async function loadGrimoireConfig() {
  if (!fs.existsSync(GRIMOIRE_CONFIG)) {
    return { exists: false };
  }

  try {
    const content = fs.readFileSync(GRIMOIRE_CONFIG, 'utf-8');
    return {
      exists: true,
      raw: content.substring(0, 500) // First 500 chars for summary
    };
  } catch (e) {
    return { exists: true, error: e.message };
  }
}

/**
 * Detect environment information
 */
function detectEnvironment() {
  return {
    node: process.version,
    platform: process.platform,
    cwd: process.cwd(),
    user: process.env.USER || process.env.USERNAME,
    shell: process.env.SHELL || process.env.ComSpec,
    isGitRepo: fs.existsSync('.git'),
    hasClaude: fs.existsSync('.claude')
  };
}

// Run main
main();
