# Sequential Thinking Workflow

Archmage가 Sequential Thinking MCP를 활용하여 복잡한 문제를 분해하고 해결하는 워크플로우입니다.

---

## 1. Overview

Sequential Thinking은 복잡한 문제를 체계적으로 분석하고 단계별로 해결하는 사고 프레임워크입니다.

```
┌─────────────────────────────────────────────────────────────┐
│                  SEQUENTIAL THINKING                         │
│                                                              │
│    Complex Problem                                           │
│          │                                                   │
│          ▼                                                   │
│    ┌───────────┐                                            │
│    │  DEFINE   │  문제 정의 및 범위 설정                      │
│    └─────┬─────┘                                            │
│          │                                                   │
│          ▼                                                   │
│    ┌───────────┐                                            │
│    │ DECOMPOSE │  하위 문제로 분해                           │
│    └─────┬─────┘                                            │
│          │                                                   │
│          ▼                                                   │
│    ┌───────────┐                                            │
│    │  ANALYZE  │  각 하위 문제 분석                          │
│    └─────┬─────┘                                            │
│          │                                                   │
│          ▼                                                   │
│    ┌───────────┐                                            │
│    │  EVALUATE │  대안 평가 및 트레이드오프                   │
│    └─────┬─────┘                                            │
│          │                                                   │
│          ▼                                                   │
│    ┌───────────┐                                            │
│    │  DECIDE   │  최적 솔루션 선택                           │
│    └─────┬─────┘                                            │
│          │                                                   │
│          ▼                                                   │
│    ┌───────────┐                                            │
│    │   PLAN    │  실행 계획 수립                             │
│    └───────────┘                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. When to Use

### 2.1 Trigger Conditions

| Condition | Example |
|-----------|---------|
| 복잡한 요구사항 | "마이크로서비스 아키텍처로 마이그레이션" |
| 아키텍처 결정 | "어떤 데이터베이스를 선택할지" |
| 트레이드오프 분석 | "성능 vs 유지보수성" |
| 멀티 Familiar 협업 | "UI + API + DB 변경이 필요한 기능" |
| 디버깅 난제 | "간헐적으로 발생하는 버그" |
| 리팩토링 계획 | "레거시 코드 현대화" |

### 2.2 Complexity Assessment

```
요청 수신
    │
    ▼
┌─────────────────────────┐
│  Complexity Assessment  │
│                         │
│  Score = Σ factors      │
│  ├── Files involved     │
│  ├── Dependencies       │
│  ├── Unknowns          │
│  ├── Risk level        │
│  └── Decision points   │
└───────────┬─────────────┘
            │
      ┌─────┴─────┐
      ▼           ▼
   Score < 5   Score >= 5
      │           │
      ▼           ▼
   Direct     Sequential
   Execute    Thinking
```

---

## 3. Thinking Phases

### 3.1 Phase 1: DEFINE

**목적**: 문제의 본질과 범위를 명확히 정의

```markdown
## Problem Definition

### What is the problem?
[문제 설명]

### What is NOT the problem?
[범위 밖 사항]

### Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

### Constraints
- Time: [시간 제약]
- Resources: [리소스 제약]
- Technical: [기술적 제약]

### Stakeholders
- Primary: [주요 이해관계자]
- Secondary: [부차적 이해관계자]
```

**Output Example**:

```json
{
  "phase": "define",
  "problem": "사용자 인증 시스템의 응답 시간이 느림 (>2초)",
  "not_problem": "기능적 오류, 보안 취약점",
  "success_criteria": [
    "응답 시간 < 500ms",
    "기존 API 호환성 유지"
  ],
  "constraints": {
    "time": "1주일",
    "technical": "현재 DB 유지"
  }
}
```

---

### 3.2 Phase 2: DECOMPOSE

**목적**: 복잡한 문제를 관리 가능한 하위 문제로 분해

```
Main Problem
    │
    ├── Sub-problem A
    │   ├── Task A.1
    │   └── Task A.2
    │
    ├── Sub-problem B
    │   ├── Task B.1
    │   ├── Task B.2
    │   └── Task B.3
    │
    └── Sub-problem C
        └── Task C.1
```

**Decomposition Template**:

```markdown
## Problem Decomposition

### Sub-problems
1. **SP-1**: [하위 문제 1]
   - Dependencies: [의존성]
   - Complexity: Low/Medium/High
   - Owner: Codex/Gemini/Stitch

2. **SP-2**: [하위 문제 2]
   - Dependencies: SP-1
   - Complexity: Medium
   - Owner: Codex

### Dependency Graph
SP-1 ──► SP-2 ──► SP-3
           │
           └──► SP-4
