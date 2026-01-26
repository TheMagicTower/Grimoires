#!/usr/bin/env node
/**
 * Generate CLAUDE.md Handler
 *
 * Automatically generates a CLAUDE.md file for a project
 * based on detected project type and configuration.
 *
 * @version 0.3.0
 */

const fs = require('fs');
const path = require('path');

const GRIMOIRES_HOME = process.env.GRIMOIRES_HOME || path.join(process.env.HOME || '', '.grimoires');
const TEMPLATES_DIR = path.join(GRIMOIRES_HOME, 'templates');

/**
 * Detect project information from file system
 * @returns {Object} Project metadata
 */
function detectProjectInfo() {
  const info = {
    name: path.basename(process.cwd()),
    type: 'unknown',
    framework: null,
    language: null,
    packageManager: null,
    testFramework: null,
    linter: null,
    formatter: null,
    hasDocker: false,
    hasCI: null,
    description: '',
    version: '0.0.0'
  };

  // Detect from package.json
  if (fs.existsSync('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      info.name = pkg.name || info.name;
      info.description = pkg.description || '';
      info.version = pkg.version || info.version;

      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      // Detect framework
      if (deps['next']) {
        info.framework = 'Next.js';
        info.type = 'fullstack';
      } else if (deps['nuxt']) {
        info.framework = 'Nuxt';
        info.type = 'fullstack';
      } else if (deps['remix']) {
        info.framework = 'Remix';
        info.type = 'fullstack';
      } else if (deps['react']) {
        info.framework = 'React';
        info.type = 'frontend';
      } else if (deps['vue']) {
        info.framework = 'Vue';
        info.type = 'frontend';
      } else if (deps['svelte'] || deps['@sveltejs/kit']) {
        info.framework = deps['@sveltejs/kit'] ? 'SvelteKit' : 'Svelte';
        info.type = deps['@sveltejs/kit'] ? 'fullstack' : 'frontend';
      } else if (deps['angular']) {
        info.framework = 'Angular';
        info.type = 'frontend';
      } else if (deps['express']) {
        info.framework = 'Express';
        info.type = 'backend';
      } else if (deps['fastify']) {
        info.framework = 'Fastify';
        info.type = 'backend';
      } else if (deps['@nestjs/core']) {
        info.framework = 'NestJS';
        info.type = 'backend';
      } else if (deps['hono']) {
        info.framework = 'Hono';
        info.type = 'backend';
      } else if (deps['koa']) {
        info.framework = 'Koa';
        info.type = 'backend';
      }

      // Detect language
      if (deps['typescript'] || fs.existsSync('tsconfig.json')) {
        info.language = 'TypeScript';
      } else {
        info.language = 'JavaScript';
      }

      // Detect test framework
      if (deps['vitest']) {
        info.testFramework = 'Vitest';
      } else if (deps['jest']) {
        info.testFramework = 'Jest';
      } else if (deps['mocha']) {
        info.testFramework = 'Mocha';
      }

      // Detect linter
      if (deps['eslint'] || fs.existsSync('.eslintrc') || fs.existsSync('.eslintrc.js') || fs.existsSync('eslint.config.js')) {
        info.linter = 'ESLint';
      } else if (deps['biome'] || deps['@biomejs/biome']) {
        info.linter = 'Biome';
      }

      // Detect formatter
      if (deps['prettier']) {
        info.formatter = 'Prettier';
      } else if (deps['biome'] || deps['@biomejs/biome']) {
        info.formatter = 'Biome';
      }

    } catch (e) {
      // Ignore parse errors
    }
  }

  // Detect package manager
  if (fs.existsSync('bun.lockb')) {
    info.packageManager = 'bun';
  } else if (fs.existsSync('pnpm-lock.yaml')) {
    info.packageManager = 'pnpm';
  } else if (fs.existsSync('yarn.lock')) {
    info.packageManager = 'yarn';
  } else if (fs.existsSync('package-lock.json')) {
    info.packageManager = 'npm';
  }

  // Python projects
  if (fs.existsSync('pyproject.toml') || fs.existsSync('requirements.txt')) {
    info.language = 'Python';
    info.type = info.type || 'backend';

    if (fs.existsSync('pyproject.toml')) {
      try {
        const content = fs.readFileSync('pyproject.toml', 'utf-8');
        if (content.includes('fastapi')) info.framework = 'FastAPI';
        else if (content.includes('django')) info.framework = 'Django';
        else if (content.includes('flask')) info.framework = 'Flask';

        if (content.includes('pytest')) info.testFramework = 'pytest';
      } catch (e) {}
    }
  }

  // Go projects
  if (fs.existsSync('go.mod')) {
    info.language = 'Go';
    info.type = info.type || 'backend';

    try {
      const content = fs.readFileSync('go.mod', 'utf-8');
      if (content.includes('gin-gonic/gin')) info.framework = 'Gin';
      else if (content.includes('gofiber/fiber')) info.framework = 'Fiber';
      else if (content.includes('labstack/echo')) info.framework = 'Echo';
    } catch (e) {}
  }

  // Rust projects
  if (fs.existsSync('Cargo.toml')) {
    info.language = 'Rust';
    info.type = info.type || 'backend';

    try {
      const content = fs.readFileSync('Cargo.toml', 'utf-8');
      if (content.includes('actix-web')) info.framework = 'Actix';
      else if (content.includes('axum')) info.framework = 'Axum';
      else if (content.includes('rocket')) info.framework = 'Rocket';
    } catch (e) {}
  }

  // Docker
  info.hasDocker = fs.existsSync('Dockerfile') || fs.existsSync('docker-compose.yml') || fs.existsSync('docker-compose.yaml');

  // CI/CD
  if (fs.existsSync('.github/workflows')) {
    info.hasCI = 'GitHub Actions';
  } else if (fs.existsSync('.gitlab-ci.yml')) {
    info.hasCI = 'GitLab CI';
  } else if (fs.existsSync('Jenkinsfile')) {
    info.hasCI = 'Jenkins';
  } else if (fs.existsSync('.circleci')) {
    info.hasCI = 'CircleCI';
  }

  return info;
}

