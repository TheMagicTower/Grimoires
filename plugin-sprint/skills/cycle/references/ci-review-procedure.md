# CI Review Procedure

Post-PR CI review and review bot response procedure. Referenced by `/sprint:cycle` Phase 4.

---

## CI Monitoring Procedure

1. **Check CI status**: Check each PR's CI status.

```bash
# CI check-run status
gh api repos/{owner}/{repo}/commits/{branch}/check-runs \
  --jq '.check_runs | map({name, status, conclusion})'

# PR status
gh api repos/{owner}/{repo}/pulls/{pr_number} \
  --jq '{state, merged, mergeable_state}'
```

2. **Failure handling**: Diagnose cause and fix in the relevant worktree.
3. **Commit/push**: Always commit + push after fixes.
4. **Repeat**: Loop 1-3 until all CI checks are green.

---

## Common CI Failure Patterns

| Pattern | Cause | Resolution |
|---------|-------|------------|
| lockfile outdated | Dependencies changed without lockfile update | Run package manager install |
| lint failure | Format/lint errors | Run config's `conventions.linter` + `--fix` |
| type-check failure | Type mismatch | Fix types in the relevant file |
| test failure | Logic error or mock mismatch | Fix test code or implementation |
| Docker build failure | Missing dependency | Check requirements/package.json |

---

## Review Comment Check

After CI passes, check PR review comments.

```bash
# PR reviews
gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews \
  --jq '.[] | {user: .user.login, state: .state, body: .body}'

# PR comments
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments
```

---

## Draft → Ready Transition

When all PRs have green CI, batch transition to Ready:

```bash
gh pr ready {number}  # Execute for each PR
```

After Ready transition, external review bots automatically start reviewing. For review bot monitoring, see `seer-bot-procedure.md`.

---

## Full Loop

```
+- 1. CI monitoring
+- 2. Fix on failure → commit → push
+- 3. Verify CI green (repeat 1-2)
+- 4. Check review comments + respond
+- 5. Fix → commit → push
+- 6. Repeat 1-5 until no more issues
+- 7. Draft → Ready transition
+- 8. Review bot monitoring (seer-bot-procedure.md)
+- 9. Completion report
```
