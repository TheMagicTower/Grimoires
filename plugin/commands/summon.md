---
description: Initialize Grimoires for a project with auto-detection
---

# Summon - Grimoires 초기화

프로젝트를 분석하여 적절한 Grimoires 구성을 자동으로 생성합니다.

## Arguments

$ARGUMENTS

## Instructions

1. 프로젝트 분석 (package.json, pyproject.toml, 디렉토리 구조 확인)
2. 프로젝트 타입 감지 (Frontend/Backend/Fullstack)
3. 적절한 Familiars, Rules, Spells 자동 선택
4. grimoire.yaml 생성

## Auto-Selected Components

### Frontend Project
- Familiars: codex, stitch, reviewer
- Rules: solid, dry, component-design

### Backend API Project
- Familiars: codex, gemini, reviewer
- Rules: solid, security, api-design

### Fullstack Project
- Familiars: codex, gemini, stitch, reviewer
- Rules: all
