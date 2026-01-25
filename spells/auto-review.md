# Auto-Review Loop Spell

코드 변경 시 자동으로 리뷰하고 필요한 경우 수정까지 진행하는 자동화 워크플로우입니다.

---

## 1. Overview

Auto-Review Loop는 코드 품질을 자동으로 보장하는 피드백 루프입니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTO-REVIEW LOOP                          │
│                                                              │
│   Code Change                                                │
│       │                                                      │
│       ▼                                                      │
│   ┌─────────────────┐                                       │
│   │    Reviewer     │◄────────────────────┐                 │
│   │    Analysis     │                     │                 │
│   └────────┬────────┘                     │                 │
│            │                              │                 │
│      ┌─────┴─────┐                        │                 │
│      ▼           ▼                        │                 │
│  ┌───────┐  ┌─────────────┐              │                 │
│  │ Pass  │  │   Issues    │              │                 │
│  │       │  │   Found     │              │                 │
│  └───┬───┘  └──────┬──────┘              │                 │
│      │             │                      │                 │
│      ▼             ▼                      │                 │
│   Complete    ┌─────────────┐            │                 │
│              │   Severity   │            │                 │
│              │    Check     │            │                 │
│              └──────┬───────┘            │                 │
│                     │                     │                 │
│        ┌────────────┼────────────┐       │                 │
│        ▼            ▼            ▼       │                 │
│    ┌───────┐   ┌────────┐  ┌─────────┐  │                 │
│    │  Low  │   │ Medium │  │High/Crit│  │                 │
│    │ (Log) │   │(Notify)│  │ (Fix)   │  │                 │
│    └───────┘   └────────┘  └────┬────┘  │                 │
│                                  │       │                 │
│                                  ▼       │                 │
│                           ┌──────────┐   │                 │
│                           │  Codex   │   │                 │
│                           │  Fix     │───┘                 │
│                           └──────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Trigger Conditions

### 2.1 Automatic Triggers

| Trigger | Description |
|---------|-------------|
| File Save | 파일 저장 시 (설정 가능) |
| Git Commit | 커밋 전/후 hook |
| PR Creation | Pull Request 생성 시 |
| PR Update | PR에 새 커밋 추가 시 |

### 2.2 Manual Triggers

```
/review              # 현재 변경사항 리뷰
/review --file=path  # 특정 파일 리뷰
/review --pr=123     # 특정 PR 리뷰
```

---

## 3. Review Pipeline

### 3.1 Stage 1: Pre-Check (Automated)

```yaml
pre_check:
  - lint: true           # ESLint/Prettier
  - typecheck: true      # TypeScript
  - test: true           # Unit tests
  - build: true          # Build verification

  on_failure:
    action: block
    notify: true
```

### 3.2 Stage 2: Reviewer Analysis

```json
{
  "task_id": "auto-review-{timestamp}",
  "familiar": "reviewer",
  "action": "review",
  "context": {
    "changes": {
      "type": "diff",
      "files": ["changed files from git diff"]
    },
    "review_focus": [
      "solid_principles",
      "error_handling",
      "security",
      "naming"
    ],
    "max_issues": 20
  }
}
```

### 3.3 Stage 3: Severity-Based Routing

```
Review Result
     │
     ├── Critical (🔴)
     │   └── Action: BLOCK + AUTO-FIX
     │       ├── Codex: 즉시 수정
     │       ├── Re-review 필수
     │       └── 3회 실패 시 Human escalation
     │
     ├── High (🟠)
     │   └── Action: AUTO-FIX
     │       ├── Codex: 자동 수정
     │       └── Re-review
     │
     ├── Medium (🟡)
     │   └── Action: NOTIFY
     │       ├── 이슈 리포트 생성
     │       └── 수정 권고 (선택적)
     │
     └── Low (🟢)
         └── Action: LOG
             └── 기록만, 진행 허용
```

---

## 4. Auto-Fix Workflow

### 4.1 Fix Request to Codex

