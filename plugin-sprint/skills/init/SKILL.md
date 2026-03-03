---
name: init
description: Analyze project and generate sprint.config.yaml
---

# Sprint Init — Project Configuration Generator

Analyze the project structure and auto-generate the `sprint.config.yaml` configuration file. When this file exists, `/sprint:cycle`, `/sprint:review`, `/sprint:plan`, and `/sprint:all` skills adapt to the project.

## Dynamic Context

```
!git rev-parse --show-toplevel 2>/dev/null
!git remote -v 2>/dev/null | head -4
!ls -d */ 2>/dev/null | head -20
!cat CLAUDE.md 2>/dev/null | head -60
!cat sprint.config.yaml 2>/dev/null || echo "NO_CONFIG_EXISTS"
```

## Arguments

`$ARGUMENTS` — None (interactive)

---

## Procedure

### 1. Check Existing Config

If `sprint.config.yaml` already exists, ask the user: **overwrite / update / cancel**.

### 2. Project Analysis

Scan in this order:

1. **Git root**: `git rev-parse --show-toplevel`
2. **Directory structure**: top-level + 1-2 depth
3. **Language/framework detection**:
   - `pyproject.toml` / `requirements.txt` → Python
   - `package.json` / `tsconfig.json` → TypeScript/JavaScript
   - `go.mod` → Go
   - `Cargo.toml` → Rust
4. **Build tools**: ruff, prettier, eslint, pytest, vitest, cargo test, etc.
5. **Documentation scan**: CLAUDE.md, docs/, README.md
6. **Existing squad docs**: docs/SQUADS.md parsing
7. **CI config**: `.github/workflows/` or CI files

### 3. Squad Proposal

Auto-propose squads from directory patterns:

| Directory Pattern | Proposed Squad |
|-------------------|---------------|
| `src/api/`, `services/api/`, `backend/` | Backend / Platform |
| `src/web/`, `apps/`, `frontend/` | Frontend / UI |
| `services/crawler-*`, `scrapers/` | Crawler / Data |
| `infra/`, `deploy/`, `docker/` | Infra / Delivery |
| `services/worker*`, `jobs/` | Worker / Processing |

For each squad:
- `name`: Squad name
- `prefix`: Branch prefix (lowercase)
- `scope`: Modifiable directories
- `language`: Primary language
- `conventions`: formatter, linter, test runner

### 4. User Confirmation

Output the proposed config as YAML and confirm:

- Add/remove/modify squads
- Branch strategy (squash/merge/rebase)
- Review bot settings
- Custom review checks (e.g. legal compliance)
- Agent model/count limits

### 5. File Generation

Write the confirmed config to `sprint.config.yaml` at project root.

### 6. Next Steps

```
sprint.config.yaml generated!

Next steps:
1. /sprint:plan → Create sprint plan
2. /sprint:cycle {N} → Execute a sprint
3. /sprint:all → Execute all sprints
```

---

## sprint.config.yaml Schema

```yaml
project:
  name: "Project Name"
  repo_root: /absolute/path          # git root (auto-detected)
  worktree_base: /absolute/path      # worktree creation path
  main_branch: main
  memory_file: .claude/.../MEMORY.md # relative to repo_root

docs:
  sprint_plan: docs/SPRINT-PLAN.md   # sprint plan document
  squads: docs/SQUADS.md             # squad definitions (optional)

squads:
  - name: SquadName
    prefix: branch-prefix
    scope:
      - directory/path/
    language: python | typescript | go | rust
    conventions:
      formatter: "command"
      linter: "command"
      test: "command"

merge:
  strategy: squash | merge | rebase
  delete_branch: true | false

ci:
  review_bots:
    - name: BotName
      check_pattern: "regex"          # check-run name matching
      comment_pattern: "regex"        # PR comment user.login matching

review:
  checklist:                          # default review checklist
    - completion_criteria
    - coding_conventions
    - scope_boundary
    - edge_cases
  custom_checks: []                   # project-specific checks

agents:
  squad_model: sonnet                 # squad agent model
  lead_model: opus                    # lead agent model (reference)
  max_squad_agents: 4
  max_total_agents: 5
```
