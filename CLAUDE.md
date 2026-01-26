# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Build & compilation
npm run build          # Compile TypeScript to JavaScript (outputs to dist/)
npm run watch          # Watch mode for TypeScript compilation
npm run clean          # Remove compiled output directory

# Testing
npm test               # Run unit tests (tests/runtime.test.js)
npm run test:e2e       # Run E2E tests (tests/e2e/hooks.test.js)
npm run test:all       # Run all tests (unit + E2E)

# Publishing
npm run prepublishOnly # Auto-runs build before npm publish
```

## Architecture

Grimoires is a Multi-AI Agent Orchestration Plugin Package for Claude Code. The system uses an "Archmage" pattern where Claude Code acts as the central orchestrator directing specialized worker agents called "Familiars."

### Core Components

**Archmage (Claude Code)**: Central orchestrator that analyzes requirements, decomposes tasks, assigns work to Familiars, and validates results against design principles.

**Familiars (Worker Agents)**:
- **Codex**: Code generation via codex-mcp-server
- **Gemini**: Code analysis & security via gemini-mcp (1M+ token context)
- **Stitch**: UI/UX design via stitch-mcp
- **Reviewer**: Quality review (Claude native, no MCP)
- **TDD Guide**: Testing specialist

**MCP Stack**: Serena (memory/indexing), FixHive (error knowledge base), Sequential Thinking (problem decomposition)

### Source Code Structure

```
src/
├── index.ts              # Main entry point & exports
├── runtime/
│   ├── bridge.ts         # Hooks bridge for Claude Code integration
│   ├── matcher.ts        # Expression matcher DSL for hook conditions
│   └── context.ts        # Context management for hooks
└── utils/
    ├── logger.ts         # Logging utility
    ├── shell-escape.ts   # Shell command safety & sanitization
    ├── detect-project.ts # Project type detection
    ├── mcp-validator.ts  # MCP configuration validation
    └── env-validator.ts  # Environment variable validation
```

### Distribution Structure

```
core/
├── spells/      # Workflow definitions (cast-*.md)
├── familiars/   # AI agent definitions (.tome.md)
├── rules/       # Design principles & rules
├── tower/       # Archmage orchestrator config
├── hooks/       # Hook definitions & handlers
└── config/      # Configuration templates
```

### Hooks System

Event-driven architecture for tool interception:
- **Events**: SessionStart, PreToolUse, PostToolUse, PreCompact, Stop, SessionEnd
- **Actions**: ALLOW, BLOCK, CONFIRM, WARN
- **Matcher DSL**: Operators include `==`, `!=`, `matches`, `startsWith`, `endsWith`, `contains`, `in` with `&&`, `||`, `!` logical operators

Configuration: `~/.grimoires/core/hooks/hooks.json` (global) or `.grimoires/hooks.json` (project)

### Spells (Workflows)

Key spells in `core/spells/`:
- `/cast:summon` - Project auto-detection & setup
- `/cast:dev` - Full development workflow
- `/cast:review` - Code review with design validation
- `/cast:tdd` - RED-GREEN-REFACTOR cycle
- `/cast:refactor` - Safe refactoring workflow
- `/cast:parallel` - Parallel task execution

## TypeScript Configuration

- **Target**: ES2020
- **Module**: CommonJS
- **Output**: `./dist`
- **Types**: `./dist/types`
- **Strict mode**: Enabled

## Testing

Tests use a custom assert-based framework (no external dependencies). Unit tests cover:
- Matcher DSL (all operators and logical combinations)
- Context parsing (tool, path, exit-code, success flags)
- Shell escaping & command safety
- Project detection

## CI Pipeline

GitHub workflows validate:
- Tests on Node 18.x, 20.x, 22.x
- MCP configuration validation
- Schema validation
- Security scans (secrets detection, dangerous patterns)
- Multi-OS installation tests (Ubuntu, macOS, Windows)
