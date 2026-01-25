# Context Optimization Guide

Grimoires 시스템의 컨텍스트(토큰) 사용량을 최적화하는 전략입니다.

---

## 1. Overview

### 1.1 Context Budget

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      TOTAL CONTEXT BUDGET                                │
│                                                                          │
│  Archmage (Main Context)                                                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Model: Claude (200K tokens)                                       │  │
│  │                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │ MCP Overhead (~80K)                                          │ │  │
│  │  │ ├── Serena: ~50K                                             │ │  │
│  │  │ ├── FixHive: ~10K                                            │ │  │
│  │  │ └── Sequential Thinking: ~20K                                │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │ Available for Conversation: ~120K                            │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Familiars (Isolated Contexts)                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │    Codex     │ │   Gemini     │ │   Stitch     │ │  Reviewer    │   │
│  │   ~30K MCP   │ │   ~1M ctx    │ │   ~40K MCP   │ │   ~20K       │   │
│  │  (isolated)  │ │  (isolated)  │ │  (isolated)  │ │  (isolated)  │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Optimization Goals

| Goal | Target | Current |
|------|--------|---------|
| Main Context Usage | < 100K | ~80K (MCP only) |
| Per-Task Overhead | < 5K | Variable |
| Familiar Handoff | < 2K | Variable |
| Memory Recall | < 10K | ~5K |

---

## 2. MCP Isolation Strategy

### 2.1 Why Isolate?

```
❌ Without Isolation (Bad)
┌─────────────────────────────────────┐
│         Main Context                 │
│  ┌─────────────────────────────────┐│
│  │ ALL MCPs loaded: ~200K tokens   ││
│  │ ├── Serena: 50K                 ││
│  │ ├── FixHive: 10K                ││
│  │ ├── Sequential: 20K             ││
│  │ ├── Codex: 30K                  ││
│  │ ├── Gemini: 50K                 ││
│  │ └── Stitch: 40K                 ││
│  │                                  ││
│  │ Available: ~0K (OVERFLOW!)      ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘

✅ With Isolation (Good)
┌─────────────────────────────────────┐
│         Main Context (Archmage)      │
│  ┌─────────────────────────────────┐│
│  │ Core MCPs only: ~80K tokens     ││
│  │ ├── Serena: 50K                 ││
│  │ ├── FixHive: 10K                ││
│  │ └── Sequential: 20K             ││
│  │                                  ││
│  │ Available: ~120K ✓              ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
        │
        │ spawn isolated
        ▼
┌───────────────┐
│ Familiar      │
│ (own MCP)     │
│ returns only  │
│ result (~2K)  │
└───────────────┘
```

### 2.2 Isolation Rules

| Rule | Description |
|------|-------------|
| **R1** | Archmage는 오케스트레이션 MCP만 로드 |
| **R2** | 각 Familiar는 자신의 MCP만 로드 |
| **R3** | Familiar 간 직접 MCP 공유 금지 |
| **R4** | 결과만 반환, 전체 컨텍스트 전달 금지 |

---

## 3. Request Optimization

### 3.1 Minimal Context Passing

```json
// ❌ Bad: 불필요한 정보 포함
{
  "familiar": "codex",
  "context": {
    "entire_codebase": "... 500K tokens ...",
    "all_history": "... 100K tokens ...",
    "unrelated_files": "..."
  }
}

// ✅ Good: 필요한 정보만
{
  "familiar": "codex",
  "context": {
    "target_file": "src/auth.ts (content)",
    "requirements": "Add error handling",
    "related_interfaces": "AuthResult type definition"
  }
}
```

### 3.2 File Content Strategies

| Strategy | When to Use | Token Savings |
|----------|-------------|---------------|
| Full Content | 새 파일 생성, 전체 수정 | - |
| Diff Only | 부분 수정 | 70-90% |
| Reference Only | 읽기만 필요 | 95%+ |
| Summary | 컨텍스트 이해용 | 80-95% |

**Implementation**:

