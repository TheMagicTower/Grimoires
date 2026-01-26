---
description: Code review with design principles validation
---

# Review - 코드 리뷰

코드 리뷰를 Archmage 패턴으로 수행합니다.

## Target

$ARGUMENTS

## Workflow

### 1. Gemini로 심층 분석
```bash
gemini "다음 코드를 분석해줘: 보안, 성능, 코드 품질 관점에서"
```

### 2. 설계 원칙 검증 (Reviewer)

**SOLID 원칙:**
- [ ] Single Responsibility
- [ ] Open/Closed
- [ ] Liskov Substitution
- [ ] Interface Segregation
- [ ] Dependency Inversion

**기타 원칙:**
- [ ] DRY
- [ ] KISS
- [ ] YAGNI

### 3. 보안 취약점 체크
- SQL Injection, XSS, CSRF
- 인증/인가 문제
- 민감 정보 노출

### 4. 수정 필요시 Codex 호출
```bash
codex "리뷰에서 발견된 이슈 수정: ..."
```

### 5. 리뷰 결과 요약
