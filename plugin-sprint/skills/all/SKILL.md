---
name: all
description: Execute all remaining sprints sequentially
---

# Sprint All — Continuous Sprint Execution

Execute all remaining sprints from the sprint plan sequentially. Each sprint invokes `/sprint:cycle`, with inter-sprint gates to verify completion.

## Dynamic Context

```
!cat sprint.config.yaml 2>/dev/null || echo "NO_CONFIG"
!cat $(grep 'memory_file:' sprint.config.yaml 2>/dev/null | awk '{print $2}') 2>/dev/null | head -40
!cat $(grep 'sprint_plan:' sprint.config.yaml 2>/dev/null | awk '{print $2}') 2>/dev/null | head -30
!gh issue list --state open --limit 30 2>/dev/null
```

## Arguments

`$ARGUMENTS` — Starting sprint number (optional). Auto-determined if omitted.

e.g. `5` → Execute Sprint 5 through the end

---

## Prerequisites

1. **`sprint.config.yaml` required**: If missing, guide to `/sprint:init`
2. **Sprint plan document required**: If missing, guide to `/sprint:plan`
3. All previous sprints must be complete before starting

---

## Procedure

### 1. Status Assessment

1. Load `sprint.config.yaml`
2. Parse sprint plan document → extract full sprint list
3. Identify completed sprints from MEMORY.md + GitHub issue status
4. Determine remaining sprints

### 2. Execution Plan Output

```
Sprint Overview:

| Sprint | Goal | Status |
|--------|------|--------|
| Sprint 1 | Foundation | Completed |
| Sprint 2 | Crawlers | Completed |
| Sprint 3 | API + Dashboard | Pending |
| Sprint 4 | Notifications | Pending |
| ...    | ... | ... |

Execution target: Sprint 3 ~ Sprint {N}
```

### 3. User Confirmation

**Gate**: "Execute Sprint {start} ~ Sprint {end} sequentially. Proceed?"

### 4. Continuous Execution Loop

```
for each sprint in remaining_sprints:
    1. Notify user: "Starting Sprint {N}"
    2. Invoke /sprint:cycle {N} (Phase 0-7 full)
    3. Verify sprint completion:
       - All issues closed
       - All PRs merged
       - MEMORY.md updated
    4. Gate: "Sprint {N} complete. Proceed to Sprint {N+1}?"
       - Approved → next sprint
       - Rejected → stop + report current status
```

### 5. Inter-Sprint Gates

After each sprint completes, verify:

- **main branch stability**: CI green
- **No unmerged PRs**: All previous sprint PRs merged
- **Worktree cleanup**: Previous sprint worktrees deleted
- **Carryover issues**: If unfinished issues exist, ask user to carryover or cancel

### 6. Final Report

On all sprints complete, output full summary:

```
All sprints complete!

| Sprint | Issues | PRs | Bug Fixes | Status |
|--------|--------|-----|-----------|--------|
| Sprint {N} | {done}/{total} | #{...} | {N} | Done |
| Sprint {N+1} | {done}/{total} | #{...} | {N} | Done |
| ... | ... | ... | ... | ... |

Total issues: {N} completed
Total PRs: {N} merged
Total bugs: {N} fixed
```

---

## Interruption and Resume

On interruption, record current state in MEMORY.md:
- Last completed sprint
- Current in-progress sprint + Phase
- Incomplete work

Resume: `/sprint:all {interrupted_sprint_number}` or `/sprint:cycle {N} phase{M}` to resume from a specific Phase.
