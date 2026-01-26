# Fullstack Project Guidelines

## Tech Stack

- **Framework**: {{FRAMEWORK}} ({{FRAMEWORK_VERSION}})
- **Language**: {{LANGUAGE}}
- **Frontend**: {{FRONTEND_FRAMEWORK}}
- **Backend**: {{BACKEND_FRAMEWORK}}
- **Database**: {{DATABASE}}
- **ORM**: {{ORM}}
- **Authentication**: {{AUTH}}
- **Package Manager**: {{PACKAGE_MANAGER}}

## Project Structure

```
{{PROJECT_STRUCTURE}}
```

### Next.js / Full-Stack Pattern
```
src/
├── app/              # App Router (Next.js 13+)
│   ├── api/          # API routes
│   ├── (auth)/       # Auth route group
│   └── (dashboard)/  # Dashboard route group
├── components/       # React components
├── lib/              # Shared utilities
├── server/           # Server-only code
│   ├── db/           # Database client
│   ├── services/     # Business logic
│   └── actions/      # Server actions
├── types/            # TypeScript types
└── styles/           # Global styles
```

## Coding Guidelines

### Frontend Guidelines
- Use Server Components by default
- Client Components only when needed (interactivity)
- Keep components small and focused
- Use composition over prop drilling

### Backend Guidelines
- Keep API routes thin (use services)
- Validate all inputs with Zod
- Use proper HTTP status codes
- Handle errors centrally

### Database
- Use migrations for schema changes
- Use Prisma/Drizzle for type-safe queries
- Optimize with proper indexes
- Use transactions for related operations

### Security
- Validate inputs on both client and server
- Use middleware for authentication
- Implement CSRF protection
- Store secrets in environment variables

## Important Patterns

### Server Action Pattern
```typescript
'use server'

export async function createUser(formData: FormData) {
  const data = schema.parse(Object.fromEntries(formData));
  return userService.create(data);
}
```

### API Route Pattern
```typescript
export async function GET(request: Request) {
  try {
    const data = await service.findAll();
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error }, { status: 500 });
  }
}
```

### Data Fetching Pattern
```typescript
// Server Component
async function Page() {
  const data = await fetchData();
  return <Component data={data} />;
}
```

## Testing Strategy

- **Unit Tests**: Components, services, utilities
- **Integration Tests**: API routes, server actions
- **E2E Tests**: Critical user flows with Playwright
- **Coverage Target**: 80%+

## Development Workflow

1. Run `{{PACKAGE_MANAGER}} run dev` for development
2. Run `{{PACKAGE_MANAGER}} run db:push` for schema sync
3. Run `{{PACKAGE_MANAGER}} run test` before committing
4. Use feature branches for new features

## Deployment

- Build: `{{PACKAGE_MANAGER}} run build`
- Database migrations before deploy
- Environment variables in production
- Use Vercel, Railway, or Docker
