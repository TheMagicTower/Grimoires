/**
 * Project Detection Utility
 *
 * Common utility for detecting project type, framework, and configuration.
 * Used by generate-claude-md.js, generate-settings.js, and other handlers.
 *
 * @version 0.3.1
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Project types
 */
export const ProjectType = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  FULLSTACK: 'fullstack',
  UNKNOWN: 'unknown'
} as const;

export type ProjectTypeValue = typeof ProjectType[keyof typeof ProjectType];

export interface PackageJson {
  name?: string;
  version?: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface ProjectInfo {
  name: string;
  type: ProjectTypeValue;
  framework: string | null;
  language: string | null;
  packageManager: string | null;
  testFramework: string | null;
  linter: string | null;
  formatter: string | null;
  hasDocker: boolean;
  hasCI: string | null;
  description: string;
  version: string;
}

/**
 * Detect project type from file system
 * @param cwd - Working directory (defaults to process.cwd())
 * @returns Project type: frontend, backend, fullstack, or unknown
 */
export function detectProjectType(cwd: string = process.cwd()): ProjectTypeValue {
  const exists = (file: string): boolean => fs.existsSync(path.join(cwd, file));
  const readJson = <T>(file: string): T | null => {
    try {
      return JSON.parse(fs.readFileSync(path.join(cwd, file), 'utf-8')) as T;
    } catch {
      return null;
    }
  };

  // Check package.json
  if (exists('package.json')) {
    const pkg = readJson<PackageJson>('package.json');
    if (pkg) {
      const deps: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };

      // Fullstack frameworks
      if (deps['next'] || deps['nuxt'] || deps['remix'] || deps['@sveltejs/kit']) {
        return ProjectType.FULLSTACK;
      }

      // Frontend frameworks
      if (deps['react'] || deps['vue'] || deps['svelte'] || deps['@angular/core']) {
        // Check for backend
        if (deps['express'] || deps['fastify'] || deps['@nestjs/core']) {
          return ProjectType.FULLSTACK;
        }
        return ProjectType.FRONTEND;
      }

      // Backend frameworks
      if (deps['express'] || deps['fastify'] || deps['@nestjs/core'] || deps['koa'] || deps['hono']) {
        return ProjectType.BACKEND;
      }
    }
  }

  // Check Python
  if (exists('pyproject.toml') || exists('requirements.txt')) {
    return ProjectType.BACKEND;
  }

  // Check Go
  if (exists('go.mod')) {
    return ProjectType.BACKEND;
  }

  // Check Rust
  if (exists('Cargo.toml')) {
    return ProjectType.BACKEND;
  }

  return ProjectType.UNKNOWN;
}

/**
 * Detect comprehensive project information
 * @param cwd - Working directory
 * @returns Project metadata
 */
