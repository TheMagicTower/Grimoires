# Full Development Workflow

Archmage와 모든 Familiar가 협업하는 전체 개발 워크플로우입니다.

---

## 1. Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      GRIMOIRES DEVELOPMENT WORKFLOW                      │
│                                                                          │
│   User Request                                                           │
│        │                                                                 │
│        ▼                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                         ARCHMAGE                                 │   │
│   │   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐        │   │
│   │   │ Serena  │   │FixHive │   │Sequential│   │ Tools   │        │   │
│   │   │ Memory  │   │ Errors  │   │Thinking │   │         │        │   │
│   │   └─────────┘   └─────────┘   └─────────┘   └─────────┘        │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│        │                                                                 │
│        │ orchestrates                                                    │
│        ▼                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        FAMILIARS                                 │   │
│   │                                                                  │   │
│   │   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐        │   │
│   │   │  Codex  │   │ Gemini  │   │ Stitch  │   │Reviewer │        │   │
│   │   │  Code   │   │ Analyze │   │   UI    │   │ Review  │        │   │
│   │   └─────────┘   └─────────┘   └─────────┘   └─────────┘        │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│        │                                                                 │
│        ▼                                                                 │
│   Deliverables                                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Workflow Stages

### Stage Overview

| Stage | Name | Description | Familiars |
|-------|------|-------------|-----------|
| 1 | Intake | 요청 수신 및 분석 | Archmage |
| 2 | Planning | 설계 및 계획 수립 | Archmage + Sequential Thinking |
| 3 | Design | UI/UX 디자인 | Stitch |
| 4 | Implementation | 코드 구현 | Codex |
| 5 | Analysis | 품질 분석 | Gemini |
| 6 | Review | 코드 리뷰 | Reviewer |
| 7 | Integration | 통합 및 검증 | Archmage |
| 8 | Delivery | 최종 전달 | Archmage |

---

## 3. Stage Details

### Stage 1: Intake

```
User Request
     │
     ▼
┌─────────────────────────────────────┐
│           INTAKE                     │
│                                      │
│  1. Context Loading (Serena)        │
│     └── Previous session state      │
│     └── Project context             │
│     └── Architecture decisions      │
│                                      │
│  2. Request Analysis                 │
│     └── Parse user intent           │
│     └── Identify scope              │
│     └── Detect ambiguities          │
│                                      │
│  3. Clarification (if needed)       │
│     └── Ask clarifying questions    │
│                                      │
│  4. Complexity Assessment           │
│     └── Score calculation           │
│     └── Workflow selection          │
└─────────────────────────────────────┘
     │
     ▼
   Stage 2
```

**Complexity Score Factors**:

| Factor | Weight | Low (1-3) | Medium (4-6) | High (7-10) |
|--------|--------|-----------|--------------|-------------|
| Files | 20% | 1-2 files | 3-5 files | 6+ files |
| Dependencies | 20% | None | Internal | External |
| Unknowns | 20% | Clear | Some | Many |
| Risk | 20% | Reversible | Moderate | Critical |
| Decision Points | 20% | None | Few | Many |

---

### Stage 2: Planning

```
Complexity Score
     │
     ├── Score < 3: Direct Implementation
     │   └── Skip to Stage 4
     │
     ├── Score 3-6: Standard Planning
     │   └── Basic decomposition
     │
     └── Score > 6: Deep Planning
         └── Sequential Thinking
```

**Sequential Thinking Phases** (for complex tasks):

```
┌─────────────────────────────────────┐
│           PLANNING                   │
│                                      │
│  Phase 1: DEFINE                    │
│  └── Problem definition             │
│  └── Success criteria               │
│  └── Constraints                    │
│                                      │
│  Phase 2: DECOMPOSE                 │
│  └── Sub-problems                   │
│  └── Dependencies                   │
│  └── Familiar assignments           │
│                                      │
│  Phase 3: ANALYZE                   │
│  └── Technical analysis             │
│  └── Risk assessment                │
│                                      │
│  Phase 4: EVALUATE                  │
│  └── Options comparison             │
│  └── Trade-off analysis             │
│                                      │
│  Phase 5: DECIDE                    │
│  └── Solution selection             │
│  └── Decision documentation         │
│                                      │
│  Phase 6: PLAN                      │
│  └── Execution plan                 │
│  └── Timeline                       │
│  └── Familiar workflow              │
└─────────────────────────────────────┘
```

