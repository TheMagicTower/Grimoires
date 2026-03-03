---
name: cycle
description: Execute a single sprint through all phases (0-7)
---

# Sprint Cycle Orchestrator

Execute a single sprint cycle through 8 Phases (0-7). All project-specific settings come from `sprint.config.yaml`.

## Dynamic Context

```
!cat sprint.config.yaml 2>/dev/null || echo "NO_CONFIG"
!cat $(grep 'memory_file:' sprint.config.yaml 2>/dev/null | awk '{print $2}') 2>/dev/null | head -40
!git branch --list 2>/dev/null | head -20
!git worktree list 2>/dev/null
!gh pr list --state open --limit 20 2>/dev/null
```

## Arguments

`$ARGUMENTS` — Sprint number or Phase resume point (e.g. `5`, `5 phase3`)

- Sprint number only: Execute from Phase 0
- `{sprint} phase{N}`: Resume from that Phase

## Config Reference

Notation below refers to `sprint.config.yaml` field paths.

| Shorthand | Config Path | Example |
|-----------|-------------|---------|
| `CFG.repo_root` | `project.repo_root` | `/opt/.../repo` |
| `CFG.worktree_base` | `project.worktree_base` | `/opt/.../worktrees` |
| `CFG.main_branch` | `project.main_branch` | `main` |
| `CFG.memory_file` | `project.memory_file` | `.claude/.../MEMORY.md` |
| `CFG.sprint_plan` | `docs.sprint_plan` | `docs/SPRINT-PLAN.md` |
| `CFG.squads[]` | `squads` array | `[{name, prefix, scope, ...}]` |
| `CFG.merge.strategy` | `merge.strategy` | `squash` |
| `CFG.review_bots[]` | `ci.review_bots` array | `[{name, check_pattern, ...}]` |
| `CFG.checklist` | `review.checklist` | `[completion_criteria, ...]` |
| `CFG.custom_checks` | `review.custom_checks` | `[legal_compliance]` |
| `CFG.squad_model` | `agents.squad_model` | `sonnet` |
| `CFG.max_squad_agents` | `agents.max_squad_agents` | `4` |

---

## Phase Overview

| Phase | Name | Gate | Description |
|-------|------|------|-------------|
| 0 | Pre-check | User approval | Memory, pending PRs, worktree check |
| 1 | Planning | User approval | Issue parsing, squad assignment, merge order |
| 2 | Infrastructure setup | Auto | Worktrees, team, tasks, agent spawn |
| 3 | Execution monitoring | Auto | Agent monitoring, blocker resolution, shutdown on completion |
| 4 | CI review | User approval | CI fixes, Draft→Ready, review bot wait |
| 5 | Code review | User approval | AI PM direct review, fix loop |
| 6 | Merge | User approval (per PR) | Sequential merge + rebase + review bot re-check |
| 7 | Cleanup | Auto | Issue close, memory, team disband, worktree delete |

---

## Phase 0: Pre-check

**Gate: User approval**

1. **Memory check**: `CFG.memory_file` for current state, unmerged PRs, leftover worktrees
2. **Pending PR check**: Previous sprint Draft PRs → need merge first?
3. **Worktree cleanup**: Remove leftover worktrees from previous sprints

```bash
git worktree list
git worktree remove {CFG.worktree_base}/{name} 2>/dev/null
```

4. **Check table output**:

| Item | Status | Note |
|------|--------|------|
| Previous sprint complete | ? | Memory check |
| Unmerged PRs | ? | `gh pr list` |
| Leftover worktrees | ? | `git worktree list` |
| main CI | ? | Latest commit CI |
| Sprint Plan | ? | `CFG.sprint_plan` section |

5. Report results to user → request proceed approval

---

## Phase 1: Planning

**Gate: User approval**

1. **Sprint Plan parsing**: Extract issue list for this sprint from `CFG.sprint_plan`
2. **Squad assignment**: Map issues → `CFG.squads[]` `scope` matching. Identify idle squads
3. **Dependency analysis**: Issue blocker relationships, merge order
4. **Branch naming**: `{squad.prefix}/{feature}` format
5. **Plan table output** (active squads only):

| Squad | Branch | Issues | Worktree | Merge Order |
|-------|--------|--------|----------|-------------|
| {name} | {prefix}/{feat} | {IDs} | {CFG.worktree_base}/{prefix} | {N} |

6. Get user confirmation on branch names, assignments, order

---

## Phase 2: Infrastructure Setup

**Auto proceed**

1. **Worktree creation** (per active squad):
```bash
cd {CFG.repo_root}
git worktree add {CFG.worktree_base}/{prefix} -b {prefix}/{feature}
```

2. **Team creation**: `TeamCreate(team_name: "sprint-{N}")`

3. **Task creation** (TaskCreate per squad):
```
subject: [{SQUAD}] {ISSUE-ID}: {title}
description: |
  Working directory: {CFG.worktree_base}/{prefix}
  Branch: {prefix}/{feature}
  ## Deliverables / Completion Criteria / Edge Cases (from sprint plan)
  ## Scope restriction: {squad.scope}
```

