## Deployment

### Environments

| Environment | URL | Branch |
|-------------|-----|--------|
| Development | {{DEV_URL}} | `develop` |
| Staging | {{STAGING_URL}} | `staging` |
| Production | {{PROD_URL}} | `main` |

### Build Process

```bash
# Install dependencies
{{PACKAGE_MANAGER}} install

# Build
{{PACKAGE_MANAGER}} run build

# Start
{{PACKAGE_MANAGER}} start
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection | Yes |
| `API_KEY` | External API key | Yes |
| `NODE_ENV` | Environment mode | Yes |

### CI/CD Pipeline

1. **On PR**: Lint, Test, Build
2. **On Merge to develop**: Deploy to staging
3. **On Merge to main**: Deploy to production

### Rollback

```bash
# Revert to previous version
{{ROLLBACK_COMMAND}}
```

### Monitoring

- **Logs**: {{LOGGING_SERVICE}}
- **Metrics**: {{METRICS_SERVICE}}
- **Alerts**: {{ALERTING_SERVICE}}
