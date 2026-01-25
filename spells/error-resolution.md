# Error Resolution Workflow

FixHive를 활용한 오류 해결 워크플로우입니다.

---

## 1. Overview

FixHive는 커뮤니티 기반 오류 해결 지식베이스입니다.
Archmage는 에러 발생 시 FixHive를 우선 검색하여 기존 해결책을 활용합니다.

---

## 2. Workflow

```
에러 발생
    │
    ▼
┌─────────────────────────────────┐
│ Step 1: FixHive 검색             │
│ - 에러 메시지 기반 검색          │
│ - 기술 스택 필터링               │
│ - 유사 케이스 조회               │
└─────────────────────────────────┘
    │
    ├── 해결책 발견 ──────────────────┐
    │                                │
    │                                ▼
    │                    ┌─────────────────────┐
    │                    │ Step 2a: 해결책 적용 │
    │                    │ - 컨텍스트 확인      │
    │                    │ - 적용               │
    │                    │ - 검증               │
    │                    └─────────────────────┘
    │                                │
    │                                ▼
    │                    ┌─────────────────────┐
    │                    │ 성공 → 완료          │
    │                    │ 실패 → Step 2b로     │
    │                    └─────────────────────┘
    │
    └── 해결책 없음
            │
            ▼
    ┌─────────────────────────────────┐
    │ Step 2b: 분석 및 해결           │
    │                                  │
    │ 1. Gemini: 원인 분석             │
    │    - 에러 스택 분석               │
    │    - 근본 원인 식별               │
    │    - 해결 방향 제시               │
    │                                  │
    │ 2. Codex: 수정 구현               │
    │    - Gemini 분석 기반 수정        │
    │    - 테스트 코드 작성             │
    │                                  │
    │ 3. 검증                          │
    │    - 테스트 실행                  │
    │    - 에러 재현 확인               │
    └─────────────────────────────────┘
            │
            ▼
    ┌─────────────────────────────────┐
    │ Step 3: FixHive 등록 (선택)      │
    │ - 등록 가치 평가                 │
    │ - 해결책 문서화                  │
    │ - 커뮤니티 공유                  │
    └─────────────────────────────────┘
```

---

## 3. FixHive Search

### 3.1 Search Query Format

```
{
  "error_type": "TypeError | SyntaxError | RuntimeError | ...",
  "error_message": "Cannot read property 'x' of undefined",
  "technology": ["TypeScript", "React", "Node.js"],
  "context": "optional additional context"
}
```

### 3.2 Search Result Evaluation

| Score | Action |
|-------|--------|
| High (>80%) | 직접 적용 시도 |
| Medium (50-80%) | 컨텍스트 확인 후 적용 |
| Low (<50%) | 참고만, 직접 분석 진행 |

---

## 4. FixHive Registration

### 4.1 Registration Criteria

등록 가치가 있는 케이스:
- 재발 가능성이 높은 오류
- 해결에 상당한 시간이 소요된 케이스
- 비자명한 해결 방법
- 커뮤니티에 도움이 될 수 있는 케이스

### 4.2 Registration Format

```
{
  "title": "간결한 문제 설명",
  "error_type": "TypeError",
  "error_message": "정확한 에러 메시지",
  "technology": ["TypeScript", "React"],
  "root_cause": "원인 설명",
  "solution": {
    "description": "해결 방법 설명",
    "code_before": "문제가 있던 코드",
    "code_after": "수정된 코드"
  },
  "prevention": "향후 방지 방법"
}
```

---

## 5. Integration with Familiars

### Gemini Role
- 에러 스택 트레이스 분석
- 근본 원인 식별
- 해결 방향 제시 (코드 직접 수정 X)

### Codex Role
- Gemini 분석 기반 코드 수정
- 테스트 코드 작성
- 수정 검증

### Archmage Role
- 전체 워크플로우 조율
- FixHive 검색/등록 결정
- 최종 검증

---

## 6. Example Scenario

```
1. 에러 발생: "TypeError: Cannot read property 'map' of undefined"

2. FixHive 검색
   Query: { error_type: "TypeError", error_message: "Cannot read property 'map'" }
   Result: 80% match - "API 응답이 배열이 아닐 때 발생"

3. 해결책 적용
   - 응답 유효성 검사 추가
   - 기본값 설정

4. 검증
   - 테스트 통과
   - 완료
```

---

## 7. Metrics

| Metric | Target |
|--------|--------|
| FixHive Hit Rate | > 50% |
| First-time Resolution | > 70% |
| Registration Quality | > 4.0/5.0 |

---

*Version: 0.1.0*
*Last Updated: 2026-01-25*
