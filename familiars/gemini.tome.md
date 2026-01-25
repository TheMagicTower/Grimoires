# Gemini Familiar

코드 분석 전문 Familiar입니다. Google Gemini의 100만+ 토큰 컨텍스트를 활용하여 대규모 코드베이스 분석을 담당합니다.

---

## 1. Identity

| Attribute | Value |
|-----------|-------|
| **Name** | Gemini |
| **Type** | Code Analysis Specialist |
| **MCP** | gemini-mcp |
| **Token Budget** | ~1M+ (massive context window) |

---

## 2. Role & Responsibilities

### 2.1 Core Role
대규모 코드베이스 분석 및 심층 검토 전문가

### 2.2 Responsibilities

| 책임 | 설명 |
|------|------|
| 코드 품질 분석 | 코드 스멜, 복잡도, 유지보수성 분석 |
| 보안 검토 | 보안 취약점 탐지 및 권고 |
| 성능 분석 | 병목 지점 식별, 최적화 제안 |
| 아키텍처 이해 | 대규모 코드베이스 구조 파악 |
| 의존성 분석 | 모듈 간 의존성 맵핑 |

### 2.3 Do NOT Handle
- 코드 작성/수정 (Codex 담당)
- UI 디자인 (Stitch 담당)
- 최종 리뷰 결정 (Reviewer 담당)

---

## 3. Unique Capability: 1M+ Token Context

### 3.1 Why Gemini?

| Feature | Benefit |
|---------|---------|
| **1M+ 토큰** | 전체 코드베이스를 한 번에 분석 가능 |
| **멀티모달** | 다이어그램, 스크린샷 분석 가능 |
| **추론 능력** | 복잡한 의존성 관계 파악 |

### 3.2 Context Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    Gemini Context                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Full Codebase (~500K tokens)                       │ │
│  │ ├── src/                                           │ │
│  │ ├── tests/                                         │ │
│  │ ├── configs/                                       │ │
│  │ └── docs/                                          │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Analysis Request (~10K tokens)                     │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Previous Analysis Context (~100K tokens)           │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Available for Response (~400K tokens)              │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 3.3 When to Use Full Context

| Scenario | Full Context | Partial Context |
|----------|--------------|-----------------|
| 전체 아키텍처 분석 | ✓ | |
| 특정 파일 보안 검토 | | ✓ |
| 의존성 영향 분석 | ✓ | |
| 단일 함수 성능 분석 | | ✓ |
| 리팩토링 영향 범위 | ✓ | |

---

## 4. Input/Output Format

### 4.1 Input (Analysis Request)

```json
{
  "task_id": "uuid-v4",
  "familiar": "gemini",
  "action": "analyze | security_review | performance_audit | architecture_map",
  "context": {
    "files": [
      {
        "path": "src/**/*.ts",
        "content": "// full codebase or glob pattern"
      }
    ],
    "focus_areas": [
      "authentication",
      "data validation"
    ],
    "previous_issues": [
      "SQL injection in user.ts (fixed)"
    ],
    "analysis_depth": "shallow | medium | deep"
  },
  "priority": "low | medium | high",
  "timeout": 600
}
```

### 4.2 Output (Analysis Report)

```json
{
  "task_id": "uuid-v4",
  "status": "success | partial | failure",
  "result": {
    "summary": "분석 요약 (1-2 문단)",
    "findings": [
      {
        "type": "security | performance | quality | architecture",
        "severity": "critical | high | medium | low",
        "location": {
          "file": "src/auth/login.ts",
          "line": 45,
          "function": "validateCredentials"
        },
        "description": "발견 내용 상세",
        "recommendation": "권장 조치",
        "code_example": {
          "before": "// problematic code",
          "after": "// recommended fix"
        }
      }
    ],
    "metrics": {
      "files_analyzed": 150,
      "issues_found": 12,
      "critical": 1,
      "high": 3,
      "medium": 5,
      "low": 3
    },
    "architecture_insights": {
      "patterns_detected": ["MVC", "Repository"],
      "coupling_score": 0.35,
      "cohesion_score": 0.78,
      "recommendations": []
    }
  },
  "metrics": {
    "tokens_used": 450000,
    "time_elapsed": 120
  }
}
```

---

## 5. MCP Configuration

### 5.1 Config File
`runes/mcp/gemini.json`

### 5.2 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google AI API 키 | Yes |
| `GEMINI_MODEL` | 모델 (기본: gemini-1.5-pro) | No |
| `GEMINI_MAX_TOKENS` | 출력 최대 토큰 | No |

### 5.3 Capabilities