export function detectProjectInfo(cwd: string = process.cwd()): ProjectInfo {
  const exists = (file: string): boolean => fs.existsSync(path.join(cwd, file));
  const readFile = (file: string): string | null => {
    try {
      return fs.readFileSync(path.join(cwd, file), 'utf-8');
    } catch {
      return null;
    }
  };
  const readJson = <T>(file: string): T | null => {
    try {
      return JSON.parse(fs.readFileSync(path.join(cwd, file), 'utf-8')) as T;
    } catch {
      return null;
    }
  };

  const info: ProjectInfo = {
    name: path.basename(cwd),
    type: ProjectType.UNKNOWN,
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
  const pkg = readJson<PackageJson>('package.json');
  if (pkg) {
    info.name = pkg.name || info.name;
    info.description = pkg.description || '';
    info.version = pkg.version || info.version;

    const deps: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };

    // Detect framework
    if (deps['next']) {
      info.framework = 'Next.js';
      info.type = ProjectType.FULLSTACK;
    } else if (deps['nuxt']) {
      info.framework = 'Nuxt';
      info.type = ProjectType.FULLSTACK;
    } else if (deps['remix']) {
      info.framework = 'Remix';
      info.type = ProjectType.FULLSTACK;
    } else if (deps['react']) {
      info.framework = 'React';
      info.type = ProjectType.FRONTEND;
    } else if (deps['vue']) {
      info.framework = 'Vue';
      info.type = ProjectType.FRONTEND;
    } else if (deps['svelte'] || deps['@sveltejs/kit']) {
      info.framework = deps['@sveltejs/kit'] ? 'SvelteKit' : 'Svelte';
      info.type = deps['@sveltejs/kit'] ? ProjectType.FULLSTACK : ProjectType.FRONTEND;
    } else if (deps['angular']) {
      info.framework = 'Angular';
      info.type = ProjectType.FRONTEND;
    } else if (deps['express']) {
      info.framework = 'Express';
      info.type = ProjectType.BACKEND;
    } else if (deps['fastify']) {
      info.framework = 'Fastify';
      info.type = ProjectType.BACKEND;
    } else if (deps['@nestjs/core']) {
      info.framework = 'NestJS';
      info.type = ProjectType.BACKEND;
    } else if (deps['hono']) {
      info.framework = 'Hono';
      info.type = ProjectType.BACKEND;
    } else if (deps['koa']) {
      info.framework = 'Koa';
      info.type = ProjectType.BACKEND;
    }

    // Detect language
    if (deps['typescript'] || exists('tsconfig.json')) {
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
    if (deps['eslint'] || exists('.eslintrc') || exists('.eslintrc.js') || exists('eslint.config.js')) {
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
  }

  // Detect package manager
  if (exists('bun.lockb')) {
    info.packageManager = 'bun';
  } else if (exists('pnpm-lock.yaml')) {
    info.packageManager = 'pnpm';
  } else if (exists('yarn.lock')) {
    info.packageManager = 'yarn';
  } else if (exists('package-lock.json')) {
    info.packageManager = 'npm';
  }

  // Python projects
  if (exists('pyproject.toml') || exists('requirements.txt')) {
    info.language = 'Python';
    info.type = info.type || ProjectType.BACKEND;

    const pyproject = readFile('pyproject.toml');
    if (pyproject) {
      if (pyproject.includes('fastapi')) info.framework = 'FastAPI';
      else if (pyproject.includes('django')) info.framework = 'Django';
      else if (pyproject.includes('flask')) info.framework = 'Flask';

      if (pyproject.includes('pytest')) info.testFramework = 'pytest';
    }
  }

  // Go projects
  if (exists('go.mod')) {
    info.language = 'Go';
    info.type = info.type || ProjectType.BACKEND;

    const gomod = readFile('go.mod');
    if (gomod) {
      if (gomod.includes('gin-gonic/gin')) info.framework = 'Gin';
      else if (gomod.includes('gofiber/fiber')) info.framework = 'Fiber';
      else if (gomod.includes('labstack/echo')) info.framework = 'Echo';
    }
  }

  // Rust projects
  if (exists('Cargo.toml')) {
    info.language = 'Rust';
    info.type = info.type || ProjectType.BACKEND;

    const cargo = readFile('Cargo.toml');
    if (cargo) {
      if (cargo.includes('actix-web')) info.framework = 'Actix';
      else if (cargo.includes('axum')) info.framework = 'Axum';
      else if (cargo.includes('rocket')) info.framework = 'Rocket';
    }
  }

  // Docker
  info.hasDocker = exists('Dockerfile') || exists('docker-compose.yml') || exists('docker-compose.yaml');

  // CI/CD
  if (exists('.github/workflows')) {
    info.hasCI = 'GitHub Actions';
  } else if (exists('.gitlab-ci.yml')) {
    info.hasCI = 'GitLab CI';
  } else if (exists('Jenkinsfile')) {
    info.hasCI = 'Jenkins';
  } else if (exists('.circleci')) {
    info.hasCI = 'CircleCI';
  }

  return info;
}

/**
 * Get the directory structure
 * @param dir - Directory to scan
 * @param depth - Current depth
 * @param maxDepth - Maximum depth
 * @returns Tree representation
 */
export function getDirectoryStructure(dir: string = '.', depth: number = 0, maxDepth: number = 3): string {
  const ignore = ['node_modules', '.git', 'dist', 'build', '.next', '.cache', '__pycache__', 'venv', '.venv', 'target'];
  const items: string[] = [];

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
  } catch {
    // Ignore permission errors
  }

  return items.join('\n');
}
