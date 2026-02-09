---
description: Create sprint plan with issues, squads, dependencies, and edge cases
---

# Sprint Plan

Create or update a sprint plan based on `sprint.config.yaml`.

## Task

$ARGUMENTS

## Usage

```
/sprint:plan         # Auto-detect next sprint
/sprint:plan 5       # Plan Sprint 5
/sprint:plan Phase 3 # Plan Phase 3
```

## Workflow

1. Load config and parse existing sprint plan
2. Define issues interactively with user
3. Assign squads based on scope matching
4. Analyze dependencies and merge order
5. Identify edge cases
6. Write plan document and optionally create GitHub issues
