# Git Workflow Rules

Git 및 GitHub 워크플로우 관련 규칙입니다. 일관된 버전 관리와 협업을 위한 가이드라인을 정의합니다.

---

## 1. Branch Naming

### 1.1 Branch Convention (High)

> "Use consistent branch naming format."

**Pattern**: `<type>/<ticket>-<short-description>`

**Types**:

| Type | Description | Example |
|------|-------------|---------|
| `feature` | 새로운 기능 | `feature/PROJ-123-user-auth` |
| `fix` | 버그 수정 | `fix/PROJ-456-login-error` |
| `hotfix` | 긴급 수정 | `hotfix/PROJ-789-critical-bug` |
| `refactor` | 리팩토링 | `refactor/PROJ-101-auth-module` |
| `docs` | 문서 작업 | `docs/PROJ-102-api-docs` |
| `test` | 테스트 추가 | `test/PROJ-103-user-tests` |
| `chore` | 빌드/설정 | `chore/PROJ-104-ci-update` |

**예시**:

```bash
# ❌ Bad: 불명확한 브랜치명
git checkout -b new-feature
git checkout -b fix
git checkout -b john-work

# ✅ Good: 명확한 브랜치명
git checkout -b feature/PROJ-123-oauth-integration
git checkout -b fix/PROJ-456-null-pointer-exception
git checkout -b refactor/PROJ-789-extract-auth-service
```

**Severity**: High

---

### 1.2 Protected Branches (Critical)

> "Never push directly to protected branches."

**보호 대상**:
- `main` / `master`
- `develop`
- `release/*`

**규칙**:
- [ ] Direct push 금지
- [ ] Force push 금지
- [ ] PR 필수
- [ ] 리뷰 승인 필수

**Severity**: Critical

---

## 2. Commit Messages

### 2.1 Conventional Commits (High)

> "Follow Conventional Commits specification."

**Format**:
```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

**Types**:

| Type | Description | Version Impact |
|------|-------------|----------------|
| `feat` | 새 기능 | Minor |
| `fix` | 버그 수정 | Patch |
| `docs` | 문서만 변경 | None |
| `style` | 포맷팅 (코드 동작 변경 없음) | None |
| `refactor` | 리팩토링 | None |
| `perf` | 성능 개선 | Patch |
| `test` | 테스트 추가/수정 | None |
| `chore` | 빌드/툴링 변경 | None |
| `ci` | CI 설정 변경 | None |

**예시**:

```bash
# ❌ Bad: 불명확한 메시지
git commit -m "fix"
git commit -m "update code"
git commit -m "WIP"

# ✅ Good: Conventional Commits
git commit -m "feat(auth): add OAuth2 login support"
git commit -m "fix(api): handle null response from payment gateway"
git commit -m "refactor(user): extract validation logic to separate module"
git commit -m "docs(readme): add installation instructions"

# Breaking change
git commit -m "feat(api)!: change response format for user endpoint

BREAKING CHANGE: Response now includes 'data' wrapper object"
```

**Severity**: High

---

### 2.2 Commit Message Body (Medium)

> "Use body to explain 'why' not 'what'."

**예시**:

```bash
# ❌ Bad: 무엇을 했는지만 설명
git commit -m "Add retry logic to API calls"

# ✅ Good: 왜 했는지 설명
git commit -m "feat(api): add retry logic to API calls

External API occasionally returns 503 during deployments.
Added exponential backoff retry (max 3 attempts) to improve
reliability during these periods.

Fixes #234"
```

**Severity**: Medium

---

### 2.3 Atomic Commits (Medium)

> "Each commit should represent one logical change."

**위반 탐지**:
- 한 커밋에 관련 없는 여러 변경
- 기능과 포맷팅 혼합
- 테스트와 구현이 별도 커밋

**예시**:

```bash
# ❌ Bad: 여러 변경을 하나의 커밋에
git commit -m "Add user feature, fix bug, update docs"

# ✅ Good: 논리적 단위로 분리
git commit -m "feat(user): add user profile page"
git commit -m "test(user): add tests for user profile"
git commit -m "docs(user): document user profile API"
```

**Severity**: Medium

---

## 3. Pull Request Guidelines

### 3.1 PR Template (High)

**필수 섹션**:

```markdown
## Summary
<!-- 1-3 bullet points describing the changes -->

## Changes
<!-- Detailed list of changes -->

## Test Plan
<!-- How to test these changes -->
- [ ] Unit tests added
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
<!-- UI changes should include screenshots -->

