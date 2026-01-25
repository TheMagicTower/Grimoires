# Grimoires

> Multi-AI Agent Orchestration Plugin Package for Claude Code

A Magic Tower Project

## Overview

Grimoires는 Claude Code를 중심으로 여러 AI 에이전트(Codex, Gemini, Stitch 등)를 오케스트레이션하는 플러그인 패키지입니다. 각 AI의 강점을 활용하여 설계, 코딩, 분석, 디자인 작업을 효율적으로 분배하고 통합합니다.

## Core Concept

```
┌─────────────────────────────────────────────────────────────────┐
│                    Claude Code (Archmage)                        │
│              설계 + 검증 + 의사결정 + 오케스트레이션               │
│         MCP: Serena + FixHive + Sequential Thinking              │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬───────────────┐
         ▼               ▼               ▼               ▼
   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
   │  Codex    │   │  Gemini   │   │  Stitch   │   │  Reviewer │
   │ (Familiar)│   │ (Familiar)│   │ (Familiar)│   │ (Familiar)│
   ├───────────┤   ├───────────┤   ├───────────┤   ├───────────┤
   │ 코드 작성  │   │ 코드 분석  │   │ UI 디자인  │   │ PR 리뷰   │
   │ MCP:Codex │   │ MCP:Gemini│   │ MCP:Stitch│   │ MCP: None │
   └───────────┘   └───────────┘   └───────────┘   └───────────┘
```

## Key Features

- **Multi-AI Orchestration**: Claude가 Archmage로서 여러 AI Familiar를 지휘
- **MCP Isolation**: 에이전트별 MCP 분리로 컨텍스트 효율성 극대화
- **Design Principles**: SOLID, DRY, KISS 등 소프트웨어 설계 원칙 내장
- **Memory Management**: Serena를 통한 장기 컨텍스트 관리
- **Error Knowledge Base**: FixHive 통합으로 오류 해결 지식 활용
- **Sequential Thinking**: 복잡한 문제에 대한 체계적 사고 지원
- **Auto Review Loop**: 자동 PR 리뷰 및 수정 반복

## Terminology

| Term | Role |
|------|------|
| **Archmage** | Claude (Main Orchestrator) |
| **Familiar** | Worker Agents (Codex, Gemini, Stitch, Reviewer) |
| **Spell** | Skill / Command |
| **Tome** | Agent Definition File |
| **Rune** | Configuration Item |
| **Circle** | Workflow (Magic Circle) |
| **Tower** | Project Root |
| **Chamber** | Module / Package |

## Directory Structure

```
Grimoires/
├── tower/                    # Core configurations
│   ├── archmage.md          # Main orchestrator definition
│   └── circles/             # Workflow definitions
├── familiars/               # Agent definitions
│   ├── codex.tome.md        # Codex agent
│   ├── gemini.tome.md       # Gemini agent
│   ├── stitch.tome.md       # Stitch agent
│   └── reviewer.tome.md     # Reviewer agent
├── spells/                  # Skills / Commands
├── runes/                   # Configurations
│   ├── mcp/                 # MCP settings per agent
│   └── rules/               # Design principles & rules
├── docs/                    # Documentation
│   └── ARCHITECTURE.md      # Architecture document
└── grimoire.json            # Main configuration
```

## Role Distribution

| Role | AI | Responsibility |
|------|-----|----------------|
| **Architect** | Claude | Requirements analysis, Design, Task distribution |
| **Coder** | Codex | All code writing/modification |
| **Analyzer** | Gemini | Code analysis, Security/Performance review |
| **Designer** | Stitch | UI/UX design, Component generation |
| **Reviewer** | Claude (sub) | PR review, Design principle verification |
| **Thinker** | Sequential Thinking | Complex problem decomposition |

## Design Principles

Grimoires enforces the following software design principles:

- **KISS** - Keep It Simple, Stupid
- **YAGNI** - You Aren't Gonna Need It
- **DRY** - Don't Repeat Yourself
- **SOLID** - Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Separation of Concerns**
- **Modularity**
- **Law of Demeter (LoD)**
- **Curly's Law** - Do One Thing
- **Fail Fast**
- **Principle of Least Astonishment**
- **Composition over Inheritance**
- **Defensive Programming**
- **Boy Scout Rule** - Leave the code better than you found it

## Dependencies

### MCP Servers (Main Context)

- [Serena](https://github.com/oraios/serena) - Memory context management
- [Sequential Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking) - Structured reasoning
- FixHive - Error case knowledge base

### MCP Servers (Familiars)

- [Codex MCP](https://developers.openai.com/codex/mcp/) - OpenAI Codex integration
- [Gemini MCP](https://github.com/RLabs-Inc/gemini-mcp) - Google Gemini integration
- [Stitch MCP](https://github.com/Kargatharaakash/stitch-mcp) - Google Stitch integration
- [Stitch Skills](https://github.com/google-labs-code/stitch-skills) - Stitch agent skills

### References

- [everything-claude-code](https://github.com/affaan-m/everything-claude-code) - Best practices reference

## Installation

```bash
# Clone the repository
git clone https://github.com/TheMagicTower/Grimoires.git

# Navigate to the directory
cd Grimoires

# Install (TBD)
```

## Usage

```bash
# TBD - Usage examples will be added
```

## License

MIT License

## Contributing

Contributions are welcome! Please read the contribution guidelines before submitting a PR.

---

*A Magic Tower Project*