---

### Stage 3: Design (Optional)

UI/UX 관련 작업 시에만 실행

```
┌─────────────────────────────────────┐
│           DESIGN (Stitch)            │
│                                      │
│  Input:                              │
│  └── Design requirements            │
│  └── Brand guidelines               │
│  └── Technical constraints          │
│                                      │
│  Process:                            │
│  └── Layout design                  │
│  └── Component design               │
│  └── Design token generation        │
│                                      │
│  Output:                             │
│  └── UI components                  │
│  └── Style files                    │
│  └── Design tokens                  │
│  └── Preview                        │
└─────────────────────────────────────┘
```

---

### Stage 4: Implementation

```
┌─────────────────────────────────────┐
│       IMPLEMENTATION (Codex)         │
│                                      │
│  Input:                              │
│  └── Design spec (from Archmage)    │
│  └── UI components (from Stitch)    │
│  └── Requirements                   │
│                                      │
│  Process:                            │
│  └── Code generation                │
│  └── Test generation                │
│  └── Documentation                  │
│                                      │
│  Output:                             │
│  └── Source files                   │
│  └── Test files                     │
│  └── Type definitions               │
│                                      │
│  Verification:                       │
│  └── Lint check                     │
│  └── Type check                     │
│  └── Unit tests                     │
└─────────────────────────────────────┘
```

**Parallel Execution** (when possible):

```
         Archmage (Plan)
              │
      ┌───────┴───────┐
      ▼               ▼
  ┌─────────┐   ┌─────────┐
  │ Codex   │   │ Codex   │
  │Frontend │   │ Backend │
  └────┬────┘   └────┬────┘
       │             │
       └──────┬──────┘
              ▼
         Archmage
         (Merge)
```

---

### Stage 5: Analysis

```
┌─────────────────────────────────────┐
│         ANALYSIS (Gemini)            │
│                                      │
│  Input:                              │
│  └── Generated code                 │
│  └── Analysis focus areas           │
│                                      │
│  Analysis Types:                     │
│  └── Security review                │
│  └── Performance audit              │
│  └── Code quality check             │
│  └── Architecture alignment         │
│                                      │
│  Output:                             │
│  └── Analysis report                │
│  └── Issues found                   │
│  └── Recommendations                │
└─────────────────────────────────────┘
```

**When to Invoke Gemini**:

| Condition | Action |
|-----------|--------|
| Security-sensitive code | Always |
| Performance-critical code | Always |
| Large changes (>300 lines) | Recommended |
| Architecture changes | Always |
| Simple utilities | Skip |

---

### Stage 6: Review

```
┌─────────────────────────────────────┐
│          REVIEW (Reviewer)           │
│                                      │
│  Input:                              │
│  └── Code changes                   │
│  └── Gemini analysis (if any)       │
│  └── Design principles rules        │
│                                      │
│  Review Checklist:                   │
│  └── SOLID principles               │
│  └── DRY/KISS/YAGNI                 │
│  └── Error handling                 │
│  └── Naming conventions             │
│  └── Complexity limits              │
│                                      │
│  Output:                             │
│  └── Review status                  │
│  └── Issues with severity           │
│  └── Fix suggestions                │
└─────────────────────────────────────┘
```

**Review → Fix Loop**:

```
Review Result
     │
     ├── Approved → Stage 7
     │
     └── Changes Requested
              │
         ┌────┴────┐
         ▼         ▼
      Low/Med    High/Crit
         │         │
         ▼         ▼
      Notify    Auto-Fix
                   │
                   ▼
              ┌─────────┐
              │  Codex  │
              │   Fix   │
              └────┬────┘
                   │
                   └──► Re-Review (max 3)
```

---

### Stage 7: Integration

```
┌─────────────────────────────────────┐
│       INTEGRATION (Archmage)         │
│                                      │
│  Verification:                       │
│  └── All tests passing              │
│  └── Type check passing             │
│  └── Lint check passing             │
│  └── Build successful               │
│                                      │
│  Integration Checks:                 │
│  └── No conflicts                   │
│  └── Dependencies resolved          │
│  └── API compatibility              │
│                                      │
│  Documentation:                      │
│  └── Update CHANGELOG               │
│  └── Update API docs (if needed)    │
│  └── Update architecture docs       │
│                                      │
│  Memory Update:                      │
│  └── Serena: learned patterns       │
│  └── Serena: architecture decisions │
│  └── FixHive: new error solutions   │
└─────────────────────────────────────┘
```

