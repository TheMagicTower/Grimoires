# Grimoires - Session Prompts

후속 세션에서 사용할 프롬프트 모음입니다.

---

## Initial Context Prompt (새 세션 시작 시)

```
나는 Grimoires 프로젝트를 진행 중이다.
Grimoires는 Claude Code 기반의 멀티 AI 에이전트 오케스트레이션 플러그인 패키지다.

핵심 개념:
- Archmage (Claude): 메인 오케스트레이터, 설계 및 검증 담당
- Familiars (Codex, Gemini, Stitch, Reviewer): 워커 에이전트들
- MCP 격리: 각 에이전트는 자신의 MCP만 로드하여 컨텍스트 효율화

현재 상태:
- README.md와 ARCHITECTURE.md 작성 완료
- GitHub: https://github.com/bluelucifer/Grimoires

다음 작업을 진행한다: [작업 내용]
```

---

## Phase 1: Foundation

### Prompt 1-1: 디렉토리 구조 생성

```
Grimoires 프로젝트의 디렉토리 구조를 생성하라.
docs/ARCHITECTURE.md의 Directory Structure 섹션을 참고하여:

1. tower/ - 코어 설정
2. familiars/ - 에이전트 정의 (.tome.md 파일들)
3. spells/ - 스킬/커맨드
4. runes/mcp/ - MCP 설정 파일들
5. runes/rules/ - 설계 원칙 룰

각 디렉토리에 .gitkeep 또는 placeholder 파일을 생성하라.
```

### Prompt 1-2: Archmage 정의

```
tower/archmage.md 파일을 작성하라.
Archmage(Claude)의 역할과 책임을 정의해야 한다:

1. 오케스트레이션 전략
2. Familiar 호출 규칙
3. 의사결정 기준
4. Sequential Thinking 활용 가이드
5. 설계 원칙 적용 방법

everything-claude-code의 에이전트 정의 형식을 참고하라.
```

### Prompt 1-3: Serena MCP 통합

```
Serena MCP를 Grimoires에 통합하라.

1. runes/mcp/archmage.json에 Serena 설정 추가
2. .serena/ 디렉토리 구조 설정
3. 초기 memories 파일 생성
4. Serena 사용 가이드 문서화
```

### Prompt 1-4: FixHive 통합

```
FixHive 플러그인을 Grimoires에 통합하라.

1. runes/mcp/archmage.json에 FixHive 설정 추가
2. 오류 검색/등록 워크플로우 정의
3. Archmage가 FixHive를 활용하는 방법 문서화
```

---

## Phase 2: Core Familiars

### Prompt 2-1: Codex Familiar

```
familiars/codex.tome.md를 작성하라.
Codex Familiar의 정의:

1. 역할: 모든 코드 작성/수정
2. 입력 형식: 설계 스펙
3. 출력 형식: 코드 파일
4. MCP 설정 (runes/mcp/codex.json)
5. 호출 예시
6. 에러 핸들링

codex-mcp-server 문서를 참고하라.
```

### Prompt 2-2: Gemini Familiar

```
familiars/gemini.tome.md를 작성하라.
Gemini Familiar의 정의:

1. 역할: 코드 분석, 보안/성능 검토
2. 입력 형식: 분석 대상 코드
3. 출력 형식: 분석 리포트
4. MCP 설정 (runes/mcp/gemini.json)
5. 100만+ 토큰 컨텍스트 활용 전략
6. 호출 예시

gemini-mcp 또는 gemini-code-assist-mcp 문서를 참고하라.
```

### Prompt 2-3: 기본 워크플로우 테스트

```
Codex와 Gemini Familiar를 활용한 기본 워크플로우를 테스트하라.

테스트 시나리오:
1. 간단한 함수 작성 요청 → Codex
2. 작성된 코드 분석 요청 → Gemini
3. 분석 결과 기반 수정 → Codex

결과를 문서화하고 개선점을 식별하라.
```

---

## Phase 3: Design & Review

### Prompt 3-1: Stitch Familiar

```
familiars/stitch.tome.md를 작성하라.
Stitch Familiar의 정의:

1. 역할: UI/UX 디자인, 컴포넌트 생성
2. 입력 형식: 디자인 요구사항
3. 출력 형식: HTML/CSS/컴포넌트
4. MCP 설정 (runes/mcp/stitch.json)
5. stitch-skills 활용
6. Figma 연동

stitch-mcp와 google-labs-code/stitch-skills를 참고하라.
```