/**
 * Get the directory structure
 * @param {string} dir - Directory to scan
 * @param {number} depth - Current depth
 * @param {number} maxDepth - Maximum depth
 * @returns {string} Tree representation
 */
function getDirectoryStructure(dir = '.', depth = 0, maxDepth = 3) {
  const ignore = ['node_modules', '.git', 'dist', 'build', '.next', '.cache', '__pycache__', 'venv', '.venv', 'target'];
  const items = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (ignore.includes(entry.name) || entry.name.startsWith('.')) continue;

      const indent = '│   '.repeat(depth);
      const prefix = depth === 0 ? '' : '├── ';

      if (entry.isDirectory() && depth < maxDepth) {
        items.push(`${indent}${prefix}${entry.name}/`);
        const subItems = getDirectoryStructure(path.join(dir, entry.name), depth + 1, maxDepth);
        if (subItems) items.push(subItems);
      } else if (entry.isDirectory()) {
        items.push(`${indent}${prefix}${entry.name}/`);
      }
    }
  } catch (e) {
    // Ignore permission errors
  }

  return items.join('\n');
}

/**
 * Load template content
 * @param {string} templateName - Template file name
 * @returns {string|null} Template content or null
 */
function loadTemplate(templateName) {
  const templatePath = path.join(TEMPLATES_DIR, templateName);

  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf-8');
  }

  // Try claude-templates subdirectory
  const claudeTemplatePath = path.join(TEMPLATES_DIR, 'claude-templates', templateName);
  if (fs.existsSync(claudeTemplatePath)) {
    return fs.readFileSync(claudeTemplatePath, 'utf-8');
  }

  return null;
}

/**
 * Replace template variables
 * @param {string} template - Template content
 * @param {Object} vars - Variables to replace
 * @returns {string} Processed content
 */
function replaceVariables(template, vars) {
  let result = template;

  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`;
    const displayValue = value || 'Not specified';
    result = result.split(placeholder).join(displayValue);
  }

  // Remove unreplaced placeholders
  result = result.replace(/\{\{[A-Z_]+\}\}/g, 'TBD');

  return result;
}

/**
 * Generate CLAUDE.md content
 * @param {Object} options - Generation options
 * @returns {string} Generated content
 */
function generateClaudeMd(options = {}) {
  const info = detectProjectInfo();
  const structure = getDirectoryStructure();

  // Load base template
  let template = loadTemplate('CLAUDE.md.template');
  if (!template) {
    // Fallback template
    template = `# ${info.name}

## Overview
${info.description || 'A ' + (info.type || 'project') + ' project.'}

## Tech Stack
- **Language**: ${info.language || 'Not detected'}
- **Framework**: ${info.framework || 'Not detected'}
- **Package Manager**: ${info.packageManager || 'Not detected'}

## Project Structure
\`\`\`
${structure || 'Unable to detect structure'}
\`\`\`

## Development
\`\`\`bash
${info.packageManager || 'npm'} install
${info.packageManager || 'npm'} run dev
\`\`\`
`;
  }

  // Load type-specific template
  const typeTemplate = loadTemplate(`${info.type}.md`);

  // Prepare variables
  const vars = {
    PROJECT_NAME: info.name,
    PROJECT_DESCRIPTION: info.description || `A ${info.type} project built with ${info.framework || info.language}.`,
    PROJECT_TYPE: info.type,
    PROJECT_VERSION: info.version,
    FRAMEWORK: info.framework || 'Not detected',
    FRAMEWORK_VERSION: '',
    LANGUAGE: info.language || 'Not detected',
    LANGUAGE_VERSION: '',
    PACKAGE_MANAGER: info.packageManager || 'npm',
    TEST_FRAMEWORK: info.testFramework || 'Not configured',
    LINTER: info.linter || 'Not configured',
    FORMATTER: info.formatter || 'Not configured',
    FILE_STRUCTURE: '```\n' + structure + '\n```',
    TECH_STACK: generateTechStackSection(info),
    ARCHITECTURE: generateArchitectureSection(info),
    CODING_GUIDELINES: generateCodingGuidelinesSection(info),
    PATTERNS: generatePatternsSection(info),
    TESTING: generateTestingSection(info),
    WORKFLOW: generateWorkflowSection(info),
    DEPLOYMENT: generateDeploymentSection(info),
    TODOS: '- [ ] Add project-specific documentation'
  };

  // Apply variables to main template
  let content = replaceVariables(template, vars);

  // Append type-specific content if available
  if (typeTemplate && options.includeTypeTemplate !== false) {
    content += '\n---\n\n';
    content += replaceVariables(typeTemplate, vars);
  }

  return content;
}

