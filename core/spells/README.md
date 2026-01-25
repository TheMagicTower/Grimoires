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

## Quick Start

```bash
# 1. 프로젝트 초기화
/cast:summon

# 2. 개발 시작
/cast:dev "사용자 프로필 페이지 추가"

# 3. 코드 리뷰
/cast:review

# 4. 에러 발생 시
/cast:fix
```

## Spell Categories

### Initialization
- `/cast:summon` - Grimoires 초기화

### Development
- `/cast:dev` - 전체 개발 워크플로우
- `/cast:design` - UI/UX 디자인

### Quality
- `/cast:review` - 코드 리뷰
- `/cast:analyze` - 심층 분석

### Operations
- `/cast:fix` - 에러 해결
- `/cast:parallel` - 병렬 실행 최적화

## Why `/cast:` Prefix?

1. **네임스페이스 확보** - 빌트인 명령어와 충돌 없음
2. **일관성** - 모든 Grimoires spell이 통일된 패턴
3. **테마** - 마법을 "시전"하는 느낌
4. **확장성** - 새 spell 추가 시 일관된 UX

---

*Version: 0.1.0*
