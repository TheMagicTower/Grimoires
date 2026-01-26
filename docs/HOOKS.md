# Grimoires Hooks System

Claude Code의 훅 시스템을 활용한 이벤트 기반 자동화 가이드입니다.

---

## 1. Overview

Hooks는 Claude Code의 특정 이벤트에 반응하여 자동으로 실행되는 핸들러입니다.
Grimoires는 다음 훅 이벤트를 지원합니다:

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOOKS LIFECYCLE                               │
│                                                                  │
│   SessionStart ──────────────────────────────────────────────┐  │
│        │                                                     │  │
│        ▼                                                     │  │
│   ┌─────────────────────────────────────────────────────┐   │  │
│   │                   SESSION LOOP                       │   │  │
│   │                                                      │   │  │
│   │   PreToolUse ─── Tool Execution ─── PostToolUse     │   │  │
│   │        │                                    │        │   │  │
│   │        │   ┌──────────────────────────┐    │        │   │  │
│   │        └──►│  Block / Confirm / Allow │────┘        │   │  │
│   │            └──────────────────────────┘             │   │  │
│   │                                                      │   │  │
│   │   PreCompact ─── Context Compaction                 │   │  │
│   │                                                      │   │  │
│   │   Stop ─── Response Complete                        │   │  │
│   │                                                      │   │  │
│   └─────────────────────────────────────────────────────┘   │  │
│                                                              │  │
│   SessionEnd ◄───────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Hook Types

| Hook | Trigger | Use Case |
|------|---------|----------|
| `SessionStart` | 세션 시작 시 | 컨텍스트 로드, 환경 감지 |
| `SessionEnd` | 세션 종료 시 | 상태 저장, 정리 |
| `PreToolUse` | 도구 실행 전 | 검증, 차단, 확인 요청 |
| `PostToolUse` | 도구 실행 후 | 포맷팅, 린팅, 테스트 |
| `PreCompact` | 컨텍스트 압축 전 | 중요 상태 백업 |
| `Stop` | 응답 완료 시 | 완료 검증, 권장사항 제시 |

---

## 3. Configuration

### 3.1 hooks.json Structure

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "id": "unique-id",
        "description": "설명",
        "matcher": "조건 표현식",
        "action": "block | confirm | warn",
        "message": "사용자 메시지"
      }
    ],
    "PostToolUse": [
      {
        "id": "unique-id",
        "matcher": "조건 표현식",
        "command": "실행할 명령어",
        "condition": "실행 조건 (optional)",
        "on_failure": "warn | error (optional)"
      }
    ],
    "SessionStart": [
      {
        "id": "unique-id",
        "handler": "handlers/session-start.js"
      }
    ]
  },
  "settings": {
    "enabled": true,
    "log_level": "info | debug | warn | error",
    "timeout_ms": 30000,
    "parallel_hooks": false,
    "fail_on_error": false
  }
}
```

#### Settings Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `enabled` | boolean | `true` | 훅 시스템 활성화 |
| `log_level` | string | `"info"` | 로그 레벨 |
| `timeout_ms` | number | `30000` | 핸들러 타임아웃 (ms) |
| `parallel_hooks` | boolean | `false` | 훅 병렬 실행 (순환 의존성 방지를 위해 `false` 권장) |
| `fail_on_error` | boolean | `false` | 핸들러 오류 시 작업 중단 여부 |

> **Note**: `parallel_hooks`가 `false`인 이유는 순환 의존성 방지입니다.
> 예: PostToolUse → Write 트리거 → PostToolUse 재실행 방지

```
```

### 3.2 Matcher Expressions

매처는 도구 사용 컨텍스트를 평가하는 표현식입니다:

| Variable | Type | Description |
|----------|------|-------------|
| `tool` | string | 도구 이름 (Bash, Write, Edit, Read 등) |
| `command` | string | Bash 명령어 (Bash 도구 시) |
| `path` | string | 파일 경로 (Write, Edit, Read 시) |
| `content` | string | 파일 내용 (Write 시) |

**Operators:**

| Operator | Example | Description |
|----------|---------|-------------|
| `==` | `tool == 'Bash'` | 동등 비교 |
| `matches` | `command matches 'git push'` | 정규식 매칭 |
| `&&` | `tool == 'Bash' && command matches 'git'` | AND |
| `\|\|` | `path matches '.ts$' \|\| path matches '.js$'` | OR |

---

## 4. Built-in Hooks

### 4.1 PreToolUse Hooks

#### Block: Dev Server Outside tmux
```json
{
  "id": "block-dev-outside-tmux",
  "matcher": "tool == 'Bash' && command matches 'npm run dev'",
  "action": "block",
  "message": "Dev server should run in tmux"
}
```

#### Confirm: Git Push
```json
{
  "id": "git-push-confirm",
  "matcher": "tool == 'Bash' && command matches 'git push'",
  "action": "confirm"
}
```

#### Block: Destructive Git Operations
```json
{
  "id": "destructive-git-block",
  "matcher": "tool == 'Bash' && command matches 'git reset --hard|git clean -f|git push --force'",
  "action": "block",
  "message": "Destructive git operations are blocked"
}
```

### 4.2 PostToolUse Hooks

#### Auto Prettier
```json
{
  "id": "auto-prettier",
  "matcher": "tool == 'Write' && path matches '\\.(ts|tsx|js|jsx)$'",
  "command": "npx prettier --write {{path}}",
  "condition": "has_dependency('prettier')",
  "silent": true
}
```

#### TypeScript Check
```json
{
  "id": "typecheck",
  "matcher": "tool == 'Write' && path matches '\\.tsx?$'",
  "command": "npx tsc --noEmit",
  "on_failure": "warn"
}
```

#### Console.log Warning
```json
{
  "id": "console-log-warn",
  "matcher": "tool == 'Write' && path matches '\\.(ts|tsx|js|jsx)$'",
  "pattern": "console\\.(log|debug)",
  "message": "Found console.log - remove before commit"
}
```

---

## 5. Handler Scripts

### 5.1 Handler Interface

핸들러는 Node.js 스크립트로 작성됩니다:

```javascript
#!/usr/bin/env node

