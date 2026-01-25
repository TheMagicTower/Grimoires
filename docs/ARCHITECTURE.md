# Grimoires Architecture Document

## 1. Overview

Grimoires는 Claude Code 기반의 멀티 AI 에이전트 오케스트레이션 시스템입니다. Claude가 Archmage(대마법사)로서 여러 AI Familiar(사역마)를 지휘하여 소프트웨어 개발 작업을 수행합니다.

### 1.1 Design Goals

1. **역할 분리**: 각 AI의 강점을 극대화
2. **컨텍스트 효율성**: MCP 격리로 토큰 사용 최적화
3. **품질 보장**: 설계 원칙 준수 및 자동 리뷰
4. **확장성**: 새로운 Familiar 추가 용이
5. **메모리 지속성**: 장기 세션 지원

### 1.2 Core Principles

- **Single Responsibility**: 각 에이전트는 하나의 역할만 담당
- **Loose Coupling**: 에이전트간 직접 의존 없음, Archmage를 통해서만 통신
- **Context Isolation**: 각 에이전트는 자신의 MCP만 로드

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Request                                 │
└─────────────────────────────┬───────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     ARCHMAGE (Claude Code)                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Core Responsibilities                        │ │
│  │  • 요구사항 분석 및 설계                                         │ │
│  │  • 작업 분해 및 Familiar 할당                                    │ │
│  │  • 결과 검증 및 통합                                             │ │
│  │  • 최종 품질 보증                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      MCP Stack (3)                              │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐│ │
│  │  │   Serena     │ │   FixHive    │ │  Sequential Thinking     ││ │
│  │  │   Memory     │ │   Errors     │ │  Reasoning               ││ │
│  │  └──────────────┘ └──────────────┘ └──────────────────────────┘│ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┬─────────────────┐
        ▼                     ▼                     ▼                 ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐ ┌───────────────┐
│    CODEX      │     │    GEMINI     │     │    STITCH     │ │   REVIEWER    │
│   Familiar    │     │   Familiar    │     │   Familiar    │ │   Familiar    │
├───────────────┤     ├───────────────┤     ├───────────────┤ ├───────────────┤
│ • 코드 작성    │     │ • 코드 분석   │     │ • UI 디자인    │ │ • PR 리뷰     │
│ • 리팩토링     │     │ • 보안 검토   │     │ • 컴포넌트     │ │ • 원칙 검증   │
│ • 버그 수정    │     │ • 성능 분석   │     │ • 프로토타입   │ │ • 품질 체크   │
├───────────────┤     ├───────────────┤     ├───────────────┤ ├───────────────┤
│ MCP: Codex    │     │ MCP: Gemini   │     │ MCP: Stitch   │ │ MCP: None     │
│      (1)      │     │      (1)      │     │ + Skills (2)  │ │     (0)       │
└───────────────┘     └───────────────┘     └───────────────┘ └───────────────┘
```

### 2.2 Component Details

#### 2.2.1 Archmage (Claude Code)

**역할**: 중앙 오케스트레이터

**책임**:
- 사용자 요구사항 분석
- Sequential Thinking을 활용한 문제 분해
- Familiar에게 작업 위임
- 결과물 검증 및 통합
- 설계 원칙 준수 확인

**MCP Stack**:
| MCP | Purpose | Token Impact |
|-----|---------|--------------|
| Serena | 메모리 관리, 프로젝트 인덱싱 | Medium |
| FixHive | 오류 케이스 검색/등록 | Low |
| Sequential Thinking | 복잡한 문제 분해 | Low |

#### 2.2.2 Codex Familiar

**역할**: 코드 생성 전문가

**책임**:
- 모든 코드 작성/수정
- 리팩토링
- 버그 수정
- 테스트 코드 작성

**입력**: 설계 스펙, 코드 요구사항
**출력**: 코드 파일, 테스트 파일

**MCP**: codex-mcp-server

#### 2.2.3 Gemini Familiar

**역할**: 코드 분석 전문가

**책임**:
- 코드 품질 분석
- 보안 취약점 검토
- 성능 병목 분석
- 대규모 코드베이스 이해

**입력**: 분석 대상 코드
**출력**: 분석 리포트

**MCP**: gemini-mcp (1M+ token context 활용)

#### 2.2.4 Stitch Familiar

**역할**: UI/UX 디자인 전문가

**책임**:
- UI 컴포넌트 디자인
- 프로토타입 생성
- 디자인 시스템 관리
- Figma 연동

**입력**: 디자인 요구사항
**출력**: HTML/CSS, 컴포넌트 코드

**MCP**: stitch-mcp + stitch-skills

#### 2.2.5 Reviewer Familiar

**역할**: 품질 검증 전문가

**책임**:
- PR 리뷰
- 설계 원칙 준수 검증
- 코드 컨벤션 체크
- 리뷰 피드백 생성

**입력**: 코드 변경사항
**출력**: 리뷰 피드백, 수정 요청

**MCP**: 없음 (Claude 자체 기능 사용)

---

## 3. Workflow Patterns

### 3.1 Standard Development Workflow

```
사용자 요청
    │
    ▼
