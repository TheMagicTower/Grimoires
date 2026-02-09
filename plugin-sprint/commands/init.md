---
description: Analyze project and generate sprint.config.yaml
---

# Sprint Init

Analyze the project structure and generate `sprint.config.yaml` configuration file.

## Task

$ARGUMENTS

## Workflow

1. Scan project structure (directories, languages, frameworks)
2. Detect squads from directory patterns
3. Propose configuration with conventions, CI, and review settings
4. Confirm with user and write `sprint.config.yaml`

## Next Steps

After init completes:
- `/sprint:plan` to create a sprint plan
- `/sprint:cycle {N}` to execute a sprint
