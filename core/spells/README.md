# Grimoires Spells

마법을 시전하듯 `/cast:` 프리픽스로 워크플로우를 실행합니다.

## Available Spells

| Spell | Description | Usage |
|-------|-------------|-------|
| `/cast:summon` | 프로젝트 초기화 | `/cast:summon` |
| `/cast:dev` | 개발 워크플로우 | `/cast:dev "기능 구현"` |
| `/cast:review` | 코드 리뷰 | `/cast:review` |
| `/cast:analyze` | Gemini 분석 | `/cast:analyze --security` |
| `/cast:design` | UI/UX 디자인 | `/cast:design "페이지 디자인"` |
| `/cast:fix` | 에러 해결 | `/cast:fix --error="..."` |
| `/cast:parallel` | 병렬 실행 | `/cast:parallel --tasks="FE,BE"` |
| `/cast:tdd` | TDD 워크플로우 | `/cast:tdd "기능 설명"` |
| `/cast:test-coverage` | 커버리지 분석 | `/cast:test-coverage --path=src` |
| `/cast:e2e` | E2E 테스트 | `/cast:e2e --spec=auth` |
| `/cast:plan` | 계획 수립 | `/cast:plan "복잡한 기능"` |
| `/cast:refactor` | 리팩토링 | `/cast:refactor --path=src/services` |
| `/cast:checkpoint` | 체크포인트 | `/cast:checkpoint save "설명"` |

## Quick Start

```bash
# 1. 프로젝트 초기화
/cast:summon

# 2. 계획 수립 (복잡한 작업)
/cast:plan "인증 시스템 구현"

# 3. TDD로 개발 시작
/cast:tdd "사용자 로그인"

# 4. 코드 리뷰
/cast:review

# 5. 에러 발생 시
/cast:fix
```

## Spell Categories

### Initialization
- `/cast:summon` - Grimoires 초기화

### Development
- `/cast:dev` - 전체 개발 워크플로우
- `/cast:design` - UI/UX 디자인
- `/cast:plan` - 계획 수립 (Sequential Thinking)
- `/cast:refactor` - 코드 리팩토링

### Testing (New in 0.3.0)
- `/cast:tdd` - TDD 워크플로우 (RED-GREEN-REFACTOR)
- `/cast:test-coverage` - 테스트 커버리지 분석
- `/cast:e2e` - E2E 테스트 실행

### Quality
- `/cast:review` - 코드 리뷰
- `/cast:analyze` - 심층 분석

### Operations
- `/cast:fix` - 에러 해결
- `/cast:parallel` - 병렬 실행 최적화
- `/cast:checkpoint` - 작업 상태 저장/복원

## Why `/cast:` Prefix?

1. **네임스페이스 확보** - 빌트인 명령어와 충돌 없음
2. **일관성** - 모든 Grimoires spell이 통일된 패턴
3. **테마** - 마법을 "시전"하는 느낌
4. **확장성** - 새 spell 추가 시 일관된 UX

---

## New in 0.3.0

### TDD/Testing Spells
- **`/cast:tdd`** - RED-GREEN-REFACTOR 사이클 관리
- **`/cast:test-coverage`** - 커버리지 분석 및 개선 제안
- **`/cast:e2e`** - End-to-End 테스트 실행

### Planning & Refactoring
- **`/cast:plan`** - Sequential Thinking 기반 계획 수립
- **`/cast:refactor`** - 안전한 리팩토링 워크플로우
- **`/cast:checkpoint`** - 작업 상태 스냅샷 저장/복원

---

*Version: 0.3.0*
