---
description: Directly invoke Codex for code generation
---

# Codex - 코드 생성 Familiar

## Request

$ARGUMENTS

## STEP 1: 상태 저장 (필수)

먼저 이 명령어를 실행하여 상태를 저장하세요:

```bash
mkdir -p .grimoires && echo '{"activeFamiliar":"codex","task":"$ARGUMENTS","mustUseCLI":true}' > .grimoires/active-familiar.json
```

## STEP 2: Codex CLI 호출 (필수)

**절대로 직접 코드를 작성하지 마세요.**

```bash
codex exec "$ARGUMENTS"
```

위 명령어를 **지금 즉시** 실행하세요.

## STEP 3: 상태 정리

작업 완료 후:

```bash
rm -f .grimoires/active-familiar.json
```

## 금지 사항

- ❌ 직접 코드 작성
- ❌ codex 호출 건너뛰기
- ❌ 상태 파일 저장 건너뛰기