┌─────────────────────────────────────┐
│ 1. Archmage: 요구사항 분석           │
│    - Sequential Thinking 활용       │
│    - 문제 분해                       │
│    - 작업 계획 수립                   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 2. Archmage: 설계                   │
│    - 아키텍처 결정                   │
│    - 인터페이스 정의                 │
│    - 작업 분배 결정                  │
└─────────────────────────────────────┘
    │
    ├──────────────────┬──────────────────┐
    ▼                  ▼                  ▼
┌──────────┐    ┌──────────┐      ┌──────────┐
│ Stitch   │    │ Codex    │      │ Codex    │
│ UI 디자인 │    │ Frontend │      │ Backend  │
└──────────┘    └──────────┘      └──────────┘
    │                  │                  │
    └──────────────────┴──────────────────┘
                       │
                       ▼
         ┌─────────────────────────────────┐
         │ 3. Gemini: 코드 분석             │
         │    - 보안 검토                   │
         │    - 성능 분석                   │
         │    - 품질 체크                   │
         └─────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────────┐
         │ 4. Archmage: 검증               │
         │    - 설계 원칙 준수 확인         │
         │    - 요구사항 충족 확인          │
         │    - 통합 테스트                 │
         └─────────────────────────────────┘
                       │
                ┌──────┴──────┐
                ▼             ▼
         ┌──────────┐  ┌──────────┐
         │ 문제 없음 │  │ 문제 발견 │
         │   완료    │  │          │
         └──────────┘  └────┬─────┘
                            │
                            ▼
                  ┌─────────────────────┐
                  │ 5. Reviewer: 리뷰   │
                  │    - 상세 분석       │
                  │    - 수정 요청 생성  │
                  └─────────────────────┘
                            │
                            ▼
                  ┌─────────────────────┐
                  │ 6. Codex: 수정      │
                  └─────────────────────┘
                            │
                            └─────→ 3번으로 반복
```

### 3.2 Error Resolution Workflow

```
오류 발생
    │
    ▼
┌─────────────────────────────────────┐
│ 1. FixHive: 오류 검색                │
│    - 기존 해결 사례 조회             │
│    - 유사 오류 패턴 분석             │
└─────────────────────────────────────┘
    │
    ├── 해결책 존재 ──→ 적용
    │
    └── 해결책 없음
            │
            ▼
    ┌─────────────────────────────────┐
    │ 2. Gemini: 오류 분석             │
    │    - 원인 분석                   │
    │    - 해결 방향 제시               │
    └─────────────────────────────────┘
            │
            ▼
    ┌─────────────────────────────────┐
    │ 3. Codex: 수정 구현              │
    └─────────────────────────────────┘
            │
            ▼
    ┌─────────────────────────────────┐
    │ 4. FixHive: 해결책 등록          │
    │    - 커뮤니티 지식 공유           │
    └─────────────────────────────────┘
