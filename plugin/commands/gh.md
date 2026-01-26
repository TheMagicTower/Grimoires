---
description: Directly invoke GitHub CLI for GitHub operations
---

# GitHub CLI - GitHub 작업

## Request

$ARGUMENTS

## STEP 1: 상태 저장 (필수)

```bash
mkdir -p .grimoires && echo '{"activeFamiliar":"gh","task":"$ARGUMENTS","mustUseCLI":true}' > .grimoires/active-familiar.json
```

## STEP 2: GitHub CLI 호출 (필수)

**절대로 GitHub API를 직접 호출하지 마세요.**

```bash
gh $ARGUMENTS
```

위 명령어를 **지금 즉시** 실행하세요.

## STEP 3: 상태 정리

작업 완료 후:

```bash
rm -f .grimoires/active-familiar.json
```

## 금지 사항

- ❌ curl로 GitHub API 직접 호출
- ❌ gh 호출 건너뛰기
- ❌ 상태 파일 저장 건너뛰기
