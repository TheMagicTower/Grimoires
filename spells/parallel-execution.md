# Parallel Execution Guide

Familiar들을 병렬로 실행하여 워크플로우 성능을 최적화하는 전략입니다.

---

## 1. Overview

### 1.1 Why Parallel Execution?

```
Sequential Execution (Slow)
─────────────────────────────────────────────────────►
│ Codex FE │ Codex BE │ Gemini │ Reviewer │
    30s        30s       20s       15s     = 95s total


Parallel Execution (Fast)
─────────────────────────────────────────────────────►
│ Codex FE ├──────────┤
│ Codex BE ├──────────┤
               │ Gemini │ Reviewer │
    30s           20s       15s     = 65s total
                                      (32% faster)
```

### 1.2 Parallelization Rules

| Rule | Description |
|------|-------------|
| **P1** | 의존성 없는 작업은 병렬 실행 |
| **P2** | 동일 파일 수정 작업은 순차 실행 |
| **P3** | 분석 작업은 구현 완료 후 실행 |
| **P4** | 리뷰는 모든 구현 완료 후 실행 |

---

## 2. Dependency Analysis

### 2.1 Task Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPENDENCY GRAPH                          │
│                                                              │
│                    ┌─────────┐                              │
│                    │ Planning │                              │
│                    └────┬────┘                              │
│                         │                                    │
│            ┌────────────┼────────────┐                      │
│            ▼            ▼            ▼                      │
│      ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│      │ Stitch   │ │ Codex FE │ │ Codex BE │                │
│      │   UI     │ │(depends  │ │          │                │
│      │          │ │on Stitch)│ │          │                │
│      └────┬─────┘ └────┬─────┘ └────┬─────┘                │
│           │            │            │                        │
│           └──────┬─────┴────────────┘                       │
│                  │                                           │
│                  ▼                                           │
│            ┌──────────┐                                     │
│            │  Gemini  │                                     │
│            │ Analysis │                                     │
│            └────┬─────┘                                     │
│                 │                                            │
│                 ▼                                            │
│            ┌──────────┐                                     │
│            │ Reviewer │                                     │
│            └──────────┘                                     │
│                                                              │
│  Legend:                                                     │
│  ───► Sequential dependency                                 │
│  Parallel: Tasks at same level with no arrows between       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Dependency Types

| Type | Description | Example |
|------|-------------|---------|
| **Hard** | 반드시 순차 실행 | Stitch → Codex FE (UI 필요) |
| **Soft** | 권장 순차, 병렬 가능 | Codex FE, Codex BE |
| **None** | 완전 독립 | 서로 다른 모듈 |

### 2.3 Dependency Detection

```json
{
  "tasks": [
    {
      "id": "T1",
      "familiar": "stitch",
      "outputs": ["components/Button.tsx"],
      "dependencies": []
    },
    {
      "id": "T2",
      "familiar": "codex",
      "outputs": ["pages/Login.tsx"],
      "dependencies": ["T1"],  // Hard: needs Button
      "reason": "imports Button component"
    },
    {
      "id": "T3",
      "familiar": "codex",
      "outputs": ["api/auth.ts"],
      "dependencies": [],  // Independent
      "parallel_with": ["T1", "T2"]
    }
  ]
}
```

---

## 3. Execution Patterns

### 3.1 Pattern A: Independent Tasks

모든 작업이 독립적인 경우

```
         Archmage
             │
    ┌────────┼────────┐
    ▼        ▼        ▼
┌───────┐┌───────┐┌───────┐
│Task A ││Task B ││Task C │
│Codex  ││Codex  ││Codex  │
└───┬───┘└───┬───┘└───┬───┘
    │        │        │
    └────────┼────────┘
             ▼
         Archmage
         (Merge)
```

**Implementation**:

```json
{
  "execution": "parallel",
  "tasks": [
    { "id": "A", "familiar": "codex", "file": "utils/format.ts" },
    { "id": "B", "familiar": "codex", "file": "utils/validate.ts" },
    { "id": "C", "familiar": "codex", "file": "utils/transform.ts" }
  ],
  "merge_strategy": "collect_all"
}
```

### 3.2 Pattern B: Staged Parallel

단계별 병렬 실행

```
Stage 1 (Design + Backend)
    ┌────────────────┐
    │    Archmage    │
    └───────┬────────┘
            │
    ┌───────┴───────┐
    ▼               ▼
┌───────┐       ┌───────┐
│Stitch │       │Codex  │
│  UI   │       │Backend│
└───┬───┘       └───┬───┘
    │               │
    └───────┬───────┘
            ▼

Stage 2 (Frontend needs UI)
    ┌───────────────┐
    │    Codex      │
    │   Frontend    │
    └───────┬───────┘
            │
            ▼

Stage 3 (Analysis + Review)
    ┌───────┴───────┐
    ▼               ▼
┌───────┐       ┌───────┐
│Gemini │       │Review │
│       │       │(light)│
└───┬───┘       └───┬───┘
    │               │
    └───────┬───────┘
            ▼
        Complete
```

**Implementation**:

```json
{
  "execution": "staged_parallel",
  "stages": [
    {
      "stage": 1,
      "parallel": true,
      "tasks": [
        { "id": "UI", "familiar": "stitch" },
        { "id": "BE", "familiar": "codex" }
      ]
    },
    {
      "stage": 2,
      "parallel": false,
      "tasks": [
        { "id": "FE", "familiar": "codex", "depends": ["UI"] }
      ]
    },
    {
      "stage": 3,
      "parallel": true,
      "tasks": [
        { "id": "Analysis", "familiar": "gemini", "depends": ["FE", "BE"] },
        { "id": "Review", "familiar": "reviewer", "depends": ["FE", "BE"] }
      ]
    }
  ]
}
```

### 3.3 Pattern C: Pipeline

연속적인 처리가 필요한 경우

```
    Input
      │
      ▼
┌───────────┐
│  Gemini   │ Analyze
└─────┬─────┘
      │ findings
      ▼
┌───────────┐
│   Codex   │ Fix
└─────┬─────┘
      │ fixed code
      ▼
┌───────────┐
│ Reviewer  │ Verify
└─────┬─────┘
      │
      ▼
   Output
```

**Implementation**:

```json
{
  "execution": "pipeline",
  "steps": [
    {
      "familiar": "gemini",
      "action": "analyze",
      "output_key": "findings"
    },
    {
      "familiar": "codex",
      "action": "fix",
      "input_from": "findings",
      "output_key": "fixed_code"
    },
    {
      "familiar": "reviewer",
      "action": "verify",
      "input_from": "fixed_code"
    }
  ]
}
```

### 3.4 Pattern D: Fan-Out/Fan-In

하나의 작업을 분할하여 병렬 처리 후 병합

```
        Large Task
             │
             ▼
      ┌──────────────┐
      │   Split      │
      └──────┬───────┘
             │
    ┌────────┼────────┐
    ▼        ▼        ▼
┌───────┐┌───────┐┌───────┐
│Part 1 ││Part 2 ││Part 3 │
│Codex  ││Codex  ││Codex  │
└───┬───┘└───┬───┘└───┬───┘
    │        │        │
    └────────┼────────┘
             ▼
      ┌──────────────┐
      │    Merge     │
      └──────────────┘
```

**Implementation**:

```json
{
  "execution": "fan_out_fan_in",
  "split": {
    "strategy": "by_module",
    "input": "src/",
    "partitions": ["auth/", "user/", "payment/"]
  },
  "parallel_tasks": {
    "familiar": "codex",
    "action": "refactor",
    "per_partition": true
  },
  "merge": {
    "strategy": "collect_changes",
    "conflict_resolution": "manual"
  }
}
```

---

## 4. Conflict Resolution

### 4.1 File Conflict Detection

```
┌─────────────────────────────────────────────────────────────┐
│                 CONFLICT DETECTION                           │
│                                                              │
│  Task A (Codex)        Task B (Codex)                       │
│  ├── modify auth.ts    ├── modify auth.ts  ← CONFLICT       │
│  └── create util.ts    └── modify user.ts  ← OK             │
│                                                              │
│  Detection:                                                  │
│  1. Before parallel execution, check output files           │
│  2. If overlap detected:                                    │
│     - Option A: Serialize conflicting tasks                 │
│     - Option B: Merge results carefully                     │
│     - Option C: Assign to single Familiar                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Conflict Resolution Strategies

| Strategy | When to Use | Pros | Cons |
|----------|-------------|------|------|
| **Serialize** | High conflict risk | Safe | Slower |
| **Merge** | Low conflict, additive changes | Fast | Risk |
| **Consolidate** | Same file, different parts | Balanced | Complex |

### 4.3 Merge Implementation

```json
{
  "merge_strategy": {
    "type": "smart_merge",

    "rules": {
      "same_function": "serialize",
      "different_functions": "merge",
      "imports": "union",
      "types": "union"
    },

    "conflict_handling": {
      "auto_resolvable": "apply",
      "manual_required": "pause_and_notify"
    }
  }
}
```

---

## 5. Resource Management

### 5.1 Concurrency Limits

```yaml
concurrency:
  # 전역 제한
  global:
    max_parallel_familiars: 4
    max_parallel_tasks: 8

  # Familiar별 제한
  per_familiar:
    codex:
      max_instances: 3
      rate_limit: 10/minute

    gemini:
      max_instances: 2
      rate_limit: 5/minute

    stitch:
      max_instances: 2
      rate_limit: 5/minute

    reviewer:
      max_instances: 2
      rate_limit: 20/minute

  # 리소스 기반 제한
  resource_based:
    max_total_tokens_per_minute: 100000
    max_api_calls_per_minute: 30
