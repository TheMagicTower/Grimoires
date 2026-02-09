---
description: Execute all remaining sprints sequentially
---

# Sprint All

Execute all remaining sprints from the sprint plan sequentially, with inter-sprint gates for user approval.

## Task

$ARGUMENTS

## Usage

```
/sprint:all      # Auto-detect and run remaining sprints
/sprint:all 5    # Start from Sprint 5
```

## Workflow

1. Parse sprint plan to identify remaining sprints
2. Display execution plan for user confirmation
3. Execute each sprint via `/sprint:cycle`
4. Inter-sprint gate: verify completion before proceeding
5. Final summary report
