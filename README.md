# Grimoires

> Multi-AI Agent Orchestration Plugin Package for Claude Code

A Magic Tower Project | Version 0.1.0

---

## Overview

Grimoires는 Claude Code를 중심으로 여러 AI 에이전트(Codex, Gemini, Stitch 등)를 오케스트레이션하는 플러그인 패키지입니다. 각 AI의 강점을 활용하여 설계, 코딩, 분석, 디자인 작업을 효율적으로 분배하고 통합합니다.

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

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Multi-AI Orchestration** | Claude가 Archmage로서 여러 AI Familiar를 지휘 |
| **MCP Isolation** | 에이전트별 MCP 분리로 컨텍스트 효율성 극대화 |
| **Design Principles** | SOLID, DRY, KISS 등 16개 설계 원칙 자동 검증 |
| **Memory Management** | Serena를 통한 장기 컨텍스트 관리 |
| **Error Knowledge Base** | FixHive 통합으로 오류 해결 지식 활용 |
| **Sequential Thinking** | 복잡한 문제에 대한 6단계 체계적 사고 |
| **Auto Review Loop** | 자동 PR 리뷰 및 수정 반복 |
| **Parallel Execution** | 독립 작업의 병렬 실행 최적화 |
| **Cost Management** | API 비용 모니터링 및 최적화 |

---

## Quick Start

### Prerequisites

