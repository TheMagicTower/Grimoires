# Changelog

All notable changes to Grimoires will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### Planned for 0.3.0
- [ ] Testing suite for workflows
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
| 0.2.0 | 2026-01-25 | Cross-platform installation, global deployment, auto-init |
| 0.1.0 | 2026-01-25 | Initial release with 4 Familiars, 7 spells, 16 design principles |

---

*For detailed release notes, see the [GitHub Releases](https://github.com/bluelucifer/Grimoires/releases) page.*
