# Basic Workflow: Codex-Gemini Collaboration

Codex와 Gemini Familiar의 기본 협업 워크플로우입니다.

---

## 1. Overview

이 워크플로우는 코드 작성과 분석이 연계되는 기본 패턴을 정의합니다.

```
사용자 요청
     │
     ▼
┌──────────────────┐
│    Archmage      │
│  (요청 분석)      │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐  ┌────────┐
│ Codex  │  │ Gemini │
│ (구현)  │  │ (분석) │
└───┬────┘  └───┬────┘
    │           │
    └─────┬─────┘
          ▼
┌──────────────────┐
│    Archmage      │
│  (통합 및 검증)   │
└──────────────────┘
```

---

## 2. Workflow Patterns

### 2.1 Pattern A: Implement → Analyze

새 기능 구현 후 품질 검증

```
Step 1: Archmage → Codex
        "사용자 인증 API 구현"

Step 2: Codex → Archmage
        { files_created: ["src/auth/api.ts"] }

Step 3: Archmage → Gemini
        "생성된 코드 보안 및 품질 분석"

Step 4: Gemini → Archmage
        { findings: [...], severity: "medium" }

Step 5: Archmage 판단
        ├── Issues found → Codex 수정 요청 (Step 1로)
        └── No issues → 완료
```

### 2.2 Pattern B: Analyze → Implement

기존 코드 분석 후 개선 구현

```
Step 1: Archmage → Gemini
        "레거시 인증 모듈 분석"

Step 2: Gemini → Archmage
        {
          findings: [
            { type: "security", severity: "high", ... },
            { type: "performance", severity: "medium", ... }
          ]
        }

Step 3: Archmage → Codex
        "Gemini 분석 기반 보안 취약점 수정"
        + Gemini findings 전달

Step 4: Codex → Archmage
        { files_modified: ["src/auth/legacy.ts"] }

Step 5: Archmage → Gemini
        "수정된 코드 재분석"

Step 6: 검증 통과 시 완료
```

### 2.3 Pattern C: Parallel Execution

독립적인 작업의 병렬 처리

```
         Archmage
             │
     ┌───────┴───────┐
     ▼               ▼
┌─────────┐     ┌─────────┐
│ Codex   │     │ Codex   │
│ Feature │     │ Tests   │
│    A    │     │ for A   │
└────┬────┘     └────┬────┘
     │               │
     └───────┬───────┘
             ▼
         Gemini
    (통합 코드 분석)
             │
             ▼
         Archmage
         (최종 검증)
```

---

## 3. Test Scenarios

### 3.1 Scenario 1: Simple Function

**요청**: "숫자 배열의 평균을 계산하는 함수 작성"

```
1. Archmage 분석
   - 복잡도: Low
   - 결정: Codex 단독 처리

2. Codex 실행
   Input:
   {
     "action": "implement",
     "requirements": "숫자 배열의 평균 계산 함수",
     "constraints": ["TypeScript", "Edge case 처리"]
   }

   Output:
   {
     "files_created": [
       { "path": "src/utils/math.ts", "content": "..." }
     ],
     "tests_created": [
       { "path": "tests/utils/math.test.ts", "content": "..." }
     ]
   }

3. Archmage 검증
   - 단순 작업이므로 Gemini 분석 생략
   - 테스트 실행 확인 후 완료
```

### 3.2 Scenario 2: API Endpoint

**요청**: "사용자 프로필 조회 API 구현"

```
1. Archmage 분석
   - 복잡도: Medium
   - 결정: Codex 구현 → Gemini 보안 검토

2. Codex 실행
   Input:
   {
     "action": "implement",
     "requirements": "GET /api/users/:id 엔드포인트",
     "constraints": ["Express.js", "인증 필요", "TypeScript"]
   }

   Output:
   {
     "files_created": [
       { "path": "src/routes/users.ts" },
       { "path": "src/controllers/userController.ts" }
     ]
   }

3. Gemini 분석
   Input:
   {
     "action": "security_review",
     "files": [생성된 파일들],
     "focus_areas": ["authentication", "input validation"]
   }

   Output:
   {
     "findings": [
       {
         "severity": "medium",
         "description": "Rate limiting 미적용",
         "recommendation": "express-rate-limit 적용 권고"
       }
     ]
   }

4. Archmage 판단
   - Severity: Medium → 수정 권고
   - 사용자에게 보고 및 수정 여부 확인

5. (선택) Codex 수정
   - Rate limiting 적용
   - 재분석 후 완료
```