```

### 5.2 Queue Management

```
┌─────────────────────────────────────────────────────────────┐
│                      TASK QUEUE                              │
│                                                              │
│  Priority Queue                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [P1: Critical Fix] [P2: Feature] [P3: Refactor] ... │    │
│  └─────────────────────────────────────────────────────┘    │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              SCHEDULER                               │    │
│  │  - Check concurrency limits                         │    │
│  │  - Check dependencies                               │    │
│  │  - Allocate to available slots                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                         │                                    │
│          ┌──────────────┼──────────────┐                    │
│          ▼              ▼              ▼                    │
│     ┌─────────┐    ┌─────────┐    ┌─────────┐              │
│     │ Slot 1  │    │ Slot 2  │    │ Slot 3  │              │
│     │ Codex   │    │ Gemini  │    │ Codex   │              │
│     └─────────┘    └─────────┘    └─────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Error Handling in Parallel

### 6.1 Failure Modes

| Mode | Description | Handling |
|------|-------------|----------|
| **Single Failure** | 하나의 태스크만 실패 | 해당 태스크만 재시도 |
| **Cascade Failure** | 의존 태스크들도 실패 | 의존 체인 롤백 |
| **Partial Success** | 일부만 성공 | 성공 결과 유지, 실패 재시도 |

### 6.2 Recovery Strategies

```
Task Failure Detected
         │
         ▼
┌─────────────────────┐
│ Check Failure Type  │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
Isolated      Has Dependents
    │             │
    ▼             ▼
┌─────────┐ ┌─────────────────┐
│ Retry   │ │ Pause Dependents│
│ Task    │ │ + Retry Task    │
└────┬────┘ └────────┬────────┘
     │               │
     ├───────────────┤
     │               │
     ▼               ▼
  Success         Fail Again
     │               │
     ▼               ▼
  Continue      ┌─────────────┐
  Others        │ Rollback or │
                │ Escalate    │
                └─────────────┘
```

### 6.3 Rollback Implementation

```json
{
  "error_handling": {
    "on_failure": {
      "strategy": "isolate_and_retry",
      "max_retries": 2,
      "retry_delay": 5000
    },

    "on_cascade_failure": {
      "strategy": "rollback_chain",
      "preserve_successful": true
    },

    "rollback": {
      "enabled": true,
      "checkpoint_before_parallel": true,
      "restore_on_failure": true
    }
  }
}
```

---

## 7. Monitoring & Observability

### 7.1 Parallel Execution Metrics

```yaml
metrics:
  parallelism:
    - active_tasks
    - queue_depth
    - slot_utilization
    - avg_wait_time

  performance:
    - parallel_speedup_ratio
    - task_completion_time
    - merge_time

  reliability:
    - failure_rate
    - retry_count
    - rollback_count
```

### 7.2 Execution Timeline

```
Timeline View:
────────────────────────────────────────────────────────────►
│                        Time (seconds)                      │
│  0    10    20    30    40    50    60    70    80        │
│  │     │     │     │     │     │     │     │     │        │
│  ├─────────────────┤                                       │
│  │   Codex (FE)    │                                       │
│  │                 │                                       │
│  ├────────────────────────┤                                │
│  │     Codex (BE)         │                                │
│  │                        │                                │
│  │           ├────────────────────┤                        │
│  │           │     Gemini         │                        │
│  │           │                    │                        │
│  │           │              ├───────────┤                  │
│  │           │              │ Reviewer  │                  │
│  │           │              │           │                  │
│  └───────────┴──────────────┴───────────┘                  │
│                                          │                  │
│  Total: 70s (Sequential would be: 100s)  │                  │
│  Speedup: 30%                            │                  │
────────────────────────────────────────────────────────────►
```

---

## 8. Configuration

### 8.1 Parallel Execution Config

```yaml
# runes/config/parallel.yaml
parallel_execution:
  enabled: true

  scheduler:
    algorithm: priority_with_dependencies
    check_interval: 1000  # ms

  concurrency:
    max_parallel: 4
    per_familiar_limit:
      codex: 3
      gemini: 2
      stitch: 2
      reviewer: 2

  dependencies:
    auto_detect: true
    file_conflict_check: true

  error_handling:
    retry_failed: true
    max_retries: 2
    rollback_on_cascade: true

  optimization:
    batch_small_tasks: true
    min_batch_size: 3
    max_batch_size: 10
```

---

## 9. Best Practices

### 9.1 When to Parallelize

✅ **Good candidates**:
- 서로 다른 모듈/파일 수정
- 독립적인 기능 구현
- 다중 분석 (보안 + 성능)
- 테스트 실행

❌ **Avoid parallelizing**:
- 같은 파일 수정
- 순차적 의존성 있는 작업
- 상태 공유가 필요한 작업

### 9.2 Optimization Tips

1. **Early dependency detection**: 실행 전 의존성 분석
2. **Smart batching**: 작은 태스크들 묶어서 실행
3. **Resource awareness**: API 제한 고려
4. **Checkpoint often**: 병렬 실행 전 체크포인트

### 9.3 Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| 과도한 병렬화 | 적절한 concurrency 제한 |
| 파일 충돌 무시 | 충돌 검사 활성화 |
| 에러 전파 | 격리된 에러 처리 |
| 리소스 고갈 | 레이트 리밋 설정 |

---

*Version: 0.1.0*
*Last Updated: 2026-01-25*
