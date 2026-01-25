# Codex Familiar

코드 생성 전문 Familiar입니다. OpenAI Codex를 활용하여 모든 코드 작성/수정 작업을 담당합니다.

---

## 1. Identity

| Attribute | Value |
|-----------|-------|
| **Name** | Codex |
| **Type** | Code Generation Specialist |
| **MCP** | codex-mcp-server |
| **Token Budget** | ~30K (isolated context) |

---

## 2. Role & Responsibilities

### 2.1 Core Role
모든 코드 작성 및 수정 작업을 담당하는 코딩 전문가

### 2.2 Responsibilities

| 책임 | 설명 |
|------|------|
| 코드 작성 | 새로운 기능, 모듈, 컴포넌트 구현 |
| 리팩토링 | 기존 코드 구조 개선 |
| 버그 수정 | 오류 원인 파악 및 수정 |
| 테스트 작성 | 단위 테스트, 통합 테스트 코드 |

### 2.3 Do NOT Handle
- 아키텍처 결정 (Archmage 담당)
- 코드 분석/리뷰 (Gemini, Reviewer 담당)
- UI 디자인 (Stitch 담당)

---

## 3. Input/Output Format

### 3.1 Input (Task Request)

```json
{
  "task_id": "uuid-v4",
  "familiar": "codex",
  "action": "implement | refactor | fix | test",
  "context": {
    "files": [
      {
        "path": "src/services/auth.ts",
        "content": "// existing code or empty for new file"
      }
    ],
    "requirements": "상세한 구현 요구사항",
    "constraints": [
      "TypeScript strict mode",
      "No external dependencies",
      "Must be backward compatible"
    ],
    "design_spec": {
      "interfaces": ["interface definitions if any"],
      "patterns": ["Factory", "Repository"]
    }
  },
  "priority": "low | medium | high",
  "timeout": 300
}
```

### 3.2 Output (Task Result)

```json
{
  "task_id": "uuid-v4",
  "status": "success | failure | partial",
  "result": {
    "files_created": [
      {
        "path": "src/services/auth.ts",
        "content": "// generated code"
      }
    ],
    "files_modified": [
      {
        "path": "src/index.ts",
        "diff": "// unified diff format"
      }
    ],
    "tests_created": [
      {
        "path": "tests/auth.test.ts",
        "content": "// test code"
      }
    ]
  },
  "notes": "구현 노트, 주의사항",
  "metrics": {
    "tokens_used": 5000,
    "time_elapsed": 45
  }
}
```

---

## 4. MCP Configuration

### 4.1 Config File
`runes/mcp/codex.json`

### 4.2 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API 키 | Yes |
| `CODEX_MODEL` | 사용할 모델 (기본: gpt-4) | No |
| `CODEX_MAX_TOKENS` | 최대 토큰 수 | No |

### 4.3 Capabilities

Codex MCP가 제공하는 주요 도구:

| Tool | Description |
|------|-------------|
| `generate_code` | 요구사항 기반 코드 생성 |
| `refactor_code` | 기존 코드 리팩토링 |
| `fix_code` | 버그 수정 |
| `explain_code` | 코드 설명 생성 |
| `generate_tests` | 테스트 코드 생성 |

---

## 5. Invocation Examples

### 5.1 New Feature Implementation

```
Archmage → Codex:
{
  "action": "implement",
  "context": {
    "requirements": "JWT 기반 인증 미들웨어 구현",
    "constraints": ["Express.js", "TypeScript"],
    "design_spec": {
      "interfaces": [
        "interface AuthMiddleware { verify(token: string): Promise<User>; }"
      ]
    }
  }
}

Codex → Archmage:
{
  "status": "success",
  "result": {
    "files_created": [
      { "path": "src/middleware/auth.ts", "content": "..." }
    ],
    "tests_created": [
      { "path": "tests/middleware/auth.test.ts", "content": "..." }
    ]
  }
}
```

### 5.2 Bug Fix

```
Archmage → Codex:
{
  "action": "fix",
  "context": {
    "files": [
      { "path": "src/utils/date.ts", "content": "// buggy code" }
    ],
    "requirements": "parseDate 함수가 ISO 8601 형식을 잘못 파싱하는 버그 수정",
    "error_info": {
      "message": "Invalid Date",
      "stack": "..."
    }
  }
}
```

### 5.3 Refactoring

```
Archmage → Codex:
{
  "action": "refactor",
  "context": {
    "files": [
      { "path": "src/services/user.ts", "content": "// large file" }
    ],
    "requirements": "UserService를 Repository 패턴으로 분리",
    "constraints": ["기존 public API 유지", "breaking change 없음"]
  }
}
```

---

## 6. Error Handling

### 6.1 Common Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| `CONTEXT_TOO_LARGE` | 입력 파일이 너무 큼 | 파일 분할 또는 요약 요청 |
| `AMBIGUOUS_REQUIREMENT` | 요구사항 불명확 | Archmage에게 명확화 요청 |
| `DEPENDENCY_MISSING` | 필요한 의존성 정보 없음 | 의존성 정보 추가 요청 |
| `API_RATE_LIMIT` | OpenAI API 제한 | 재시도 또는 대기 |

### 6.2 Fallback Strategy

```
Codex 실패 시:
1. 에러 유형 분석
2. 재시도 가능 → 재시도 (최대 3회)
3. 재시도 불가 → Archmage에게 보고
4. Archmage 판단:
   - 간단한 작업 → 직접 처리
   - 복잡한 작업 → Gemini 분석 후 재시도
```

---

## 7. Quality Standards

### 7.1 Code Quality

Codex가 생성하는 코드는 다음을 준수:

- [ ] TypeScript strict mode 호환
- [ ] ESLint 규칙 준수
- [ ] 함수당 단일 책임
- [ ] 명확한 변수/함수 명명
- [ ] 적절한 에러 핸들링
- [ ] 필요한 타입 정의 포함

### 7.2 Test Coverage

테스트 코드 생성 시:

- [ ] Happy path 테스트
- [ ] Edge case 테스트
- [ ] Error case 테스트
- [ ] 모킹 적절히 사용

---

## 8. Performance Considerations

### 8.1 Token Optimization

- 불필요한 주석 최소화
- 간결한 코드 스타일
- 큰 파일은 청크 단위로 처리

### 8.2 Parallel Execution

독립적인 작업은 병렬 실행 가능:
```
┌─────────┐     ┌─────────┐
│ Codex   │     │ Codex   │
│ Task A  │     │ Task B  │
└────┬────┘     └────┬────┘
     │               │
     └───────┬───────┘
             │
         Archmage
         (통합)
```

---

## 9. Integration Points

### 9.1 With Archmage
- 설계 스펙 수신
- 결과물 반환
- 에러 보고

### 9.2 With Gemini
- Gemini 분석 결과 기반 수정
- 복잡한 버그의 원인 분석 요청

### 9.3 With Reviewer
- 생성 코드가 Reviewer 검증 대상
- 리뷰 피드백 기반 수정

---

*Version: 0.1.0*
*Last Updated: 2026-01-25*