4. **Agent spawn** (model: `CFG.squad_model`):

Agent prompt essentials:
- Working directory: `{CFG.worktree_base}/{prefix}` — **work here only**
- Branch: `{prefix}/{feature}` — **never commit to main directly**
- Scope: `{squad.scope}` directories only
- Coding conventions: `{squad.conventions}` (formatter, linter)
- Commit format: `feat({prefix}): {issue-ids} {desc}`
- PR: Create as Draft (`gh pr create --draft`)

---

## Phase 3: Execution Monitoring

**Auto proceed**

1. **Periodic progress check via TaskList**
2. **Cross-squad dependency mediation**: Define shared interfaces first
3. **Blocker resolution**: Unresponsive agent → SendMessage x2 → take over directly

**Agent cleanup (Phase 3 completion)**:
When all squad agents have created PRs, immediately `shutdown_request`.
- Squad agents: implementation + PR only
- CI fix, review bot response, review: AI PM handles directly
- Max concurrent: squad `CFG.max_squad_agents` + PM = `CFG.max_total_agents`

---

## Phase 4: CI Review

**Gate: User approval (Phase 4→5)**

Detailed procedure: `references/ci-review-procedure.md`

1. **Per-PR CI monitoring** → fix in worktree on failure → commit → push → repeat
2. **All CI green → Draft → Ready**: `gh pr ready {number}`
3. **Review bot monitoring**: `references/seer-bot-procedure.md`
   - Poll check-runs for each `CFG.review_bots[]` bot
   - Handle by conclusion (success/neutral/skipping/failure)
4. **Review bot complete + CI green** → request user approval for Phase 5

---

## Phase 5: Code Review

**Gate: User approval (Phase 5→6)**

1. **AI PM reviews directly** — no separate review agent spawn

2. **Review checklist** (`CFG.checklist` + `CFG.custom_checks`):

| Check Item | Description |
|------------|-------------|
| `completion_criteria` | Sprint plan completion criteria comparison |
| `coding_conventions` | `squad.conventions` compliance |
| `scope_boundary` | `squad.scope` directory boundary check |
| `edge_cases` | Sprint plan edge case handling |
| (custom) | Each `CFG.custom_checks` item (project-specific) |

3. **Bug classification**: Valid Bug / False Positive / Enhancement

4. **Fix loop** (same as seer-bot-procedure.md re-review loop):
   - Fix Valid Bug → commit → push
   - CI re-check → review bot re-review wait
   - Repeat until success or all handled

5. **Results summary table**:

| PR | Self Review | Review Bot | Valid Bug | False Positive | Final |
|----|------------|------------|-----------|----------------|-------|
| #{n} | {result} | {conclusion} | {N} | {N} | Pass/Fail |

6. Request merge approval from user

---

## Phase 6: Merge

**Gate: User approval (per PR individually)**

Merge sequentially in the dependency order from Phase 1.

```
+- PR-A (no dependencies) → squash merge
+- main CI check
+- PR-B worktree rebase:
|     git fetch origin {CFG.main_branch}
|     git rebase origin/{CFG.main_branch}
|     git push --force-with-lease
+- PR-B CI + review bot re-review wait
+- PR-B squash merge
+- Repeat...
```

**Key**: After dependent PR merge, subsequent PRs must rebase → wait for review bot to re-check new code.

Per PR:
```bash
gh pr merge {number} --{CFG.merge.strategy} --delete-branch
```

If main CI fails after merge: fix immediately on `hotfix/{sprint}-ci-fix` branch.

---

## Phase 7: Cleanup

**Auto proceed**

1. **Close GitHub issues**:
```bash
gh issue close {number} --comment "Completed in Sprint {N}. Related PR: #{pr}"
```

2. **Memory update** (`CFG.memory_file`):
   - Completed issues + merged PR list
   - Discovered bugs + solutions (lessons)
   - Next sprint prerequisites

3. **Team disband**: shutdown_request → TeamDelete

4. **Worktree delete**:
```bash
git worktree remove {CFG.worktree_base}/{prefix}
```

5. **Completion report**:

| Item | Result |
|------|--------|
| Completed issues | {N}/{Total} |
| Merged PRs | #{...} |
| Bugs found | {N} |
| Lessons | {bullets} |
| Next | Sprint {N+1} |

---

## Variable Squad Handling

Not all sprints use every squad. Squads marked "no assignment" in the Sprint Plan are excluded from worktrees, agents, tasks, and merge order.

## Reference Files

| File | Purpose |
|------|---------|
| `sprint.config.yaml` | Project config (squads, conventions, review bots, etc.) |
| `{CFG.sprint_plan}` | Issue list, completion criteria, edge cases |
| `{CFG.memory_file}` | Cross-session state persistence |
| `references/ci-review-procedure.md` | CI review procedure (Phase 4) |
| `references/seer-bot-procedure.md` | Review bot monitoring loop (Phase 4-6) |