/**
 * Generate tech stack section
 */
function generateTechStackSection(info) {
  const lines = [];

  if (info.language) lines.push(`- **Language**: ${info.language}`);
  if (info.framework) lines.push(`- **Framework**: ${info.framework}`);
  if (info.packageManager) lines.push(`- **Package Manager**: ${info.packageManager}`);
  if (info.testFramework) lines.push(`- **Testing**: ${info.testFramework}`);
  if (info.linter) lines.push(`- **Linting**: ${info.linter}`);
  if (info.formatter) lines.push(`- **Formatting**: ${info.formatter}`);
  if (info.hasDocker) lines.push(`- **Container**: Docker`);
  if (info.hasCI) lines.push(`- **CI/CD**: ${info.hasCI}`);

  return lines.join('\n') || 'Not detected';
}

/**
 * Generate architecture section
 */
function generateArchitectureSection(info) {
  if (info.type === 'fullstack') {
    return `This is a fullstack ${info.framework || ''} application with integrated frontend and backend.`;
  } else if (info.type === 'frontend') {
    return `This is a frontend ${info.framework || ''} application.`;
  } else if (info.type === 'backend') {
    return `This is a backend ${info.framework || ''} application.`;
  }
  return 'Architecture not detected. Please document manually.';
}

/**
 * Generate coding guidelines section
 */
function generateCodingGuidelinesSection(info) {
  const lines = [];

  if (info.language === 'TypeScript') {
    lines.push('- Use strict TypeScript types');
    lines.push('- Avoid `any` type where possible');
    lines.push('- Define interfaces for data structures');
  }

  if (info.linter) {
    lines.push(`- Follow ${info.linter} rules`);
  }

  if (info.formatter) {
    lines.push(`- Format code with ${info.formatter}`);
  }

  lines.push('- Write meaningful variable and function names');
  lines.push('- Keep functions small and focused');
  lines.push('- Document complex logic with comments');

  return lines.join('\n');
}

/**
 * Generate patterns section
 */
function generatePatternsSection(info) {
  if (info.framework === 'Next.js') {
    return `- Use Server Components by default
- Use Client Components only for interactivity
- Use Server Actions for mutations
- Use Route Handlers for API endpoints`;
  } else if (info.framework === 'React') {
    return `- Use functional components with hooks
- Separate container and presentational components
- Use custom hooks for reusable logic`;
  } else if (info.type === 'backend') {
    return `- Use service layer for business logic
- Use repository pattern for data access
- Handle errors centrally`;
  }

  return 'Document important patterns here.';
}

/**
 * Generate testing section
 */
function generateTestingSection(info) {
  if (info.testFramework) {
    return `- **Framework**: ${info.testFramework}
- Run tests: \`${info.packageManager || 'npm'} test\`
- Target coverage: 80%+`;
  }
  return 'Testing not configured.';
}

/**
 * Generate workflow section
 */
function generateWorkflowSection(info) {
  const pm = info.packageManager || 'npm';
  return `1. Install dependencies: \`${pm} install\`
2. Start development: \`${pm} run dev\`
3. Run tests: \`${pm} test\`
4. Build for production: \`${pm} run build\``;
}

/**
 * Generate deployment section
 */
function generateDeploymentSection(info) {
  if (info.hasDocker) {
    return `Docker-based deployment available.
\`\`\`bash
docker build -t ${info.name} .
docker run -p 3000:3000 ${info.name}
\`\`\``;
  }
  return 'Deployment process not documented.';
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const outputPath = args[0] || 'CLAUDE.md';
  const update = args.includes('--update');

  // Check if file exists and not updating
  if (fs.existsSync(outputPath) && !update) {
    console.log(JSON.stringify({
      status: 'skipped',
      message: 'CLAUDE.md already exists. Use --update to regenerate.',
      path: outputPath
    }));
    return;
  }

  try {
    const content = generateClaudeMd({
      includeTypeTemplate: true
    });

    if (args.includes('--dry-run')) {
      console.log(content);
    } else {
      fs.writeFileSync(outputPath, content, 'utf-8');
      console.log(JSON.stringify({
        status: 'success',
        message: `Generated ${outputPath}`,
        path: outputPath
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
  detectProjectInfo,
  generateClaudeMd,
  getDirectoryStructure
};

// Run if called directly
if (require.main === module) {
  main();
}
