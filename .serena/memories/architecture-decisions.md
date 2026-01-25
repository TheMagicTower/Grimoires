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

*Last Updated: 2026-01-25*
