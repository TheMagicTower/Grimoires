# Backend Project Guidelines

## Tech Stack

- **Framework**: {{FRAMEWORK}} ({{FRAMEWORK_VERSION}})
- **Language**: {{LANGUAGE}}
- **Database**: {{DATABASE}}
- **ORM**: {{ORM}}
- **Authentication**: {{AUTH}}
- **Package Manager**: {{PACKAGE_MANAGER}}

## Project Structure

```
src/
├── api/              # API routes and controllers
│   ├── routes/       # Route definitions
│   └── middleware/   # Custom middleware
├── services/         # Business logic
├── models/           # Database models/entities
├── repositories/     # Data access layer
├── utils/            # Utility functions
├── config/           # Configuration files
├── types/            # TypeScript type definitions
└── tests/            # Test files
```

## Coding Guidelines

### API Design
- Follow RESTful conventions
- Use proper HTTP status codes
- Validate all inputs
- Return consistent response format

### Error Handling
- Use custom error classes
- Centralized error handling middleware
- Log errors with context
- Never expose internal errors to clients

### Database
- Use migrations for schema changes
- Index frequently queried columns
- Use transactions for related operations
- Parameterize all queries (prevent SQL injection)

### Security
- Validate and sanitize all inputs
- Use parameterized queries
- Implement rate limiting
- Store secrets in environment variables
- Hash passwords with bcrypt

## Important Patterns

### Service Pattern
```typescript
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findById(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }
}
```

### Repository Pattern
```typescript
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return db.user.findUnique({ where: { id } });
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": []
  }
}
```

## Testing Strategy

- **Unit Tests**: Services and utilities with Jest
- **Integration Tests**: API endpoints with Supertest
- **Database Tests**: Use test database or mocks
- **Coverage Target**: 80%+

## Development Workflow

1. Run `{{PACKAGE_MANAGER}} run dev` for development
2. Run `{{PACKAGE_MANAGER}} run db:migrate` for migrations
3. Run `{{PACKAGE_MANAGER}} run test` before committing
4. Use feature branches for new features

## Deployment

- Use environment variables for configuration
- Run migrations before deployment
- Use health check endpoints
- Implement graceful shutdown
