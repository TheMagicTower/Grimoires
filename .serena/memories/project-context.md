# Project Context

## Overview

Grimoires는 Claude Code 기반의 멀티 AI 에이전트 오케스트레이션 시스템입니다.

## Key Concepts

- **Archmage (Claude)**: 메인 오케스트레이터, 설계 및 검증 담당
- **Familiars**: 워커 에이전트들 (Codex, Gemini, Stitch, Reviewer)
- **MCP 격리**: 각 에이전트는 자신의 MCP만 로드
- **Spells**: `/cast:*` 형태의 워크플로우 명령어

## Project Structure (v0.2.0)

### Global Installation (`~/.grimoires/`)

```
~/.grimoires/
├── bin/
│   └── grimoires              # CLI 래퍼
├── core/
│   ├── tower/                 # Archmage 설정 (5 files)
│   ├── familiars/             # Familiar 정의 (4 files)
│   ├── spells/                # 워크플로우 (8 files)
│   └── rules/                 # 설계 원칙 (1 file)
├── templates/
│   ├── grimoire.yaml.template
│   └── presets/               # minimal, frontend, backend, fullstack
├── mcp/                       # MCP 설정 (4 files)
├── config.yaml                # 글로벌 설정
└── version                    # 설치된 버전
```

### Project-local Structure

```
project/
├── grimoire.yaml              # 프로젝트 설정
├── .grimoires/                # 프로젝트별 확장
│   ├── rules/
│   ├── spells/
│   └── cache/
├── .serena/                   # 메모리 저장소
└── .claude/settings.local.json
```

### Repository Structure (Development)

```
Grimoires/
├── tower/           # Archmage 설정 (원본)
├── familiars/       # Familiar 정의 (원본)
├── spells/          # 워크플로우 (원본)
├── runes/           # MCP 설정, rules (원본)
├── core/            # 글로벌 설치용 (복사본)
├── templates/       # 프로젝트 템플릿
├── mcp/             # MCP 설정 (복사본)
├── scripts/         # 설치/제거/릴리즈 스크립트
├── .github/         # GitHub Actions
├── docs/            # 문서
└── .serena/         # Serena 메모리
```

## Current Version

**Version**: 0.2.0
**Status**: Installation & Deployment System 구현 완료

## Installation

```bash
# Unix/Linux/macOS
curl -fsSL https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/install.sh | bash

# Windows PowerShell
irm https://raw.githubusercontent.com/bluelucifer/Grimoires/main/scripts/install.ps1 | iex
```

---

*Last Updated: 2026-01-25*
