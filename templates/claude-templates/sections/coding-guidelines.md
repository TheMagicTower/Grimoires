## Coding Guidelines

### General Principles

1. **Clarity over cleverness**: Write readable, maintainable code
2. **Single Responsibility**: Each function/class does one thing well
3. **DRY (Don't Repeat Yourself)**: Extract common logic
4. **YAGNI (You Ain't Gonna Need It)**: Don't over-engineer

### Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Types/Interfaces**: PascalCase (`UserData`)

### Code Style

- Use {{LINTER}} for linting
- Use {{FORMATTER}} for formatting
- Max line length: {{MAX_LINE_LENGTH}}
- Indentation: {{INDENTATION}} spaces

### Comments

- Avoid obvious comments
- Document "why", not "what"
- Use JSDoc for public APIs
- Keep TODO comments with context

### Error Handling

```typescript
// Good: Specific error handling
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle network issues
  }
  throw error;
}
```

### Security

- Never commit secrets
- Validate all inputs
- Sanitize outputs
- Use parameterized queries