## Related Issues
<!-- Link to related issues -->
Fixes #123
```

### 3.2 PR Size Limits (Medium)

> "Keep PRs small and focused."

| Size | Lines Changed | Recommendation |
|------|---------------|----------------|
| Small | < 200 | Ideal |
| Medium | 200-400 | Acceptable |
| Large | 400-800 | Split if possible |
| Too Large | > 800 | Must split |

**예외**:
- 자동 생성 코드
- 마이그레이션
- 대량 리네이밍

**Severity**: Medium

---

### 3.3 PR Review Requirements (High)

> "All PRs require proper review before merge."

**체크리스트**:
- [ ] 최소 1명 승인 (팀 규모에 따라 조정)
- [ ] CI 통과
- [ ] 충돌 해결
- [ ] 리뷰 코멘트 해결
- [ ] 관련 이슈 연결

**Severity**: High

---

### 3.4 Draft PRs (Low)

> "Use draft PRs for work in progress."

**용도**:
- 초기 피드백 요청
- 접근 방식 논의
- CI 검증

```bash
# GitHub CLI로 draft PR 생성
gh pr create --draft --title "WIP: Add new feature"
```

**Severity**: Low

---

## 4. Merge Strategy

### 4.1 Merge Method (Medium)

| Method | Use Case | Pros | Cons |
|--------|----------|------|------|
| Merge commit | Feature branches | 히스토리 보존 | 복잡한 그래프 |
| Squash | Small features | 깔끔한 히스토리 | 세부 히스토리 손실 |
| Rebase | Personal branches | 선형 히스토리 | Force push 필요 |

**권장**:
- Feature → main: **Squash merge**
- Release → main: **Merge commit**
- Hotfix → main: **Merge commit**

### 4.2 Branch Cleanup (Low)

> "Delete branches after merge."

```bash
# 머지 후 로컬 브랜치 삭제
git branch -d feature/PROJ-123-user-auth

# 원격 브랜치 삭제
git push origin --delete feature/PROJ-123-user-auth

# 오래된 원격 브랜치 정리
git remote prune origin
```

**Severity**: Low

---

## 5. Version Control Best Practices

### 5.1 Keep History Clean (Medium)

> "Maintain a clean and meaningful commit history."

**권장 사항**:
- Interactive rebase로 정리 후 push
- Fixup commits 사용 후 squash
- WIP 커밋 정리

```bash
# 최근 3개 커밋 정리
git rebase -i HEAD~3

# Fixup commit (자동으로 이전 커밋과 합쳐짐)
git commit --fixup HEAD~1
git rebase -i --autosquash HEAD~2
```

### 5.2 Never Rewrite Shared History (Critical)

> "Don't rebase or amend commits that others may have pulled."

**금지 사항**:
- 공유 브랜치에서 `git push --force`
- main/develop에서 rebase
- 이미 push된 커밋 amend

**예외**:
- 개인 feature 브랜치
- 명시적 팀 합의

**Severity**: Critical

---

### 5.3 .gitignore Best Practices (Medium)

> "Properly ignore generated and sensitive files."

**필수 제외 항목**:
```gitignore
# Dependencies
node_modules/
vendor/

# Build output
dist/
build/
.next/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Test coverage
coverage/

# Secrets
*.pem
*.key
```

**Severity**: Medium

---

## 6. Git Hooks

### 6.1 Pre-commit Hooks (High)

> "Validate changes before commit."

**권장 검사**:
- [ ] Lint 검사
- [ ] 포맷팅 검사
- [ ] 타입 검사
- [ ] 시크릿 스캔

**예시 (husky + lint-staged)**:

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**Severity**: High

---

### 6.2 Commit-msg Hook (Medium)

> "Validate commit message format."

**commitlint 설정**:

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'chore', 'ci', 'revert'
    ]],
    'subject-max-length': [2, 'always', 72]
  }
};
```

**Severity**: Medium

---

## 7. Severity Reference

| Rule | Severity |
|------|----------|
| Protected Branches | Critical |
| Never Rewrite Shared History | Critical |
| Branch Naming | High |
| Conventional Commits | High |
| PR Review Requirements | High |
| Pre-commit Hooks | High |
| Commit Message Body | Medium |
| Atomic Commits | Medium |
| PR Size | Medium |
| Merge Strategy | Medium |
| .gitignore | Medium |
| Commit-msg Hook | Medium |
| Draft PRs | Low |
| Branch Cleanup | Low |

---

*Version: 0.3.0*
*Last Updated: 2026-01-26*