```

**Output Example**:

```json
{
  "phase": "decompose",
  "sub_problems": [
    {
      "id": "SP-1",
      "title": "DB 쿼리 분석",
      "complexity": "medium",
      "owner": "gemini",
      "dependencies": []
    },
    {
      "id": "SP-2",
      "title": "캐싱 전략 설계",
      "complexity": "medium",
      "owner": "archmage",
      "dependencies": ["SP-1"]
    },
    {
      "id": "SP-3",
      "title": "캐시 구현",
      "complexity": "low",
      "owner": "codex",
      "dependencies": ["SP-2"]
    }
  ]
}
```

---

### 3.3 Phase 3: ANALYZE

**목적**: 각 하위 문제에 대한 심층 분석

```markdown
## Analysis: SP-1 (DB 쿼리 분석)

### Current State
- 현재 쿼리 실행 시간: 1.8초
- 테이블 크기: 1M rows
- 인덱스: created_at만 존재

### Root Cause
- user_id 컬럼에 인덱스 없음
- N+1 쿼리 패턴 발견
- 불필요한 JOIN 존재

### Impact Assessment
- 성능: High (주요 병목)
- 변경 범위: Medium (2개 파일)
- 리스크: Low (읽기 전용 쿼리)
```

---

### 3.4 Phase 4: EVALUATE

**목적**: 가능한 솔루션들의 트레이드오프 분석

```markdown
## Solution Evaluation

### Option A: 인덱스 추가
| Factor | Score | Notes |
|--------|-------|-------|
| 효과 | 8/10 | 쿼리 시간 70% 감소 예상 |
| 구현 난이도 | 2/10 | 간단한 마이그레이션 |
| 리스크 | 3/10 | 인덱스 생성 시 잠금 |
| 유지보수 | 9/10 | 추가 유지보수 불필요 |
| **Total** | **7.5** | |

### Option B: Redis 캐싱
| Factor | Score | Notes |
|--------|-------|-------|
| 효과 | 9/10 | 응답 시간 90% 감소 |
| 구현 난이도 | 6/10 | 캐시 로직 필요 |
| 리스크 | 5/10 | 캐시 일관성 관리 |
| 유지보수 | 5/10 | Redis 인프라 필요 |
| **Total** | **6.25** | |

### Option C: 쿼리 리팩토링 + 인덱스
| Factor | Score | Notes |
|--------|-------|-------|
| 효과 | 9/10 | 근본적 해결 |
| 구현 난이도 | 4/10 | 쿼리 수정 필요 |
| 리스크 | 4/10 | 테스트 필요 |
| 유지보수 | 8/10 | 깔끔한 쿼리 |
| **Total** | **7.75** | |

### Recommendation
**Option C** - 쿼리 리팩토링 + 인덱스 추가
```

---

### 3.5 Phase 5: DECIDE

**목적**: 분석을 바탕으로 최종 결정

```markdown
## Decision Record

### Decision
쿼리 리팩토링과 인덱스 추가 병행 (Option C)

### Rationale
1. 근본적인 문제 해결 (N+1 제거)
2. 추가 인프라 불필요
3. 장기적 유지보수 용이

### Trade-offs Accepted
- 구현 시간: 인덱스만 추가하는 것보다 오래 걸림
- 테스트 필요: 쿼리 변경으로 인한 회귀 테스트 필수

### Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| 쿼리 변경으로 버그 | 충분한 테스트 커버리지 |
| 인덱스 생성 시 락 | 트래픽 낮은 시간에 실행 |

### Reversibility
- 쿼리 변경: Git revert로 복구 가능
- 인덱스: DROP INDEX로 제거 가능
```

---

### 3.6 Phase 6: PLAN

**목적**: 실행 가능한 상세 계획 수립

```markdown
## Execution Plan

### Phase 1: 준비 (Day 1)
- [ ] 현재 쿼리 성능 베이스라인 측정
- [ ] 테스트 케이스 작성
- [ ] 롤백 계획 수립

### Phase 2: 구현 (Day 2-3)
- [ ] SP-1: Gemini - 쿼리 분석 리포트
- [ ] SP-2: Archmage - 리팩토링 설계
- [ ] SP-3: Codex - 쿼리 리팩토링 구현
- [ ] SP-4: Codex - 인덱스 마이그레이션 작성

### Phase 3: 검증 (Day 4)
- [ ] 단위 테스트 실행
- [ ] 통합 테스트 실행
- [ ] 성능 테스트 실행

### Phase 4: 배포 (Day 5)
- [ ] 스테이징 배포
- [ ] 프로덕션 배포 (트래픽 낮은 시간)
- [ ] 모니터링

