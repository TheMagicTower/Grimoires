# Grimoires

> Multi-AI Agent Orchestration Plugin Package for Claude Code

A Magic Tower Project | Version 0.3.0

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

## Installation

### One-liner Install

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

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Claude Code CLI** - Will be installed automatically if missing
- **API Keys** (optional): OpenAI, Google AI, Figma

### Verify Installation

```bash
# Check version
grimoires version

# Check installation health
grimoires doctor
```

### Update

```bash
grimoires update
```

### Uninstall

```bash
grimoires uninstall
```

---

## Quick Start

### 1. Initialize Project

Open Claude Code in your project directory:

```bash
cd your-project
claude
```

Then run the summon spell:

```
/cast:summon
```

This will:
- Detect your project type (Frontend, Backend, Fullstack)
- Create `grimoire.yaml` configuration
- Set up `.claude/settings.local.json` for MCP

### 2. Start Development

```
/cast:dev "새로운 기능을 구현해줘"
```

### 3. Code Review

```
/cast:review
```

### Auto-Initialization (New in 0.2.0)

If you run any `/cast:*` command without `grimoire.yaml`, Grimoires will prompt you to initialize:

```
🔮 Grimoires 초기화가 필요합니다
이 프로젝트에서 Grimoires를 사용하시겠습니까?

[1] 예, 자동 설정 (권장)
[2] 예, 직접 설정
[3] 아니오, 취소
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
| **Hooks System** | 이벤트 기반 자동화 (v0.3.0) |
| **TDD Workflow** | RED-GREEN-REFACTOR 사이클 지원 (v0.3.0) |
| **Extended Rules** | Security, Testing, Git, Performance 규칙 (v0.3.0) |

---

## Spells (Commands)

| Spell | Description |
|-------|-------------|
| `/cast:summon` | 프로젝트 초기화 |
| `/cast:dev` | 개발 워크플로우 시작 |
| `/cast:review` | 코드 리뷰 |
| `/cast:analyze` | Gemini 분석 (보안/성능) |
| `/cast:design` | UI/UX 디자인 (Stitch) |
| `/cast:fix` | 에러 해결 (FixHive 연동) |
| `/cast:parallel` | 병렬 작업 실행 |
| `/cast:tdd` | TDD 워크플로우 (v0.3.0) |
| `/cast:test-coverage` | 커버리지 분석 (v0.3.0) |
| `/cast:e2e` | E2E 테스트 (v0.3.0) |
| `/cast:plan` | 계획 수립 (v0.3.0) |
| `/cast:refactor` | 리팩토링 (v0.3.0) |
| `/cast:checkpoint` | 체크포인트 관리 (v0.3.0) |

---

## Directory Structure

### Global Installation (`~/.grimoires/`)

```
~/.grimoires/
├── bin/
│   └── grimoires              # CLI wrapper
├── core/
│   ├── tower/                 # Archmage configuration
│   ├── familiars/             # Agent definitions
│   ├── spells/                # Workflows
│   └── rules/                 # Design principles
├── templates/
│   ├── grimoire.yaml.template
│   └── presets/
├── mcp/                       # MCP configurations
├── config.yaml                # Global settings
└── version
```

### Project Structure

```
project/
├── grimoire.yaml              # Project configuration
├── .grimoires/                # Project-local extensions
│   ├── rules/
│   ├── spells/
│   └── cache/
├── .serena/                   # Memory storage
└── .claude/
    └── settings.local.json    # MCP settings
```

---

## Familiars (AI Agents)

| Familiar | Role | MCP | Specialty |
|----------|------|-----|-----------|
| **Codex** | Code Generation | codex-mcp-server | 코드 작성, 리팩토링, 버그 수정 |
| **Gemini** | Code Analysis | gemini-mcp | 보안/성능 분석, 1M+ 토큰 컨텍스트 |
| **Stitch** | UI/UX Design | stitch-mcp + skills | 컴포넌트 생성, Figma 연동 |
| **Reviewer** | Quality Review | None (Claude) | PR 리뷰, 설계 원칙 검증 |
| **TDD Guide** | Testing Specialist | None (Claude) | TDD 사이클, 테스트 설계 (v0.3.0) |

---

## Configuration

### Global Configuration

```yaml
# ~/.grimoires/config.yaml
version: "0.2.0"

