---
name: summon
description: Initialize Grimoires for a project with auto-detection
---

프로젝트를 분석하여 적절한 Grimoires 구성을 자동으로 생성하는 초기화 마법입니다.

## Usage

```
/cast:summon
/cast:summon --template=backend
/cast:summon --minimal
```

## How It Works

1. 프로젝트 분석 (package.json, pyproject.toml, 디렉토리 구조)
2. 프로젝트 타입 감지 (Frontend/Backend/Fullstack)
3. 적절한 Familiars, Rules, Spells 자동 선택
4. grimoire.yaml 및 .claude/settings.local.json 생성

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
