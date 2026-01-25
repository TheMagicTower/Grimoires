# Grimoires Quick Start Guide

Grimoires를 빠르게 시작하기 위한 단계별 가이드입니다.

---

## 1. Prerequisites

### Required
- **Node.js 18+**: [Download](https://nodejs.org/)
- **Claude Code CLI**: [Install](https://claude.ai/code)

### Optional (Familiar별)
- **OpenAI API Key**: Codex Familiar 사용 시
- **Google AI API Key**: Gemini Familiar 사용 시
- **Figma Token**: Stitch Familiar의 Figma 연동 시

---

## 2. Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/bluelucifer/Grimoires.git
cd Grimoires
```

### Step 2: Run Installation Script

```bash
./scripts/install.sh
```

### Step 3: Configure API Keys

```bash
# Edit .env file
nano .env
```

```bash
# .env
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_API_KEY=AI-your-google-key
```

---

## 3. First Run

### Start Grimoires Session

```bash
claude --mcp-config runes/mcp/archmage.json
```

### Test with Simple Request

```
> 안녕, Grimoires가 잘 작동하는지 확인해줘
```

Expected response:
```
Grimoires 시스템이 정상적으로 작동 중입니다.

활성화된 MCP:
- Serena: 메모리 관리 ✓
- Sequential Thinking: 사고 프레임워크 ✓
- FixHive: 에러 지식베이스 ✓

사용 가능한 Familiars:
- Codex: 코드 생성
- Gemini: 코드 분석
- Stitch: UI 디자인
- Reviewer: 품질 검증
```

---

## 4. Basic Usage Examples

### Example 1: Simple Code Generation

```
> 숫자 배열의 평균을 계산하는 TypeScript 함수를 만들어줘
```

Grimoires flow:
1. Archmage: 요청 분석 (단순 작업)
2. Codex: 함수 생성 + 테스트
3. Delivery

### Example 2: Feature with UI

```
> 사용자 로그인 폼 컴포넌트를 만들어줘. React + Tailwind 사용
```

Grimoires flow:
1. Archmage: 요청 분석 (UI 필요)
2. Stitch: 컴포넌트 디자인
3. Codex: React 구현
4. Reviewer: 품질 검증
5. Delivery

### Example 3: Code Analysis

```
> src/services/auth.ts 파일의 보안을 검토해줘
```

Grimoires flow:
1. Archmage: 분석 요청 파악
2. Gemini: 보안 분석 (1M+ 토큰 컨텍스트 활용)
3. Delivery (분석 리포트)

### Example 4: Complex Feature

```
> JWT 기반 인증 시스템을 구현해줘
```

Grimoires flow:
1. Archmage: Sequential Thinking으로 문제 분해
2. Stitch: 로그인 UI 컴포넌트
3. Codex (병렬): Frontend + Backend 구현
4. Gemini: 보안 분석
5. Reviewer: 설계 원칙 검증
6. Codex: 리뷰 기반 수정 (필요시)
7. Delivery

---

## 5. Understanding the Flow

### Request Analysis

모든 요청은 먼저 Archmage가 분석합니다:

```
요청 수신
    │
    ▼
복잡도 평가
    │
    ├── 낮음 (1-3): 직접 처리 또는 단일 Familiar
    ├── 중간 (4-6): 다중 Familiar 협업
    └── 높음 (7+): Sequential Thinking + 전체 워크플로우
```

### Familiar Selection

| 작업 유형 | 선택되는 Familiar |
|----------|------------------|
| 코드 작성/수정 | Codex |
| 코드 분석/리뷰 | Gemini |
| UI/컴포넌트 | Stitch |
| 품질 검증 | Reviewer |

---

## 6. Useful Commands

### Check Status

```
> Grimoires 상태를 보여줘
```

### View Memory

```
> 현재 세션의 컨텍스트를 보여줘
```

### Recall Previous Work

```
> 이전에 만든 인증 코드 기억나?
```

(Serena가 메모리에서 검색)

### Cost Check

```
> 오늘 API 비용이 얼마나 사용됐어?
```

---

## 7. Configuration Tips

### For Cost Optimization

```yaml
# runes/config/cost-monitor.yaml
budgets:
  daily:
    limit: 5.00  # Conservative daily budget
```

### For Better Performance

```yaml
# runes/config/auto-review.yaml
auto_fix:
  enabled: true  # Auto-fix review issues
```

### For Specific Projects

프로젝트에 맞게 `.serena/memories/project-context.md` 수정:

```markdown
## Project Specific

- Framework: Next.js 14
- Style: Tailwind CSS
- State: Zustand
- Testing: Vitest
```

---

## 8. Troubleshooting

### MCP Connection Failed

```
Error: Failed to connect to MCP server
```

**Solution**:
```bash
# Verify npx works
npx --version

# Try manual MCP test
npx -y serena-mcp --help
```

### API Key Issues

```
Error: Invalid API key
```

**Solution**:
```bash
# Check .env file
cat .env

# Verify key format
# OpenAI: sk-...
# Google: AI...
```

### Context Overflow

```
Warning: Context limit approaching
```

**Solution**:
```
> 컨텍스트를 정리해줘
```

또는 새 세션 시작:
```bash
claude --mcp-config runes/mcp/archmage.json
```

---

## 9. Next Steps

### Learn More

- **Architecture**: [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- **Workflows**: [spells/dev-workflow.md](../spells/dev-workflow.md)
- **Design Principles**: [runes/rules/design-principles.md](../runes/rules/design-principles.md)

### Customize

1. 프로젝트 컨텍스트 설정: `.serena/memories/project-context.md`
2. 비용 예산 조정: `runes/config/cost-monitor.yaml`
3. 리뷰 규칙 조정: `runes/config/auto-review.yaml`

### Extend

Familiar 추가나 워크플로우 커스터마이징은 다음 파일들을 참고:
- `familiars/*.tome.md` - Familiar 정의 형식
- `spells/*.md` - 워크플로우 정의 형식

---

## 10. Getting Help

- **Issues**: https://github.com/bluelucifer/Grimoires/issues
- **Discussions**: https://github.com/bluelucifer/Grimoires/discussions

---

*Happy coding with Grimoires!*
