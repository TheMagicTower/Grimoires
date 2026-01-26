---
description: Directly invoke Codex for code generation
---

# Codex - 코드 생성 Familiar

## Request

$ARGUMENTS

## STEP 1: 상태 저장 (필수)

```bash
mkdir -p .grimoires && echo '{"activeFamiliar":"codex","task":"$ARGUMENTS","mustUseMCP":true}' > .grimoires/active-familiar.json
```

## STEP 2: Codex 호출 (필수)

**절대로 직접 코드를 작성하지 마세요.**

### 우선순위 1: MCP 도구 사용
Codex MCP 서버가 활성화되어 있으면 **Codex MCP 도구**를 사용하세요.

### 우선순위 2: Bash 폴백
MCP가 없으면 Bash로:
```bash
codex exec "$ARGUMENTS"
```

## STEP 3: 상태 정리

작업 완료 후:
```bash
rm -f .grimoires/active-familiar.json
```

## 금지 사항

- ❌ 직접 코드 작성
- ❌ Codex MCP/CLI 호출 건너뛰기
- ❌ 상태 파일 저장 건너뛰기