### Prompt 3-2: Reviewer Familiar

```
familiars/reviewer.tome.md를 작성하라.
Reviewer Familiar의 정의:

1. 역할: PR 리뷰, 설계 원칙 검증
2. 검증 항목 목록 (SOLID, DRY, etc.)
3. Severity 레벨 정의
4. 리뷰 피드백 형식
5. 수정 요청 생성 방법

MCP 없이 Claude 자체 기능으로 구현.
```

### Prompt 3-3: 설계 원칙 Rules

```
runes/rules/design-principles.md를 작성하라.

다음 원칙들의 검증 규칙을 정의:
- KISS, YAGNI, DRY
- SOLID (5개 각각)
- Separation of Concerns
- Modularity
- Law of Demeter
- Curly's Law
- Fail Fast
- Principle of Least Astonishment
- Composition over Inheritance
- Defensive Programming
- Boy Scout Rule

각 원칙별로:
1. 설명
2. 위반 탐지 방법
3. 예시 (Good/Bad)
4. Severity 레벨
```

---

## Phase 4: Automation

### Prompt 4-1: 자동 리뷰 루프

```
자동 리뷰 루프를 구현하라.

워크플로우:
1. 코드 변경 감지
2. Reviewer Familiar 호출
3. Severity에 따른 분기
   - High/Critical: Codex로 자동 수정 → 재리뷰
   - Medium: 수정 권고 메시지
   - Low: 경고 로그
4. 리뷰 통과 시 완료

spells/auto-review.md로 정의하라.
```

### Prompt 4-2: 에러 해결 워크플로우

```
에러 해결 워크플로우를 구현하라.

워크플로우:
1. 에러 발생
2. FixHive 검색
3. 해결책 있음 → 적용
4. 해결책 없음 → Gemini 분석 → Codex 수정
5. 해결 성공 시 FixHive에 등록

spells/error-resolution.md로 정의하라.
```

### Prompt 4-3: Sequential Thinking 통합

```
Sequential Thinking MCP를 Archmage 워크플로우에 통합하라.

활용 시나리오:
1. 복잡한 요구사항 분석
2. 아키텍처 결정
3. 작업 분해 및 우선순위
4. 트레이드오프 분석

tower/circles/thinking-workflow.md로 정의하라.
```

---

## Phase 5: Optimization

### Prompt 5-1: 컨텍스트 최적화

```
컨텍스트 사용량을 분석하고 최적화하라.

1. 현재 MCP별 토큰 사용량 측정
2. 병목 지점 식별
3. 최적화 전략 수립
4. 구현 및 재측정

목표: Main context < 100K tokens
```

### Prompt 5-2: 병렬 실행 최적화

```
Familiar 병렬 실행을 최적화하라.

1. 의존성 분석으로 병렬 가능 작업 식별
2. 동시 실행 전략 정의
3. 결과 통합 방법 설계
4. 에러 핸들링 (부분 실패 시)
```

---

## Utility Prompts

### 진행 상황 확인

```
Grimoires 프로젝트의 현재 진행 상황을 확인하라.

1. docs/ARCHITECTURE.md의 Implementation Phases 체크리스트 확인
2. 완료된 항목과 미완료 항목 목록화
3. 다음 우선순위 작업 제안
```

### 테스트 실행

```
Grimoires의 [컴포넌트명]을 테스트하라.

테스트 시나리오:
1. [시나리오 설명]
2. [예상 결과]

결과를 분석하고 이슈가 있으면 수정하라.
```

### 문서 업데이트

```
[변경 내용]을 반영하여 문서를 업데이트하라.

1. README.md 업데이트 (필요시)
2. ARCHITECTURE.md 업데이트 (필요시)
3. 관련 .tome.md 파일 업데이트
4. 변경사항 커밋
```

---

## Quick Reference

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 1 | Foundation | 구조, Archmage, Serena, FixHive |
| 2 | Core Familiars | Codex, Gemini, 기본 워크플로우 |
| 3 | Design & Review | Stitch, Reviewer, Rules |
| 4 | Automation | 리뷰 루프, 에러 해결, Thinking |
| 5 | Optimization | 컨텍스트, 병렬화 |
| 6 | Release | 문서, 설치 스크립트 |

---

*Last Updated: 2026-01-25*
