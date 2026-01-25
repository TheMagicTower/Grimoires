# Learned Patterns

프로젝트 진행 중 학습한 패턴과 베스트 프랙티스를 기록합니다.

---

## Patterns

### Pattern-001: MCP 설정 파일 구조

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": {}
    }
  }
}
```

### Pattern-002: Familiar 정의 파일 명명

- 파일명: `{familiar-name}.tome.md`
- 위치: `familiars/` 디렉토리
- 예시: `codex.tome.md`, `gemini.tome.md`

---

## Anti-Patterns

### Anti-Pattern-001: 모든 MCP를 메인 컨텍스트에 로드

- 문제: 컨텍스트 토큰 폭발
- 해결: 에이전트별 MCP 격리

---

*Last Updated: 2026-01-25*
