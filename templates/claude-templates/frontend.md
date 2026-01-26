# Frontend Project Guidelines

## Tech Stack

- **Framework**: {{FRAMEWORK}} ({{FRAMEWORK_VERSION}})
- **Language**: {{LANGUAGE}}
- **Styling**: {{STYLING}}
- **State Management**: {{STATE_MANAGEMENT}}
- **Build Tool**: {{BUILD_TOOL}}
- **Package Manager**: {{PACKAGE_MANAGER}}

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── common/       # Shared components (Button, Input, etc.)
│   └── features/     # Feature-specific components
├── pages/            # Page components / Routes
├── hooks/            # Custom React hooks
├── context/          # React context providers
├── services/         # API calls and external services
├── utils/            # Utility functions
├── styles/           # Global styles and theme
├── types/            # TypeScript type definitions
└── assets/           # Static assets (images, fonts)
```

## Coding Guidelines

### Component Structure
- Use functional components with hooks
- Keep components small and focused (< 200 lines)
- Separate business logic into custom hooks
- Use composition over prop drilling

### Styling
- Use CSS modules or styled-components for scoped styles
- Follow mobile-first responsive design
- Use design tokens for colors, spacing, typography

### State Management
- Use local state for component-specific data
- Use context for global UI state
- Use server state libraries (React Query/SWR) for API data

### Performance
- Lazy load routes and heavy components
- Memoize expensive computations
- Use React.memo for pure components
- Avoid inline object/function props

## Important Patterns

### Component Pattern
```tsx
interface Props {
  // Props interface
}

export function ComponentName({ prop1, prop2 }: Props) {
  // Hooks at the top
  // Event handlers
  // Render
}
```

### Custom Hook Pattern
```tsx
export function useCustomHook(params) {
  // State
  // Effects
  // Return { data, actions }
}
```

## Testing Strategy

- **Unit Tests**: Components with Jest + Testing Library
- **Integration Tests**: User flows with Cypress/Playwright
- **Visual Tests**: Storybook + Chromatic
- **Coverage Target**: 80%+

## Development Workflow

1. Run `{{PACKAGE_MANAGER}} run dev` for development
2. Run `{{PACKAGE_MANAGER}} run test` before committing
3. Run `{{PACKAGE_MANAGER}} run lint` to check code style
4. Use feature branches for new features
