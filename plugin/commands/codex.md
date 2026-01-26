---
description: Directly invoke Codex for code generation
---

# Codex - 코드 생성 Familiar

Codex를 직접 호출하여 코드를 생성합니다.

## Request

$ARGUMENTS

## Instructions

**Codex MCP 서버가 활성화되어 있으면:**
Codex MCP 도구를 사용하여 요청을 처리하세요.

**MCP가 없으면 Bash로 호출:**
```bash
codex exec "$ARGUMENTS"
```

## Codex 역할

- 코드 생성/수정
- 리팩토링
- 버그 수정
- 테스트 작성

## 필요 조건

```bash
codex login  # 먼저 로그인 필요
```