```

### 3.3 Review Loop Pattern

```
코드 변경 완료
    │
    ▼
┌─────────────────────────────────────┐
│ Reviewer: 자동 리뷰                  │
│ - SOLID 원칙 검증                    │
│ - DRY 위반 체크                      │
│ - 보안 취약점 확인                   │
│ - 코드 컨벤션 검사                   │
└─────────────────────────────────────┘
    │
    ├── Severity: Low ──→ 경고 후 진행
    │
    ├── Severity: Medium ──→ 수정 권고
    │       │
    │       ▼
    │   ┌───────────────┐
    │   │ Codex: 수정   │
    │   └───────────────┘
    │           │
    │           └─────→ 재리뷰
    │
    └── Severity: High ──→ 수정 필수
            │
            ▼
        ┌───────────────┐
        │ Codex: 수정   │
        └───────────────┘
                │
                └─────→ 재리뷰
```

---

## 4. MCP Configuration Strategy

### 4.1 MCP Isolation Principle

```
┌─────────────────────────────────────────────────────────────────┐
│                     Main Context (Archmage)                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   MCP Budget: 3                           │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────────────┐   │   │
│  │  │ Serena  │  │ FixHive │  │ Sequential Thinking     │   │   │
│  │  │ ~50K    │  │ ~10K    │  │ ~20K tokens             │   │   │
│  │  └─────────┘  └─────────┘  └─────────────────────────┘   │   │
│  │                                                           │   │
│  │  Total: ~80K tokens (from 200K budget)                    │   │
│  │  Available for conversation: ~120K tokens                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Subagent Contexts                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Codex Agent  │  │ Gemini Agent │  │ Stitch Agent │           │
│  │ MCP: 1       │  │ MCP: 1       │  │ MCP: 2       │           │
│  │ Isolated     │  │ Isolated     │  │ Isolated     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  각 subagent는 독립된 컨텍스트에서 실행                           │
│  결과만 Main Context로 반환                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 MCP Configuration Files

#### Main Context (runes/mcp/archmage.json)

```json
{
  "mcpServers": {
    "serena": {
      "command": "npx",
      "args": ["-y", "serena-mcp"],
      "env": {}
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "env": {}
    },
    "fixhive": {
      "command": "fixhive-mcp",
      "args": [],
      "env": {}
    }
  }
}
```

#### Codex Agent (runes/mcp/codex.json)

```json
{
  "mcpServers": {
    "codex": {
      "command": "codex",
      "args": ["--mcp-server"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"
      }
    }
  }
}
```

#### Gemini Agent (runes/mcp/gemini.json)

```json
{
  "mcpServers": {
    "gemini": {
      "command": "npx",
      "args": ["-y", "gemini-mcp"],
      "env": {
        "GOOGLE_API_KEY": "${GOOGLE_API_KEY}"
      }
    }
  }
}
```

#### Stitch Agent (runes/mcp/stitch.json)

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "stitch-mcp"],
      "env": {}
    }
  }
}
```

---

## 5. Design Principles Implementation

### 5.1 Rules Definition (runes/rules/design-principles.md)

각 원칙은 rules 파일로 정의되어 Reviewer Familiar가 검증에 사용합니다.

| Principle | Verification Method |
|-----------|---------------------|
| KISS | 복잡도 메트릭 (Cyclomatic Complexity < 10) |
| YAGNI | 사용되지 않는 코드 탐지 |
| DRY | 코드 중복 분석 (3회 이상 반복 시 경고) |
| SOLID | 패턴 기반 정적 분석 |
| Separation of Concerns | 모듈 의존성 분석 |
| Modularity | 파일/함수 크기 제한 |
| Law of Demeter | 메서드 체이닝 깊이 검사 |
| Curly's Law | 함수당 책임 수 분석 |
| Fail Fast | 에러 핸들링 패턴 검사 |
| POLA | 네이밍 컨벤션 검사 |
| Composition over Inheritance | 상속 깊이 검사 |
| Defensive Programming | 입력 검증 패턴 확인 |
| Boy Scout Rule | 변경 전후 품질 비교 |

### 5.2 Severity Levels

| Level | Description | Action |
|-------|-------------|--------|
| **Critical** | 보안 취약점, 데이터 손실 위험 | 즉시 수정 필수 |
| **High** | 주요 설계 원칙 위반 | 수정 필수 |
| **Medium** | 경미한 원칙 위반, 코드 스멜 | 수정 권고 |
| **Low** | 스타일 이슈, 개선 제안 | 선택적 수정 |

---

## 6. Memory Management (Serena Integration)

### 6.1 Memory Structure

```
.serena/
├── memories/
│   ├── project-context.md      # 프로젝트 전반 이해
│   ├── architecture-decisions.md # 아키텍처 결정 기록
│   ├── current-task.md         # 현재 작업 상태
│   └── learned-patterns.md     # 학습된 패턴
└── index/
    └── codebase-index          # 코드베이스 인덱스