---

### Stage 8: Delivery

```
┌─────────────────────────────────────┐
│         DELIVERY (Archmage)          │
│                                      │
│  Summary Generation:                 │
│  └── What was done                  │
│  └── Files changed                  │
│  └── Key decisions made             │
│                                      │
│  Artifacts:                          │
│  └── Code changes                   │
│  └── Test results                   │
│  └── Review report                  │
│                                      │
│  Next Steps:                         │
│  └── Suggested follow-ups           │
│  └── Known limitations              │
│  └── Future improvements            │
│                                      │
│  Session State:                      │
│  └── Update current-task.md         │
│  └── Save to Serena                 │
└─────────────────────────────────────┘
```

---

## 4. Workflow Variants

### 4.1 Quick Fix Workflow

단순 버그 수정 (Complexity < 3)

```
User Request → Archmage → Codex → Quick Review → Delivery
```

### 4.2 Feature Workflow

새 기능 개발 (Complexity 3-6)

```
User Request → Archmage → [Stitch] → Codex → Gemini → Reviewer → Delivery
```

### 4.3 Complex Feature Workflow

복잡한 기능 (Complexity > 6)

```
User Request
     │
     ▼
Archmage (Sequential Thinking)
     │
     ├── Stitch (UI Design)
     │        │
     └────────┼──────────────┐
              ▼              ▼
         Codex (FE)     Codex (BE)
              │              │
              └──────┬───────┘
                     ▼
               Gemini (Analysis)
                     │
                     ▼
               Reviewer
                     │
                     ▼
               Archmage (Integration)
                     │
                     ▼
               Delivery
```

### 4.4 Review-Only Workflow

코드 리뷰만 필요한 경우

```
User Request → Archmage → Reviewer → Delivery
```

### 4.5 Analysis-Only Workflow

분석만 필요한 경우

```
User Request → Archmage → Gemini → Delivery
```

---

## 5. Error Handling Flow

```
Error Occurs
     │
     ▼
┌─────────────────────────────────────┐
│        ERROR RESOLUTION              │
│                                      │
│  Step 1: FixHive Search             │
│  └── Search existing solutions      │
│                                      │
│       ┌─────┴─────┐                  │
│       ▼           ▼                  │
│    Found      Not Found              │
│       │           │                  │
│       ▼           ▼                  │
│    Apply      Gemini                 │
│       │       Analysis               │
│       │           │                  │
│       │           ▼                  │
│       │       Codex Fix              │
│       │           │                  │
│       │           ▼                  │
│       │       Verify                 │
│       │           │                  │
│       │           ├── Success        │
│       │           │       │          │
│       │           │       ▼          │
│       │           │   FixHive        │
│       │           │   Register       │
│       │           │                  │
│       │           └── Failure        │
│       │                   │          │
│       │                   ▼          │
│       │              Escalate        │
│       │                              │
│       └───────────────────┘          │
│              Done                    │
└─────────────────────────────────────┘
```

---

## 6. Communication Protocol

### 6.1 Request Format

```json
{
  "workflow_id": "wf-{timestamp}-{random}",
  "stage": "implementation",
  "familiar": "codex",
  "request": {
    "action": "implement",
    "context": {
      "files": [],
      "requirements": "",
      "constraints": []
    },
    "dependencies": {
      "from_stitch": { "components": [] },
      "from_gemini": { "findings": [] }
    }
  },
  "metadata": {
    "priority": "high",
    "timeout": 300,
    "parent_workflow": "wf-xxx"
  }
}
```

### 6.2 Response Format

```json
{
  "workflow_id": "wf-{timestamp}-{random}",
  "stage": "implementation",
  "familiar": "codex",
  "response": {
    "status": "success | failure | partial",
    "result": {
      "files_created": [],
      "files_modified": [],
      "tests_created": []
    },
    "issues": [],
    "notes": ""
  },
  "metrics": {
    "tokens_used": 5000,
    "time_elapsed": 60
  },
  "next_stage": "analysis"
}
```

---

## 7. Workflow State Management

### 7.1 State Machine

