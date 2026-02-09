---
name: plan
description: Create sprint plan with issues, squads, dependencies, and edge cases
---

# Sprint Plan — Sprint Planning Skill

Read `sprint.config.yaml` and generate or update a sprint plan document. Define issues, squad assignments, dependencies, completion criteria, and edge cases interactively with the user.

## Dynamic Context

```
!cat sprint.config.yaml 2>/dev/null || echo "NO_CONFIG"
!cat $(grep 'sprint_plan:' sprint.config.yaml 2>/dev/null | awk '{print $2}') 2>/dev/null | tail -100
!cat $(grep 'memory_file:' sprint.config.yaml 2>/dev/null | awk '{print $2}') 2>/dev/null | head -40
!gh issue list --state open --limit 30 2>/dev/null
```

## Arguments

`$ARGUMENTS` — Sprint number or Phase name (e.g. `7`, `Phase 3`)

When called without arguments, auto-determine the next sprint from MEMORY.md and existing plan.

---

## Prerequisites

1. **`sprint.config.yaml` required**: If missing, guide user to `/sprint:init`.
2. If existing sprint plan document exists, parse it to determine previous sprint status.

---

## Procedure

### Phase A: Context Collection

1. Load `sprint.config.yaml` → squad list, scopes, doc paths
2. Parse existing sprint plan document:
   - Identify completed sprints
   - Determine next sprint number
   - Check for carryover issues
3. Check MEMORY.md for previous sprint lessons, remaining work
4. Check GitHub open issues

### Phase B: Issue Definition (Interactive)

Define issues interactively with the user. One question at a time.

1. **Sprint goal confirmation**: "What is the goal for Sprint {N}?"
2. **Issue list proposal**: Draft issues based on the goal
3. **For each issue**:
   - ID: `{Squad-Prefix}-{Number}` (e.g. C-01, P-05, U-10)
   - Task name
   - Deliverables
   - Completion criteria (specific, verifiable)
4. **Carryover check**: If unfinished issues from previous sprint, ask about carryover

### Phase C: Squad Assignment

1. Map each issue to `sprint.config.yaml`'s `squads[]`
2. Match issue file paths → squad `scope`
3. Group issues by squad
4. Identify "no assignment" squads
5. User confirmation: "Does this assignment look correct?"

### Phase D: Dependency Analysis

1. Identify blocker relationships between issues
   - Schema changes → API → UI order
   - Infra → Services order
2. Determine merge order (dependent PRs first)
3. Output dependency diagram:

```
[No blockers]           [No blockers]
     |                       |
     v                       v
 +--------+           +--------+
 | P-xx   |           | D-xx   |
 +---+----+           +---+----+
     |                     |
     v                     v
 +--------+           +--------+
 | C-xx   |           | U-xx   |
 +--------+           +--------+
```

### Phase E: Edge Case Definition

1. Derive edge cases for each issue
2. Ask user for additional edge cases
3. Record in edge case register:

| ID | Issue | Edge Case | Handling Strategy |
|----|-------|-----------|-------------------|
| EC-xx | C-xx | {description} | {strategy} |

### Phase F: Document Writing

Add/update the sprint section in the sprint plan document (`docs.sprint_plan` path).

Document structure:
```markdown
## Sprint {N} (Week {W}) — {Goal}

### {Squad} Squad

| ID | Task | Deliverable | Completion Criteria |
|----|------|-------------|---------------------|
| {ID} | {Task} | {Deliverable} | {Criteria} |

### Dependency Map
{Diagram}

### Edge Case Register
{Table}

### Merge Order
1. {Squad}/{branch} — {reason}
2. ...
```

### Phase G: GitHub Issue Creation (Optional)

Ask user "Create GitHub issues too?" then:

```bash
# For each issue
gh issue create --title "{ID}: {Task}" \
  --body "$(cat <<'EOF'
## Deliverables
{deliverables}

## Completion Criteria
{criteria}

## Edge Cases
{related edge cases}

Sprint {N} | {Squad} Squad
EOF
)" --label "sprint-{N},{squad}"
```

PM issues separately:
```bash
gh issue create --title "PM-xx: Sprint {N} Management" \
  --body "Sprint {N} overall management issue" --label "sprint-{N},pm"
```

---

## Output Summary

Print summary table on completion:

| Squad | Issues | Branch | Merge Order |
|-------|--------|--------|-------------|
| {name} | {N} | {prefix}/{feature} | {order} |

```
Next step: /sprint:cycle {N} to execute the sprint.
```