```

### 6.2 Memory Usage Pattern

1. **세션 시작**: Serena가 memories 읽기 → 컨텍스트 복원
2. **작업 중**: 중요 결정/발견 → memories에 기록
3. **세션 종료**: 현재 상태 요약 → memories에 저장
4. **새 세션**: memories에서 컨텍스트 로드 → 이어서 작업

---

## 7. Agent Communication Protocol

### 7.1 Request Format

```json
{
  "task_id": "uuid",
  "familiar": "codex|gemini|stitch|reviewer",
  "action": "string",
  "context": {
    "files": ["path/to/file"],
    "requirements": "string",
    "constraints": []
  },
  "priority": "low|medium|high",
  "timeout": 300
}
```

### 7.2 Response Format

```json
{
  "task_id": "uuid",
  "status": "success|failure|partial",
  "result": {
    "files_created": [],
    "files_modified": [],
    "analysis": {},
    "feedback": []
  },
  "metrics": {
    "tokens_used": 1234,
    "time_elapsed": 45
  }
}
```

---

## 8. Implementation Phases

### Phase 1: Foundation
- [ ] 기본 디렉토리 구조 생성
- [ ] Archmage 정의 파일 작성
- [ ] Serena MCP 통합
- [ ] FixHive MCP 통합

### Phase 2: Core Familiars
- [ ] Codex Familiar 구현
- [ ] Gemini Familiar 구현
- [ ] 기본 워크플로우 테스트

### Phase 3: Design & Review
- [ ] Stitch Familiar 구현
- [ ] Reviewer Familiar 구현
- [ ] 설계 원칙 rules 작성

### Phase 4: Automation
- [ ] 자동 리뷰 루프 구현
- [ ] 에러 해결 워크플로우 구현
- [ ] Sequential Thinking 통합

### Phase 5: Optimization
- [ ] 컨텍스트 사용량 최적화
- [ ] 병렬 실행 최적화
- [ ] 비용 모니터링 도입

### Phase 6: Documentation & Release
- [ ] 사용자 문서 작성
- [ ] 설치 스크립트 작성
- [ ] 첫 릴리즈

---

## 9. Risk Considerations

| Risk | Impact | Mitigation |
|------|--------|------------|
| MCP 컨텍스트 폭발 | 성능 저하 | 엄격한 MCP 격리 정책 |
| API 비용 증가 | 예산 초과 | 작업 크기 기반 라우팅 |
| 에이전트 간 불일치 | 통합 실패 | 명확한 인터페이스 정의 |
| Codex 장애 | 코딩 불가 | 간단한 작업 Claude 폴백 |
| 복잡도 증가 | 유지보수 어려움 | 모듈화, 문서화 |

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| 컨텍스트 효율성 | Main context < 100K tokens |
| 리뷰 통과율 | First-pass > 70% |
| 오류 해결 시간 | FixHive hit rate > 50% |
| 설계 원칙 준수 | High severity = 0 |

---

*Last Updated: 2026-01-25*
*Version: 0.1.0 (Draft)*
