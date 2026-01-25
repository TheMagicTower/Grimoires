# Changelog

All notable changes to Grimoires will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- `basic-workflow`: Codex-Gemini collaboration pattern
- `auto-review`: Automatic review loop with auto-fix
- `dev-workflow`: Full 8-stage development workflow
- `error-resolution`: FixHive-based error handling
- `parallel-execution`: Parallel task execution strategies

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

### Project Structure

```
Grimoires/
├── tower/           (5 files)  - Archmage configuration
├── familiars/       (4 files)  - Familiar definitions
├── spells/          (5 files)  - Workflows
├── runes/
│   ├── mcp/         (4 files)  - MCP configurations
│   ├── rules/       (1 file)   - Design principles
│   └── config/      (2 files)  - System configuration
├── docs/            (3 files)  - Documentation
├── scripts/         (1 file)   - Utility scripts
└── .serena/         (4 files)  - Memory storage
```

### Dependencies

- Claude Code CLI
- Node.js 18+
- MCP Servers: Serena, Sequential Thinking, FixHive
- Optional: OpenAI API, Google AI API, Figma API

---

## [Unreleased]

### Planned for 0.2.0
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
| 0.1.0 | 2026-01-25 | Initial release with 4 Familiars, 5 workflows, 16 design principles |

---

*For detailed release notes, see the [GitHub Releases](https://github.com/bluelucifer/Grimoires/releases) page.*