### Familiar Assignments
| Task | Familiar | Estimated Time |
|------|----------|----------------|
| 쿼리 분석 | Gemini | 30min |
| 설계 | Archmage | 20min |
| 구현 | Codex | 2hr |
| 리뷰 | Reviewer | 30min |
```

---

## 4. MCP Integration

### 4.1 Sequential Thinking MCP Tools

| Tool | Description |
|------|-------------|
| `create_thought` | 새로운 사고 단계 생성 |
| `branch_thought` | 대안적 사고 경로 분기 |
| `evaluate_options` | 옵션 비교 평가 |
| `summarize_thinking` | 사고 과정 요약 |

### 4.2 Invocation Pattern

```json
{
  "tool": "sequential-thinking",
  "action": "create_thought",
  "params": {
    "phase": "define",
    "content": "문제: 인증 API 응답 시간 개선",
    "context": {
      "current_state": "평균 2초",
      "target": "500ms 이하"
    }
  }
}
```

---

## 5. Thinking Templates

### 5.1 Architecture Decision

```markdown
# Architecture Decision: [제목]

## Context
[현재 상황과 문제]

## Options Considered
1. Option A: [설명]
2. Option B: [설명]
3. Option C: [설명]

## Decision Matrix
| Criteria | Weight | Opt A | Opt B | Opt C |
|----------|--------|-------|-------|-------|
| 성능 | 30% | 7 | 9 | 8 |
| 유지보수 | 25% | 8 | 5 | 7 |
| 비용 | 20% | 9 | 4 | 6 |
| 확장성 | 25% | 6 | 9 | 8 |
| **Weighted** | | **7.4** | **6.7** | **7.3** |

## Decision
[선택된 옵션과 이유]

## Consequences
- Positive: [긍정적 결과]
- Negative: [부정적 결과]
- Risks: [위험 요소]
```

### 5.2 Bug Investigation

```markdown
# Bug Investigation: [제목]

## Symptoms
- [증상 1]
- [증상 2]

## Reproduction Steps
1. [단계 1]
2. [단계 2]

## Hypothesis Tree
├── H1: [가설 1]
│   ├── Evidence for: [지지 증거]
│   └── Evidence against: [반박 증거]
├── H2: [가설 2]
└── H3: [가설 3]

## Root Cause
[확인된 근본 원인]

## Fix Strategy
[수정 전략]
```

### 5.3 Feature Planning

```markdown
# Feature Planning: [기능명]

## User Story
As a [user], I want [feature] so that [benefit].

## Acceptance Criteria
- [ ] AC1: [조건 1]
- [ ] AC2: [조건 2]

## Technical Breakdown
1. **Frontend**
   - Component: [컴포넌트]
   - State: [상태 관리]

2. **Backend**
   - API: [엔드포인트]
   - Logic: [비즈니스 로직]

3. **Database**
   - Schema: [스키마 변경]
   - Migration: [마이그레이션]

## Familiar Workflow
Stitch (UI) → Codex (Frontend) → Codex (Backend) → Gemini (Review)

## Estimated Effort
- Design: [시간]
- Implementation: [시간]
- Testing: [시간]
```

---

## 6. Integration with Familiars

### 6.1 Thinking → Familiar Flow

```
Sequential Thinking Complete
            │
            ▼
    ┌───────────────┐
    │  Execution    │
    │    Plan       │
    └───────┬───────┘
            │
    ┌───────┴───────┐
    ▼               ▼
Parallel Tasks  Sequential Tasks
    │               │
    ├── Stitch      ├── 1. Gemini (분석)
    └── Codex (A)   ├── 2. Codex (구현)
                    └── 3. Reviewer (검증)
```

### 6.2 Familiar Feedback Loop

```
Thinking → Plan → Execute → Feedback
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
               Success             Issue Found
                    │                   │
                    ▼                   ▼
               Complete          Re-think (specific phase)
```

---

## 7. Best Practices

### 7.1 When to Think Deeply

- 되돌리기 어려운 결정
- 여러 팀/시스템에 영향
- 장기적 결과가 중요한 경우

### 7.2 When to Think Fast

- 명확한 해결책이 있는 경우
- 쉽게 되돌릴 수 있는 변경
- 시간이 촉박한 버그 수정

### 7.3 Documentation

- 모든 중요 결정은 `architecture-decisions.md`에 기록
- 반복되는 패턴은 템플릿화
- 실패한 접근법도 기록 (같은 실수 방지)

---

*Version: 0.1.0*
*Last Updated: 2026-01-25*
