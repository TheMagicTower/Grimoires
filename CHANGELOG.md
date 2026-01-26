# Changelog

All notable changes to Grimoires will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] - 2026-01-26

### everything-claude-code Integration Release

This release integrates key features from everything-claude-code to significantly increase feature completeness from ~35-40% to ~85%+.

### Added

#### Hooks System (Phase 1)
- **Event-driven automation** with 6 hook types:
  - `PreToolUse` - Validate, block, or confirm before tool execution
  - `PostToolUse` - Auto-format, lint, typecheck after changes
  - `SessionStart` - Load context and detect project type
  - `SessionEnd` - Save state and cleanup
  - `PreCompact` - Backup important state before context compaction
  - `Stop` - Verify task completion

- **JavaScript handlers** for custom logic:
  - `session-start.js` - Serena memory loading, project detection
  - `session-end.js` - State saving, pattern learning
  - `pre-compact.js` - Critical state backup
  - `pre-tool-use.js` - Security checks, destructive operation blocking
  - `post-tool-use.js` - Auto-formatting, linting, testing
  - `stop.js` - Completion verification, recommendations

- **Security features**:
  - Block force push, hard reset, dangerous rm operations
  - Detect hardcoded secrets and API keys
  - SQL injection pattern detection
  - Confirmation for sensitive operations

#### Extended Rules (Phase 2)
- **security.md** - Comprehensive security rules:
  - Secret management (hardcoded secrets, env validation)
  - Input validation (SQL injection, XSS, path traversal)
  - Authentication best practices (JWT, password hashing)
  - Data protection (sensitive logging, HTTPS, CORS)

- **testing.md** - Testing standards:
  - Coverage thresholds (80% line, 70% branch)
  - TDD workflow (RED → GREEN → REFACTOR)
  - Test categories (Unit, Integration, E2E)
  - Test quality rules (independence, AAA pattern)

- **git-workflow.md** - Git best practices:
  - Branch naming conventions
  - Conventional Commits format
  - PR guidelines and templates
  - Merge strategies

- **performance.md** - Performance optimization:
  - Frontend (bundle size, render performance, virtualization)
  - Backend (N+1 queries, caching, connection pooling)
  - Algorithm complexity guidelines
  - Async patterns (parallel execution, debounce/throttle)

- **coding-style.md** - Code style guidelines:
  - File organization and imports
  - Naming conventions
  - Error handling patterns
  - TypeScript best practices

#### TDD/Testing (Phase 3)
- **TDD Guide Familiar** - Testing specialist:
  - Requirement to test case conversion
  - Coverage analysis
  - Test quality verification
  - TDD cycle management

- **New Spells**:
  - `/cast:tdd` - TDD workflow (RED-GREEN-REFACTOR)
  - `/cast:test-coverage` - Coverage analysis and recommendations
  - `/cast:e2e` - E2E test execution (Playwright/Cypress)

#### MCP Extensions (Phase 4)
- **github.json** - GitHub MCP integration:
  - Repository operations
  - Issue management
  - Pull request workflows
  - GitHub Actions integration

- **memory.json** - Memory MCP for persistent context:
  - Entity storage and retrieval
  - Relationship management
  - Cross-session context preservation

- **New Spells**:
  - `/cast:plan` - Sequential Thinking-based planning
  - `/cast:refactor` - Safe refactoring workflow
  - `/cast:checkpoint` - State snapshot save/restore

### Changed