- Claude Code CLI
- Node.js 18+
- API Keys: OpenAI, Google AI (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/bluelucifer/Grimoires.git
cd Grimoires

# Run installation script
./scripts/install.sh

# Configure API keys
cp .env.example .env
# Edit .env with your API keys
```

### Basic Usage

```bash
# Start a Grimoires session
claude --mcp-config runes/mcp/archmage.json

# Example: Request a feature
> "사용자 인증 API를 구현해줘"

# Grimoires will:
# 1. Archmage analyzes requirements (Sequential Thinking)
# 2. Stitch designs UI components (if needed)
# 3. Codex implements the code
# 4. Gemini analyzes security/performance
# 5. Reviewer validates design principles
# 6. Deliver the result
```

---

## Directory Structure

```
Grimoires/
├── tower/                          # Archmage configuration
│   ├── archmage.md                 # Main orchestrator definition
│   ├── serena-guide.md             # Memory management guide
│   ├── thinking-workflow.md        # Sequential Thinking guide
│   ├── context-optimization.md     # Token optimization strategies
│   └── cost-management.md          # Cost monitoring guide
│
├── familiars/                      # Agent definitions
│   ├── codex.tome.md               # Code generation specialist
│   ├── gemini.tome.md              # Code analysis specialist (1M+ tokens)
│   ├── stitch.tome.md              # UI/UX design specialist
│   └── reviewer.tome.md            # Quality verification specialist
│
├── spells/                         # Workflows
│   ├── basic-workflow.md           # Codex-Gemini collaboration
│   ├── auto-review.md              # Automatic review loop
│   ├── dev-workflow.md             # Full development workflow
│   ├── error-resolution.md         # FixHive error handling
│   └── parallel-execution.md       # Parallel execution strategies
│
├── runes/                          # Configurations
│   ├── mcp/                        # MCP settings per agent
│   │   ├── archmage.json           # Serena + FixHive + Sequential Thinking
│   │   ├── codex.json              # OpenAI Codex
│   │   ├── gemini.json             # Google Gemini
│   │   └── stitch.json             # Stitch + Skills
│   ├── rules/
│   │   └── design-principles.md    # 16 design principles
│   └── config/
│       ├── auto-review.yaml        # Auto-review configuration
│       └── cost-monitor.yaml       # Cost monitoring settings
│
├── docs/                           # Documentation
│   ├── ARCHITECTURE.md             # System architecture
│   ├── PROMPTS.md                  # Session prompts
│   └── QUICKSTART.md               # Getting started guide
│
├── scripts/                        # Utility scripts
│   └── install.sh                  # Installation script
│
└── .serena/                        # Serena memory (auto-generated)
    └── memories/
        ├── project-context.md
        ├── architecture-decisions.md
        ├── current-task.md
        └── learned-patterns.md
```

---

## Familiars (AI Agents)

| Familiar | Role | MCP | Specialty |
|----------|------|-----|-----------|
| **Codex** | Code Generation | codex-mcp-server | 코드 작성, 리팩토링, 버그 수정 |
| **Gemini** | Code Analysis | gemini-mcp | 보안/성능 분석, 1M+ 토큰 컨텍스트 |
| **Stitch** | UI/UX Design | stitch-mcp + skills | 컴포넌트 생성, Figma 연동 |
| **Reviewer** | Quality Review | None (Claude) | PR 리뷰, 설계 원칙 검증 |

---

## Workflows

### Standard Development Flow

```
User Request → Archmage (Plan) → Stitch (UI) → Codex (Code)
     → Gemini (Analyze) → Reviewer (Review) → Delivery
```

### Auto-Review Loop

```
Code Change → Reviewer → [Pass] → Done
                      → [Fail] → Codex Fix → Re-review (max 3)
```

### Error Resolution

```
Error → FixHive Search → [Found] → Apply Solution
                       → [Not Found] → Gemini Analyze → Codex Fix → Register
```

---

## Design Principles (16)

### SOLID Principles
- **S**ingle Responsibility (High)
- **O**pen/Closed (Medium)
- **L**iskov Substitution (High)
- **I**nterface Segregation (Medium)
- **D**ependency Inversion (High)

### General Principles
- DRY - Don't Repeat Yourself (Medium)
- KISS - Keep It Simple (Medium)
- YAGNI - You Aren't Gonna Need It (Low)
- Separation of Concerns (Medium)
- Law of Demeter (Low)
- Curly's Law (Low)
- Fail Fast (Medium)
- POLA - Principle of Least Astonishment (Medium)
- Composition over Inheritance (Medium)
- Defensive Programming (High)
- Boy Scout Rule (Low)

---

## Configuration

### MCP Configuration

```json
// runes/mcp/archmage.json
{
  "mcpServers": {
    "serena": {
      "command": "npx",
      "args": ["-y", "serena-mcp"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "fixhive": {
      "command": "fixhive-mcp",
      "args": []
    }
  }
}
```

### Environment Variables

```bash
# .env
OPENAI_API_KEY=sk-...          # For Codex
GOOGLE_API_KEY=AI...           # For Gemini
FIGMA_ACCESS_TOKEN=figd_...    # For Stitch (optional)
```

### Cost Budget (Optional)

```yaml
# runes/config/cost-monitor.yaml
budgets:
  daily:
    limit: 10.00    # $10/day
    warning: 7.00   # Alert at 70%
```

---

## Terminology

| Term | Description |
|------|-------------|
| **Archmage** | Claude (Main Orchestrator) |
| **Familiar** | Worker Agents (Codex, Gemini, Stitch, Reviewer) |
| **Spell** | Workflow / Command |
| **Tome** | Agent Definition File (.tome.md) |
| **Rune** | Configuration File |
| **Tower** | Core Settings Directory |

---

## Dependencies

### Core MCP Servers

| MCP | Purpose | Required |
|-----|---------|----------|
| [Serena](https://github.com/oraios/serena) | Memory management | Yes |
| [Sequential Thinking](https://github.com/modelcontextprotocol/servers) | Structured reasoning | Yes |
| FixHive | Error knowledge base | Yes |

### Familiar MCP Servers

| MCP | Purpose | Required |
|-----|---------|----------|
| Codex MCP | OpenAI Codex | For coding tasks |
| [Gemini MCP](https://github.com/RLabs-Inc/gemini-mcp) | Google Gemini | For analysis |
| [Stitch MCP](https://github.com/anthropics/stitch-mcp) | UI generation | For design tasks |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Main Context Usage | < 100K tokens |
| First-pass Review Rate | > 70% |
| FixHive Hit Rate | > 50% |
| Critical Issues | 0 |

---

## Roadmap

- [x] Phase 1: Foundation
- [x] Phase 2: Core Familiars (Codex, Gemini)
- [x] Phase 3: Design & Review (Stitch, Reviewer)
- [x] Phase 4: Automation (Auto-review, Workflows)
- [x] Phase 5: Optimization (Context, Cost, Parallel)
- [x] Phase 6: Documentation & Release
- [ ] Phase 7: Testing & Refinement
- [ ] Phase 8: Community Plugins

---

## Contributing

Contributions are welcome! Please read the [contribution guidelines](CONTRIBUTING.md) before submitting a PR.

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/Grimoires.git

# Create a branch
git checkout -b feature/your-feature

# Make changes and test
# Submit PR
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Links

- **Repository**: https://github.com/bluelucifer/Grimoires
- **Documentation**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Quick Start**: [docs/QUICKSTART.md](docs/QUICKSTART.md)

---

*A Magic Tower Project*

*Version 0.1.0 | Last Updated: 2026-01-25*
