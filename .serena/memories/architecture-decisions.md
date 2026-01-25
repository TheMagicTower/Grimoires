# Architecture Decisions

프로젝트 진행 중 내린 주요 아키텍처 결정을 기록합니다.

---

## ADR-001: MCP 격리 전략

**Date**: 2026-01-25
**Status**: Accepted

### Context
각 AI 에이전트가 모든 MCP를 로드하면 컨텍스트 토큰이 급증합니다.

### Decision
각 에이전트는 자신의 역할에 필요한 MCP만 로드합니다.

### Consequences
- (+) 컨텍스트 효율성 향상
- (+) 각 에이전트의 책임 명확화
- (-) 에이전트 간 직접 MCP 공유 불가

---

## ADR-002: Familiar 통신 방식

**Date**: 2026-01-25
**Status**: Accepted

### Context
Familiar 간 직접 통신 vs Archmage를 통한 간접 통신

### Decision
모든 통신은 Archmage를 통해 이루어집니다.

### Consequences
- (+) 중앙 집중식 제어 가능
- (+) 의존성 관리 용이
- (-) 단일 실패 지점

---

## ADR-003: 2계층 배포 구조 (Global + Project-local)

**Date**: 2026-01-25
**Status**: Accepted
**Version**: 0.2.0

### Context
Grimoires를 여러 프로젝트에서 사용할 때, 매번 전체 파일을 복사하는 것은 비효율적입니다.

### Decision
2계층 구조 채택:
- **Global (`~/.grimoires/`)**: 코어 파일, 공유 템플릿, CLI
- **Project-local**: 프로젝트별 설정, 커스텀 확장, 메모리

### Consequences
- (+) 중복 설치 제거
- (+) 글로벌 업데이트 용이
- (+) 프로젝트별 커스터마이징 가능
- (-) 글로벌/로컬 설정 병합 로직 필요

---

## ADR-004: Auto-init 시 사용자 확인 필수

**Date**: 2026-01-25
**Status**: Accepted
**Version**: 0.2.0

### Context
`/cast:*` 명령어 실행 시 `grimoire.yaml`이 없을 때 자동 초기화 여부

### Decision
항상 사용자 확인 프롬프트를 표시합니다. 절대 자동으로 파일을 생성하지 않습니다.

### Consequences
- (+) 사용자 동의 없이 파일 생성 방지
- (+) 명시적인 프로젝트 초기화
- (-) 첫 사용 시 추가 단계 필요

---

## ADR-005: Shell Wrapper vs Node.js CLI

**Date**: 2026-01-25
**Status**: Accepted
**Version**: 0.2.0

### Context
Grimoires CLI를 어떤 방식으로 구현할 것인가?

### Decision
경량 Shell Wrapper만 사용. Node.js CLI는 구현하지 않음.

### Rationale
- 대부분의 기능은 Claude Code 내 `/cast:*` 명령어로 동작
- CLI는 설치/제거/버전 확인 등 기본 유틸리티만 제공
- 의존성 최소화 (추가 npm 패키지 불필요)

### Consequences
- (+) 설치 크기 최소화
- (+) 의존성 없음
- (-) 복잡한 CLI 기능 구현 어려움

---

## ADR-006: GitHub Raw URL 호스팅

**Date**: 2026-01-25
**Status**: Accepted
**Version**: 0.2.0

### Context
설치 스크립트 호스팅 방식 선택

### Options Considered
1. GitHub Raw URL (선택)
2. 별도 CDN
3. npm 패키지

### Decision
GitHub Raw URL 사용 (`raw.githubusercontent.com`)

### Rationale
- 별도 인프라 불필요
- 릴리즈와 자동 동기화
- 버전 태깅으로 특정 버전 설치 가능

### Consequences
- (+) 관리 오버헤드 없음
- (+) 버전 관리 용이
- (-) GitHub 의존성

---

*Last Updated: 2026-01-25*
