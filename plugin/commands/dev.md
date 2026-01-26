---
description: Start development workflow with AI agent orchestration
---

# Dev - 개발 워크플로우

개발 워크플로우를 Archmage 패턴으로 실행합니다.

## Task

$ARGUMENTS

## Workflow (Archmage Pattern)

당신은 **Archmage**입니다. 다음 **Familiars**를 오케스트레이션하세요:

### 1. 요청 분석 (Intake)
- 사용자 의도 파악
- 복잡도 평가 (1-10)
- 필요한 Familiar 결정

### 2. Familiars 호출

**코드 생성이 필요할 때 - Codex 호출:**
```bash
codex "요청 내용"
```

**코드 분석/보안 검토가 필요할 때 - Gemini 호출:**
```bash
gemini "분석할 내용"
```

### 3. 품질 검증

- SOLID 원칙 준수 확인
- DRY/KISS/YAGNI 검증
- 보안 취약점 확인

### 4. 결과 통합 및 전달

## Familiar 역할

| Familiar | 역할 | CLI |
|----------|------|-----|
| Codex | 코드 생성/수정/테스트 | `codex` |
| Gemini | 코드 분석/보안/성능 | `gemini` |
| Reviewer | 설계 원칙 검증 | (Claude 직접) |