async function main() {
  const context = {
    // Environment variables
    tool: process.env.GRIMOIRES_TOOL,
    path: process.env.GRIMOIRES_PATH,
    command: process.env.GRIMOIRES_COMMAND
  };

  // Process and output JSON result
  console.log(JSON.stringify({
    status: 'success',
    result: { /* ... */ }
  }));
}

main();
```

### 5.2 Environment Variables

핸들러에서 사용 가능한 환경 변수:

| Variable | Description | Available In |
|----------|-------------|--------------|
| `GRIMOIRES_TOOL` | 도구 이름 | PreToolUse, PostToolUse |
| `GRIMOIRES_PATH` | 파일 경로 | PreToolUse, PostToolUse |
| `GRIMOIRES_COMMAND` | Bash 명령어 | PreToolUse |
| `GRIMOIRES_CONTENT` | 파일 내용 | PreToolUse (Write) |
| `GRIMOIRES_EXIT_CODE` | 종료 코드 | PostToolUse |
| `GRIMOIRES_SUCCESS` | 성공 여부 | PostToolUse |
| `GRIMOIRES_SESSION_START` | 세션 시작 시간 | SessionEnd |
| `GRIMOIRES_TASK_ID` | 현재 작업 ID | Stop |

### 5.3 Handler Output

핸들러는 JSON을 stdout으로 출력합니다:

```javascript
// Success
{
  "status": "success",
  "result": { /* any data */ }
}

// Block (PreToolUse only)
{
  "status": "blocked",
  "result": {
    "action": "block",
    "message": "Operation blocked: reason"
  }
}

// Warning
{
  "status": "warnings",
  "result": {
    "warnings": [
      { "type": "lint", "message": "Warning message" }
    ]
  }
}
```

---

## 6. Included Handlers

### 6.1 session-start.js

세션 시작 시 실행:

1. **Serena 메모리 로드**
   - `project-context.md`
   - `architecture-decisions.md`
   - `current-task.md`
   - `learned-patterns.md`

2. **프로젝트 감지**
   - 프로젝트 타입 (frontend/backend/fullstack)
   - 패키지 매니저 (npm/yarn/pnpm/bun)
   - 프레임워크 (React/Vue/Next.js 등)

3. **환경 정보 수집**

### 6.2 session-end.js

세션 종료 시 실행:

1. 세션 요약 저장
2. 현재 작업 상태 업데이트
3. 학습된 패턴 저장
4. 임시 파일 정리

### 6.3 pre-compact.js

컨텍스트 압축 전 실행:

1. 현재 작업 백업
2. 컨텍스트 요약 저장
3. 아키텍처 결정 백업
4. 보류 중인 변경사항 저장
5. 복원 매니페스트 생성

### 6.4 pre-tool-use.js

도구 실행 전 검증:

1. **차단 규칙**
   - Force push
   - Hard reset
   - 위험한 rm -rf

2. **확인 규칙**
   - Git push
   - 브랜치 삭제
   - 환경 파일 수정

3. **경고 규칙**
   - TODO 주석
   - console.log
   - any 타입

4. **보안 검사**
   - 하드코딩된 시크릿
   - SQL 인젝션 패턴

#### Secret Detection Patterns

다음 패턴의 시크릿을 탐지하여 차단합니다:

| Service | Pattern | Example |
|---------|---------|---------|
| OpenAI | `sk-[a-zA-Z0-9]{20,}` | `sk-abc123...` |
| GitHub PAT | `ghp_[a-zA-Z0-9]{36}` | `ghp_xxxx...` |
| GitHub Fine-grained | `github_pat_[a-zA-Z0-9_]{22,}` | `github_pat_xxxx...` |
| Slack | `xox[baprs]-[a-zA-Z0-9-]{10,}` | `xoxb-xxxx...` |
| AWS Access Key | `AKIA[A-Z0-9]{16}` | `AKIAIOSFODNN7EXAMPLE` |
| Google API | `AIza[a-zA-Z0-9_-]{35}` | `AIzaSyDaGmWKa...` |
| Stripe | `sk_(live\|test)_[a-zA-Z0-9]{24,}` | `sk_live_xxxx...` |
| Private Key | `-----BEGIN.*PRIVATE KEY-----` | PEM format |
| Hardcoded Password | `password\s*[=:]\s*['"][^'"]{8,}['"]` | `password = "secret"` |

### 6.5 post-tool-use.js

도구 실행 후 처리:

1. Prettier 포맷팅
2. ESLint 검사
3. TypeScript 타입 검사
4. 관련 테스트 실행
5. 파일 크기 검사

#### Error Logging

오류 발생 시 자동으로 로그 파일에 기록됩니다:

- **위치**: `~/.grimoires/logs/post-tool-use.log`
- **형식**: JSON (한 줄에 하나의 에러)
- **로테이션**: 1MB 초과 시 자동 백업 (`.old`)
- **비차단**: 로깅 실패해도 메인 작업은 계속 진행

```bash
# 로그 확인
tail -f ~/.grimoires/logs/post-tool-use.log | jq .

