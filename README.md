# Grimoires

> Multi-AI Agent Orchestration Plugin for Claude Code

A Magic Tower Project | Version 0.3.18

---

## Overview

Grimoires는 Claude Code를 중심으로 여러 AI 에이전트(Codex, Gemini 등)를 오케스트레이션하는 플러그인입니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Claude Code (Archmage)                        │
│              설계 + 검증 + 의사결정 + 오케스트레이션               │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ┌───────────┐   ┌───────────┐   ┌───────────┐
   │  Codex    │   │  Gemini   │   │  Reviewer │
   │   (MCP)   │   │   (MCP)   │   │ (Claude)  │
   ├───────────┤   ├───────────┤   ├───────────┤
   │ 코드 작성  │   │ 코드 분석  │   │ 품질 검증  │
   └───────────┘   └───────────┘   └───────────┘
```

---

## Installation

### Plugin Marketplace (권장)

Claude Code에서:

```
/plugin marketplace add TheMagicTower/Grimoires
/plugin install cast@grimoires
```

### 사전 요구 사항

- **Claude Code CLI** - 최신 버전
- **Codex CLI** - `codex login` 필요
- **Gemini CLI** - 첫 실행시 로그인

```bash
# Familiar CLI 로그인
codex login
gemini
```

---

## Quick Start

### 1. 플러그인 설치 후

```
/cast:summon
```

프로젝트를 분석하고 Grimoires 설정을 생성합니다.

### 2. 개발 시작

```
/cast:dev "새로운 기능을 구현해줘"
```

### 3. 코드 분석

```
/cast:gemini "이 코드베이스 분석해줘"
```

### 4. 코드 리뷰

```
/cast:review
```

---

## Commands (Spells)

| 명령어 | 설명 |
|--------|------|
| `/cast:summon` | 프로젝트 초기화 |
| `/cast:dev` | 개발 워크플로우 |
| `/cast:codex` | Codex 직접 호출 (코드 생성) |
| `/cast:gemini` | Gemini 직접 호출 (코드 분석) |
| `/cast:gh` | GitHub CLI 직접 호출 |
| `/cast:review` | 코드 리뷰 |
| `/cast:analyze` | 코드베이스 분석 |
| `/cast:fix` | 버그 수정 |
| `/cast:tdd` | TDD 워크플로우 |
| `/cast:plan` | 구현 계획 |
| `/cast:refactor` | 리팩토링 |
| `/cast:parallel` | 병렬 작업 실행 |
| `/cast:checkpoint` | 체크포인트 관리 |

---

## Sprint Plugin

Grimoires includes a separate **Sprint Plugin** for config-driven multi-squad sprint orchestration.

### Installation

```
/plugin install sprint@grimoires
```

Or via script:

```bash
./scripts/setup-sprint.sh
```

### Sprint Commands

| Command | Description |
|---------|-------------|
| `/sprint:init` | Analyze project and generate `sprint.config.yaml` |
| `/sprint:plan` | Create sprint plan with issues, squads, dependencies |
| `/sprint:cycle {N}` | Execute a single sprint (Phase 0-7) |
| `/sprint:review` | Batch review sprint PRs |
| `/sprint:all` | Execute all remaining sprints sequentially |

### How It Works

1. Run `/sprint:init` to generate `sprint.config.yaml` from your project structure
2. Run `/sprint:plan` to define issues, assign squads, and analyze dependencies
3. Run `/sprint:cycle {N}` to execute the sprint through 8 phases:
   - Pre-check → Planning → Setup → Execution → CI → Review → Merge → Cleanup
4. Or run `/sprint:all` to execute all remaining sprints sequentially

The sprint plugin uses worktrees, team agents, and automated CI/review bot monitoring to orchestrate multi-squad development workflows.

---

## Familiars (AI Agents)

| Familiar | 역할 | MCP | 호출 방식 |
|----------|------|-----|----------|
| **Codex** | 코드 생성 | `codex mcp-server` | MCP 우선, Bash 폴백 |
| **Gemini** | 코드 분석 | `gemini-mcp-tool` | MCP 우선, Bash 폴백 |
| **Reviewer** | 품질 검증 | None | Claude 직접 |

---

## Key Features

| 기능 | 설명 |
|------|------|
| **Multi-AI Orchestration** | Claude가 Archmage로서 Familiar들을 지휘 |
| **MCP Integration** | Codex, Gemini를 MCP 도구로 사용 |
| **Persistent State** | 세션 재시작 후에도 CLI 호출 상태 유지 |
| **Design Principles** | SOLID, DRY, KISS 등 설계 원칙 자동 검증 |
| **Hooks System** | 이벤트 기반 자동화 |

---

## Session Persistence

`/cast:codex`, `/cast:gemini` 실행 시 상태가 저장됩니다:

```
.grimoires/active-familiar.json
```

세션이 재시작되어도 SessionStart 훅이 상태를 읽어 CLI 호출을 보장합니다.

---

## Troubleshooting

### MCP 서버가 안 보임

```
/mcp
```

codex, gemini가 없으면 플러그인 재설치:

```
/plugin uninstall cast
/plugin install cast@grimoires
```

### Codex 인증 오류

```bash
codex login
```

### Gemini 인증 오류

```bash
gemini  # 첫 실행시 로그인 프롬프트
```

---

## Links

- **Repository**: https://github.com/TheMagicTower/Grimoires
- **Issues**: https://github.com/TheMagicTower/Grimoires/issues

---

*A Magic Tower Project*

*Version 0.3.18 | Last Updated: 2026-01-26*