### 3.3 Scenario 3: Refactoring

**요청**: "결제 모듈 리팩토링"

```
1. Archmage 분석
   - 복잡도: High
   - 결정: Gemini 선행 분석 → Codex 리팩토링

2. Gemini 분석
   Input:
   {
     "action": "architecture_map",
     "files": ["src/payment/**/*"],
     "analysis_depth": "deep"
   }

   Output:
   {
     "architecture_insights": {
       "patterns_detected": ["None (Spaghetti)"],
       "coupling_score": 0.85,
       "recommendations": [
         "Strategy 패턴으로 결제 방식 분리",
         "Repository 패턴으로 DB 접근 추상화"
       ]
     }
   }

3. Archmage 설계
   - Gemini 권고 기반 리팩토링 계획 수립
   - 단계별 작업 분해

4. Codex 실행 (단계별)
   Step 4.1: PaymentStrategy 인터페이스 정의
   Step 4.2: 각 결제 방식 구현체 분리
   Step 4.3: Repository 계층 추가
   Step 4.4: 기존 코드 마이그레이션

5. Gemini 재분석
   - 리팩토링 후 아키텍처 검증
   - coupling_score 개선 확인

6. 완료
```

---

## 4. Communication Protocol

### 4.1 Archmage → Codex

```json
{
  "task_id": "uuid",
  "familiar": "codex",
  "action": "implement | refactor | fix | test",
  "context": {
    "files": [],
    "requirements": "명확한 요구사항",
    "constraints": [],
    "design_spec": {}
  },
  "gemini_insights": {
    "findings": [],
    "recommendations": []
  }
}
```

### 4.2 Archmage → Gemini

```json
{
  "task_id": "uuid",
  "familiar": "gemini",
  "action": "analyze | security_review | performance_audit",
  "context": {
    "files": [],
    "focus_areas": [],
    "analysis_depth": "shallow | medium | deep"
  },
  "codex_output": {
    "files_created": [],
    "files_modified": []
  }
}
```

### 4.3 Result Integration

```json
{
  "workflow_id": "uuid",
  "steps": [
    { "familiar": "codex", "status": "success", "result": {} },
    { "familiar": "gemini", "status": "success", "result": {} }
  ],
  "final_status": "success | needs_revision | failed",
  "deliverables": {
    "files": [],
    "reports": [],
    "issues": []
  }
}
```

---

## 5. Error Handling

### 5.1 Codex Failure

```
Codex 실패
    │
    ├── 재시도 가능 에러 → 최대 3회 재시도
    │
    ├── 요구사항 불명확 → Archmage가 명확화 후 재시도
    │
    └── 복잡한 문제 → Gemini 분석 후 재시도
```

### 5.2 Gemini Failure

```
Gemini 실패
    │
    ├── 컨텍스트 초과 → 분석 범위 축소
    │
    ├── 타임아웃 → depth 낮춰서 재시도
    │
    └── 부분 분석 → 결과 활용 후 나머지 후속 처리
```

### 5.3 Integration Failure

```
통합 실패
    │
    ├── 버전 충돌 → 순차 실행으로 전환
    │
    └── 의존성 문제 → 작업 순서 재조정
```

---

## 6. Metrics & Monitoring

### 6.1 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| First-pass Success | > 80% | Codex 결과가 Gemini 검증 통과 |
| Revision Cycles | < 2 | 평균 수정 반복 횟수 |
| Critical Issues | 0 | Gemini가 발견한 Critical 이슈 |

### 6.2 Performance Metrics

| Metric | Target |
|--------|--------|
| Codex Response | < 60s |
| Gemini Analysis | < 120s |
| Total Workflow | < 300s |

---

## 7. Best Practices

### 7.1 Effective Collaboration

- Codex에게 명확한 설계 스펙 전달
- Gemini 분석 범위를 목적에 맞게 제한
- 병렬 실행 가능한 작업 식별

### 7.2 Context Efficiency

- Codex: 관련 파일만 전달
- Gemini: 분석 목적에 맞는 depth 선택
- 중복 분석 방지

### 7.3 Iterative Improvement

- Gemini 피드백을 Codex에게 구체적으로 전달
- 반복 패턴 발견 시 rules로 정의
- 워크플로우 병목 지속 모니터링

---

*Version: 0.1.0*
*Last Updated: 2026-01-25*