```json
{
  "task_id": "auto-fix-{timestamp}",
  "familiar": "codex",
  "action": "fix",
  "context": {
    "files": [
      {
        "path": "src/services/auth.ts",
        "content": "// current content"
      }
    ],
    "issues": [
      {
        "id": "REV-001",
        "severity": "high",
        "principle": "SRP",
        "location": { "line": 45, "function": "authenticate" },
        "description": "함수가 두 가지 책임을 가짐",
        "suggestion": "로깅 로직 분리"
      }
    ],
    "constraints": [
      "기존 public API 유지",
      "테스트 통과 필수"
    ]
  }
}
```

### 4.2 Fix Verification

```
Codex Fix Complete
       │
       ▼
┌─────────────────┐
│  Test Execution │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
 Pass       Fail
    │         │
    ▼         ▼
Re-review   Rollback
    │         │
    │         └──→ Human escalation
    │
    ▼
┌─────────────────┐
│ Reviewer Check  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
 Pass       Fail
    │         │
    ▼         │
Complete    ──┘ (retry, max 3)
```

---

## 5. Configuration

### 5.1 Review Config File

`runes/config/auto-review.yaml`:

```yaml
auto_review:
  enabled: true

  triggers:
    on_save: false
    on_commit: true
    on_pr: true

  pre_checks:
    lint: true
    typecheck: true
    test: true
    coverage_threshold: 80

  review:
    focus:
      - solid_principles
      - error_handling
      - security
      - naming
      - complexity

    thresholds:
      cyclomatic_complexity: 10
      file_length: 300
      function_length: 50

  auto_fix:
    enabled: true
    max_retries: 3

    severity_actions:
      critical: auto_fix_and_block
      high: auto_fix
      medium: notify
      low: log

    excluded_patterns:
      - "*.test.ts"
      - "*.spec.ts"
      - "migrations/*"

  notifications:
    slack: false
    email: false
    inline_comments: true

  escalation:
    after_retries: 3
    notify_human: true
```

### 5.2 Exclusion Rules

```yaml
exclusions:
  files:
    - "**/*.generated.ts"
    - "**/node_modules/**"
    - "**/dist/**"
    - "**/*.d.ts"

  rules:
    # 테스트 파일은 일부 규칙 완화
    "**/*.test.ts":
      - disable: complexity
      - disable: file_length

    # 마이그레이션은 리뷰 제외
    "migrations/**":
      - skip_review: true
```

---

## 6. Review Loop States

### 6.1 State Machine

```
┌─────────┐
│  IDLE   │◄─────────────────────────┐
└────┬────┘                          │
     │ trigger                       │
     ▼                               │
┌─────────┐                          │
│PRE_CHECK│                          │
└────┬────┘                          │
     │ pass                          │
     ▼                               │
┌─────────┐      fail                │
│REVIEWING│──────────────────────────┤
└────┬────┘                          │
     │ complete                      │
     ▼                               │
┌─────────┐      no issues           │
│DECIDING │──────────────────────────┤
└────┬────┘                          │
     │ issues found                  │
     ▼                               │
┌─────────┐                          │
│ FIXING  │                          │
└────┬────┘                          │
     │ fixed                         │
     ▼                               │
┌─────────┐      pass                │
│VERIFYING│──────────────────────────┘
└────┬────┘
     │ fail (retry < max)
     └──────────► FIXING
     │ fail (retry >= max)
     ▼
┌─────────┐
│ESCALATED│
└─────────┘
```

### 6.2 State Transitions

| From | To | Condition |
|------|-----|-----------|
| IDLE | PRE_CHECK | Trigger received |
| PRE_CHECK | REVIEWING | All pre-checks pass |
| PRE_CHECK | IDLE | Pre-check fail (blocked) |
| REVIEWING | DECIDING | Review complete |
| DECIDING | IDLE | No issues or all Low |
| DECIDING | FIXING | High/Critical issues |
| FIXING | VERIFYING | Fix applied |
| VERIFYING | IDLE | Verification pass |
| VERIFYING | FIXING | Verification fail (retry) |
| VERIFYING | ESCALATED | Max retries reached |

---

## 7. Notification Templates

### 7.1 Issue Found Notification