- **mcp/archmage.json** - Added hooks configuration reference
- **templates/presets/*.yaml** - Added new rules and spells to all presets
- **core/spells/README.md** - Documented 6 new spells
- **README.md** - Updated for v0.3.0 features

### File Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Hooks | 8 | 1 |
| Rules | 5 | 0 |
| Familiars | 1 | 0 |
| Spells | 6 | 1 |
| MCP | 2 | 1 |
| Docs/Config | 2 | 3 |
| **Total** | **24** | **6** |

### New Directory Structure

```
core/
├── hooks/
│   ├── hooks.json           # Hook configuration
│   └── handlers/            # JavaScript handlers
│       ├── session-start.js
│       ├── session-end.js
│       ├── pre-compact.js
│       ├── pre-tool-use.js
│       ├── post-tool-use.js
│       └── stop.js
├── rules/
│   ├── design-principles.md # (existing)
│   ├── security.md          # NEW
│   ├── testing.md           # NEW
│   ├── git-workflow.md      # NEW
│   ├── performance.md       # NEW
│   └── coding-style.md      # NEW
├── familiars/
│   ├── codex.tome.md        # (existing)
│   └── tdd-guide.tome.md    # NEW
└── spells/
    ├── cast-tdd.md          # NEW
    ├── cast-test-coverage.md# NEW
    ├── cast-e2e.md          # NEW
    ├── cast-plan.md         # NEW
    ├── cast-refactor.md     # NEW
    └── cast-checkpoint.md   # NEW

mcp/
├── github.json              # NEW
└── memory.json              # NEW

docs/
└── HOOKS.md                 # NEW
```

---

## [0.2.0] - 2026-01-25

### Installation & Deployment Release

This release introduces a comprehensive cross-platform installation system with one-liner install commands and a two-tier (Global + Project-local) deployment architecture.

### Added

#### Cross-Platform Installation
- **One-liner installers** for all major platforms:
  - `install.sh` - Unix/Linux/macOS (bash)
  - `install.ps1` - Windows PowerShell
  - `install.cmd` - Windows CMD
- **Clean uninstallers**:
  - `uninstall.sh` - Unix/Linux/macOS
  - `uninstall.ps1` - Windows PowerShell
- **Shell wrapper CLI** (`grimoires`) with commands:
  - `version` - Show installed version
  - `doctor` - Check installation health
  - `update` - Update to latest version
  - `uninstall` - Remove Grimoires
  - `config` - Edit global configuration

#### Two-Tier Architecture
- **Global installation** (`~/.grimoires/`):
  - `core/` - Tower, Familiars, Spells, Rules
  - `templates/` - Project templates and presets
  - `mcp/` - MCP server configurations
  - `config.yaml` - Global settings
  - `bin/` - CLI wrapper
- **Project-local** structure:
  - `grimoire.yaml` - Project configuration
  - `.grimoires/` - Custom extensions
  - `.serena/` - Memory storage
  - `.claude/settings.local.json` - MCP settings

#### Auto-Initialization
- Automatic initialization prompt when running `/cast:*` commands without `grimoire.yaml`
- User confirmation before initializing (never auto-creates without consent)
- Configurable via `defaults.auto_init` in global config

#### Release Automation
- `release.sh` - Packaging script for releases
- GitHub Actions workflow for automated releases
- Cross-platform installation testing in CI

#### Global Configuration
- Comprehensive `config.yaml` with:
  - API key management
  - Default settings for new projects
  - Cost management controls
  - Update preferences
  - Advanced settings

### Changed

#### Directory Structure
- Reorganized to support global installation:
  - `tower/` → `core/tower/`
  - `familiars/` → `core/familiars/`
  - `spells/` → `core/spells/`
  - `runes/rules/` → `core/rules/`
  - `runes/mcp/` → `mcp/`
  - `registry/templates/` → `templates/`

#### Spells
- Updated `/cast:summon` to support auto-init flow
- Added auto-init flow diagram to spell documentation

### Project Structure After Installation

```
~/.grimoires/                    # Global (shared across projects)
├── bin/grimoires                # CLI wrapper
├── core/
│   ├── tower/                   # Archmage config (5 files)
│   ├── familiars/               # Agent definitions (4 files)
│   ├── spells/                  # Workflows (8 files)
│   └── rules/                   # Design principles (1 file)
├── templates/
│   ├── grimoire.yaml.template
│   └── presets/                 # minimal, frontend, backend, fullstack
├── mcp/                         # MCP configurations (4 files)
├── config.yaml                  # Global configuration
└── version                      # Installed version

project/                         # Project-local
├── grimoire.yaml                # Project settings
├── .grimoires/                  # Custom extensions
├── .serena/                     # Memory storage
└── .claude/settings.local.json  # MCP settings
```

### Installation

**Unix/Linux/macOS:**
```bash
curl -fsSL https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/install.sh | bash
```

**Windows PowerShell:**
```powershell
irm https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/install.ps1 | iex
```

**Windows CMD:**
```batch
curl -fsSL https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/install.cmd -o install.cmd && install.cmd && del install.cmd
```

---

## [0.1.0] - 2026-01-25

### Initial Release

First public release of Grimoires - Multi-AI Agent Orchestration for Claude Code.

### Added

#### Core System
- **Archmage (Claude)**: Central orchestrator with MCP integration
  - Serena MCP for memory management
  - Sequential Thinking MCP for structured reasoning
  - FixHive MCP for error knowledge base

#### Familiars (AI Agents)
- **Codex Familiar**: Code generation specialist
  - Code writing, refactoring, bug fixing
  - Test generation
  - OpenAI Codex MCP integration

- **Gemini Familiar**: Code analysis specialist
  - Security review
  - Performance analysis
  - 1M+ token context support
  - Google Gemini MCP integration

- **Stitch Familiar**: UI/UX design specialist
  - Component generation
  - Design token management
  - Figma integration
  - Stitch MCP + Skills integration

- **Reviewer Familiar**: Quality verification specialist
  - PR review automation
  - Design principles validation
  - Severity-based issue classification

#### Workflows (Spells)
- `/cast:summon`: Project initialization
- `/cast:dev`: Development workflow
- `/cast:review`: Code review
- `/cast:analyze`: Code analysis
- `/cast:design`: UI/UX design
- `/cast:fix`: Error resolution
- `/cast:parallel`: Parallel execution

#### Design Principles
- 16 software design principles with verification rules
  - SOLID (5 principles)
  - General principles (11): DRY, KISS, YAGNI, etc.
- Severity levels: Critical, High, Medium, Low
- Automated verification in review workflow

#### Optimization
- Context optimization strategies
  - MCP isolation per Familiar
  - Minimal context passing
  - Memory hierarchy (Hot/Warm/Cold)
  - Caching strategies

- Cost management system
  - Budget tracking (daily/weekly/monthly)
  - Model routing based on task complexity
  - Cost alerts and throttling
  - Usage reporting

- Parallel execution optimization
  - Dependency analysis
  - 4 execution patterns
  - Conflict resolution
  - Resource management

#### Memory Management
- Serena integration with structured memories
  - `project-context.md`: Project overview
  - `architecture-decisions.md`: ADR records
  - `current-task.md`: Active task tracking
  - `learned-patterns.md`: Pattern accumulation

#### Configuration
- MCP configurations per agent (`runes/mcp/`)
- Auto-review settings (`runes/config/auto-review.yaml`)
- Cost monitoring settings (`runes/config/cost-monitor.yaml`)

#### Documentation
- Comprehensive README
- Architecture documentation (ARCHITECTURE.md)
- Quick start guide (QUICKSTART.md)
- Session prompts (PROMPTS.md)
- Installation script

### Dependencies

- Claude Code CLI
- Node.js 18+
- MCP Servers: Serena, Sequential Thinking, FixHive
- Optional: OpenAI API, Google AI API, Figma API

---

## [Unreleased]

### Planned for 0.4.0
- [ ] Plugin system for custom Familiars
- [ ] Web dashboard for monitoring
- [ ] Integration with more AI providers
- [ ] Improved caching system

### Planned for Future
- [ ] Multi-project support
- [ ] Team collaboration features
- [ ] Custom design principle definitions
- [ ] Workflow templates marketplace

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 0.3.0 | 2026-01-26 | Hooks system, TDD workflow, extended rules, 6 new spells |
| 0.2.0 | 2026-01-25 | Cross-platform installation, global deployment, auto-init |
| 0.1.0 | 2026-01-25 | Initial release with 4 Familiars, 7 spells, 16 design principles |

---

*For detailed release notes, see the [GitHub Releases](https://github.com/bluelucifer/Grimoires/releases) page.*
