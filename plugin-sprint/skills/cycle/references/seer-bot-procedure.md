# Review Bot Monitoring Procedure

External review bot (Seer, Sentry, etc.) monitoring procedure. Referenced by `/sprint:cycle` Phase 4-6.

Read the bot list from `sprint.config.yaml`'s `ci.review_bots[]` config.

---

## Monitoring Loop

Start immediately after Ready transition or after pushing new commits.

```
+- 1. Query review bot check-run status for each PR
+- 2. status == "in_progress" (conclusion == null)?
|     → YES: Wait 30s-1min then go to 1
|     → NO: Go to 3
+- 3. Check conclusion:
|     - "success" → Pass, move to next PR
|     - "neutral" → Triage comments (below)
|     - "failure" → Serious issue, check immediately
|     - "skipping" → MUST check PR comments (new comments may exist)
+- 4. After all PR bots complete → proceed to next Phase
+- * Report results to user as soon as available
```

**Key: Do not proceed to other work while bot is in_progress. Always poll until complete.**

---

## check-run Query

```bash
# Review bot check-run status (use config's check_pattern)
gh api repos/{owner}/{repo}/commits/{branch}/check-runs \
  --jq '.check_runs[] | select(.name | test("{check_pattern}"; "i")) | {name, status, conclusion}'
```

---

## Response by conclusion

| conclusion | Meaning | Action |
|------------|---------|--------|
| `success` | No code issues | Pass — next PR |
| `neutral` | Review comments exist | Triage comments |
| `skipping` | Check run skipped | **MUST check PR comments** — treat like neutral if new comments exist |
| `failure` | Serious issue | Check + fix immediately |
| `null` (in_progress) | Reviewing | Wait 30s-1min then re-check |

---

## Comment Triage (neutral / skipping)

```bash
# Query review bot's PR comments (use config's comment_pattern)
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments \
  --jq '.[] | select(.user.login | test("{comment_pattern}"; "i")) | {id, path, line, body}'
```

Classify each comment:

### Valid Bug
Fix in the relevant worktree → commit → push.
Bot will re-review after new commit → restart monitoring loop.

### False Positive
```bash
# Thumbs down reaction
gh api repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions \
  -f content="-1" --method POST

# Reason comment (reply)
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments \
  -f body="False positive: {reason}" -f in_reply_to={comment_id} --method POST
```

---

## Post-fix Re-review Loop

```
+- Fix Valid Bug → commit → push
+- CI re-check (wait for green)
+- Review bot re-review monitoring (same loop as above)
|   - success → Loop complete
|   - neutral → Triage new comments
|   - skipping → Check PR comments (new comments may exist!)
+- New Valid Bug → fix → restart
+- All feedback resolved → Complete
```

---

## Completion Criteria

For all PRs:
- Review bot check-run is `success`, OR
- All `neutral`/`skipping` comments handled (Valid Bug fixed or False Positive recorded)
