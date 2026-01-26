# /cast:claude-md Spell

프로젝트의 CLAUDE.md 파일을 자동으로 생성하거나 업데이트하는 마법입니다.

---

## Usage

```
/cast:claude-md
/cast:claude-md --update
/cast:claude-md --dry-run
```

---

## Options

| Option | Description |
|--------|-------------|
| `--update` | 기존 CLAUDE.md가 있어도 덮어쓰기 |
| `--dry-run` | 파일을 생성하지 않고 미리보기만 |
| `--minimal` | 최소 템플릿 사용 |
| `--merge` | 기존 내용과 병합 (TODO 등 유지) |

---

## How It Works

```
/cast:claude-md 실행
     │
     ▼
┌─────────────────────────────────────┐
│     1. 프로젝트 분석                  │
│     - package.json / pyproject.toml │
│     - 디렉토리 구조                   │
│     - 프레임워크 / 언어 감지           │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│     2. 템플릿 선택                    │
│     - Frontend / Backend / Fullstack│
│     - 프레임워크별 섹션               │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│     3. 변수 치환                      │
│     - {{PROJECT_NAME}}               │
│     - {{TECH_STACK}}                 │
│     - {{PATTERNS}} 등                │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│     4. CLAUDE.md 생성                 │
│     - 기존 파일 백업 (있으면)          │
│     - 새 파일 작성                    │
└─────────────────────────────────────┘
```

---

## Detected Information

### Project Type

```javascript
// 자동 감지되는 프로젝트 타입
{
  frontend: "React, Vue, Svelte, Angular",
  backend: "Express, Fastify, NestJS, FastAPI, Django",
  fullstack: "Next.js, Nuxt, Remix, SvelteKit"
}
```

### Tech Stack Detection

| Detection Source | Information |
|-----------------|-------------|
| `package.json` | Framework, Dependencies, Scripts |
| `tsconfig.json` | TypeScript 설정 |
| Lock files | Package Manager |
| Directory structure | 프로젝트 구조 |
| Config files | Linter, Formatter, Test framework |

---

## Generated Sections

### 1. Project Overview
- 프로젝트 이름, 설명
- 타입 (Frontend/Backend/Fullstack)
- 프레임워크, 언어

### 2. Tech Stack
- 핵심 기술 스택
- 패키지 매니저
- 개발 도구

### 3. Project Structure
```
src/
├── components/     # UI 컴포넌트
├── pages/          # 페이지
├── services/       # 비즈니스 로직
└── utils/          # 유틸리티
```

### 4. Coding Guidelines
- 네이밍 컨벤션
- 코드 스타일
- 에러 핸들링

### 5. Important Patterns
- 프레임워크별 패턴
- 권장 구조

### 6. Testing Strategy
- 테스트 프레임워크
- 커버리지 목표

### 7. Development Workflow
- 개발 서버 실행
- 빌드 명령어
- 배포 프로세스

---

## Templates

### Base Template

Location: `templates/CLAUDE.md.template`

```markdown
# {{PROJECT_NAME}}

## Project Overview
{{PROJECT_DESCRIPTION}}

## Tech Stack
{{TECH_STACK}}

## Project Structure
{{FILE_STRUCTURE}}
...
```

### Type-Specific Templates

| Template | Location |
|----------|----------|
| Frontend | `templates/claude-templates/frontend.md` |
| Backend | `templates/claude-templates/backend.md` |
| Fullstack | `templates/claude-templates/fullstack.md` |

### Section Templates

| Section | Location |
|---------|----------|
| Overview | `templates/claude-templates/sections/project-overview.md` |
| Tech Stack | `templates/claude-templates/sections/tech-stack.md` |
| Guidelines | `templates/claude-templates/sections/coding-guidelines.md` |
| Testing | `templates/claude-templates/sections/testing-strategy.md` |
| Deployment | `templates/claude-templates/sections/deployment.md` |

---

## Examples

### Example 1: New Next.js Project

```bash
cd my-nextjs-app
claude
> /cast:claude-md
```

Output:
```
🔮 Generating CLAUDE.md...

Detected:
  Type: fullstack
  Framework: Next.js
  Language: TypeScript
  Package Manager: pnpm

✓ Generated CLAUDE.md

Preview:
  - Project Overview
  - Tech Stack (Next.js, TypeScript, Tailwind)
  - File Structure
  - Coding Guidelines
  - Testing (Vitest)
  - Development Workflow
```

### Example 2: Update Existing

```bash
> /cast:claude-md --update
```

Output:
```
⚠ Existing CLAUDE.md found
✓ Backed up to CLAUDE.md.backup
✓ Generated new CLAUDE.md
```

### Example 3: Dry Run

```bash
> /cast:claude-md --dry-run
```

Output:
```markdown
# my-project

## Project Overview
A fullstack application built with Next.js.
...
```

---

## Integration with /cast:summon

`/cast:summon` 실행 시 자동으로 CLAUDE.md도 생성할 수 있습니다:

```yaml
# grimoire.yaml 옵션
project:
  generate_claude_md: true
```

또는 수동으로:

```bash
> /cast:summon
> /cast:claude-md
```

---

## Customization

### Custom Template

프로젝트에 `.grimoires/claude-template.md`를 생성하면 해당 템플릿이 사용됩니다:

```markdown
# My Project Template

## {{PROJECT_NAME}}

Custom sections...
```

### Ignore Sections

특정 섹션을 제외하려면:

```yaml
# grimoire.yaml
claude_md:
  skip_sections:
    - deployment
    - testing
```

---

## CLI Usage

직접 핸들러 실행도 가능합니다:

```bash
# 기본 생성
node ~/.grimoires/core/hooks/handlers/generate-claude-md.js

# 옵션과 함께
node ~/.grimoires/core/hooks/handlers/generate-claude-md.js CLAUDE.md --update

# 미리보기
node ~/.grimoires/core/hooks/handlers/generate-claude-md.js --dry-run
```

---

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:summon` | 프로젝트 초기화 |
| `/cast:analyze` | 코드 분석 |
| `/cast:review` | 코드 리뷰 |

---

*Version: 0.3.0*
