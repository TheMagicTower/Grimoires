---
description: Fix bugs with root cause analysis
---

# Fix - 버그 수정

버그를 분석하고 Codex로 수정합니다.

## Issue

$ARGUMENTS

## Workflow

### 1. Gemini로 원인 분석
```bash
gemini "이 버그의 근본 원인을 분석해줘: ..."
```

### 2. 수정 전략 수립
- 영향 범위 파악
- 수정 방안 결정
- 회귀 테스트 계획

### 3. Codex로 코드 수정
```bash
codex "버그 수정: ..."
```

### 4. 검증
- 버그 재현 테스트
- 회귀 테스트
- 코드 리뷰