| Tool | Description |
|------|-------------|
| `analyze_codebase` | 전체 코드베이스 분석 |
| `security_scan` | 보안 취약점 스캔 |
| `performance_profile` | 성능 프로파일링 |
| `dependency_map` | 의존성 맵 생성 |
| `complexity_report` | 복잡도 리포트 |

---

## 6. Analysis Types

### 6.1 Security Review

```
Focus Areas:
├── Injection Attacks (SQL, NoSQL, Command, XSS)
├── Authentication/Authorization Flaws
├── Sensitive Data Exposure
├── Security Misconfiguration
├── Cryptographic Failures
├── SSRF, CSRF Vulnerabilities
└── Dependency Vulnerabilities
```

### 6.2 Performance Audit

```
Focus Areas:
├── Algorithm Complexity (Big O)
├── Database Query Optimization
├── Memory Leaks
├── Unnecessary Computations
├── Caching Opportunities
├── Async/Await Patterns
└── Bundle Size Impact
```

### 6.3 Code Quality Analysis

```
Focus Areas:
├── Cyclomatic Complexity
├── Code Duplication
├── Dead Code
├── Naming Conventions
├── Error Handling Patterns
├── Test Coverage Gaps
└── Documentation Quality
```

### 6.4 Architecture Mapping

```
Output:
├── Module Dependency Graph
├── Layer Violations
├── Circular Dependencies
├── Coupling/Cohesion Metrics
├── Pattern Detection
└── Refactoring Suggestions
```

---

## 7. Invocation Examples

### 7.1 Security Review

```
Archmage → Gemini:
{
  "action": "security_review",
  "context": {
    "files": [{ "path": "src/**/*.ts" }],
    "focus_areas": ["authentication", "input validation"],
    "analysis_depth": "deep"
  }
}

Gemini → Archmage:
{
  "status": "success",
  "result": {
    "summary": "12개 파일에서 3개의 보안 이슈 발견",
    "findings": [
      {
        "type": "security",
        "severity": "critical",
        "location": { "file": "src/auth/login.ts", "line": 45 },
        "description": "SQL Injection 취약점",
        "recommendation": "Parameterized query 사용"
      }
    ]
  }
}
```

### 7.2 Performance Audit

```
Archmage → Gemini:
{
  "action": "performance_audit",
  "context": {
    "files": [{ "path": "src/services/**/*.ts" }],
    "focus_areas": ["database queries", "memory usage"]
  }
}
```

### 7.3 Full Architecture Analysis

```
Archmage → Gemini:
{
  "action": "architecture_map",
  "context": {
    "files": [{ "path": "src/**/*" }],
    "analysis_depth": "deep"
  }
}
```

---

## 8. Error Handling

### 8.1 Common Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| `CONTEXT_OVERFLOW` | 1M 토큰 초과 | 분석 범위 축소 |
| `RATE_LIMIT` | API 제한 | 재시도 또는 대기 |
| `ANALYSIS_TIMEOUT` | 분석 시간 초과 | 범위 축소 또는 depth 낮춤 |
| `INVALID_FILE_FORMAT` | 지원하지 않는 파일 | 파일 필터링 |

### 8.2 Partial Analysis

대규모 코드베이스에서 타임아웃 발생 시:
```
1. 우선순위 높은 영역 먼저 분석
2. 결과를 partial로 반환
3. 나머지 영역은 후속 요청으로 처리
```

---

## 9. Integration Points

### 9.1 With Archmage
- 분석 요청 수신
- 분석 리포트 반환
- 아키텍처 결정 지원

### 9.2 With Codex
- 분석 결과를 Codex에게 전달 (수정 필요 시)
- Codex 생성 코드의 품질 검증

### 9.3 With Reviewer
- 심층 분석 결과 제공
- 리뷰 근거 자료 생성

---

## 10. Best Practices

### 10.1 Effective Analysis Requests

**Good Request:**
```json
{
  "action": "security_review",
  "focus_areas": ["authentication", "API endpoints"],
  "analysis_depth": "deep"
}
```

**Poor Request:**
```json
{
  "action": "analyze",
  "context": { "files": "all" }
}
```

### 10.2 Context Optimization

- 관련 없는 파일 제외 (node_modules, build 등)
- 분석 목적에 맞는 파일만 포함
- 이전 분석 결과 활용

### 10.3 Follow-up Actions

```
Gemini 분석 완료
      │
      ├── Critical Issues → Codex 즉시 수정
      │
      ├── High Issues → Archmage 검토 후 수정
      │
      ├── Medium Issues → 백로그 등록
      │
      └── Low Issues → 문서화
```

---

*Version: 0.1.0*
*Last Updated: 2026-01-25*
