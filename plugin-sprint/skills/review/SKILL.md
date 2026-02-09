---
name: review
description: Batch review sprint PRs against completion criteria and conventions
---

# Sprint PR Review

Batch review sprint PRs. Can be called from `/sprint:cycle` Phase 5 or run independently. All settings come from `sprint.config.yaml`.

## Arguments

`$ARGUMENTS` — PR numbers to review (space-separated). e.g. `143 144 145 146`

When called without arguments, targets all open PRs.

## Dynamic Context

```
!cat sprint.config.yaml 2>/dev/null || echo "NO_CONFIG"
!gh pr list --state open --limit 20 2>/dev/null
!cat $(grep 'memory_file:' sprint.config.yaml 2>/dev/null | awk '{print $2}') 2>/dev/null | head -40
```

---

## Config Reference

| Setting | Purpose |
|---------|---------|
| `squads[].name` | Squad name |
| `squads[].scope` | Allowed directories (scope check) |
| `squads[].conventions` | Coding conventions (formatter, linter) |
| `review.checklist` | Default review checklist |
| `review.custom_checks` | Project-specific checks |
| `docs.sprint_plan` | Completion criteria & edge case reference |

---

## Review Procedure

### 1. PR Information Collection

For each PR:

```bash
gh pr diff {number}
gh pr view {number}
gh pr diff {number} --name-only
```

Identify the squad from PR file paths (`squads[].scope` matching).

### 2. Review Checklist

Sequentially check items from `review.checklist` + `review.custom_checks`.

#### completion_criteria — Completion Criteria Met

- Extract completion criteria for the issue from `docs.sprint_plan`
- Compare against PR changes
- Missing criteria → Valid Bug

#### coding_conventions — Coding Conventions

Check against the squad's `conventions`:

- **Formatter compliance**: `conventions.formatter` (ruff format, prettier, etc.)
- **Linter passing**: `conventions.linter` (ruff check, eslint, etc.)
- **Language rules**: Type hints (Python), strict mode (TypeScript), naming conventions
- **Common**: Conventional Commits, remove debug code

#### scope_boundary — Scope Boundary

- Check if PR files exceed `squads[].scope`
- Shared package changes: only owner squad (or AI PM approval)
- Root config files: allow Infra/Delivery squad

#### edge_cases — Edge Cases

- Extract edge cases from sprint plan register for this sprint
- Verify each edge case is handled
- Unhandled → Valid Bug

#### Custom Checks (`review.custom_checks`)

Execute project-specific checks from `custom_checks`:

| Check Key | Inspection |
|-----------|------------|
| `legal_compliance` | Raw data direct customer exposure (API response, rendering) |
| `security_review` | Auth/authz, input validation, secret exposure |
| `performance` | N+1 queries, infinite loops, memory leaks |
| `accessibility` | WCAG compliance, screen reader compatibility |

> If a custom check key isn't in the table above, infer inspection from the key name.

---

### 3. Parallel Review (Optional)

For 3+ PRs, optionally use `pr-review-toolkit` agents in parallel:

- `code-reviewer`: Coding conventions, style
- `silent-failure-hunter`: Error handling
- `comment-analyzer`: Comment accuracy
- `pr-test-analyzer`: Test coverage

---

### 4. Result Classification

| Classification | Definition | Action |
|----------------|-----------|--------|
| **Valid Bug** | Must fix (functional error, criteria unmet, security, custom check violation) | Fix in worktree → commit → push |
| **False Positive** | Misdetection or intentional design | Record reason in PR comment |
| **Enhancement** | Improvement outside current sprint scope | Register as separate issue |

---

### 5. Result Summary Output

#### Per-PR Summary

| PR | Squad | Valid Bug | False Positive | Enhancement | Verdict |
|----|-------|-----------|----------------|-------------|---------|
| #{n} | {name} | {N} | {N} | {N} | PASS/FIX |

#### Valid Bug Detail

| PR | File | Line | Check Item | Description | Severity |
|----|------|------|------------|-------------|----------|
| #{n} | {file} | {line} | {check} | {desc} | HIGH/MED/LOW |

#### Overall Verdict

- **ALL PASS**: All PRs passed → proceed to merge
- **FIX NEEDED**: Valid Bugs exist → fix loop required

---

### 6. Fix Loop

When Valid Bugs are found:

1. Fix in the relevant worktree
2. Commit: `fix({prefix}): {fix description}`
3. Push
4. CI re-check
5. Review bot re-review wait (if applicable)
6. Re-review (re-invoke this skill or manual check)
7. Repeat until all Valid Bugs resolved

---

## Reference Files

| File | Purpose |
|------|---------|
| `sprint.config.yaml` | Squads, conventions, review settings |
| `{docs.sprint_plan}` | Completion criteria, edge cases |