```json
// Full Content (필요시만)
{
  "file": {
    "path": "src/auth.ts",
    "mode": "full",
    "content": "// entire file"
  }
}

// Diff Only (수정 시)
{
  "file": {
    "path": "src/auth.ts",
    "mode": "diff",
    "target_lines": "45-60",
    "context_lines": 5
  }
}

// Reference Only (참조만)
{
  "file": {
    "path": "src/auth.ts",
    "mode": "reference",
    "summary": "Authentication service with JWT"
  }
}
```

### 3.3 Chunking Large Files

```
Large File (1000 lines)
         │
         ▼
    ┌─────────────────┐
    │ Chunk Analysis  │
    │ - Identify sections
    │ - Mark dependencies
    └────────┬────────┘
             │
     ┌───────┼───────┐
     ▼       ▼       ▼
  Chunk 1  Chunk 2  Chunk 3
  (L1-300) (L301-600) (L601-1000)
     │       │       │
     ▼       ▼       ▼
  Process  Process  Process
     │       │       │
     └───────┼───────┘
             ▼
         Merge Results
```

---

## 4. Response Optimization

### 4.1 Structured Responses

```json
// ❌ Bad: 장황한 응답
{
  "result": "I have successfully implemented the authentication
    feature. The changes include modifications to the auth.ts
    file where I added proper error handling. The function now
    validates input parameters and throws appropriate errors..."
}

// ✅ Good: 구조화된 응답
{
  "status": "success",
  "changes": [
    {
      "file": "src/auth.ts",
      "action": "modify",
      "lines": "45-52"
    }
  ],
  "summary": "Added input validation and error handling"
}
```

### 4.2 Response Size Limits

| Familiar | Max Response | Typical |
|----------|--------------|---------|
| Codex | 10K tokens | 2-5K |
| Gemini | 15K tokens | 5-10K |
| Stitch | 8K tokens | 3-5K |
| Reviewer | 5K tokens | 1-3K |

---

## 5. Memory Optimization (Serena)

### 5.1 Memory Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    MEMORY HIERARCHY                          │
│                                                              │
│  Hot Memory (Always Loaded)                                  │
│  ├── current-task.md (~2K)                                  │
│  └── project-context.md summary (~1K)                       │
│                                                              │
│  Warm Memory (Load on Demand)                               │
│  ├── architecture-decisions.md                              │
│  └── learned-patterns.md                                    │
│                                                              │
│  Cold Memory (Index Only)                                   │
│  └── codebase-index (searchable, not loaded)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Memory Management Rules

| Rule | Description |
|------|-------------|
| **M1** | Hot memory는 5K 이하 유지 |
| **M2** | 오래된 정보는 요약 후 아카이브 |
| **M3** | 반복 정보는 참조로 대체 |
| **M4** | 세션 종료 시 정리 |

### 5.3 Memory Cleanup

```markdown
## Before Cleanup
current-task.md (15K tokens)
- 모든 이전 작업 상세 기록
- 중복된 정보
- 불필요한 로그

## After Cleanup
current-task.md (3K tokens)
- 현재 활성 작업만
- 요약된 이전 작업 참조
- 핵심 정보만 유지

## Archived
archive/session-2026-01-24.md
- 이전 세션 전체 기록
- 필요시 검색 가능
```

---

## 6. Familiar-Specific Optimization

### 6.1 Codex Optimization

```yaml
codex_optimization:
  input:
    # 필요한 파일만 전달
    include_patterns:
      - target_files
      - direct_dependencies
      - interface_definitions

    exclude_patterns:
      - test_files (unless testing task)
      - documentation
      - unrelated_modules

  output:
    # 간결한 출력
    format: structured_json
    include_full_content: only_for_new_files
    use_diff: for_modifications
```

### 6.2 Gemini Optimization

```yaml
gemini_optimization:
  # Gemini는 큰 컨텍스트 가능, 하지만 효율성 고려
  input:
    # 전체 코드베이스 대신 관련 부분만
    scope_by_analysis_type:
      security: auth_and_input_modules
      performance: hotpath_code
      architecture: module_boundaries

    # 이전 분석 결과 재사용
    cache_analysis: true
    cache_ttl: 1hour

  output:
    # 요약 + 상세 분리
    summary: always (< 1K)
    details: on_request
```

### 6.3 Stitch Optimization

