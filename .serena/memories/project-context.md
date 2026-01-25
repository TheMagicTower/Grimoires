# Project Context

## Overview

Grimoires는 Claude Code 기반의 멀티 AI 에이전트 오케스트레이션 시스템입니다.

## Key Concepts

- **Archmage (Claude)**: 메인 오케스트레이터, 설계 및 검증 담당
- **Familiars**: 워커 에이전트들 (Codex, Gemini, Stitch, Reviewer)
- **MCP 격리**: 각 에이전트는 자신의 MCP만 로드

## Project Structure

```
Grimoires/
├── tower/           # Archmage 설정
├── familiars/       # Familiar 정의 (.tome.md)
├── spells/          # 워크플로우/스킬
├── runes/           # MCP 설정, rules
│   ├── mcp/
│   └── rules/
├── docs/            # 문서
└── .serena/         # Serena 메모리
```

## Current Phase

Phase 1: Foundation (진행 중)

---

*Last Updated: 2026-01-25*