api_keys:
  openai: ${OPENAI_API_KEY}
  google: ${GOOGLE_API_KEY}
  figma: ${FIGMA_ACCESS_TOKEN}

defaults:
  preset: auto
  auto_init: true
  parallel_limit: 4

cost:
  enabled: false
  daily_budget: 10.00
  alerts: true
```

### Project Configuration

```yaml
# grimoire.yaml
version: "0.2"

project:
  name: my-project
  type: fullstack
  framework: nextjs

familiars:
  enabled:
    - codex
    - gemini
    - stitch
    - reviewer

rules:
  enabled:
    - solid
    - dry
    - security
```

---

## CLI Commands

```bash
grimoires version     # Show installed version
grimoires doctor      # Check installation health
grimoires update      # Update to latest version
grimoires uninstall   # Remove Grimoires
grimoires config      # Edit global configuration
grimoires help        # Show help
```

### Example: `grimoires doctor` Output

```
Checking Grimoires installation...

✓ Installation directory: /home/user/.grimoires
✓ Version: 0.2.0
✓ core/ exists (18 files)
✓ templates/ exists (5 files)
✓ mcp/ exists (4 files)
✓ Global configuration exists
✓ Claude Code CLI available
✓ Node.js v20.10.0
✓ PATH is configured

Health check passed - installation is healthy
```

---

## Troubleshooting

### `grimoires: command not found`

터미널을 재시작하거나 다음을 실행:
```bash
# bash
source ~/.bashrc

# zsh
source ~/.zshrc
```

### PATH가 설정되지 않음

수동으로 PATH 추가:
```bash
export GRIMOIRES_HOME="$HOME/.grimoires"
export PATH="$GRIMOIRES_HOME/bin:$PATH"
```

### 설치 실패 (Node.js 버전)

Node.js 18+ 필요:
```bash
node -v  # v18.0.0 이상이어야 함
```

### API 키 설정

환경변수로 설정 (권장):
```bash
# ~/.bashrc 또는 ~/.zshrc에 추가
export OPENAI_API_KEY="sk-..."
export GOOGLE_API_KEY="AI..."
```

### 설치 복구

문제 발생 시 재설치:
```bash
grimoires uninstall
curl -fsSL https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/install.sh | bash
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

## Roadmap

- [x] Phase 1: Foundation
- [x] Phase 2: Core Familiars (Codex, Gemini)
- [x] Phase 3: Design & Review (Stitch, Reviewer)
- [x] Phase 4: Automation (Auto-review, Workflows)
- [x] Phase 5: Optimization (Context, Cost, Parallel)
- [x] Phase 6: Documentation & Release
- [x] Phase 7: Installation & Deployment (v0.2.0)
- [x] Phase 8: Hooks, TDD, Extended Rules (v0.3.0)
- [ ] Phase 9: Testing & Refinement
- [ ] Phase 10: Community Plugins

---

## Contributing

Contributions are welcome! Please read the [contribution guidelines](CONTRIBUTING.md) before submitting a PR.

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/Grimoires.git

# Create a branch
git checkout -b feature/your-feature

# Make changes and test
# Submit PR
```

### File Synchronization Note

이 프로젝트는 두 가지 디렉토리 구조를 유지합니다:
- **원본** (`tower/`, `familiars/`, `spells/`, `runes/`) - 개발용
- **배포용** (`core/`, `templates/`, `mcp/`) - 글로벌 설치용

코어 파일 수정 시 `scripts/release.sh`를 실행하여 배포용 디렉토리와 동기화하세요:
```bash
./scripts/release.sh
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

*Version 0.3.0 | Last Updated: 2026-01-26*