```markdown
## 🔍 Auto-Review Results

**File**: `src/services/auth.ts`
**Commit**: `abc123`
**Time**: 2026-01-25 10:30:00

### Summary
| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 High | 1 |
| 🟡 Medium | 2 |
| 🟢 Low | 1 |

### Issues

#### 🟠 [HIGH] SRP Violation
**Location**: Line 45, `authenticateUser()`
**Issue**: 함수가 인증과 로깅 두 가지 책임 수행
**Action**: Auto-fix initiated

---

**Status**: 🔄 Auto-fix in progress...
```

### 7.2 Fix Complete Notification

```markdown
## ✅ Auto-Fix Complete

**Original Issues**: 1 High, 2 Medium
**Fixed**: 1 High
**Remaining**: 2 Medium (manual review recommended)

### Changes Made
- `src/services/auth.ts`: Extracted logging to middleware
- `src/middleware/logging.ts`: New file created

### Verification
- ✅ Tests passing (45/45)
- ✅ Type check passing
- ✅ Re-review passing

**Status**: Ready for merge
```

### 7.3 Escalation Notification

```markdown
## ⚠️ Review Escalation Required

**File**: `src/services/auth.ts`
**Reason**: Auto-fix failed after 3 attempts

### Failed Issue
**Type**: Critical - SQL Injection vulnerability
**Location**: Line 78

### Attempted Fixes
1. Parameterized query - Failed (syntax error)
2. ORM method - Failed (type mismatch)
3. Prepared statement - Failed (test failure)

### Required Action
Human review and manual fix required.

**Assigned to**: @developer
**Priority**: Critical
```

---

## 8. Metrics & Reporting

### 8.1 Tracked Metrics

| Metric | Description |
|--------|-------------|
| Review Count | 총 리뷰 실행 횟수 |
| Pass Rate | 첫 리뷰 통과율 |
| Auto-Fix Success | 자동 수정 성공률 |
| Avg Fix Time | 평균 수정 소요 시간 |
| Escalation Rate | Human 에스컬레이션 비율 |
| Issue Distribution | Severity별 이슈 분포 |

### 8.2 Weekly Report

```markdown
## 📊 Auto-Review Weekly Report

**Period**: 2026-01-19 ~ 2026-01-25

### Overview
- Total Reviews: 156
- Pass Rate: 73%
- Auto-Fix Success: 89%
- Escalations: 2

### Issue Trends
| Principle | This Week | Last Week | Trend |
|-----------|-----------|-----------|-------|
| SRP | 12 | 18 | ↓ 33% |
| DRY | 8 | 5 | ↑ 60% |
| Error Handling | 15 | 12 | ↑ 25% |

### Top Files by Issues
1. `src/services/user.ts` - 8 issues
2. `src/utils/validation.ts` - 5 issues
3. `src/controllers/api.ts` - 4 issues

### Recommendations
- DRY 위반 증가 추세, 공통 유틸리티 추출 고려
- user.ts 리팩토링 권장
```

---

## 9. Integration with CI/CD

### 9.1 GitHub Actions Integration

```yaml
# .github/workflows/auto-review.yml
name: Auto-Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  auto-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Grimoires Auto-Review
        uses: grimoires/auto-review-action@v1
        with:
          config: runes/config/auto-review.yaml
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Post Review Comments
        if: failure()
        uses: grimoires/post-review-comments@v1
```

### 9.2 Git Hooks Integration

```bash
# .git/hooks/pre-commit
#!/bin/bash
grimoires review --staged --fail-on=high
```

---

## 10. Best Practices

### 10.1 Configuration Tips

- 초기에는 `auto_fix: false`로 시작하여 리뷰만 수행
- 점진적으로 자동 수정 범위 확대
- 핵심 비즈니스 로직은 `excluded_patterns`에 추가 고려

### 10.2 Handling False Positives

```yaml
# 특정 라인 리뷰 제외
// grimoires-ignore-next-line: complexity
function complexButNecessary() { ... }

# 특정 파일 리뷰 제외
// grimoires-ignore-file
```

### 10.3 Continuous Improvement

- 주간 리포트 분석으로 반복 이슈 식별
- 반복 이슈는 rules에 추가
- 팀 컨벤션에 맞게 threshold 조정

---

*Version: 0.1.0*
*Last Updated: 2026-01-25*