# 최근 오류 확인
tail -10 ~/.grimoires/logs/post-tool-use.log | jq '.error.message'
```

### 6.6 stop.js

응답 완료 시 검사:

1. 커밋되지 않은 변경 확인
2. 작업 완료 상태 확인
3. 테스트 상태 확인
4. TypeScript 에러 확인
5. 디버그 코드 확인

---

## 7. Custom Hooks

### 7.1 Adding Custom Hook

프로젝트 로컬 훅 추가:

```bash
# 디렉토리 생성
mkdir -p .grimoires/hooks/handlers

# 커스텀 훅 설정
cat > .grimoires/hooks/hooks.local.json << 'EOF'
{
  "hooks": {
    "PostToolUse": [
      {
        "id": "custom-format",
        "matcher": "tool == 'Write' && path matches '\\.py$'",
        "command": "black {{path}}"
      }
    ]
  }
}
EOF
```

### 7.2 Custom Handler Example

```javascript
#!/usr/bin/env node
// .grimoires/hooks/handlers/custom-check.js

const fs = require('fs');

async function main() {
  const path = process.env.GRIMOIRES_PATH;

  if (!path || !fs.existsSync(path)) {
    console.log(JSON.stringify({ status: 'skipped' }));
    return;
  }

  const content = fs.readFileSync(path, 'utf-8');

  // Custom check logic
  const issues = [];

  if (content.includes('DEPRECATED')) {
    issues.push({
      type: 'deprecation',
      message: 'File contains deprecated code markers'
    });
  }

  console.log(JSON.stringify({
    status: issues.length > 0 ? 'warnings' : 'success',
    result: { issues }
  }));
}

main();
```

---

## 8. Debugging

### 8.1 Log Levels

```json
{
  "settings": {
    "log_level": "debug"  // debug | info | warn | error
  }
}
```

### 8.2 Validate Configuration

```bash
# JSON 문법 검증
node -e "JSON.parse(require('fs').readFileSync('core/hooks/hooks.json'))"

# 핸들러 문법 검증
node --check core/hooks/handlers/*.js
```

### 8.3 Test Handler

```bash
# 환경 변수 설정하여 핸들러 테스트
GRIMOIRES_TOOL=Write \
GRIMOIRES_PATH=test.ts \
node core/hooks/handlers/post-tool-use.js
```

---

## 9. Best Practices

### 9.1 Performance

- 핸들러는 빠르게 실행되어야 함 (< 5초)
- 무거운 작업은 비동기로 처리
- 불필요한 파일 I/O 최소화

### 9.2 Error Handling

- 핸들러 오류가 Claude 작업을 차단하지 않도록
- 적절한 fallback 제공
- 에러 로깅 구현

### 9.3 Security

- 시크릿 검사는 PreToolUse에서
- 사용자 입력 검증
- 외부 명령어 실행 시 주의

---

## 10. Troubleshooting

### Hook이 실행되지 않음

1. `hooks.json`의 `settings.enabled`가 `true`인지 확인
2. matcher 표현식 검증
3. 핸들러 파일 권한 확인

### 핸들러 실행 실패

1. `node --check` 로 문법 검증
2. 필요한 의존성 설치 확인
3. 환경 변수 확인

### 성능 저하

1. 타임아웃 설정 조정
2. 불필요한 훅 비활성화
3. 무거운 검사는 `silent: true` 사용

---

*Version: 0.3.0*
*Last Updated: 2026-01-26*
