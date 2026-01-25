# Serena Integration Guide

Serena MCP를 활용한 메모리 관리 가이드입니다.

---

## 1. Overview

Serena는 프로젝트 메모리와 컨텍스트를 지속적으로 관리하는 MCP입니다.

### 주요 기능
- 프로젝트 컨텍스트 저장/복원
- 코드베이스 인덱싱
- 세션 간 상태 유지
- 아키텍처 결정 기록

---

## 2. Memory Structure

```
.serena/
├── memories/
│   ├── project-context.md      # 프로젝트 전반 이해
│   ├── architecture-decisions.md # 아키텍처 결정 기록
│   ├── current-task.md         # 현재 작업 상태
│   └── learned-patterns.md     # 학습된 패턴
└── index/
    └── codebase-index          # 코드베이스 인덱스 (자동 생성)
```

---

## 3. Usage Patterns

### 3.1 Session Start

세션 시작 시 Serena를 활용하여 컨텍스트를 복원합니다:

1. `project-context.md` 로드 → 프로젝트 이해
2. `current-task.md` 확인 → 중단된 작업 파악
3. `architecture-decisions.md` 참조 → 기존 결정 존중

### 3.2 During Development

개발 중 중요한 정보가 생기면 즉시 기록:

```markdown
# architecture-decisions.md에 추가

## ADR-XXX: [결정 제목]

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated

### Context
[결정이 필요한 배경]

### Decision
[내린 결정]

### Consequences
- (+) 긍정적 결과
- (-) 부정적 결과
```

### 3.3 Session End

세션 종료 전 반드시:

1. `current-task.md` 업데이트
   - 완료된 항목 체크
   - 미완료 작업 기록
   - 다음 단계 명시

2. `learned-patterns.md` 업데이트 (해당 시)
   - 새로운 패턴 발견
   - 안티패턴 식별

---

## 4. Memory Files Detail

### project-context.md

프로젝트의 고수준 이해를 담습니다:
- 프로젝트 목적
- 핵심 개념
- 디렉토리 구조
- 현재 phase

### architecture-decisions.md

ADR (Architecture Decision Record) 형식으로 기록:
- 결정 번호 (ADR-XXX)
- 상태 (Proposed/Accepted/Deprecated)
- 컨텍스트, 결정, 결과

### current-task.md

현재 작업 상태 추적:
- 활성 작업
- 완료/진행중/대기 항목
- 다음 단계

### learned-patterns.md

학습된 내용 축적:
- 유용한 패턴
- 피해야 할 안티패턴
- 프로젝트 특정 규칙

---

## 5. Best Practices

### Do
- 모든 주요 결정을 ADR로 기록
- 세션 종료 전 current-task.md 업데이트
- 패턴/안티패턴 발견 시 즉시 기록

### Don't
- 임시 정보를 memories에 저장
- 코드 조각을 memories에 저장 (코드는 코드베이스에)
- memories 파일을 너무 크게 유지 (주기적 정리 필요)

---

## 6. Troubleshooting

### 컨텍스트 로드 실패
- `.serena/` 디렉토리 존재 확인
- 파일 권한 확인
- Serena MCP 연결 상태 확인

### 인덱스 오류
- `index/` 디렉토리 삭제 후 재생성
- 코드베이스 크기 확인 (대용량 시 시간 소요)

---

*Version: 0.1.0*
*Last Updated: 2026-01-25*
