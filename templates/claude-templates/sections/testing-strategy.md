## Testing Strategy

### Test Pyramid

```
        /\
       /  \     E2E (Few)
      /----\
     /      \   Integration (Some)
    /--------\
   /          \  Unit (Many)
  /------------\
```

### Test Types

| Type | Tools | Coverage |
|------|-------|----------|
| Unit | {{UNIT_TEST_FRAMEWORK}} | 80%+ |
| Integration | {{INTEGRATION_TEST_FRAMEWORK}} | Key paths |
| E2E | {{E2E_TEST_FRAMEWORK}} | Critical flows |

### Running Tests

```bash
# All tests
{{PACKAGE_MANAGER}} test

# Watch mode
{{PACKAGE_MANAGER}} test:watch

# Coverage
{{PACKAGE_MANAGER}} test:coverage

# E2E
{{PACKAGE_MANAGER}} test:e2e
```

### Test Guidelines

1. **Arrange-Act-Assert** pattern
2. Test behavior, not implementation
3. One assertion per test (when practical)
4. Use meaningful test descriptions
5. Mock external dependencies

### Coverage Requirements

- New code: 80%+ coverage
- Critical paths: 100% coverage
- Bug fixes: Include regression test