```
┌─────────┐
│  INIT   │
└────┬────┘
     │
     ▼
┌─────────┐   error    ┌─────────┐
│ INTAKE  │───────────►│  ERROR  │
└────┬────┘            └────┬────┘
     │                      │
     ▼                      │ resolved
┌─────────┐                 │
│PLANNING │◄────────────────┘
└────┬────┘
     │
     ▼
┌─────────┐
│ DESIGN  │ (optional)
└────┬────┘
     │
     ▼
┌─────────┐   error    ┌─────────┐
│IMPLEMENT│───────────►│  ERROR  │
└────┬────┘            └─────────┘
     │
     ▼
┌─────────┐
│ANALYSIS │
└────┬────┘
     │
     ▼
┌─────────┐   changes  ┌─────────┐
│ REVIEW  │───────────►│  FIX    │
└────┬────┘            └────┬────┘
     │                      │
     │ approved             │ fixed
     │                      │
     │◄─────────────────────┘
     │
     ▼
┌─────────┐
│INTEGRATE│
└────┬────┘
     │
     ▼
┌─────────┐
│DELIVERY │
└────┬────┘
     │
     ▼
┌─────────┐
│COMPLETE │
└─────────┘
```

### 7.2 Checkpoint & Recovery

```yaml
checkpoints:
  after_planning:
    save: execution_plan
    recoverable: true

  after_implementation:
    save: generated_files
    recoverable: true

  after_review:
    save: review_result
    recoverable: true

recovery:
  on_failure:
    - rollback_files
    - restore_checkpoint
    - notify_user
```

---

## 8. Metrics & Monitoring

### 8.1 Workflow Metrics

| Metric | Description |
|--------|-------------|
| Total Time | 전체 워크플로우 소요 시간 |
| Stage Times | 각 단계별 소요 시간 |
| Token Usage | 총 토큰 사용량 |
| Review Cycles | 리뷰 반복 횟수 |
| Error Rate | 에러 발생 비율 |
| Fix Success | 자동 수정 성공률 |

### 8.2 Quality Metrics

| Metric | Target |
|--------|--------|
| First-pass Review | > 70% |
| Test Coverage | > 80% |
| Critical Issues | 0 |
| Security Issues | 0 |

---

## 9. Example Scenarios

### 9.1 Simple Bug Fix

```
User: "로그인 버튼이 작동하지 않아요"

Workflow:
1. Intake: 버그 확인, 복잡도 2
2. Planning: Skip (simple)
3. Design: Skip
4. Implementation: Codex 수정
5. Analysis: Skip (simple fix)
6. Review: Quick review
7. Integration: Test verification
8. Delivery: Complete

Total Time: ~5 min
```

### 9.2 New Feature

```
User: "사용자 프로필 페이지를 추가해주세요"

Workflow:
1. Intake: 요구사항 분석, 복잡도 5
2. Planning: Standard planning
3. Design: Stitch - UI 컴포넌트
4. Implementation: Codex - 페이지 구현
5. Analysis: Gemini - 보안/품질
6. Review: Reviewer - 원칙 검증
7. Integration: 통합 테스트
8. Delivery: Complete

Total Time: ~30 min
```

### 9.3 Architecture Change

```
User: "인증을 JWT에서 OAuth로 변경해주세요"

Workflow:
1. Intake: 요구사항 분석, 복잡도 8
2. Planning: Sequential Thinking
   - Define: 마이그레이션 범위
   - Decompose: 하위 작업 분해
   - Analyze: 영향 분석
   - Evaluate: 접근법 비교
   - Decide: 전략 선택
   - Plan: 실행 계획
3. Design: Skip (no UI changes)
4. Implementation: Codex - 단계별 구현
5. Analysis: Gemini - 보안 리뷰
6. Review: Reviewer - 전체 검증
7. Integration: 마이그레이션 테스트
8. Delivery: Complete

Total Time: ~2 hours
```

---

## 10. Best Practices

### 10.1 Efficient Workflows

- 복잡도에 맞는 워크플로우 선택
- 가능한 경우 병렬 실행
- 불필요한 단계 스킵

### 10.2 Quality Assurance

- 모든 변경에 테스트 포함
- 복잡한 변경은 Gemini 분석 필수
- 리뷰 피드백 반영

### 10.3 Documentation

- 중요 결정은 항상 기록
- 세션 종료 시 상태 저장
- 학습된 패턴 축적

---

*Version: 0.1.0*
*Last Updated: 2026-01-25*