```yaml
stitch_optimization:
  input:
    # 디자인 컨텍스트만
    include:
      - design_tokens
      - existing_components (references)
      - brand_guidelines (summary)

    exclude:
      - business_logic
      - backend_code

  output:
    # 컴포넌트 코드만 반환
    format: component_files_only
    exclude_preview_html: when_not_requested
```

### 6.4 Reviewer Optimization

```yaml
reviewer_optimization:
  input:
    # 변경된 부분 + 최소 컨텍스트
    include:
      - diff_only
      - function_signatures (for context)
      - related_tests (if exist)

    exclude:
      - unchanged_files
      - full_file_content

  output:
    # 이슈 목록만, 코드 예시는 짧게
    format: issue_list
    code_examples: max_10_lines
```

---

## 7. Caching Strategies

### 7.1 What to Cache

| Item | Cache Duration | Invalidation |
|------|----------------|--------------|
| File content hash | Session | File change |
| Gemini analysis | 1 hour | Code change |
| Design tokens | 24 hours | Token file change |
| Type definitions | Session | Type file change |
| Test results | Until code change | Code change |

### 7.2 Cache Implementation

```yaml
cache:
  # 파일 해시 캐시
  file_hashes:
    enabled: true
    storage: memory

  # 분석 결과 캐시
  analysis_cache:
    enabled: true
    storage: .grimoires/cache/

    entries:
      gemini_security:
        ttl: 3600
        key: file_content_hash

      gemini_performance:
        ttl: 3600
        key: file_content_hash

  # 변경 감지
  invalidation:
    on_file_change: true
    on_dependency_change: true
```

---

## 8. Monitoring & Alerts

### 8.1 Token Usage Tracking

```yaml
monitoring:
  track:
    - tokens_per_request
    - tokens_per_familiar
    - tokens_per_workflow
    - total_session_tokens

  alerts:
    high_usage:
      threshold: 150K tokens/hour
      action: warn

    critical_usage:
      threshold: 300K tokens/hour
      action: throttle

    context_overflow:
      threshold: 95% of limit
      action: summarize_and_trim
```

### 8.2 Usage Report

```markdown
## Token Usage Report

### Session Summary
- Duration: 2 hours
- Total Tokens: 180K
- Average per Request: 5K

### By Familiar
| Familiar | Input | Output | Total |
|----------|-------|--------|-------|
| Archmage | 80K | 20K | 100K |
| Codex | 30K | 15K | 45K |
| Gemini | 25K | 10K | 35K |

### By Workflow Stage
| Stage | Tokens | % of Total |
|-------|--------|------------|
| Planning | 15K | 8% |
| Implementation | 85K | 47% |
| Analysis | 40K | 22% |
| Review | 40K | 22% |

### Optimization Opportunities
1. Codex input could be reduced by 20% with better scoping
2. Gemini analysis was run 3 times redundantly
```

---

## 9. Best Practices Checklist

### 9.1 Before Request

- [ ] 필요한 파일만 식별했는가?
- [ ] 전체 내용 대신 diff/summary 가능한가?
- [ ] 캐시된 결과가 있는가?
- [ ] 이전 요청과 중복되지 않는가?

### 9.2 During Request

- [ ] 구조화된 형식 사용
- [ ] 불필요한 설명 제거
- [ ] 참조로 대체 가능한 내용 확인

### 9.3 After Request

- [ ] 응답 크기 확인
- [ ] 캐시 가능한 결과 저장
- [ ] 메모리 정리 필요성 확인

---

## 10. Emergency Procedures

### 10.1 Context Overflow

```
Context Limit Approaching (>90%)
              │
              ▼
      ┌───────────────┐
      │ 1. Summarize  │
      │    current    │
      │    context    │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │ 2. Archive    │
      │    old info   │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │ 3. Clear      │
      │    caches     │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │ 4. Continue   │
      │    with fresh │
      │    context    │
      └───────────────┘
```

### 10.2 Memory Recovery

```bash
# 긴급 메모리 정리
grimoires memory --cleanup

# 캐시 초기화
grimoires cache --clear

# 세션 요약 및 재시작
grimoires session --summarize --restart
```

---

*Version: 0.1.0*
*Last Updated: 2026-01-25*
