---
description: Execute a single sprint through all phases (0-7)
---

# Sprint Cycle

Execute a single sprint cycle through 8 phases: pre-check, planning, setup, execution, CI, review, merge, cleanup.

## Task

$ARGUMENTS

## Usage

```
/sprint:cycle 5          # Run Sprint 5 from Phase 0
/sprint:cycle 5 phase3   # Resume Sprint 5 from Phase 3
```

## Phases

| Phase | Name | Gate |
|-------|------|------|
| 0 | Pre-check | User approval |
| 1 | Planning | User approval |
| 2 | Infrastructure setup | Auto |
| 3 | Execution monitoring | Auto |
| 4 | CI review | User approval |
| 5 | Code review | User approval |
| 6 | Merge | User approval (per PR) |
| 7 | Cleanup | Auto |
